// better-sqlite3 connection with the exact pragmas from 설계문서/18 §3.1.

import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';

export type Db = DatabaseType;

export interface OpenDbOptions {
  readonly?: boolean;
}

export function openDatabase(filename: string, options: OpenDbOptions = {}): Db {
  const db = new Database(filename, { readonly: options.readonly ?? false });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  return db;
}

export function foreignKeysEnabled(db: Db): boolean {
  const row = db.pragma('foreign_keys', { simple: true });
  return row === 1;
}

export function journalMode(db: Db): string {
  return String(db.pragma('journal_mode', { simple: true }));
}
