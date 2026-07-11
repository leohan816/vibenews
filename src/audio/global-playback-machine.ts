// Pure, framework-free device playback machine (설계문서/18 §10.2, §10.4, §10.5).
// No React/Expo/server imports so it is directly unit-testable. The React controller and the
// Expo SQLite journal build on these functions; the server remains the canonical authority.

export const AUTOMATIC_STATUSES = ['unheard', 'in_progress', 'completed', 'skipped'] as const;
export type AutomaticStatus = (typeof AUTOMATIC_STATUSES)[number];

export type MutationType = 'START' | 'CHECKPOINT' | 'SEEK' | 'PAUSE' | 'COMPLETE' | 'SKIP';

export interface LocalMutation {
  clientMutationId: string;
  deviceRunId: string;
  deviceSequence: number;
  baseRevision: number;
  sessionId: string;
  contentItemId: string;
  positionSec: number;
  durationSec: number;
  type: MutationType;
  createdAt: number;
}

export interface LocalPlaybackCache {
  activeContentId: string | null;
  activeSessionId: string | null;
  status: AutomaticStatus | null;
  positionSec: number;
  durationSec: number;
  revision: number;
  deviceRunId: string;
  nextSequence: number;
}

const EXPLICIT: ReadonlySet<MutationType> = new Set(['START', 'SEEK', 'PAUSE', 'COMPLETE', 'SKIP']);

/** Only a real START moves unheard -> in_progress; only COMPLETE (didJustFinish) completes;
 *  only SKIP skips. CHECKPOINT/SEEK/PAUSE keep in_progress. Returns null when not permitted. */
export function applyStatus(current: AutomaticStatus, type: MutationType): AutomaticStatus | null {
  if (current === 'completed' || current === 'skipped') return null; // terminal for automatic
  if (type === 'START') return 'in_progress';
  if (type === 'COMPLETE') return current === 'in_progress' ? 'completed' : null;
  if (type === 'SKIP') return 'skipped';
  if (type === 'CHECKPOINT' || type === 'SEEK' || type === 'PAUSE') {
    return current === 'unheard' ? 'unheard' : 'in_progress';
  }
  return null;
}

export function nextDeviceSequence(cache: Pick<LocalPlaybackCache, 'nextSequence'>): number {
  return cache.nextSequence;
}

/** Reduce a local mutation into the cache (optimistic). Position is the mutation's explicit value,
 *  including a deliberate backward seek. Bumps nextSequence and local revision monotonically. */
export function reduceLocal(cache: LocalPlaybackCache, m: LocalMutation): LocalPlaybackCache {
  const currentStatus: AutomaticStatus =
    cache.activeContentId === m.contentItemId && cache.status ? cache.status : 'unheard';
  const nextStatus = applyStatus(currentStatus, m.type) ?? currentStatus;
  const cleared = nextStatus === 'completed' || nextStatus === 'skipped';
  return {
    ...cache,
    activeContentId: cleared ? null : m.contentItemId,
    activeSessionId: cleared ? null : m.sessionId,
    status: cleared ? null : nextStatus,
    positionSec: cleared ? 0 : m.positionSec,
    durationSec: m.durationSec,
    revision: cache.revision + 1,
    nextSequence: Math.max(cache.nextSequence, m.deviceSequence + 1),
  };
}

/**
 * Coalesce an ordered outbox: only consecutive CHECKPOINT mutations for the same active item
 * collapse to the latest. START/SEEK/PAUSE/COMPLETE/SKIP never coalesce or reorder.
 */
export function coalesceOutbox(outbox: LocalMutation[]): LocalMutation[] {
  const out: LocalMutation[] = [];
  for (const m of outbox) {
    const prev = out[out.length - 1];
    if (
      prev &&
      prev.type === 'CHECKPOINT' &&
      m.type === 'CHECKPOINT' &&
      prev.contentItemId === m.contentItemId &&
      prev.sessionId === m.sessionId
    ) {
      out[out.length - 1] = m; // keep the later checkpoint value
    } else {
      out.push(m);
    }
  }
  return out;
}

/** Drain order for pending outbox on cold start: created_at, device_run_id, device_sequence. */
export function drainOrder(outbox: LocalMutation[]): LocalMutation[] {
  return outbox
    .slice()
    .sort(
      (a, b) =>
        a.createdAt - b.createdAt ||
        a.deviceRunId.localeCompare(b.deviceRunId) ||
        a.deviceSequence - b.deviceSequence,
    );
}

/**
 * Rebase the outbox after a server revision conflict against the latest server active item/session.
 * Mutations for a different (stale) active item or session are discarded; explicit actions for the
 * current active item are preserved (including a backward SEEK); a bare CHECKPOINT never overrides a
 * later explicit action for the same item.
 */
export function rebaseOutbox(
  outbox: LocalMutation[],
  server: { activeContentId: string | null; activeSessionId: string | null },
): LocalMutation[] {
  const ordered = drainOrder(coalesceOutbox(outbox));
  const kept = ordered.filter(
    (m) => m.contentItemId === server.activeContentId && m.sessionId === server.activeSessionId,
  );
  // Drop a trailing/among CHECKPOINT that is superseded by a later explicit action on the same item.
  const result: LocalMutation[] = [];
  for (let i = 0; i < kept.length; i++) {
    const m = kept[i] as LocalMutation;
    if (m.type === 'CHECKPOINT') {
      const laterExplicit = kept
        .slice(i + 1)
        .some((n) => EXPLICIT.has(n.type) && n.contentItemId === m.contentItemId);
      if (laterExplicit) continue;
    }
    result.push(m);
  }
  return result;
}

export function isExcluded(status: AutomaticStatus | null): boolean {
  return status === 'completed' || status === 'skipped';
}
