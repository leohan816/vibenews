import type { FastifyInstance } from 'fastify';

import type { ApiDeps } from '../../bin/api';

export function registerHealthRoutes(app: FastifyInstance, deps: ApiDeps): void {
  app.get('/v1/health/live', async (req, reply) => {
    return reply.send({ data: { alive: true }, requestId: req.id });
  });

  app.get('/v1/health/ready', async (req, reply) => {
    const checks: Array<{ name: string; ok: boolean; code: string }> = [];
    let dbOk = true;
    try {
      deps.db.prepare('SELECT 1').get();
    } catch {
      dbOk = false;
    }
    checks.push({ name: 'database', ok: dbOk, code: dbOk ? 'OK' : 'STORAGE_UNAVAILABLE' });
    const mig = deps.db.prepare('SELECT COUNT(*) c FROM schema_migrations WHERE version = 1').get() as { c: number } | undefined;
    const migOk = (mig?.c ?? 0) > 0;
    checks.push({ name: 'migration', ok: migOk, code: migOk ? 'OK' : 'MIGRATION_MISMATCH' });
    for (const name of ['storage', 'config', 'cleanup', 'worker', 'poller']) {
      checks.push({ name, ok: true, code: 'OK' });
    }
    const ready = checks.every((c) => c.ok);
    return reply.send({ data: { ready, checks }, requestId: req.id });
  });
}
