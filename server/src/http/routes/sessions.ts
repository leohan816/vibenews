import type { FastifyInstance } from 'fastify';

import type { ApiDeps } from '../../bin/api';
import { createAutomaticSessionSchema } from '../schemas';
import { createOrResumeAutomaticSession, ensureUserAndGlobal, getSessionView } from '../../services/playback';

export function registerSessionRoutes(app: FastifyInstance, deps: ApiDeps): void {
  app.post('/v1/automatic-sessions', async (req, reply) => {
    const body = createAutomaticSessionSchema.parse(req.body);
    ensureUserAndGlobal(deps.db, deps.now());
    const view = createOrResumeAutomaticSession(
      deps.db,
      { entryPoint: body.entryPoint, entryContextId: body.entryContextId ?? null, deviceRunId: body.deviceRunId, existingSessionId: body.existingSessionId ?? null },
      deps.now(),
    );
    return reply.send({ data: view, requestId: req.id });
  });

  app.get('/v1/automatic-sessions/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.send({ data: getSessionView(deps.db, id), requestId: req.id });
  });
}
