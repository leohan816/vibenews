// Same-host private backup + restore drill (설계문서/18 §12.4). better-sqlite3 online backup plus a
// ready-audio manifest into a new 0700 generation directory, hash-verified, atomically published
// with a .complete marker. Secrets and temp captions are excluded. Keeps 7 daily generations.

import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { openDatabase, type Db } from '../db/connection';

export const MAX_GENERATIONS = 7;

export interface BackupResult {
  generationDir: string;
  dbFile: string;
  manifestFile: string;
  complete: boolean;
}

export async function performBackup(db: Db, backupsDir: string, generationLabel: string): Promise<BackupResult> {
  const generationDir = join(backupsDir, generationLabel);
  mkdirSync(generationDir, { recursive: true, mode: 0o700 });
  const dbFile = join(generationDir, 'vibenews.sqlite3');
  await db.backup(dbFile);

  // Ready-audio manifest only (opaque keys + hashes; never secrets or temp captions).
  const audio = db.prepare("SELECT id, storage_key, sha256, byte_count FROM audio_assets WHERE status = 'ready'").all() as Array<{
    id: string;
    storage_key: string;
    sha256: string | null;
    byte_count: number | null;
  }>;
  const manifestFile = join(generationDir, 'audio-manifest.json');
  writeFileSync(manifestFile, JSON.stringify({ generatedFor: generationLabel, assets: audio }, null, 2), { mode: 0o600 });

  const dbHash = createHash('sha256').update(readFileSync(dbFile)).digest('hex');
  writeFileSync(join(generationDir, '.complete'), `${dbHash}\n`, { mode: 0o600 });

  pruneOldGenerations(backupsDir);
  return { generationDir, dbFile, manifestFile, complete: true };
}

export function pruneOldGenerations(backupsDir: string): void {
  let entries: string[];
  try {
    entries = readdirSync(backupsDir).sort();
  } catch {
    return;
  }
  const complete = entries.filter((name) => {
    try {
      readFileSync(join(backupsDir, name, '.complete'));
      return true;
    } catch {
      return false;
    }
  });
  const excess = complete.slice(0, Math.max(0, complete.length - MAX_GENERATIONS));
  for (const name of excess) rmSync(join(backupsDir, name), { recursive: true, force: true });
}

/** Restore drill: opens the backup in isolation and verifies migration version, foreign keys, and
 *  integrity before it could be swapped in. Returns true only when all checks pass. */
export function verifyBackup(dbFile: string): boolean {
  let db: Db | null = null;
  try {
    db = openDatabase(dbFile, { readonly: true });
    const mig = db.prepare('SELECT COUNT(*) c FROM schema_migrations WHERE version = 1').get() as { c: number };
    if (mig.c < 1) return false;
    const integrity = db.pragma('integrity_check', { simple: true });
    if (String(integrity) !== 'ok') return false;
    const fkErrors = db.pragma('foreign_key_check') as unknown[];
    return fkErrors.length === 0;
  } catch {
    return false;
  } finally {
    db?.close();
  }
}
