import assert from 'node:assert/strict';
import test from 'node:test';

import type { BuilderOutput, ProviderContext, VerifierOutput } from '../../src/domain/contracts';
import { DeepSeekBuilderProvider, type HttpResponseLike, type Transport } from '../../src/providers/deepseek-builder';
import { DeepSeekVerifierProvider } from '../../src/providers/deepseek-verifier';
import { FishTtsProvider } from '../../src/providers/fish-tts';

const ctx = (): ProviderContext => ({
  jobId: 'job-1',
  idempotencyKey: 'idem-1',
  deadlineMs: Date.now() + 60_000,
  abortSignal: new AbortController().signal,
});

function capturingTransport(response: (init: { body: string }) => HttpResponseLike): {
  transport: Transport;
  last: () => { url: string; headers: Record<string, string>; body: string };
} {
  let captured: { url: string; headers: Record<string, string>; body: string };
  const transport: Transport = async (url, init) => {
    captured = { url, headers: init.headers, body: init.body };
    return response(init);
  };
  return { transport, last: () => captured };
}

function chatResponse(contentObj: unknown): HttpResponseLike {
  return {
    status: 200,
    text: async () => JSON.stringify({ choices: [{ message: { content: JSON.stringify(contentObj) } }] }),
  };
}

function validBuilderOutput(): BuilderOutput {
  return {
    schemaVersion: 'builder-output.v1',
    title: 'Observe intro',
    oneLineSummary: 'A short one-line summary.',
    contentKind: 'analysis',
    category: 'developer',
    subcategory: { slug: 'dev_tools', displayName: 'Dev Tools' },
    topicClusters: ['Performance'],
    tags: ['observe', 'react-native', 'performance'],
    entities: [{ name: 'Expo', kind: 'company' }],
    claims: [{ claim: 'It monitors performance.', evidenceRefs: ['cap:000000-000002'] }],
    numbers: [{ value: '2', context: 'two runtimes', evidenceRefs: ['cap:000000-000002'] }],
    audioScript: { language: 'ko', mode: 'standard', segments: [{ order: 0, text: '브리핑', evidenceRefs: ['cap:000000-000002'] }] },
  };
}
function validVerifierOutput(): VerifierOutput {
  return {
    schemaVersion: 'verifier-output.v1',
    verdict: 'PASS',
    overallScore: 9.3,
    dimensionScores: { fidelity: 9, coverage: 9, clarity: 9, audioFitness: 9, provenance: 9 },
    criticalFailures: [],
    findings: [],
  };
}

const KEY = 'synthetic-secret-key-should-never-be-in-body';

test('builder posts to chat-completions with model, no reasoning_effort, and auth in a header only', async () => {
  const t = capturingTransport(() => chatResponse(validBuilderOutput()));
  const builder = new DeepSeekBuilderProvider({ apiKey: KEY, baseUrl: 'https://api.deepseek.com', model: 'builder-model' }, t.transport);
  const out = await builder.buildAggregate({ sourceMeta: {}, schemaVersion: 'v', promptVersion: 'v', chunkOutputs: [] }, 'system', ctx());
  assert.equal(out.schemaVersion, 'builder-output.v1');
  const last = t.last();
  assert.equal(last.url, 'https://api.deepseek.com/chat/completions');
  assert.equal(last.headers.authorization, `Bearer ${KEY}`);
  const body = JSON.parse(last.body);
  assert.equal(body.model, 'builder-model');
  assert.ok(!('reasoning_effort' in body), 'builder must not send reasoning_effort');
  assert.ok(!last.body.includes(KEY), 'secret key must never appear in the request body');
});

test('builder rejects markdown-fenced / invalid JSON as INVALID_SCHEMA', async () => {
  const fenced: Transport = async () => ({ status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: '```json\n{}\n```' } }] }) });
  const builder = new DeepSeekBuilderProvider({ apiKey: KEY, baseUrl: 'https://api.deepseek.com', model: 'm' }, fenced);
  await assert.rejects(() => builder.buildAggregate({}, 's', ctx()), (e: unknown) => (e as { code?: string }).code === 'INVALID_SCHEMA');
});

test('builder maps upstream status codes to retryable provider errors', async () => {
  const b429 = new DeepSeekBuilderProvider({ apiKey: KEY, baseUrl: 'https://x', model: 'm' }, async () => ({ status: 429, text: async () => '' }));
  await assert.rejects(() => b429.buildAggregate({}, 's', ctx()), (e: unknown) => (e as { code?: string; retryable?: boolean }).code === 'RATE_LIMITED' && (e as { retryable?: boolean }).retryable === true);
  const b500 = new DeepSeekBuilderProvider({ apiKey: KEY, baseUrl: 'https://x', model: 'm' }, async () => ({ status: 503, text: async () => '' }));
  await assert.rejects(() => b500.buildAggregate({}, 's', ctx()), (e: unknown) => (e as { code?: string }).code === 'UPSTREAM_5XX');
});

test('verifier sends the configured reasoning_effort and its own model', async () => {
  const t = capturingTransport(() => chatResponse(validVerifierOutput()));
  const verifier = new DeepSeekVerifierProvider(
    { apiKey: KEY, baseUrl: 'https://api.deepseek.com', model: 'verifier-model', reasoningEffort: 'high' },
    t.transport,
  );
  const out = await verifier.verify({ sourceMeta: {}, candidate: {}, evidencePack: [], attempt: 1, schemaVersion: 'v', promptVersion: 'v' }, 'system', ctx());
  assert.equal(out.verdict, 'PASS');
  const body = JSON.parse(t.last().body);
  assert.equal(body.model, 'verifier-model');
  assert.equal(body.reasoning_effort, 'high');
  assert.equal(t.last().headers.authorization, `Bearer ${KEY}`);
  assert.ok(!t.last().body.includes(KEY));
});

test('fish body carries only reference/script/params + adapter model; key is header-only', async () => {
  let captured: { url: string; headers: Record<string, string>; body: string } | undefined;
  const transport: Transport = async (url, init) => {
    captured = { url, headers: init.headers, body: init.body };
    return {
      status: 200,
      text: async () => '',
      arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer,
      headers: { get: (n: string) => (n === 'x-audio-duration-ms' ? '134000' : null) },
    };
  };
  const fish = new FishTtsProvider({ apiKey: KEY, model: 'fish-model', stagingDir: '/tmp/vn-fish-staging-test', baseUrl: 'https://api.fish.audio' }, transport);
  const artifact = await fish.synthesize(
    { language: 'ko', format: 'mp3', speed: 1, referenceId: 'ref-1', segments: [{ order: 0, text: '안녕하세요' }] },
    ctx(),
  );
  assert.equal(artifact.mimeType, 'audio/mpeg');
  assert.equal(artifact.byteCount, 4);
  assert.equal(artifact.durationMs, 134000);
  assert.match(artifact.sha256, /^[0-9a-f]{64}$/);
  assert.ok(captured);
  assert.equal(captured?.url, 'https://api.fish.audio/v1/tts');
  const body = JSON.parse(captured!.body);
  assert.equal(body.reference_id, 'ref-1');
  assert.equal(body.model, 'fish-model');
  assert.equal(body.format, 'mp3');
  assert.ok(typeof body.text === 'string' && body.text.includes('안녕하세요'));
  assert.equal(captured?.headers.authorization, `Bearer ${KEY}`);
  assert.ok(!captured!.body.includes(KEY), 'fish api key must never be in the body');
});
