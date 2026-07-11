// Server-canonical global playback + automatic session service (설계문서/18 §10, §11).
// One global state per user (leo). Sessions snapshot an immutable, ordered membership; completion/
// skip/deletion dynamically excludes items from every automatic surface; manual replay is isolated.

import { randomUUID } from 'node:crypto';

import type { Db } from '../db/connection';
import { FIXED_USER_ID } from '../domain/enums';
import { nextPlaybackStatus, type PlaybackAction } from '../domain/state-machines';

export type MutationType = 'START' | 'CHECKPOINT' | 'SEEK' | 'PAUSE' | 'COMPLETE' | 'SKIP';
export type EntryPoint = 'today_briefing' | 'listen_global' | 'category' | 'tag' | 'today_flow';

export interface GlobalView {
  userId: 'leo';
  activeContentItemId: string | null;
  activeSessionId: string | null;
  automaticStatus: 'in_progress' | null;
  lastPositionSec: number;
  durationSec: number;
  revision: number;
  lastDeviceRunId: string | null;
  lastDeviceSequence: number;
  updatedAt: string;
}

export interface SessionItemView {
  ordinal: number;
  contentItemId: string;
  audioAssetId: string | null;
  automaticStatus: string;
  audioReadyAt: string | null;
}
export interface SessionView {
  id: string;
  status: string;
  entryPoint: EntryPoint;
  entryContextId: string | null;
  snapshotAt: string;
  activeContentItemId: string | null;
  resumePositionSec: number;
  revision: number;
  items: SessionItemView[];
}

export interface MutationInput {
  clientMutationId: string;
  deviceRunId: string;
  deviceSequence: number;
  baseRevision: number;
  sessionId: string;
  contentItemId: string;
  positionSec: number;
  durationSec: number;
  type: MutationType;
}
export interface MutationResult {
  playback: GlobalView;
  appliedRevision: number;
  outcome: 'applied' | 'idempotent_replay' | 'stale_discarded';
}

export class PlaybackConflictError extends Error {
  readonly code = 'PLAYBACK_REVISION_CONFLICT';
  constructor() {
    super('PLAYBACK_REVISION_CONFLICT');
    this.name = 'PlaybackConflictError';
  }
}

const iso = (ms: number | null): string | null => (ms === null ? null : new Date(ms).toISOString());
const toMs = (sec: number): number => Math.round(sec * 1000);
const toSec = (ms: number): number => ms / 1000;

export function ensureUserAndGlobal(db: Db, now: number, userId: string = FIXED_USER_ID): void {
  db.prepare('INSERT OR IGNORE INTO users (id, timezone, created_at, updated_at) VALUES (?, ?, ?, ?)').run(
    userId,
    'Asia/Seoul',
    now,
    now,
  );
  db.prepare(
    'INSERT OR IGNORE INTO global_playback_state (user_id, active_content_id, active_session_id, last_position_ms, revision, last_device_run_id, last_device_sequence, updated_at) VALUES (?, NULL, NULL, 0, 0, NULL, 0, ?)',
  ).run(userId, now);
}

export function getGlobalView(db: Db, userId: string = FIXED_USER_ID): GlobalView {
  const g = db
    .prepare('SELECT * FROM global_playback_state WHERE user_id = ?')
    .get(userId) as
    | {
        active_content_id: string | null;
        active_session_id: string | null;
        last_position_ms: number;
        revision: number;
        last_device_run_id: string | null;
        last_device_sequence: number;
        updated_at: number;
      }
    | undefined;
  if (!g) throw new Error('GLOBAL_STATE_MISSING');
  let durationMs = 0;
  let status: 'in_progress' | null = null;
  if (g.active_content_id) {
    const pb = db
      .prepare('SELECT status, duration_ms FROM playback_items WHERE user_id = ? AND content_item_id = ?')
      .get(userId, g.active_content_id) as { status: string; duration_ms: number } | undefined;
    if (pb) {
      durationMs = pb.duration_ms;
      status = pb.status === 'in_progress' ? 'in_progress' : null;
    }
  }
  return {
    userId: 'leo',
    activeContentItemId: g.active_content_id,
    activeSessionId: g.active_session_id,
    automaticStatus: status,
    lastPositionSec: toSec(g.last_position_ms),
    durationSec: toSec(durationMs),
    revision: g.revision,
    lastDeviceRunId: g.last_device_run_id,
    lastDeviceSequence: g.last_device_sequence,
    updatedAt: new Date(g.updated_at).toISOString(),
  };
}

