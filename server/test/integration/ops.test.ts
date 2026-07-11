import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { openDatabase, type Db } from '../../src/db/connection';
import { runMigrations } from '../../src/db/migrate';
import { performBackup, verifyBackup } from '../../src/services/backup';
import { hasOverdueCaptions, sweepCaptionArtifacts } from '../../src/services/retention';
import { acquireWorkerLease, nextDailyCapEligibleAt, promoteDiscoveries } from '../../src/services/scheduler';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const T = 1_731_000_000_000;

function memDb(): Db {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  db.prepare("INSERT INTO users (id, timezone, created_at, updated_at) VALUES ('leo','Asia/Seoul',?,?)").run(T, T);
  return db;
}

test('worker singleton lease is exclusive until expiry', () => {
  const db = memDb();
  assert.equal(acquireWorkerLease(db, 'owner-1', T, 1000), true);
  assert.equal(acquireWorkerLease(db, 'owner-2', T + 500, 1000), false);
  assert.equal(acquireWorkerLease(db, 'owner-2', T + 2000, 1000), true); // previous lease expired
  db.close();
});

test('promoteDiscoveries promotes at most 3 oldest and keeps the rest deferred', () => {
  const db = memDb();
  db.prepare("INSERT INTO channels (id, user_id, youtube_channel_id, canonical_url, public_title, status, auto_processing_enabled, approval_version, created_at, updated_at) VALUES ('ch','leo','UCx','u','T','active',1,1,?,?)").run(T, T);
  db.prepare("INSERT INTO provider_scope_approvals (id, user_id, origin_kind, manual_batch_id, channel_id, source_scope, scope_attestation_version, status, approval_version, approved_at, created_at, updated_at) VALUES ('csa','leo','channel',NULL,'ch','public_low_risk_youtube_technology','d009a.public-youtube-tech.v1','active',1,?,?,?)").run(T, T, T);
  for (let i = 0; i < 5; i++) {
    db.prepare("INSERT INTO channel_discoveries (id, channel_id, youtube_video_id, published_at, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)").run(`d${i}`, 'ch', `v${i}`, T + i, 'discovered', T, T);
  }
  const promoted = promoteDiscoveries(db, 'ch', T + 100);
  assert.equal(promoted.length, 3);
  const queued = (db.prepare("SELECT COUNT(*) c FROM channel_discoveries WHERE status='queued'").get() as { c: number }).c;
  const deferred = (db.prepare("SELECT COUNT(*) c FROM channel_discoveries WHERE status='deferred'").get() as { c: number }).c;
  assert.equal(queued, 3);
  assert.equal(deferred, 2);
  db.close();
});

test('daily cap eligibility is the next Asia/Seoul midnight plus deterministic jitter', () => {
  const eligible = nextDailyCapEligibleAt(T, 'job-seed');
  assert.ok(eligible > T);
  assert.equal(nextDailyCapEligibleAt(T, 'job-seed'), nextDailyCapEligibleAt(T, 'job-seed'), 'deterministic');
  // KST midnight component (UTC ms) plus a jitter under 5 minutes
  const kstMidnightUtc = eligible - (eligible % 1000) - (((eligible % 1000) + 0) % 1000);
  void kstMidnightUtc;
  const jitterMs = eligible - (Math.floor((eligible + 9 * 3600000) / 86400000) * 86400000 - 9 * 3600000);
  assert.ok(jitterMs >= 0 && jitterMs < 5 * 60 * 1000, 'jitter under 5 minutes');
});

function seedJobWithCaption(db: Db, jobId: string, createdAt: number, expiresAt: number): void {
  db.prepare("INSERT OR IGNORE INTO source_videos (id, youtube_video_id, channel_id, canonical_url, public_title, duration_sec, caption_kinds, caption_languages, provenance_json, created_at, updated_at) VALUES ('sv','vid00000001','UCx','u','T',600,'[]','[]','{}',?,?)").run(T, T);
  db.prepare("INSERT OR IGNORE INTO manual_batches (id, user_id, status, source_scope, scope_attestation_version, idempotency_key, approved_at, created_at, updated_at) VALUES ('mb','leo','accepted','public_low_risk_youtube_technology','d009a.public-youtube-tech.v1','k',?,?,?)").run(T, T, T);
  db.prepare("INSERT OR IGNORE INTO manual_batch_items (id, batch_id, ordinal, input_sha256, status, created_at, updated_at) VALUES ('mbi','mb',1,'h','queued',?,?)").run(T, T);
  db.prepare("INSERT OR IGNORE INTO provider_scope_approvals (id, user_id, origin_kind, manual_batch_id, channel_id, source_scope, scope_attestation_version, status, approval_version, approved_at, created_at, updated_at) VALUES ('sa','leo','manual','mb',NULL,'public_low_risk_youtube_technology','d009a.public-youtube-tech.v1','active',1,?,?,?)").run(T, T, T);
  db.prepare("INSERT INTO processing_jobs (id, user_id, source_video_id, scope_approval_id, origin_kind, manual_batch_item_id, channel_discovery_id, approval_version, state, stage, eligible_at, verifier_attempts, idempotency_key, created_at, updated_at) VALUES (?,'leo','sv','sa','manual','mbi',NULL,1,'captioning','caption',?,0,?,?,?)").run(jobId, T, randomUUID(), T, T);
  db.prepare("INSERT INTO temporary_caption_artifacts (id, job_id, relative_temp_key, sha256, byte_count, languages, kinds, delete_status, created_at, expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)").run(`tca-${jobId}`, jobId, `k-${jobId}`, 'x', 100, '[]', '[]', 'pending', createdAt, expiresAt);
}

test('retention sweep deletes expired captions and flags overdue past the 24h deadline', () => {
  const db = memDb();
  seedJobWithCaption(db, 'j1', T, T + 60_000); // expires soon; delete succeeds
  const deleted: string[] = [];
  const r1 = sweepCaptionArtifacts(db, T + 120_000, (k) => deleted.push(k));
  assert.equal(r1.deleted.length, 1);
  assert.ok(deleted.includes('k-j1'));

  // second artifact past hard deadline with a failing delete -> overdue
  db.prepare("INSERT INTO temporary_caption_artifacts (id, job_id, relative_temp_key, sha256, byte_count, languages, kinds, delete_status, created_at, expires_at) VALUES ('tca-old','j1','k-old','x',100,'[]','[]','pending',?,?)").run(T - 2 * 86_400_000, T - 86_400_000);
  const r2 = sweepCaptionArtifacts(db, T, () => {
    throw new Error('unlink failed');
  });
  assert.equal(r2.overdue.length, 1);
  assert.equal(hasOverdueCaptions(db, T), true);
  db.close();
});

test('backup creates a hash-verified generation and the restore drill passes; corruption fails', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'vn-bak-'));
  const dbPath = join(dir, 'vibenews.sqlite3');
  const db = openDatabase(dbPath);
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  db.prepare("INSERT INTO users (id, timezone, created_at, updated_at) VALUES ('leo','Asia/Seoul',?,?)").run(T, T);

  const result = await performBackup(db, join(dir, 'backups'), 'gen-2026-07-11');
  assert.ok(result.complete);
  assert.equal(verifyBackup(result.dbFile), true);
  db.close();

  const bogus = join(dir, 'not-a-db.sqlite3');
  writeFileSync(bogus, 'this is not sqlite');
  assert.equal(verifyBackup(bogus), false);
});
