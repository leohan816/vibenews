// Forward-only, checksum-verified SQL migration runner (설계문서/18 §8, §9.3, §13.1).
// Additive migrations are applied in one transaction and recorded in schema_migrations with a
// sha256 checksum. Re-applying an already-applied version is a verified no-op; a checksum mismatch
// fails closed (MIGRATION_MISMATCH) rather than silently re-running.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Db } from './connection';

export interface MigrationFile {
  version: number;
  name: string;
  path: string;
  sql: string;
  checksum: string;
}

export interface MigrationStatusRow {
  version: number;
  checksum: string;
  applied: boolean;
  checksumMatch: boolean | null;
}

export interface MigrateResult {
  applied: number[];
  skipped: number[];
  dryRun: boolean;
  status: MigrationStatusRow[];
}

const FILE_RE = /^(\d{3,})_.+\.sql$/;

export function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function loadMigrations(dir: string): MigrationFile[] {
  const files = readdirSync(dir)
    .filter((f) => FILE_RE.test(f))
    .sort();
  return files.map((name) => {
    const match = FILE_RE.exec(name);
    const version = Number(match![1]);
    const path = join(dir, name);
    const sql = readFileSync(path, 'utf8');
    return { version, name, path, sql, checksum: sha256(sql) };
  });
}

function ensureMigrationsTable(db: Db): void {
  db.exec(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       version INTEGER PRIMARY KEY,
       checksum TEXT NOT NULL,
       applied_at INTEGER NOT NULL
     );`,
  );
}

function appliedMap(db: Db): Map<number, string> {
  ensureMigrationsTable(db);
  const rows = db.prepare('SELECT version, checksum FROM schema_migrations').all() as Array<{
    version: number;
    checksum: string;
  }>;
  return new Map(rows.map((r) => [r.version, r.checksum]));
}

export function migrationStatus(db: Db, migrations: MigrationFile[]): MigrationStatusRow[] {
  const applied = appliedMap(db);
  return migrations.map((m) => {
    const recorded = applied.get(m.version);
    return {
      version: m.version,
      checksum: m.checksum,
      applied: recorded !== undefined,
      checksumMatch: recorded === undefined ? null : recorded === m.checksum,
    };
  });
}

export interface RunMigrationsOptions {
  dryRun?: boolean;
  now?: number;
}

export function runMigrations(
  db: Db,
  dir: string,
  options: RunMigrationsOptions = {},
): MigrateResult {
  const dryRun = options.dryRun ?? false;
  const now = options.now ?? Date.now();
  const migrations = loadMigrations(dir);
  const applied = appliedMap(db);
  const appliedVersions: number[] = [];
  const skipped: number[] = [];

  for (const m of migrations) {
    const recorded = applied.get(m.version);
    if (recorded !== undefined) {
      if (recorded !== m.checksum) {
        throw new Error(`MIGRATION_MISMATCH:${m.version}`);
      }
      skipped.push(m.version);
      continue;
    }
    if (dryRun) {
      // Validate that the SQL parses/prepares without mutating this DB: run it inside an
      // in-memory clone-free savepoint and roll it back.
      const savepoint = `dry_${m.version}`;
      db.exec(`SAVEPOINT ${savepoint}`);
      try {
        db.exec(m.sql);
      } finally {
        db.exec(`ROLLBACK TO ${savepoint}`);
        db.exec(`RELEASE ${savepoint}`);
      }
      appliedVersions.push(m.version);
      continue;
    }
    const tx = db.transaction(() => {
      db.exec(m.sql);
      db.prepare('INSERT INTO schema_migrations (version, checksum, applied_at) VALUES (?, ?, ?)').run(
        m.version,
        m.checksum,
        now,
      );
    });
    tx();
    appliedVersions.push(m.version);
  }

  return {
    applied: appliedVersions,
    skipped,
    dryRun,
    status: migrationStatus(db, migrations),
  };
}
