// Caption temp retention and orphan cleanup (설계문서/18 §6.4, §12.4). Raw caption temp files are
// deleted immediately after use and swept every 15 minutes; nothing may exceed created_at + 24h.
// Overdue deletion makes readiness unhealthy and blocks new provider claims.

import type { Db } from '../db/connection';

export const CAPTION_SWEEP_INTERVAL_MS = 15 * 60 * 1000;
export const CAPTION_HARD_DEADLINE_MS = 24 * 60 * 60 * 1000;

export interface SweepResult {
  deleted: string[];
  overdue: string[];
  failed: string[];
}

/** Deletes expired/orphan caption temp artifacts. deleteFile removes the on-disk file; a delete
 *  failure marks the row 'failed' and (if past the hard deadline) 'overdue'. */
export function sweepCaptionArtifacts(db: Db, now: number, deleteFile: (relativeKey: string) => void): SweepResult {
  const result: SweepResult = { deleted: [], overdue: [], failed: [] };
  const rows = db.prepare("SELECT id, relative_temp_key, created_at, expires_at, delete_status FROM temporary_caption_artifacts WHERE delete_status IN ('pending','failed')").all() as Array<{
    id: string;
    relative_temp_key: string;
    created_at: number;
    expires_at: number;
    delete_status: string;
  }>;
  for (const row of rows) {
    const dueBySweep = row.expires_at <= now;
    const pastDeadline = row.created_at + CAPTION_HARD_DEADLINE_MS < now;
    if (!dueBySweep && !pastDeadline) continue;
    try {
      deleteFile(row.relative_temp_key);
      db.prepare("UPDATE temporary_caption_artifacts SET delete_status = 'deleted', deleted_at = ? WHERE id = ?").run(now, row.id);
      result.deleted.push(row.id);
    } catch {
      const status = pastDeadline ? 'overdue' : 'failed';
      db.prepare('UPDATE temporary_caption_artifacts SET delete_status = ? WHERE id = ?').run(status, row.id);
      if (pastDeadline) result.overdue.push(row.id);
      else result.failed.push(row.id);
    }
  }
  return result;
}

/** True when any caption temp is past its hard deadline or already marked overdue. Blocks claims. */
export function hasOverdueCaptions(db: Db, now: number): boolean {
  const overdue = db
    .prepare("SELECT COUNT(*) c FROM temporary_caption_artifacts WHERE delete_status = 'overdue' OR (delete_status IN ('pending','failed') AND created_at + ? < ?)")
    .get(CAPTION_HARD_DEADLINE_MS, now) as { c: number };
  return overdue.c > 0;
}
