// DeepSeek Builder adapter (설계문서/18 §7.2). Reads only DEEPSEEK_API_KEY/BASE_URL/BUILDER_MODEL.
// Owns the chunk -> aggregate internal steps under the single Builder selector. Never sends a
// `reasoning_effort` field. Authorization is a header, never a body field. Strict-parses outputs.

import {
  builderChunkOutputSchema,
  builderOutputSchema,
  type BuilderChunkOutput,
  type BuilderOutput,
  type ProviderContext,
  type ProviderError,
} from '../domain/contracts';

export interface HttpResponseLike {
  status: number;
  text(): Promise<string>;
  arrayBuffer?(): Promise<ArrayBuffer>;
  headers?: { get(name: string): string | null };
}
export type Transport = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal },
) => Promise<HttpResponseLike>;

export const defaultFetchTransport: Transport = async (url, init) => {
  const res = await fetch(url, { method: init.method, headers: init.headers, body: init.body, signal: init.signal });
  return { status: res.status, text: () => res.text(), arrayBuffer: () => res.arrayBuffer(), headers: res.headers };
};

export interface DeepSeekBuilderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const CHAT_PATH = '/chat/completions';

export function builderError(code: ProviderError['code'], retryable: boolean, safeMessage: string, upstreamStatus?: number): ProviderError {
  const e: ProviderError = { stage: 'builder', code, retryable, safeMessage };
  if (upstreamStatus !== undefined) e.upstreamStatus = upstreamStatus;
  return e;
}

/** Extracts strict JSON from the DeepSeek chat-completions response. Rejects markdown fences,
 *  trailing prose, and partial JSON repair. */
export function extractStrictJson(rawResponse: string, onError: () => never): unknown {
  let outer: unknown;
  try {
    outer = JSON.parse(rawResponse);
  } catch {
    onError();
  }
  const content = (outer as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') onError();
  const trimmed = (content as string).trim();
  if (trimmed.includes('```')) onError();
  if (!(trimmed.startsWith('{') && trimmed.endsWith('}'))) onError();
  try {
    return JSON.parse(trimmed);
  } catch {
    onError();
  }
}

export class DeepSeekBuilderProvider {
  constructor(
    private readonly cfg: DeepSeekBuilderConfig,
    private readonly transport: Transport = defaultFetchTransport,
  ) {}

  private async postChat(bodyObj: Record<string, unknown>, ctx: ProviderContext): Promise<unknown> {
    // Invariant: Builder requests never carry a reasoning_effort field.
    if ('reasoning_effort' in bodyObj) throw builderError('INVALID_INPUT', false, 'builder must not set reasoning_effort');
    const body = JSON.stringify(bodyObj);
    const res = await this.transport(`${this.cfg.baseUrl}${CHAT_PATH}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.cfg.apiKey}` },
      body,
      signal: ctx.abortSignal,
    });
    if (res.status === 401 || res.status === 403) throw builderError('AUTH_REJECTED', false, 'auth rejected', res.status);
    if (res.status === 429) throw builderError('RATE_LIMITED', true, 'rate limited', res.status);
    if (res.status >= 500) throw builderError('UPSTREAM_5XX', true, 'upstream error', res.status);
    if (res.status !== 200) throw builderError('POLICY_REJECTED', false, 'unexpected status', res.status);
    return extractStrictJson(await res.text(), () => {
      throw builderError('INVALID_SCHEMA', false, 'invalid builder response');
    });
  }

  async buildChunk(semanticPayload: Record<string, unknown>, systemPrompt: string, ctx: ProviderContext): Promise<BuilderChunkOutput> {
    const raw = await this.postChat(
      { model: this.cfg.model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: JSON.stringify(semanticPayload) }] },
      ctx,
    );
    const parsed = builderChunkOutputSchema.safeParse(raw);
    if (!parsed.success) throw builderError('INVALID_SCHEMA', false, 'invalid builder chunk schema');
    return parsed.data;
  }

  async buildAggregate(semanticPayload: Record<string, unknown>, systemPrompt: string, ctx: ProviderContext): Promise<BuilderOutput> {
    const raw = await this.postChat(
      { model: this.cfg.model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: JSON.stringify(semanticPayload) }] },
      ctx,
    );
    const parsed = builderOutputSchema.safeParse(raw);
    if (!parsed.success) throw builderError('INVALID_SCHEMA', false, 'invalid builder output schema');
    return parsed.data;
  }
}
