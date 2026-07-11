import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import type { FastifyInstance } from 'fastify';

import { buildApp } from '../../src/bin/api';
import { openDatabase, type Db } from '../../src/db/connection';
import { runMigrations } from '../../src/db/migrate';
import { createManualBatch, enqueueManualBatch } from '../../src/services/source';
import { claimNextJob, promoteDiscoveries } from '../../src/services/scheduler';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const T = 1_731_000_000_000;
const TOKEN = 'device-token-value';
const TOKEN_SHA = createHash('sha256').update(TOKEN, 'utf8').digest('hex');
const AUTH = { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' };
const uuid = () => randomUUID();
const SCOPE = { scopeAttested: true, scopeAttestationVersion: 'd009a.public-youtube-tech.v1' };

function fresh(): Db {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  db.prepare("INSERT INTO users (id, timezone, created_at, updated_at) VALUES ('leo','Asia/Seoul',?,?)").run(T, T);
  return db;
}
function app(): { a: FastifyInstance; db: Db } {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  const audioDir = join(mkdtempSync(join(tmpdir(), 'vn-enq-')), 'audio');
  return { a: buildApp({ db, deviceTokenSha256: TOKEN_SHA, audioDir, now: () => T }), db };
}

test('API manual submission enqueues a claimable job', async () => {
  const { a, db } = app();
  const res = await a.inject({ method: 'POST', url: '/v1/manual-batches', headers: { ...AUTH, 'idempotency-key': uuid() }, payload: JSON.stringify({ urls: ['https://youtu.be/aaaaaaaaaaa'], ...SCOPE }) });
  assert.equal(res.statusCode, 202);
  const jobs = db.prepare("SELECT id, state, stage FROM processing_jobs WHERE origin_kind = 'manual'").all() as Array<{ id: string; state: string; stage: string }>;
  assert.equal(jobs.length, 1, 'one claimable job from the accepted item');
  assert.equal(jobs[0]?.state, 'queued');
  const claimed = claimNextJob(db, 'w1', T);
  assert.ok(claimed && claimed.id === jobs[0]?.id, 'the manual job is immediately claimable');
  db.close();
});

test('duplicate URLs reuse one SourceVideo and create no extra jobs; re-submit is idempotent', async () => {
  const { a, db } = app();
  const key = uuid();
  const payload = JSON.stringify({ urls: ['https://youtu.be/bbbbbbbbbbb', 'https://youtu.be/bbbbbbbbbbb'], ...SCOPE });
  assert.equal((await a.inject({ method: 'POST', url: '/v1/manual-batches', headers: { ...AUTH, 'idempotency-key': key }, payload })).statusCode, 202);
  assert.equal((db.prepare('SELECT COUNT(*) c FROM source_videos').get() as { c: number }).c, 1, 'one deduped source video');
  assert.equal((db.prepare('SELECT COUNT(*) c FROM processing_jobs').get() as { c: number }).c, 1, 'one job (the duplicate item is not queued)');
  assert.equal((await a.inject({ method: 'POST', url: '/v1/manual-batches', headers: { ...AUTH, 'idempotency-key': key }, payload })).statusCode, 202);
  assert.equal((db.prepare('SELECT COUNT(*) c FROM processing_jobs').get() as { c: number }).c, 1, 'still one job after an idempotent re-submit');
  db.close();
});

test('a revoked manual scope approval enqueues nothing', () => {
  const db = fresh();
  const { view } = createManualBatch(db, { urls: ['https://youtu.be/ccccccccccc'], idempotencyKey: uuid() }, T);
  db.prepare('UPDATE provider_scope_approvals SET status = ? WHERE manual_batch_id = ?').run('revoked', view.id);
  assert.equal(enqueueManualBatch(db, view.id, T), 0, 'no jobs under a revoked approval');
  assert.equal((db.prepare('SELECT COUNT(*) c FROM processing_jobs').get() as { c: number }).c, 0);
  db.close();
});

test('a disabled channel (auto off) promotes and enqueues nothing', () => {
  const db = fresh();
  db.prepare("INSERT INTO channels (id, user_id, youtube_channel_id, canonical_url, public_title, status, auto_processing_enabled, approval_version, created_at, updated_at) VALUES ('ch','leo','UCx_YiR733cfqVPRsQ1n8Fag','u','Expo','disabled',0,1,?,?)").run(T, T);
  db.prepare("INSERT INTO channel_discoveries (id, channel_id, youtube_video_id, published_at, status, eligible_at, created_at, updated_at) VALUES ('d1','ch','5JqK9JLD140',?, 'discovered',?,?,?)").run(T, T, T, T);
  assert.equal(promoteDiscoveries(db, 'ch', T).length, 0, 'disabled channel promotes nothing');
  assert.equal((db.prepare('SELECT COUNT(*) c FROM processing_jobs').get() as { c: number }).c, 0);
  db.close();
});

test('channel promotion caps at three and enqueues exactly three claimable jobs, deferred-first', () => {
  const db = fresh();
  db.prepare("INSERT INTO channels (id, user_id, youtube_channel_id, canonical_url, public_title, status, auto_processing_enabled, approval_version, created_at, updated_at) VALUES ('ch','leo','UCx_YiR733cfqVPRsQ1n8Fag','u','Expo','active',1,1,?,?)").run(T, T);
  db.prepare("INSERT INTO provider_scope_approvals (id, user_id, origin_kind, manual_batch_id, channel_id, source_scope, scope_attestation_version, status, approval_version, approved_at, created_at, updated_at) VALUES ('csa','leo','channel',NULL,'ch','public_low_risk_youtube_technology','d009a.public-youtube-tech.v1','active',1,?,?,?)").run(T, T, T);
  const vids = ['5JqK9JLD140', 'abcdef12345', 'ghijk123456', 'lmnop123456', 'qrstu123456'];
  vids.forEach((v, i) => db.prepare("INSERT INTO channel_discoveries (id, channel_id, youtube_video_id, published_at, status, eligible_at, created_at, updated_at) VALUES (?, 'ch', ?, ?, 'discovered', ?, ?, ?)").run(`d${i}`, v, T + i, T, T, T));
  const promoted = promoteDiscoveries(db, 'ch', T);
  assert.equal(promoted.length, 3);
  assert.equal((db.prepare("SELECT COUNT(*) c FROM processing_jobs WHERE origin_kind = 'channel' AND state = 'queued'").get() as { c: number }).c, 3, 'three claimable jobs');
  assert.equal((db.prepare("SELECT COUNT(*) c FROM channel_discoveries WHERE status = 'deferred'").get() as { c: number }).c, 2, 'two deferred, not discarded');
  const claimed = claimNextJob(db, 'w1', T);
  assert.ok(claimed, 'a promoted channel job is claimable');
  db.close();
});
