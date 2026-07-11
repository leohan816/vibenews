import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildApp } from '../../src/bin/api';
import { openDatabase, type Db } from '../../src/db/connection';
import { runMigrations } from '../../src/db/migrate';
import { ensureUserAndGlobal } from '../../src/services/playback';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const T = 1_731_000_000_000;
const TOKEN = 'device-token-value';
const TOKEN_SHA = createHash('sha256').update(TOKEN, 'utf8').digest('hex');
const AUTH = { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' };

function setup(): { db: Db; audioDir: string } {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  ensureUserAndGlobal(db, T);
  const audioDir = mkdtempSync(join(tmpdir(), 'vn-audio-'));
  return { db, audioDir };
}

function app(db: Db, audioDir: string) {
  return buildApp({ db, deviceTokenSha256: TOKEN_SHA, audioDir, now: () => T });
}

const uuid = () => randomUUID();

test('health/live needs no auth; other routes require the bearer token', async () => {
  const { db, audioDir } = setup();
  const a = app(db, audioDir);
  assert.equal((await a.inject({ method: 'GET', url: '/v1/health/live' })).statusCode, 200);
  assert.equal((await a.inject({ method: 'GET', url: '/v1/health/ready' })).statusCode, 401);
  const ready = await a.inject({ method: 'GET', url: '/v1/health/ready', headers: AUTH });
  assert.equal(ready.statusCode, 200);
  assert.equal(ready.json().data.ready, true);
  await a.close();
});

test('manual batch: cap, isolation, idempotency reuse, and same-key/different-body conflict', async () => {
  const { db, audioDir } = setup();
  const a = app(db, audioDir);
  // 11 urls fails validation
  const eleven = Array.from({ length: 11 }, (_, i) => `https://youtu.be/${String(i).padEnd(11, 'a').slice(0, 11)}`);
  const bad = await a.inject({ method: 'POST', url: '/v1/manual-batches', headers: { ...AUTH, 'idempotency-key': uuid() }, payload: JSON.stringify({ urls: eleven, scopeAttested: true, scopeAttestationVersion: 'd009a.public-youtube-tech.v1' }) });
  assert.equal(bad.statusCode, 400);

  const key = uuid();
  const urls = ['https://www.youtube.com/watch?v=aaaaaaaaaaa', 'https://youtu.be/bbbbbbbbbbb', 'https://www.youtube.com/watch?v=aaaaaaaaaaa', 'https://evil.example.com/x'];
  const body = JSON.stringify({ urls, scopeAttested: true, scopeAttestationVersion: 'd009a.public-youtube-tech.v1' });
  const res = await a.inject({ method: 'POST', url: '/v1/manual-batches', headers: { ...AUTH, 'idempotency-key': key }, payload: body });
  assert.equal(res.statusCode, 202);
  const items = res.json().data.items as Array<{ status: string }>;
  // The two valid items are accepted then immediately enqueued (queued -> processing).
  assert.deepEqual(items.map((i) => i.status), ['processing', 'processing', 'duplicate', 'invalid']);
  const batchId = res.json().data.id;

  // same key + same body -> same batch (idempotent)
  const again = await a.inject({ method: 'POST', url: '/v1/manual-batches', headers: { ...AUTH, 'idempotency-key': key }, payload: body });
  assert.equal(again.json().data.id, batchId);
  // same key + different body -> conflict
  const diff = await a.inject({ method: 'POST', url: '/v1/manual-batches', headers: { ...AUTH, 'idempotency-key': key }, payload: JSON.stringify({ urls: ['https://youtu.be/ccccccccccc'], scopeAttested: true, scopeAttestationVersion: 'd009a.public-youtube-tech.v1' }) });
  assert.equal(diff.statusCode, 409);
  assert.equal(diff.json().error.code, 'IDEMPOTENCY_CONFLICT');
  // unknown field rejected
  const unknown = await a.inject({ method: 'POST', url: '/v1/manual-batches', headers: { ...AUTH, 'idempotency-key': uuid() }, payload: JSON.stringify({ urls: ['https://youtu.be/ddddddddddd'], scopeAttested: true, scopeAttestationVersion: 'd009a.public-youtube-tech.v1', extra: 1 }) });
  assert.equal(unknown.statusCode, 400);
  await a.close();
});

test('channels: enable requires scope attestation; max 5 enforced', async () => {
  const { db, audioDir } = setup();
  const a = app(db, audioDir);
  const chanUrl = (i: number) => `https://www.youtube.com/channel/UC${'a'.repeat(21)}${i}`;

  const noScope = await a.inject({ method: 'POST', url: '/v1/channels', headers: { ...AUTH, 'idempotency-key': uuid() }, payload: JSON.stringify({ url: chanUrl(0), autoProcessingEnabled: true }) });
  assert.equal(noScope.statusCode, 400);

  const withScope = await a.inject({ method: 'POST', url: '/v1/channels', headers: { ...AUTH, 'idempotency-key': uuid() }, payload: JSON.stringify({ url: chanUrl(0), autoProcessingEnabled: true, scopeAttested: true, scopeAttestationVersion: 'd009a.public-youtube-tech.v1' }) });
  assert.equal(withScope.statusCode, 201);
  assert.equal(withScope.json().data.autoProcessingEnabled, true);

  for (let i = 1; i < 5; i++) {
    const r = await a.inject({ method: 'POST', url: '/v1/channels', headers: { ...AUTH, 'idempotency-key': uuid() }, payload: JSON.stringify({ url: chanUrl(i), autoProcessingEnabled: false }) });
    assert.equal(r.statusCode, 201);
  }
  const sixth = await a.inject({ method: 'POST', url: '/v1/channels', headers: { ...AUTH, 'idempotency-key': uuid() }, payload: JSON.stringify({ url: chanUrl(9), autoProcessingEnabled: false }) });
  assert.equal(sixth.statusCode, 409);
  assert.equal(sixth.json().error.code, 'CHANNEL_LIMIT_EXCEEDED');
  await a.close();
});

function seedPlayable(db: Db, id: string): void {
  db.prepare("INSERT OR IGNORE INTO categories (id, slug, display_name, status, created_at, updated_at) VALUES ('cat','developer','Developer','active',?,?)").run(T, T);
  db.prepare("INSERT OR IGNORE INTO subcategories (id, category_id, slug, display_name, created_at, updated_at) VALUES ('sub','cat','dev_tools','Dev Tools',?,?)").run(T, T);
  db.prepare('INSERT INTO source_videos (id, youtube_video_id, channel_id, canonical_url, public_title, duration_sec, caption_kinds, caption_languages, provenance_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(`sv-${id}`, `${id}0000000`.slice(0, 11), 'UCx', 'https://www.youtube.com/watch?v=x', 'T', 400, '[]', '[]', '{}', T, T);
  db.prepare("INSERT INTO content_items (id,user_id,source_video_id,content_kind,category_id,subcategory_id,builder_output_json,builder_output_hash,builder_schema_version,builder_prompt_version,verifier_output_json,verifier_score,verifier_schema_version,verifier_prompt_version,title,one_line_summary,state,audio_ready_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(id, 'leo', `sv-${id}`, 'analysis', 'cat', 'sub', '{}', 'h', 'builder-output.v1', 'b', '{}', 9.2, 'verifier-output.v1', 'v', 'Title', 'Sum', 'audio_ready', T, T, T);
  db.prepare("INSERT INTO audio_assets (id, content_item_id, status, storage_key, mime_type, byte_count, duration_ms, sha256, generated_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(`aa-${id}`, id, 'ready', `k-${id}`, 'audio/mpeg', 10, 400000, 'x', T, T, T);
  db.prepare('INSERT INTO playback_items (user_id, content_item_id, status, last_position_ms, duration_ms, revision, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)').run('leo', id, 'unheard', 0, 400000, 0, T, T);
}

test('playback mutation: revision conflict (409), applied, then idempotent replay', async () => {
  const { db, audioDir } = setup();
  const contentId = uuid();
  seedPlayable(db, contentId);
  const a = app(db, audioDir);
  const cm = uuid();
  const runId = uuid();
  const base = { clientMutationId: cm, deviceRunId: runId, deviceSequence: 1, sessionId: uuid(), contentItemId: contentId, positionSec: 0, durationSec: 400, type: 'START' as const };
  // Need a session row for the FK; create one first
  const session = await a.inject({ method: 'POST', url: '/v1/automatic-sessions', headers: { ...AUTH, 'idempotency-key': uuid() }, payload: JSON.stringify({ entryPoint: 'listen_global', deviceRunId: runId }) });
  const sessionId = session.json().data.id;

  const conflict = await a.inject({ method: 'POST', url: '/v1/playback/mutations', headers: AUTH, payload: JSON.stringify({ ...base, sessionId, baseRevision: 5 }) });
  assert.equal(conflict.statusCode, 409);
  assert.equal(conflict.json().error.code, 'PLAYBACK_REVISION_CONFLICT');

  const applied = await a.inject({ method: 'POST', url: '/v1/playback/mutations', headers: AUTH, payload: JSON.stringify({ ...base, sessionId, baseRevision: 0 }) });
  assert.equal(applied.statusCode, 200);
  assert.equal(applied.json().data.outcome, 'applied');

  const replay = await a.inject({ method: 'POST', url: '/v1/playback/mutations', headers: AUTH, payload: JSON.stringify({ ...base, sessionId, baseRevision: 0 }) });
  assert.equal(replay.json().data.outcome, 'idempotent_replay');
  await a.close();
});

test('audio Range: 200 full, 206 partial, 416 overflow/suffix, 404 missing', async () => {
  const { db, audioDir } = setup();
  seedPlayable(db, 'CIA');
  writeFileSync(join(audioDir, 'aa-CIA.mp3'), Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  const a = app(db, audioDir);

  const full = await a.inject({ method: 'GET', url: '/v1/audio-assets/aa-CIA/file', headers: AUTH });
  assert.equal(full.statusCode, 200);
  assert.equal(full.headers['accept-ranges'], 'bytes');
  assert.equal(full.headers['cache-control'], 'private, no-store');
  assert.equal(full.headers['x-content-type-options'], 'nosniff');

  const partial = await a.inject({ method: 'GET', url: '/v1/audio-assets/aa-CIA/file', headers: { ...AUTH, range: 'bytes=0-3' } });
  assert.equal(partial.statusCode, 206);
  assert.equal(partial.headers['content-range'], 'bytes 0-3/10');
  assert.equal(partial.rawPayload.length, 4);

  const overflow = await a.inject({ method: 'GET', url: '/v1/audio-assets/aa-CIA/file', headers: { ...AUTH, range: 'bytes=5-100' } });
  assert.equal(overflow.statusCode, 416);
  const suffix = await a.inject({ method: 'GET', url: '/v1/audio-assets/aa-CIA/file', headers: { ...AUTH, range: 'bytes=-5' } });
  assert.equal(suffix.statusCode, 416);

  const missing = await a.inject({ method: 'GET', url: '/v1/audio-assets/does-not-exist/file', headers: AUTH });
  assert.equal(missing.statusCode, 404);
  await a.close();
});

test('content delete tombstones the item and clears an active pointer', async () => {
  const { db, audioDir } = setup();
  const contentId = uuid();
  seedPlayable(db, contentId);
  const a = app(db, audioDir);
  const del = await a.inject({ method: 'DELETE', url: `/v1/content-items/${contentId}`, headers: { authorization: `Bearer ${TOKEN}`, 'idempotency-key': uuid() } });
  assert.equal(del.statusCode, 202);
  assert.equal(del.json().data.status, 'deleted');
  const row = db.prepare('SELECT state FROM content_items WHERE id = ?').get(contentId) as { state: string };
  assert.equal(row.state, 'deleted');
  await a.close();
});
