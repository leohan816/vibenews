import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { foreignKeysEnabled, journalMode, openDatabase, type Db } from '../../src/db/connection';
import { loadMigrations, runMigrations } from '../../src/db/migrate';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const NOW = 1_731_000_000_000;

function freshMemoryDb(): Db {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: NOW });
  return db;
}

function insertUser(db: Db, id = 'leo'): void {
  db.prepare('INSERT INTO users (id, timezone, created_at, updated_at) VALUES (?, ?, ?, ?)').run(
    id,
    'Asia/Seoul',
    NOW,
    NOW,
  );
}

test('migration 001 applies, records checksum, enables foreign keys', () => {
  const db = freshMemoryDb();
  const migrated = db
    .prepare('SELECT version, checksum FROM schema_migrations WHERE version = 1')
    .get() as { version: number; checksum: string } | undefined;
  assert.ok(migrated, 'version 1 recorded');
  assert.equal(migrated?.checksum, loadMigrations(MIGRATIONS_DIR)[0]?.checksum);
  assert.ok(foreignKeysEnabled(db));
  const tables = new Set(
    (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>).map(
      (r) => r.name,
    ),
  );
  for (const t of [
    'users',
    'processing_jobs',
    'provider_attempts',
    'provider_payload_audits',
    'content_items',
    'audio_assets',
    'playback_items',
    'global_playback_state',
    'daily_tts_usage',
    'tts_generation_receipts',
  ]) {
    assert.ok(tables.has(t), `table ${t} exists`);
  }
  db.close();
});

test('users id is fixed to leo by CHECK', () => {
  const db = freshMemoryDb();
  assert.doesNotThrow(() => insertUser(db, 'leo'));
  assert.throws(() => insertUser(db, 'bob'), /CHECK/);
  db.close();
});

test('daily_tts_usage forbids reserved+successful over 10', () => {
  const db = freshMemoryDb();
  insertUser(db);
  const ins = db.prepare(
    'INSERT INTO daily_tts_usage (user_id, local_date, reserved_count, successful_count, updated_at) VALUES (?, ?, ?, ?, ?)',
  );
  assert.doesNotThrow(() => ins.run('leo', '2026-07-11', 6, 4, NOW));
  assert.throws(() => ins.run('leo', '2026-07-12', 6, 5, NOW), /CHECK/);
  db.close();
});

test('at most one in_progress playback item per user (partial unique)', () => {
  const db = freshMemoryDb();
  insertUser(db);
  // minimal category/subcategory/source/content to satisfy FKs
  seedOneContentItem(db, 'ci-1');
  seedOneContentItem(db, 'ci-2');
  const ins = db.prepare(
    'INSERT INTO playback_items (user_id, content_item_id, status, last_position_ms, duration_ms, revision, created_at, updated_at) VALUES (?, ?, ?, 0, 1000, 0, ?, ?)',
  );
  assert.doesNotThrow(() => ins.run('leo', 'ci-1', 'in_progress', NOW, NOW));
  assert.throws(() => ins.run('leo', 'ci-2', 'in_progress', NOW, NOW), /UNIQUE/);
  db.close();
});

