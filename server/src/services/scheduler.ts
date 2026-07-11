// Worker singleton lease, job claim ordering, discovery promotion, and cap-defer timing
// (설계문서/18 §9, §11). Provider execution itself is not performed here and never in this pass.

import { randomUUID } from 'node:crypto';

import type { Db } from '../db/connection';
import { FIXED_USER_ID } from '../domain/enums';
import { ensureSourceVideo } from './source';

export const WORKER_LEASE_MS = 5 * 60 * 1000;
export const WORKER_HEARTBEAT_MS = 30 * 1000;
export const MAX_PROMOTE_PER_POLL = 3;
export const POLL_INTERVAL_MS = 60 * 60 * 1000;

/** Single-writer worker lease. Returns true only if this owner holds the lease. */
export function acquireWorkerLease(db: Db, owner: string, now: number, leaseMs = WORKER_LEASE_MS): boolean {
  const tx = db.transaction((): boolean => {
    db.prepare("INSERT OR IGNORE INTO worker_singleton (id, lease_owner, lease_expires_at, lease_heartbeat_at) VALUES ('worker', NULL, NULL, NULL)").run();
    const row = db.prepare("SELECT lease_owner, lease_expires_at FROM worker_singleton WHERE id = 'worker'").get() as { lease_owner: string | null; lease_expires_at: number | null };
    const free = row.lease_owner === null || row.lease_expires_at === null || row.lease_expires_at <= now || row.lease_owner === owner;
    if (!free) return false;
    db.prepare("UPDATE worker_singleton SET lease_owner = ?, lease_expires_at = ?, lease_heartbeat_at = ? WHERE id = 'worker'").run(owner, now + leaseMs, now);
    return true;
  });
  return tx();
}

export function heartbeatWorkerLease(db: Db, owner: string, now: number, leaseMs = WORKER_LEASE_MS): boolean {
  const info = db.prepare("UPDATE worker_singleton SET lease_expires_at = ?, lease_heartbeat_at = ? WHERE id = 'worker' AND lease_owner = ?").run(now + leaseMs, now, owner);
  return info.changes === 1;
}

export interface ClaimedJob {
  id: string;
  state: string;
  stage: string | null;
}

/** Claims the next eligible job in fair order: eligible_at, approval/discovery age (via created_at),
 *  manual origin first on an exact tie, then job_id. Expired leases are reclaimable. */
export function claimNextJob(db: Db, owner: string, now: number, leaseMs = WORKER_LEASE_MS): ClaimedJob | null {
  const tx = db.transaction((): ClaimedJob | null => {
    const row = db
      .prepare(
        `SELECT id, state, stage FROM processing_jobs
         WHERE (state IN ('queued','deferred') AND eligible_at <= ?)
            OR (lease_expires_at IS NOT NULL AND lease_expires_at <= ? AND state NOT IN ('audio_ready','failed','canceled','deleted','human_review_required'))
         ORDER BY eligible_at ASC, created_at ASC, (CASE origin_kind WHEN 'manual' THEN 0 ELSE 1 END) ASC, id ASC
         LIMIT 1`,
      )
      .get(now, now) as { id: string; state: string; stage: string | null } | undefined;
    if (!row) return null;
    db.prepare('UPDATE processing_jobs SET lease_owner = ?, lease_expires_at = ?, lease_heartbeat_at = ?, updated_at = ? WHERE id = ?').run(owner, now + leaseMs, now, now, row.id);
    return row;
  });
  return tx();
}

/** Promotes at most three discoveries per channel per poll (oldest deferred first, then new) and, in
 *  the SAME transaction, dedupes the SourceVideo and creates exactly one channel ProcessingJob per
 *  promoted discovery. Enqueues nothing when the channel is not active+auto-on or its scope approval
 *  is not active (OFF/deleted/revoked). Remaining new discoveries stay deferred (never discarded). */
export function promoteDiscoveries(db: Db, channelId: string, now: number): string[] {
  const tx = db.transaction((): string[] => {
    const ch = db.prepare('SELECT id, user_id, youtube_channel_id, status, auto_processing_enabled FROM channels WHERE id = ?').get(channelId) as
      | { id: string; user_id: string; youtube_channel_id: string; status: string; auto_processing_enabled: number }
      | undefined;
    if (!ch || ch.status !== 'active' || ch.auto_processing_enabled !== 1) return [];
    const approval = db
      .prepare("SELECT id, approval_version FROM provider_scope_approvals WHERE channel_id = ? AND origin_kind = 'channel' AND status = 'active' ORDER BY approval_version DESC LIMIT 1")
      .get(channelId) as { id: string; approval_version: number } | undefined;
    if (!approval) return [];
    const candidates = db
      .prepare(
        `SELECT id, youtube_video_id FROM channel_discoveries WHERE channel_id = ? AND status IN ('deferred','discovered')
         ORDER BY (CASE status WHEN 'deferred' THEN 0 ELSE 1 END) ASC, published_at ASC, youtube_video_id ASC LIMIT ?`,
      )
      .all(channelId, MAX_PROMOTE_PER_POLL) as Array<{ id: string; youtube_video_id: string }>;
    const promoted: string[] = [];
    for (const c of candidates) {
      if (!db.prepare('SELECT id FROM processing_jobs WHERE channel_discovery_id = ?').get(c.id)) {
        const svId = ensureSourceVideo(db, c.youtube_video_id, ch.youtube_channel_id, `https://www.youtube.com/watch?v=${c.youtube_video_id}`, now);
        db.prepare(
          "INSERT INTO processing_jobs (id, user_id, source_video_id, scope_approval_id, origin_kind, manual_batch_item_id, channel_discovery_id, approval_version, state, stage, eligible_at, verifier_attempts, idempotency_key, created_at, updated_at) VALUES (?,?,?,?,'channel',NULL,?,?,'queued','caption',?,0,?,?,?)",
        ).run(randomUUID(), ch.user_id, svId, approval.id, c.id, approval.approval_version, now, `job:${c.id}`, now, now);
      }
      db.prepare("UPDATE channel_discoveries SET status = 'queued', eligible_at = ?, updated_at = ? WHERE id = ?").run(now, now, c.id);
      promoted.push(c.id);
    }
    // Remaining discovered stay deferred for the next poll (never discarded).
    db.prepare("UPDATE channel_discoveries SET status = 'deferred', updated_at = ? WHERE channel_id = ? AND status = 'discovered'").run(now, channelId);
    return promoted;
  });
  return tx();
}

/** Next Asia/Seoul midnight (UTC ms) plus deterministic 0..5min jitter derived from the seed. */
export function nextDailyCapEligibleAt(now: number, seed: string): number {
  // Asia/Seoul is UTC+9 (no DST). Midnight KST = 15:00 UTC of the prior day boundary.
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstNow = now + kstOffsetMs;
  const kstMidnight = Math.floor(kstNow / 86_400_000) * 86_400_000 + 86_400_000; // next KST midnight
  const utcMidnight = kstMidnight - kstOffsetMs;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const jitter = (h % (5 * 60)) * 1000; // 0..5min deterministic
  return utcMidnight + jitter;
}

export function markDailyCapDeferred(db: Db, jobId: string, now: number, seed: string, userId: string = FIXED_USER_ID): number {
  void userId;
  const eligibleAt = nextDailyCapEligibleAt(now, seed);
  db.prepare("UPDATE processing_jobs SET state = 'deferred', defer_reason = 'daily_tts_cap', eligible_at = ?, lease_owner = NULL, lease_expires_at = NULL, updated_at = ? WHERE id = ?").run(eligibleAt, now, jobId);
  return eligibleAt;
}
