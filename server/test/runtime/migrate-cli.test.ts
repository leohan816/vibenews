import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { openDatabase } from '../../src/db/connection';
import { runMigrations } from '../../src/db/migrate';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const NOW = 1_731_000_000_000;

test('dry-run validates migration SQL and persists nothing', () => {
  const db = openDatabase(':memory:');
  const result = runMigrations(db, MIGRATIONS_DIR, { dryRun: true, now: NOW });
  assert.equal(result.dryRun, true);
  assert.deepEqual(result.applied, [1]);
  // schema_migrations exists (runner ensures it) but has no recorded row after a dry run
  const rows = db.prepare('SELECT COUNT(*) c FROM schema_migrations').get() as { c: number };
  assert.equal(rows.c, 0, 'dry run recorded no applied migration');
  // the schema itself was rolled back
  const hasUsers = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  assert.equal(hasUsers, undefined, 'dry run left no user table');
  db.close();
});

test('apply then simulated restart keeps schema and re-apply is a no-op', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vn-rt-'));
  const dbPath = join(dir, 'vibenews.sqlite3');

  const first = openDatabase(dbPath);
  const applied = runMigrations(first, MIGRATIONS_DIR, { now: NOW });
  assert.deepEqual(applied.applied, [1]);
  first.close();

  // "restart": fresh connection to the same file
  const second = openDatabase(dbPath);
  const again = runMigrations(second, MIGRATIONS_DIR, { now: NOW });
  assert.deepEqual(again.applied, []);
  assert.deepEqual(again.skipped, [1]);
  const count = second.prepare('SELECT COUNT(*) c FROM schema_migrations').get() as { c: number };
  assert.equal(count.c, 1);
  second.close();
});
