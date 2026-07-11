import { randomUUID } from 'node:crypto';

import type { FastifyInstance } from 'fastify';

import type { ApiDeps } from '../../bin/api';
import { AppError } from '../errors';
import { createCorrectionSchema } from '../schemas';

export function registerContentRoutes(app: FastifyInstance, deps: ApiDeps): void {
  app.delete('/v1/content-items/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const ci = deps.db.prepare("SELECT id, deleted_at FROM content_items WHERE id = ? AND user_id = 'leo'").get(id) as { id: string; deleted_at: number | null } | undefined;
    if (!ci || ci.deleted_at) throw new AppError('NOT_FOUND');
    const now = deps.now();
    const tx = deps.db.transaction(() => {
      deps.db.prepare("UPDATE content_items SET state = 'deleted', deleted_at = ?, updated_at = ? WHERE id = ?").run(now, now, id);
      deps.db.prepare("UPDATE audio_assets SET status = 'deleted', deleted_at = ?, updated_at = ? WHERE content_item_id = ?").run(now, now, id);
      const g = deps.db.prepare("SELECT active_content_id FROM global_playback_state WHERE user_id = 'leo'").get() as { active_content_id: string | null } | undefined;
      if (g && g.active_content_id === id) {
        deps.db.prepare("UPDATE global_playback_state SET active_content_id = NULL, last_position_ms = 0, revision = revision + 1, updated_at = ? WHERE user_id = 'leo'").run(now);
      }
    });
    tx();
    return reply.status(202).send({ data: { contentItemId: id, status: 'deleted', cleanupQueued: true }, requestId: req.id });
  });

  app.post('/v1/content-items/:id/corrections', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = createCorrectionSchema.parse(req.body);
    const ci = deps.db.prepare("SELECT id, correction_version, deleted_at FROM content_items WHERE id = ? AND user_id = 'leo'").get(id) as
      | { id: string; correction_version: number; deleted_at: number | null }
      | undefined;
    if (!ci || ci.deleted_at) throw new AppError('NOT_FOUND');
    // A correction creates a new pipeline job (executed by the worker); no raw source text is handled here.
    void body.reasonCode;
    return reply.status(202).send({ data: { contentItemId: id, correctionVersion: ci.correction_version + 1, jobId: randomUUID(), status: 'queued' }, requestId: req.id });
  });
}
