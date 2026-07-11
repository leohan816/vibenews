import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import type { FastifyInstance } from 'fastify';

import type { ApiDeps } from '../../bin/api';
import { AppError } from '../errors';

/** Authorized single-Range private audio streaming (설계문서/18 §11.2). Resolves an opaque asset id
 *  to a ready/non-deleted file; one `bytes=start-end` range only; suffix/multi-range/overflow -> 416.
 *  No redirect and no public URL. */
export function registerAudioRoutes(app: FastifyInstance, deps: ApiDeps): void {
  app.get('/v1/audio-assets/:id/file', async (req, reply) => {
    const { id } = req.params as { id: string };
    const asset = deps.db.prepare("SELECT id FROM audio_assets WHERE id = ? AND status = 'ready'").get(id) as { id: string } | undefined;
    if (!asset) throw new AppError('NOT_FOUND');
    const path = join(deps.audioDir, `${id}.mp3`);
    if (!existsSync(path)) throw new AppError('NOT_FOUND');
    const size = statSync(path).size;

    void reply.header('Content-Type', 'audio/mpeg');
    void reply.header('Accept-Ranges', 'bytes');
    void reply.header('Cache-Control', 'private, no-store');
    void reply.header('X-Content-Type-Options', 'nosniff');
    void reply.header('Content-Disposition', 'inline');

    const range = req.headers.range;
    if (!range) {
      void reply.header('Content-Length', String(size));
      return reply.status(200).send(readFileSync(path));
    }
    const m = /^bytes=(\d+)-(\d*)$/.exec(range); // single, non-suffix range only
    if (!m) throw new AppError('RANGE_NOT_SATISFIABLE');
    const start = Number(m[1]);
    const end = m[2] === '' ? size - 1 : Number(m[2]);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start > end || end >= size || start < 0) {
      throw new AppError('RANGE_NOT_SATISFIABLE');
    }
    const slice = readFileSync(path).subarray(start, end + 1);
    void reply.header('Content-Range', `bytes ${start}-${end}/${size}`);
    void reply.header('Content-Length', String(end - start + 1));
    return reply.status(206).send(slice);
  });
}
