// Backup / restore-drill CLI (설계문서/18 §12.4). `--verify <file>` runs the restore drill; default
// creates a hash-verified generation. Secrets and temp captions are never included.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConfig } from '../config';
import { openDatabase } from '../db/connection';
import { performBackup, verifyBackup } from '../services/backup';

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const verifyIdx = argv.indexOf('--verify');
  if (verifyIdx !== -1 && argv[verifyIdx + 1]) {
    const ok = verifyBackup(argv[verifyIdx + 1] as string);
    process.stdout.write(`BACKUP_VERIFY ${ok ? 'OK' : 'FAILED'}\n`);
    process.exit(ok ? 0 : 1);
  }
  const cfg = loadConfig(process.env);
  const db = openDatabase(join(cfg.stateDir, 'db', 'vibenews.sqlite3'), { readonly: true });
  const label = argv[0] ?? `gen-${new Date().toISOString().slice(0, 10)}`;
  const result = await performBackup(db, join(cfg.stateDir, 'backups'), label);
  process.stdout.write(`BACKUP_COMPLETE dir=${result.generationDir}\n`);
}

const HERE = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) || process.argv[1].startsWith(join(HERE, 'backup')))) {
  void main();
}
