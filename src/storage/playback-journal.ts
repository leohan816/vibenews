// Device journal/outbox writes (설계문서/18 §10.4). Every checkpoint writes the cache and the outbox
// row in one exclusive transaction; the outbox drains in (created_at, run, sequence) order.

import type { SQLiteDatabase } from 'expo-sqlite';

import { drainOrder, type LocalMutation, type LocalPlaybackCache } from '../audio/global-playback-machine';

interface OutboxRow {
  client_mutation_id: string;
  device_run_id: string;
  device_sequence: number;
  base_revision: number;
  action: string;
  content_item_id: string;
  session_id: string;
  position_ms: number;
  created_at: number;
}

export async function readCache(db: SQLiteDatabase): Promise<LocalPlaybackCache | null> {
  const row = await db.getFirstAsync<{
    active_content_id: string | null;
    active_session_id: string | null;
    status: string | null;
    position_ms: number;
    duration_ms: number;
    server_revision: number;
    device_run_id: string | null;
    next_sequence: number;
  }>("SELECT * FROM device_playback_cache WHERE user_id = 'leo'");
  if (!row) return null;
  return {
    activeContentId: row.active_content_id,
    activeSessionId: row.active_session_id,
    status: (row.status as LocalPlaybackCache['status']) ?? null,
    positionSec: row.position_ms / 1000,
    durationSec: row.duration_ms / 1000,
    revision: row.server_revision,
    deviceRunId: row.device_run_id ?? '',
    nextSequence: row.next_sequence,
  };
}

/** Persists the optimistic cache and enqueues the mutation in one exclusive transaction. */
export async function writeCheckpoint(db: SQLiteDatabase, cache: LocalPlaybackCache, m: LocalMutation): Promise<void> {
  const now = Date.now();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO device_playback_cache (user_id, active_content_id, active_session_id, status, position_ms, duration_ms, server_revision, device_run_id, next_sequence, updated_at)
       VALUES ('leo', ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET active_content_id=excluded.active_content_id, active_session_id=excluded.active_session_id, status=excluded.status,
         position_ms=excluded.position_ms, duration_ms=excluded.duration_ms, server_revision=excluded.server_revision, device_run_id=excluded.device_run_id,
         next_sequence=excluded.next_sequence, updated_at=excluded.updated_at`,
      [
        cache.activeContentId,
        cache.activeSessionId,
        cache.status,
        Math.round(cache.positionSec * 1000),
        Math.round(cache.durationSec * 1000),
        cache.revision,
        cache.deviceRunId,
        cache.nextSequence,
        now,
      ],
    );
    await txn.runAsync(
      `INSERT OR IGNORE INTO device_playback_outbox (client_mutation_id, device_run_id, device_sequence, base_revision, action, content_item_id, session_id, position_ms, created_at, attempt_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [m.clientMutationId, m.deviceRunId, m.deviceSequence, m.baseRevision, m.type, m.contentItemId, m.sessionId, Math.round(m.positionSec * 1000), now],
    );
  });
}

export async function readOutbox(db: SQLiteDatabase): Promise<LocalMutation[]> {
  const rows = await db.getAllAsync<OutboxRow>('SELECT * FROM device_playback_outbox');
  const mutations: LocalMutation[] = rows.map((r) => ({
    clientMutationId: r.client_mutation_id,
    deviceRunId: r.device_run_id,
    deviceSequence: r.device_sequence,
    baseRevision: r.base_revision,
    sessionId: r.session_id,
    contentItemId: r.content_item_id,
    positionSec: r.position_ms / 1000,
    durationSec: 0,
    type: r.action as LocalMutation['type'],
    createdAt: r.created_at,
  }));
  return drainOrder(mutations);
}

export async function removeFromOutbox(db: SQLiteDatabase, clientMutationId: string): Promise<void> {
  await db.runAsync('DELETE FROM device_playback_outbox WHERE client_mutation_id = ?', [clientMutationId]);
}
