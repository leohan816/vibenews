// DeepSeek Verifier adapter (설계문서/18 §7.2). Independent prompt/schema/selector from Builder.
// Reads only DEEPSEEK_VERIFIER_MODEL + DEEPSEEK_VERIFIER_REASONING_EFFORT (+ shared key/base URL).
// One HTTP submission is exactly one logical attempt; there is no hidden transport retry.

import { verifierOutputSchema, type ProviderContext, type ProviderError, type VerifierOutput } from '../domain/contracts';
import { defaultFetchTransport, extractStrictJson, type Transport } from './deepseek-builder';

export interface DeepSeekVerifierConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  reasoningEffort: string;
}

const CHAT_PATH = '/chat/completions';

function verifierError(code: ProviderError['code'], retryable: boolean, safeMessage: string, upstreamStatus?: number): ProviderError {
  const e: ProviderError = { stage: 'verifier', code, retryable, safeMessage };
  if (upstreamStatus !== undefined) e.upstreamStatus = upstreamStatus;
  return e;
}

export class DeepSeekVerifierProvider {
  constructor(
    private readonly cfg: DeepSeekVerifierConfig,
    private readonly transport: Transport = defaultFetchTransport,
  ) {}

  /** A single verify submission. The caller enforces the two-attempt maximum; this method performs
   *  exactly one HTTP request and never retries the transport. */
  async verify(semanticPayload: Record<string, unknown>, systemPrompt: string, ctx: ProviderContext): Promise<VerifierOutput> {
    const bodyObj = {
      model: this.cfg.model,
      reasoning_effort: this.cfg.reasoningEffort,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(semanticPayload) },
      ],
    };
    const res = await this.transport(`${this.cfg.baseUrl}${CHAT_PATH}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.cfg.apiKey}` },
      body: JSON.stringify(bodyObj),
      signal: ctx.abortSignal,
    });
    if (res.status === 401 || res.status === 403) throw verifierError('AUTH_REJECTED', false, 'auth rejected', res.status);
    if (res.status === 429) throw verifierError('RATE_LIMITED', true, 'rate limited', res.status);
    if (res.status >= 500) throw verifierError('UPSTREAM_5XX', true, 'upstream error', res.status);
    if (res.status !== 200) throw verifierError('POLICY_REJECTED', false, 'unexpected status', res.status);
    const raw = extractStrictJson(await res.text(), () => {
      throw verifierError('INVALID_SCHEMA', false, 'invalid verifier response');
    });
    const parsed = verifierOutputSchema.safeParse(raw);
    if (!parsed.success) throw verifierError('INVALID_SCHEMA', false, 'invalid verifier output schema');
    return parsed.data;
  }
}