test('foreign keys are enforced (bad batch reference rejected)', () => {
  const db = freshMemoryDb();
  insertUser(db);
  assert.throws(
    () =>
      db
        .prepare(
          'INSERT INTO manual_batch_items (id, batch_id, ordinal, input_sha256, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run('mbi-1', 'nonexistent-batch', 1, 'h', 'queued', NOW, NOW),
    /FOREIGN KEY/,
  );
  db.close();
});

test('content_items composite FK blocks a subcategory/category mismatch', () => {
  const db = freshMemoryDb();
  insertUser(db);
  db.prepare('INSERT INTO categories (id, slug, display_name, status, created_at, updated_at) VALUES (?,?,?,?,?,?)').run(
    'cat-a',
    'ai',
    'AI',
    'active',
    NOW,
    NOW,
  );
  db.prepare('INSERT INTO categories (id, slug, display_name, status, created_at, updated_at) VALUES (?,?,?,?,?,?)').run(
    'cat-b',
    'developer',
    'Developer',
    'active',
    NOW,
    NOW,
  );
  db.prepare('INSERT INTO subcategories (id, category_id, slug, display_name, created_at, updated_at) VALUES (?,?,?,?,?,?)').run(
    'sub-a',
    'cat-a',
    'agents',
    'Agents',
    NOW,
    NOW,
  );
  db.prepare(
    'INSERT INTO source_videos (id, youtube_video_id, channel_id, canonical_url, public_title, duration_sec, caption_kinds, caption_languages, provenance_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
  ).run('sv-1', 'vid00000001', 'UCx', 'https://www.youtube.com/watch?v=vid00000001', 'T', 600, '[]', '[]', '{}', NOW, NOW);

  const insertContent = (categoryId: string) =>
    db
      .prepare(
        `INSERT INTO content_items
         (id, user_id, source_video_id, content_kind, category_id, subcategory_id,
          builder_output_json, builder_output_hash, builder_schema_version, builder_prompt_version,
          verifier_output_json, verifier_score, verifier_schema_version, verifier_prompt_version,
          title, one_line_summary, state, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        'ci-x',
        'leo',
        'sv-1',
        'analysis',
        categoryId,
        'sub-a',
        '{}',
        'h',
        'builder-output.v1',
        'builder.aggregate.youtube-mvp.v1',
        '{}',
        9.2,
        'verifier-output.v1',
        'verifier.youtube-mvp.v1',
        'Title',
        'Summary',
        'built',
        NOW,
        NOW,
      );
  // sub-a belongs to cat-a; using cat-b must fail the composite FK.
  assert.throws(() => insertContent('cat-b'), /FOREIGN KEY/);
  assert.doesNotThrow(() => insertContent('cat-a'));
  db.close();
});

test('re-applying migration 001 is an idempotent no-op', () => {
  const db = freshMemoryDb();
  const result = runMigrations(db, MIGRATIONS_DIR, { now: NOW });
  assert.deepEqual(result.applied, []);
  assert.deepEqual(result.skipped, [1]);
  db.close();
});

test('a checksum mismatch fails closed with MIGRATION_MISMATCH', () => {
  const db = freshMemoryDb();
  db.prepare('UPDATE schema_migrations SET checksum = ? WHERE version = 1').run('deadbeef');
  assert.throws(() => runMigrations(db, MIGRATIONS_DIR, { now: NOW }), /MIGRATION_MISMATCH:1/);
  db.close();
});

test('file database uses WAL and persists across reopen', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vn-mig-'));
  const dbPath = join(dir, 'vibenews.sqlite3');
  const db = openDatabase(dbPath);
  runMigrations(db, MIGRATIONS_DIR, { now: NOW });
  assert.equal(journalMode(db).toLowerCase(), 'wal');
  db.close();
  const reopened = openDatabase(dbPath);
  const row = reopened.prepare('SELECT version FROM schema_migrations WHERE version = 1').get();
  assert.ok(row, 'schema persisted across reopen');
  reopened.close();
});

// --- helpers ---
function seedOneContentItem(db: Db, id: string): void {
  const has = db.prepare("SELECT 1 FROM categories WHERE id='cat-seed'").get();
  if (!has) {
    db.prepare('INSERT INTO categories (id, slug, display_name, status, created_at, updated_at) VALUES (?,?,?,?,?,?)').run(
      'cat-seed',
      'ai',
      'AI',
      'active',
      NOW,
      NOW,
    );
    db.prepare('INSERT INTO subcategories (id, category_id, slug, display_name, created_at, updated_at) VALUES (?,?,?,?,?,?)').run(
      'sub-seed',
      'cat-seed',
      'agents',
      'Agents',
      NOW,
      NOW,
    );
  }
  db.prepare(
    'INSERT INTO source_videos (id, youtube_video_id, channel_id, canonical_url, public_title, duration_sec, caption_kinds, caption_languages, provenance_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
  ).run(`sv-${id}`, `v${id}`.padEnd(11, '0').slice(0, 11), 'UCx', `https://www.youtube.com/watch?v=${id}`, 'T', 600, '[]', '[]', '{}', NOW, NOW);
  db.prepare(
    `INSERT INTO content_items
     (id, user_id, source_video_id, content_kind, category_id, subcategory_id,
      builder_output_json, builder_output_hash, builder_schema_version, builder_prompt_version,
      verifier_output_json, verifier_score, verifier_schema_version, verifier_prompt_version,
      title, one_line_summary, state, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    id,
    'leo',
    `sv-${id}`,
    'analysis',
    'cat-seed',
    'sub-seed',
    '{}',
    'h',
    'builder-output.v1',
    'builder.aggregate.youtube-mvp.v1',
    '{}',
    9.2,
    'verifier-output.v1',
    'verifier.youtube-mvp.v1',
    'Title',
    'Summary',
    'audio_ready',
    NOW,
    NOW,
  );
}
