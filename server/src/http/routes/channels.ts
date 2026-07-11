import type { FastifyInstance } from 'fastify';

import type { ApiDeps } from '../../bin/api';
import { createChannelSchema, patchChannelSchema } from '../schemas';
import { deleteChannel, getChannelView, listChannels, patchChannel, registerChannel } from '../../services/source';

export function registerChannelRoutes(app: FastifyInstance, deps: ApiDeps): void {
  app.get('/v1/channels', async (req, reply) => {
    return reply.send({ data: listChannels(deps.db), requestId: req.id });
  });

  app.post('/v1/channels', async (req, reply) => {
    const body = createChannelSchema.parse(req.body);
    const view = registerChannel(deps.db, { url: body.url, autoProcessingEnabled: body.autoProcessingEnabled }, deps.now());
    return reply.status(201).send({ data: view, requestId: req.id });
  });

  app.patch('/v1/channels/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = patchChannelSchema.parse(req.body);
    return reply.send({ data: patchChannel(deps.db, id, body.autoProcessingEnabled, deps.now()), requestId: req.id });
  });

  app.delete('/v1/channels/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.status(202).send({ data: deleteChannel(deps.db, id, deps.now()), requestId: req.id });
  });

  app.get('/v1/channels/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    return reply.send({ data: getChannelView(deps.db, id), requestId: req.id });
  });
}
