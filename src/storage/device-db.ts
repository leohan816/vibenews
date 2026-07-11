// Device Expo SQLite: durable cache + outbox for global playback (설계문서/18 §8.2.1).
// user_version=1, WAL, foreign keys. Only the token lives in SecureStore, never here.

import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

export const DEVICE_DB_NAME = 'vibenews-device.db';
export const DEVICE_DB_VERSION = 1;

const MIGRATION_V1 = `
CREATE TABLE IF NOT EXISTS device_playback_cache (
  user_id TEXT PRIMARY KEY CHECK (user_id = 'leo'),
  active_content_id TEXT,
  active_session_id TEXT,
  status TEXT,
  position_ms INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  server_revision INTEGER NOT NULL DEFAULT 0,
  device_run_id TEXT,
  next_sequence INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS device_session_items (
  session_id TEXT NOT NULL,
  ordinal INTEGER NOT NULL,
  content_item_id TEXT NOT NULL,
  audio_asset_id TEXT,
  title TEXT,
  one_line_summary TEXT,
  audio_ready_at INTEGER,
  PRIMARY KEY (session_id, ordinal),
  UNIQUE (session_id, content_item_id)
);
CREATE TABLE IF NOT EXISTS device_playback_outbox (
  client_mutation_id TEXT PRIMARY KEY,
  device_run_id TEXT NOT NULL,
  device_sequence INTEGER NOT NULL,
  base_revision INTEGER NOT NULL,
  action TEXT NOT NULL,
  content_item_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  position_ms INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_attempt_at INTEGER,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  UNIQUE (device_run_id, device_sequence)
);
CREATE TABLE IF NOT EXISTS device_migrations (
  version INTEGER PRIMARY KEY,
  checksum TEXT NOT NULL,
  applied_at INTEGER NOT NULL
);
`;

export async function openDeviceDb(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync(DEVICE_DB_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await migrateDeviceDb(db);
  return db;
}

export async function migrateDeviceDb(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const current = row?.user_version ?? 0;
  if (current >= DEVICE_DB_VERSION) return;
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.execAsync(MIGRATION_V1);
    await txn.runAsync('INSERT OR IGNORE INTO device_migrations (version, checksum, applied_at) VALUES (?, ?, ?)', [
      DEVICE_DB_VERSION,
      'device-v1',
      Date.now(),
    ]);
  });
  await db.execAsync(`PRAGMA user_version = ${DEVICE_DB_VERSION};`);
}
