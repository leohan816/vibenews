import type { FastifyInstance } from 'fastify';

import type { ApiDeps } from '../../bin/api';
import { libraryQuerySchema } from '../schemas';
import { getLibrary } from '../../services/source';

export function registerLibraryRoutes(app: FastifyInstance, deps: ApiDeps): void {
  app.get('/v1/library', async (req, reply) => {
    const q = libraryQuerySchema.parse(req.query);
    return reply.send({ data: getLibrary(deps.db, q.limit), requestId: req.id });
  });
}
