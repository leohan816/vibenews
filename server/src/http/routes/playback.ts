import type { FastifyInstance } from 'fastify';

import type { ApiDeps } from '../../bin/api';
import { AppError } from '../errors';
import { createManualReplaySchema, playbackMutationSchema } from '../schemas';
import { applyMutation, createManualReplay, ensureUserAndGlobal, getGlobalView, PlaybackConflictError } from '../../services/playback';

export function registerPlaybackRoutes(app: FastifyInstance, deps: ApiDeps): void {
  app.get('/v1/playback/global', async (req, reply) => {
    ensureUserAndGlobal(deps.db, deps.now());
    return reply.send({ data: getGlobalView(deps.db), requestId: req.id });
  });

  app.post('/v1/playback/mutations', async (req, reply) => {
    const body = playbackMutationSchema.parse(req.body);
    ensureUserAndGlobal(deps.db, deps.now());
    try {
      const res = applyMutation(deps.db, body, deps.now());
      return reply.send({ data: res, requestId: req.id });
    } catch (e) {
      if (e instanceof PlaybackConflictError) throw new AppError('PLAYBACK_REVISION_CONFLICT', true);
      throw e;
    }
  });

  app.post('/v1/manual-replays', async (req, reply) => {
    const body = createManualReplaySchema.parse(req.body);
    return reply.send({
      data: createManualReplay(deps.db, { contentItemId: body.contentItemId, clientMutationId: body.clientMutationId }, deps.now()),
      requestId: req.id,
    });
  });
}
