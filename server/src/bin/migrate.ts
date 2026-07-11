// server:migrate CLI. Supports `--dry-run` (validate SQL against an in-memory DB, persist nothing),
// `--status`, and default forward apply. Never prints secrets or provider values.

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { openDatabase } from '../db/connection';
import { loadMigrations, migrationStatus, runMigrations } from '../db/migrate';

const HERE = dirname(fileURLToPath(import.meta.url));
export const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');

function resolveDbPath(argv: string[]): string | null {
  const dbFlag = argv.indexOf('--db');
  if (dbFlag !== -1 && argv[dbFlag + 1]) return argv[dbFlag + 1] as string;
  const stateDir = process.env.VIBENEWS_STATE_DIR;
  if (stateDir) return join(stateDir, 'db', 'vibenews.sqlite3');
  return null;
}

function main(): void {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const status = argv.includes('--status');

  if (dryRun) {
    // Validate migration SQL against a throwaway in-memory database.
    const db = openDatabase(':memory:');
    try {
      const result = runMigrations(db, MIGRATIONS_DIR, { dryRun: true });
      for (const s of result.status) {
        process.stdout.write(`DRY version=${s.version} would_apply checksum=${s.checksum.slice(0, 12)}\n`);
      }
      process.stdout.write(`MIGRATE_DRY_RUN OK count=${result.applied.length}\n`);
    } finally {
      db.close();
    }
    return;
  }

  const dbPath = resolveDbPath(argv);
  if (!dbPath) {
    process.stdout.write('MIGRATE FAILED RUNTIME_CONFIG_REQUIRED (no --db and no VIBENEWS_STATE_DIR)\n');
    process.exit(1);
  }
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = openDatabase(dbPath);
  try {
    if (status) {
      const rows = migrationStatus(db, loadMigrations(MIGRATIONS_DIR));
      for (const r of rows) {
        process.stdout.write(
          `STATUS version=${r.version} applied=${r.applied} match=${r.checksumMatch === null ? 'n/a' : r.checksumMatch}\n`,
        );
      }
      process.stdout.write('MIGRATE_STATUS OK\n');
      return;
    }
    const result = runMigrations(db, MIGRATIONS_DIR);
    process.stdout.write(`MIGRATE_APPLY OK applied=[${result.applied.join(',')}] skipped=[${result.skipped.join(',')}]\n`);
  } finally {
    db.close();
  }
}

main();
