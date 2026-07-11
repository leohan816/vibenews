// Private Fastify API (설계문서/18 §11, §14). Binds loopback only; behind operator-owned Tailscale
// Serve. Every /v1 route except health/live requires the bearer token. Errors use the safe envelope.

import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import Fastify, { type FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

import { loadConfig } from '../config';
import { openDatabase, type Db } from '../db/connection';
import { requireAuth } from '../http/auth';
import { AppError, errorEnvelope, statusForCode } from '../http/errors';
import { zodFieldErrors } from '../http/schemas';
import { registerAudioRoutes } from '../http/routes/audio';
import { registerBatchRoutes } from '../http/routes/batches';
import { registerChannelRoutes } from '../http/routes/channels';
import { registerContentRoutes } from '../http/routes/content';
import { registerHealthRoutes } from '../http/routes/health';
import { registerLibraryRoutes } from '../http/routes/library';
import { registerPlaybackRoutes } from '../http/routes/playback';
import { registerSessionRoutes } from '../http/routes/sessions';

export interface ApiDeps {
  db: Db;
  deviceTokenSha256: string;
  audioDir: string;
  now: () => number;
}

export function buildApp(deps: ApiDeps): FastifyInstance {
  const app = Fastify({ bodyLimit: 64 * 1024, genReqId: () => randomUUID() });

  app.addHook('onRequest', async (req, reply) => {
    if (req.method === 'GET' && req.url.startsWith('/v1/health/live')) return;
    await requireAuth(deps.deviceTokenSha256)(req, reply);
  });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof AppError) {
      void reply.status(statusForCode(err.code)).send(errorEnvelope(err.code, req.id, err.retryable, err.fieldErrors));
      return;
    }
    if (err instanceof ZodError) {
      void reply.status(400).send(errorEnvelope('VALIDATION_ERROR', req.id, false, zodFieldErrors(err)));
      return;
    }
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 413) {
      void reply.status(413).send(errorEnvelope('VALIDATION_ERROR', req.id));
      return;
    }
    if (status === 400) {
      void reply.status(400).send(errorEnvelope('VALIDATION_ERROR', req.id));
      return;
    }
    void reply.status(500).send(errorEnvelope('INTERNAL_ERROR', req.id));
  });

  registerHealthRoutes(app, deps);
  registerBatchRoutes(app, deps);
  registerChannelRoutes(app, deps);
  registerLibraryRoutes(app, deps);
  registerSessionRoutes(app, deps);
  registerPlaybackRoutes(app, deps);
  registerAudioRoutes(app, deps);
  registerContentRoutes(app, deps);
  return app;
}

async function main(): Promise<void> {
  const cfg = loadConfig(process.env);
  const db = openDatabase(join(cfg.stateDir, 'db', 'vibenews.sqlite3'));
  const app = buildApp({ db, deviceTokenSha256: cfg.deviceTokenSha256, audioDir: join(cfg.stateDir, 'audio'), now: () => Date.now() });
  await app.listen({ host: cfg.bindHost, port: cfg.port });
}

const HERE = dirname(fileURLToPath(import.meta.url));
const invoked = process.argv[1] ? process.argv[1].startsWith(join(HERE, 'api')) || process.argv[1] === fileURLToPath(import.meta.url) : false;
if (invoked) {
  void main();
}
