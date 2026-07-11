import type { FastifyInstance } from 'fastify';

import type { ApiDeps } from '../../bin/api';
import { AppError } from '../errors';
import { createManualBatchSchema } from '../schemas';
import { createManualBatch, enqueueManualBatch, getBatchView } from '../../services/source';

function idempotencyKey(headers: Record<string, unknown>): string {
  const key = headers['idempotency-key'];
  if (typeof key !== 'string' || key.length === 0 || key.length > 200) throw new AppError('VALIDATION_ERROR');
  return key;
}

export function registerBatchRoutes(app: FastifyInstance, deps: ApiDeps): void {
  app.post('/v1/manual-batches', async (req, reply) => {
    const body = createManualBatchSchema.parse(req.body);
    const key = idempotencyKey(req.headers as Record<string, unknown>);
    const now = deps.now();
    const { view } = createManualBatch(deps.db, { urls: body.urls, idempotencyKey: key }, now);
    // Atomically turn accepted, valid items into claimable jobs (idempotent on a retried request).
    enqueueManualBatch(deps.db, view.id, now);
    return reply.status(202).send({ data: getBatchView(deps.db, view.id), requestId: req.id });
  });

  app.get('/v1/manual-batches/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.send({ data: getBatchView(deps.db, id), requestId: req.id });
  });

  app.post('/v1/manual-batch-items/:id/retry', async (req, reply) => {
    const { id } = req.params as { id: string };
    idempotencyKey(req.headers as Record<string, unknown>);
    const item = deps.db.prepare("SELECT batch_id, status FROM manual_batch_items WHERE id = ?").get(id) as { batch_id: string; status: string } | undefined;
    if (!item) throw new AppError('NOT_FOUND');
    if (item.status !== 'failed') throw new AppError('VALIDATION_ERROR');
    const now = deps.now();
    deps.db.prepare("UPDATE manual_batch_items SET status = 'queued', error_code = NULL, updated_at = ? WHERE id = ?").run(now, id);
    // Re-run an existing (failed) job for this item, or enqueue one if none exists yet.
    deps.db.prepare("UPDATE processing_jobs SET state = 'queued', stage = 'caption', eligible_at = ?, defer_reason = NULL, error_code = NULL, lease_owner = NULL, lease_expires_at = NULL, updated_at = ? WHERE manual_batch_item_id = ?").run(now, now, id);
    deps.db.prepare("UPDATE manual_batch_items SET status = 'processing', updated_at = ? WHERE id = ? AND EXISTS (SELECT 1 FROM processing_jobs WHERE manual_batch_item_id = ?)").run(now, id, id);
    enqueueManualBatch(deps.db, item.batch_id, now);
    return reply.status(202).send({ data: getBatchView(deps.db, item.batch_id), requestId: req.id });
  });
}
