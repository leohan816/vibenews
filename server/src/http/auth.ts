// Private bearer auth (설계문서/18 §11, §14). The server holds only the token sha256 and compares in
// constant time. There is no multi-user auth; the only user is the fixed 'leo'.

import { createHash, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { FIXED_USER_ID } from '../domain/enums';
import { AppError } from './errors';

export function extractBearer(header: string | undefined): string | null {
  if (!header) return null;
  const m = /^Bearer (.+)$/.exec(header);
  return m ? (m[1] as string) : null;
}

export function tokenMatches(presented: string, expectedSha256Hex: string): boolean {
  const presentedDigest = createHash('sha256').update(presented, 'utf8').digest();
  let expected: Buffer;
  try {
    expected = Buffer.from(expectedSha256Hex, 'hex');
  } catch {
    return false;
  }
  if (expected.length !== presentedDigest.length) return false;
  return timingSafeEqual(presentedDigest, expected);
}

export function requireAuth(expectedSha256Hex: string) {
  return async function authPreHandler(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const token = extractBearer(req.headers.authorization);
    if (!token || !tokenMatches(token, expectedSha256Hex)) {
      throw new AppError('UNAUTHORIZED');
    }
    (req as FastifyRequest & { userId?: string }).userId = FIXED_USER_ID;
  };
}