export interface CreateSessionInput {
  entryPoint: EntryPoint;
  entryContextId?: string | null;
  deviceRunId: string;
  existingSessionId?: string | null;
}

/** Same run + active session -> returns it. Otherwise snapshots active-in-progress first, then
 *  audio_ready & unheard items ready at/before now, ordered by audioReadyAt, contentItemId. */
export function createOrResumeAutomaticSession(
  db: Db,
  input: CreateSessionInput,
  now: number,
  userId: string = FIXED_USER_ID,
): SessionView {
  const tx = db.transaction((): string => {
    const existingActive = db
      .prepare("SELECT id FROM briefing_sessions WHERE user_id = ? AND status = 'active' AND device_run_id = ? ORDER BY created_at DESC LIMIT 1")
      .get(userId, input.deviceRunId) as { id: string } | undefined;
    if (existingActive) return existingActive.id;

    db.prepare("UPDATE briefing_sessions SET status = 'interrupted', updated_at = ? WHERE user_id = ? AND status = 'active'").run(now, userId);

    const global = db.prepare('SELECT active_content_id, revision FROM global_playback_state WHERE user_id = ?').get(userId) as
      | { active_content_id: string | null; revision: number }
      | undefined;
    const sessionId = randomUUID();
    db.prepare(
      'INSERT INTO briefing_sessions (id, user_id, entry_point, entry_context_id, device_run_id, snapshot_at, status, revision, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    ).run(sessionId, userId, input.entryPoint, input.entryContextId ?? null, input.deviceRunId, now, 'active', global?.revision ?? 0, now, now);

    const members: Array<{ contentId: string; status: string; audioReadyAt: number | null }> = [];
    // active in-progress content first
    if (global?.active_content_id) {
      const active = db
        .prepare("SELECT p.content_item_id AS cid, p.status AS st, c.audio_ready_at AS ar FROM playback_items p JOIN content_items c ON c.id = p.content_item_id WHERE p.user_id = ? AND p.content_item_id = ? AND p.status = 'in_progress'")
        .get(userId, global.active_content_id) as { cid: string; st: string; ar: number | null } | undefined;
      if (active) members.push({ contentId: active.cid, status: active.st, audioReadyAt: active.ar });
    }
    // then audio_ready + unheard items ready at/before snapshot, immutable order
    const rows = db
      .prepare(
        `SELECT c.id AS cid, p.status AS st, c.audio_ready_at AS ar
         FROM content_items c JOIN playback_items p ON p.content_item_id = c.id AND p.user_id = c.user_id
         WHERE c.user_id = ? AND c.state = 'audio_ready' AND c.deleted_at IS NULL
           AND p.status = 'unheard' AND c.audio_ready_at IS NOT NULL AND c.audio_ready_at <= ?
         ORDER BY c.audio_ready_at ASC, c.id ASC`,
      )
      .all(userId, now) as Array<{ cid: string; st: string; ar: number }>;
    for (const r of rows) if (!members.some((m) => m.contentId === r.cid)) members.push({ contentId: r.cid, status: r.st, audioReadyAt: r.ar });

    const insItem = db.prepare(
      'INSERT INTO briefing_session_items (user_id, session_id, content_item_id, ordinal, snapshot_status, audio_ready_at) VALUES (?,?,?,?,?,?)',
    );
    members.forEach((m, ordinal) => insItem.run(userId, sessionId, m.contentId, ordinal, m.status, m.audioReadyAt));
    return sessionId;
  });
  const sessionId = tx();
  return getSessionView(db, sessionId, userId);
}

export function getSessionView(db: Db, sessionId: string, userId: string = FIXED_USER_ID): SessionView {
  const s = db.prepare('SELECT * FROM briefing_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId) as
    | { id: string; status: string; entry_point: EntryPoint; entry_context_id: string | null; snapshot_at: number; revision: number }
    | undefined;
  if (!s) throw new Error('SESSION_NOT_FOUND');
  const items = db
    .prepare(
      `SELECT i.ordinal AS ordinal, i.content_item_id AS cid, a.id AS audio_id, p.status AS cur_status, c.audio_ready_at AS ar
       FROM briefing_session_items i
       JOIN content_items c ON c.id = i.content_item_id
       LEFT JOIN playback_items p ON p.user_id = i.user_id AND p.content_item_id = i.content_item_id
       LEFT JOIN audio_assets a ON a.content_item_id = i.content_item_id AND a.status = 'ready'
       WHERE i.session_id = ? ORDER BY i.ordinal ASC`,
    )
    .all(sessionId) as Array<{ ordinal: number; cid: string; audio_id: string | null; cur_status: string; ar: number | null }>;
  const global = getGlobalView(db, userId);
  return {
    id: s.id,
    status: s.status,
    entryPoint: s.entry_point,
    entryContextId: s.entry_context_id,
    snapshotAt: new Date(s.snapshot_at).toISOString(),
    activeContentItemId: global.activeContentItemId,
    resumePositionSec: global.lastPositionSec,
    revision: global.revision,
    items: items.map((r) => ({
      ordinal: r.ordinal,
      contentItemId: r.cid,
      audioAssetId: r.audio_id,
      automaticStatus: r.cur_status,
      audioReadyAt: iso(r.ar),
    })),
  };
}

const MUTATION_ACTION: Record<MutationType, PlaybackAction> = {
  START: 'start_playing',
  CHECKPOINT: 'checkpoint',
  SEEK: 'checkpoint',
  PAUSE: 'checkpoint',
  COMPLETE: 'complete',
  SKIP: 'skip',
};

/** Idempotent by clientMutationId. Optimistic revision check (409 on mismatch). A mutation for a
 *  no-longer-active item is safely discarded. Completion/skip clears the active pointer. */
export function applyMutation(db: Db, m: MutationInput, now: number, userId: string = FIXED_USER_ID): MutationResult {
  const tx = db.transaction((): MutationResult => {
    const prior = db.prepare('SELECT applied_revision FROM playback_mutations WHERE client_mutation_id = ?').get(m.clientMutationId) as
      | { applied_revision: number | null }
      | undefined;
    if (prior) {
      return { playback: getGlobalView(db, userId), appliedRevision: prior.applied_revision ?? getGlobalView(db, userId).revision, outcome: 'idempotent_replay' };
    }
    const g = db.prepare('SELECT active_content_id, revision FROM global_playback_state WHERE user_id = ?').get(userId) as { active_content_id: string | null; revision: number };

    if (m.baseRevision !== g.revision) throw new PlaybackConflictError();

    // Stale: a non-START mutation for an item that is not the current active item is discarded safely.
    if (m.type !== 'START' && g.active_content_id !== null && m.contentItemId !== g.active_content_id) {
      db.prepare(
        'INSERT INTO playback_mutations (client_mutation_id, user_id, device_run_id, device_sequence, base_revision, applied_revision, action, content_item_id, session_id, position_ms, created_at, applied_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      ).run(m.clientMutationId, userId, m.deviceRunId, m.deviceSequence, m.baseRevision, g.revision, m.type, m.contentItemId, m.sessionId, toMs(m.positionSec), now, now);
      return { playback: getGlobalView(db, userId), appliedRevision: g.revision, outcome: 'stale_discarded' };
    }

    const pb = db.prepare('SELECT status FROM playback_items WHERE user_id = ? AND content_item_id = ?').get(userId, m.contentItemId) as { status: string } | undefined;
    const currentStatus = (pb?.status ?? 'unheard') as 'unheard' | 'in_progress' | 'completed' | 'skipped';
    const nextStatus = nextPlaybackStatus(currentStatus, MUTATION_ACTION[m.type]);
    if (nextStatus === null) throw new PlaybackConflictError();

    const newRev = g.revision + 1;
    const posMs = toMs(m.positionSec);
    const durMs = toMs(m.durationSec);
    const cleared = nextStatus === 'completed' || nextStatus === 'skipped';

    db.prepare(
      `UPDATE playback_items SET status = ?, last_position_ms = ?, duration_ms = ?, revision = revision + 1,
        last_played_at = ?, play_count = play_count + ?, completed_at = ?, skipped_at = ?, updated_at = ?
       WHERE user_id = ? AND content_item_id = ?`,
    ).run(
      nextStatus,
      cleared ? posMs : posMs,
      durMs,
      now,
      m.type === 'START' ? 1 : 0,
      nextStatus === 'completed' ? now : null,
      nextStatus === 'skipped' ? now : null,
      now,
      userId,
      m.contentItemId,
    );

    db.prepare(
      'UPDATE global_playback_state SET active_content_id = ?, active_session_id = ?, last_position_ms = ?, revision = ?, last_device_run_id = ?, last_device_sequence = ?, updated_at = ? WHERE user_id = ?',
    ).run(cleared ? null : m.contentItemId, cleared ? null : m.sessionId, cleared ? 0 : posMs, newRev, m.deviceRunId, m.deviceSequence, now, userId);

    db.prepare(
      'INSERT INTO playback_mutations (client_mutation_id, user_id, device_run_id, device_sequence, base_revision, applied_revision, action, content_item_id, session_id, position_ms, created_at, applied_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    ).run(m.clientMutationId, userId, m.deviceRunId, m.deviceSequence, m.baseRevision, newRev, m.type, m.contentItemId, m.sessionId, posMs, now, now);

    return { playback: getGlobalView(db, userId), appliedRevision: newRev, outcome: 'applied' };
  });
  return tx();
}

export interface ManualReplayGrant {
  replayId: string;
  contentItemId: string;
  audioAssetId: string | null;
  durationSec: number;
  automaticPlaybackRevision: number;
}

/** Manual replay updates only manual counters / last played. It never touches the automatic active
 *  item, position, session, status, or revision. */
export function createManualReplay(
  db: Db,
  input: { contentItemId: string; clientMutationId: string },
  now: number,
  userId: string = FIXED_USER_ID,
): ManualReplayGrant {
  const tx = db.transaction((): ManualReplayGrant => {
    const before = getGlobalView(db, userId);
    db.prepare(
      'UPDATE playback_items SET manual_replay_count = manual_replay_count + 1, last_played_at = ?, updated_at = ? WHERE user_id = ? AND content_item_id = ?',
    ).run(now, now, userId, input.contentItemId);
    const audio = db.prepare("SELECT id FROM audio_assets WHERE content_item_id = ? AND status = 'ready'").get(input.contentItemId) as { id: string } | undefined;
    const pb = db.prepare('SELECT duration_ms FROM playback_items WHERE user_id = ? AND content_item_id = ?').get(userId, input.contentItemId) as { duration_ms: number } | undefined;
    const after = getGlobalView(db, userId);
    // Isolation invariant: automatic revision and active pointer are unchanged.
    if (after.revision !== before.revision || after.activeContentItemId !== before.activeContentItemId) {
      throw new Error('MANUAL_REPLAY_MUST_NOT_MUTATE_AUTOMATIC');
    }
    return {
      replayId: randomUUID(),
      contentItemId: input.contentItemId,
      audioAssetId: audio?.id ?? null,
      durationSec: toSec(pb?.duration_ms ?? 0),
      automaticPlaybackRevision: after.revision,
    };
  });
  return tx();
}
