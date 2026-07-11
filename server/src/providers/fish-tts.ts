// Fish Audio TTS adapter (설계문서/18 §7.4). Reads only FISH_API_KEY/FISH_TTS_MODEL/FISH_REFERENCE_ID.
// The guarded semantic payload contains only the approved script + reference id + minimal params.
// The model selector and Authorization header are attached here, AFTER the guard, and never appear
// in the guarded payload. contentItemId/scriptHash are local orchestration, not outbound body.

import { createHash } from 'node:crypto';
import { closeSync, fsyncSync, mkdirSync, openSync, writeSync } from 'node:fs';
import { join } from 'node:path';

import type { ProviderContext, ProviderError, TtsArtifact } from '../domain/contracts';
import { defaultFetchTransport, type Transport } from './deepseek-builder';

export interface FishConfig {
  apiKey: string;
  model: string;
  stagingDir: string; // private staging directory for the received audio body
  baseUrl?: string; // fixed provider endpoint; overridable only for tests
}

const DEFAULT_FISH_BASE = 'https://api.fish.audio';
const TTS_PATH = '/v1/tts';

export interface GuardedFishPayload {
  language: 'ko';
  format: 'mp3';
  speed: number;
  referenceId: string;
  segments: Array<{ order: number; text: string }>;
}

function fishError(code: ProviderError['code'], retryable: boolean, safeMessage: string, upstreamStatus?: number): ProviderError {
  const e: ProviderError = { stage: 'tts', code, retryable, safeMessage };
  if (upstreamStatus !== undefined) e.upstreamStatus = upstreamStatus;
  return e;
}

export class FishTtsProvider {
  constructor(
    private readonly cfg: FishConfig,
    private readonly transport: Transport = defaultFetchTransport,
  ) {}

  /** Performs one Fish synthesis. Timeout/connection-loss surfaces as a retryable TIMEOUT so the
   *  caller keeps the reservation and never auto-resubmits; the daily receipt lifecycle is owned by
   *  the caller. */
  async synthesize(payload: GuardedFishPayload, ctx: ProviderContext): Promise<TtsArtifact> {
    const text = payload.segments
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => s.text)
      .join('\n');
    // Wire body: script + reference + params + adapter-attached model selector. Never the api key.
    const wireBody = {
      text,
      reference_id: payload.referenceId,
      format: payload.format,
      model: this.cfg.model,
    };
    const base = this.cfg.baseUrl ?? DEFAULT_FISH_BASE;
    let res;
    try {
      res = await this.transport(`${base}${TTS_PATH}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${this.cfg.apiKey}` },
        body: JSON.stringify(wireBody),
        signal: ctx.abortSignal,
      });
    } catch {
      throw fishError('TIMEOUT', true, 'tts connection lost');
    }
    if (res.status === 401 || res.status === 403) throw fishError('AUTH_REJECTED', false, 'auth rejected', res.status);
    if (res.status === 429) throw fishError('RATE_LIMITED', true, 'rate limited', res.status);
    if (res.status >= 500) throw fishError('UPSTREAM_5XX', true, 'upstream error', res.status);
    if (res.status !== 200 || !res.arrayBuffer) throw fishError('POLICY_REJECTED', false, 'unexpected status', res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0) throw fishError('INVALID_INPUT', false, 'empty audio');
    const durationHeader = res.headers?.get('x-audio-duration-ms');
    const durationMs = durationHeader && /^\d+$/.test(durationHeader) ? Number(durationHeader) : 0;
    // Persist the actual received audio body to a fsync'd private staging file; finalization moves
    // and re-verifies these exact bytes before publishing.
    mkdirSync(this.cfg.stagingDir, { recursive: true, mode: 0o700 });
    const tempKey = join(this.cfg.stagingDir, `${ctx.jobId}.mp3`);
    const fd = openSync(tempKey, 'w', 0o600);
    try {
      writeSync(fd, buf);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    return {
      mimeType: 'audio/mpeg',
      tempKey,
      byteCount: buf.byteLength,
      durationMs,
      sha256: createHash('sha256').update(buf).digest('hex'),
    };
  }
}
