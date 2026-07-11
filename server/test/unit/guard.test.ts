import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildBuilderChunkPayload,
  buildFishPayload,
  decideAfterVerify,
  guardPayload,
  MAX_VERIFIER_ATTEMPTS,
  recursiveFieldNames,
  verifierSubmissionAllowed,
  type PublicSourceMeta,
} from '../../src/services/processing';
import type { VerifierOutput } from '../../src/domain/contracts';

const meta: PublicSourceMeta = {
  videoId: 'vid00000001',
  channelId: 'UCx_YiR733cfqVPRsQ1n8Fag',
  canonicalUrl: 'https://www.youtube.com/watch?v=vid00000001',
  publicTitle: 'Observe',
  publishedAt: null,
  durationSec: 600,
  captionLanguages: ['en'],
  captionKinds: ['manual'],
};

const chunk = { chunkId: 'chunk-000000', evidenceRefs: [{ ref: 'cap:000000-000002', startMs: 0, endMs: 2000 }], text: 'hello' };
const versions = { promptVersion: 'builder.chunk.youtube-mvp.v1', schemaVersion: 'builder-chunk-output.v1' };

test('a clean builder chunk payload is allowed and audits only bytes + sha256', () => {
  const payload = buildBuilderChunkPayload(meta, chunk, versions);
  const r = guardPayload({ role: 'deepseek_builder_chunk', payload, scopeActive: true, runtimeBindingValid: true });
  assert.equal(r.outcome, 'allowed');
  assert.equal(r.forbiddenFieldCount, 0);
  assert.ok(r.byteCount && r.byteCount > 0);
  assert.match(r.sha256 ?? '', /^[0-9a-f]{64}$/);
  assert.equal(r.expandedScopeReason, null);
});

test('any expanded scope reason stops before the network with SCOPE_ESCALATION_REQUIRED', () => {
  const payload = buildBuilderChunkPayload(meta, chunk, versions);
  const r = guardPayload({
    role: 'deepseek_builder_chunk',
    payload,
    scopeActive: true,
    runtimeBindingValid: true,
    expandedScopeReason: 'personal_data_health_finance_legal_or_election',
  });
  assert.equal(r.outcome, 'scope_review_required');
  assert.equal(r.errorCode, 'SCOPE_ESCALATION_REQUIRED');
  assert.equal(r.byteCount, null);
  assert.equal(r.sha256, null);
  assert.equal(r.fieldNames.length, 0);
});

test('scope_ambiguous is treated as an escalation, not an allow', () => {
  const r = guardPayload({
    role: 'deepseek_builder_chunk',
    payload: buildBuilderChunkPayload(meta, chunk, versions),
    scopeActive: true,
    runtimeBindingValid: true,
    expandedScopeReason: 'scope_ambiguous',
  });
  assert.equal(r.outcome, 'scope_review_required');
});

test('missing/revoked active scope approval blocks before the network', () => {
  const r = guardPayload({
    role: 'deepseek_builder_chunk',
    payload: buildBuilderChunkPayload(meta, chunk, versions),
    scopeActive: false,
    runtimeBindingValid: true,
  });
  assert.equal(r.outcome, 'payload_rejected');
  assert.equal(r.byteCount, null);
});

test('forbidden fields (user preference / history / private) are rejected', () => {
  const tainted = { ...buildBuilderChunkPayload(meta, chunk, versions), userPreference: 'likes short audio' };
  const r = guardPayload({ role: 'deepseek_builder_chunk', payload: tainted, scopeActive: true, runtimeBindingValid: true });
  assert.equal(r.outcome, 'payload_rejected');
  assert.ok(r.forbiddenFieldCount >= 1);
});

test('unknown (non-allowlisted) fields are rejected even if not obviously sensitive', () => {
  const tainted = { ...buildBuilderChunkPayload(meta, chunk, versions), extraDebug: 1 };
  const r = guardPayload({ role: 'deepseek_builder_chunk', payload: tainted, scopeActive: true, runtimeBindingValid: true });
  assert.equal(r.outcome, 'payload_rejected');
});

test('runtime binding mismatch blocks before the network', () => {
  const r = guardPayload({
    role: 'deepseek_verifier',
    payload: { sourceMeta: meta, candidate: {}, evidencePack: [], attempt: 1, promptVersion: 'v', schemaVersion: 'v' },
    scopeActive: true,
    runtimeBindingValid: false,
  });
  assert.equal(r.outcome, 'runtime_binding_rejected');
  assert.equal(r.errorCode, 'RUNTIME_BINDING_REJECTED');
});

test('Fish payload excludes raw transcript / VideoContentMap / AnalyticSummary and forbids extra fields', () => {
  const clean = buildFishPayload([{ order: 0, text: '브리핑' }], 'ref-1', { language: 'ko', format: 'mp3', speed: 1 });
  const names = [...recursiveFieldNames(clean)];
  for (const forbidden of ['rawTranscript', 'videoContentMap', 'analyticSummary', 'transcript']) {
    assert.ok(!names.includes(forbidden));
  }
  assert.equal(guardPayload({ role: 'fish_tts', payload: clean, scopeActive: true, runtimeBindingValid: true }).outcome, 'allowed');
  const tainted = { ...clean, rawTranscript: 'the full transcript text' };
  assert.equal(guardPayload({ role: 'fish_tts', payload: tainted, scopeActive: true, runtimeBindingValid: true }).outcome, 'payload_rejected');
});

const v = (o: Partial<VerifierOutput>): VerifierOutput => ({
  schemaVersion: 'verifier-output.v1',
  verdict: 'PASS',
  overallScore: 9.2,
  dimensionScores: { fidelity: 9, coverage: 9, clarity: 9, audioFitness: 9, provenance: 9 },
  criticalFailures: [],
  findings: [],
  ...o,
});

test('verifier flow: PASS -> tts, REVISE within budget -> revise, otherwise -> human review; no 3rd attempt', () => {
  assert.equal(MAX_VERIFIER_ATTEMPTS, 2);
  assert.equal(decideAfterVerify(v({}), 1).decision, 'tts_eligible');
  assert.equal(decideAfterVerify(v({ verdict: 'REVISE', overallScore: 8.0 }), 1).decision, 'revise');
  // second attempt REVISE cannot revise again -> human review
  assert.equal(decideAfterVerify(v({ verdict: 'REVISE', overallScore: 8.0 }), 2).decision, 'human_review_required');
  assert.equal(decideAfterVerify(v({ verdict: 'HUMAN_REVIEW' }), 1).decision, 'human_review_required');
  // model verdict PASS but a critical failure -> not tts
  assert.equal(
    decideAfterVerify(v({ criticalFailures: ['UNSUPPORTED_CLAIM'] }), 1).decision,
    'human_review_required',
  );
  assert.equal(verifierSubmissionAllowed(0), true);
  assert.equal(verifierSubmissionAllowed(1), true);
  assert.equal(verifierSubmissionAllowed(2), false);
});
