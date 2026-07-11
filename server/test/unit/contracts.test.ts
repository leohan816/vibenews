import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

import {
  assertValidPolicySnapshot,
  buildRuntimeBinding,
  builderOutputSchema,
  computeServerGate,
  detectCopyrightReproduction,
  DEEPSEEK_PUBLIC_STATEMENT_CODES,
  DEEPSEEK_UNVERIFIED_CODES,
  FISH_PUBLIC_STATEMENT_CODES,
  FISH_UNVERIFIED_CODES,
  formatAssurance,
  providerBindingHmac,
  validateEvidenceRefs,
  VERIFIED_LOCAL_CONTROL_CODES,
  verifierOutputSchema,
  type BuilderOutput,
  type EvidenceRef,
  type ProviderPolicySnapshot,
  type VerifierOutput,
} from '../../src/domain/contracts';

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
    audioScript: {
      language: 'ko',
      mode: 'standard',
      segments: [{ order: 0, text: '안녕하세요, 오늘의 브리핑입니다.', evidenceRefs: ['cap:000000-000002'] }],
    },
  };
}

function validVerifierOutput(overrides: Partial<VerifierOutput> = {}): VerifierOutput {
  return {
    schemaVersion: 'verifier-output.v1',
    verdict: 'PASS',
    overallScore: 9.2,
    dimensionScores: { fidelity: 9, coverage: 9, clarity: 9, audioFitness: 9, provenance: 9 },
    criticalFailures: [],
    findings: [],
    ...overrides,
  };
}

test('builder output strict schema accepts a valid output and rejects unknown keys', () => {
  assert.ok(builderOutputSchema.safeParse(validBuilderOutput()).success);
  const withUnknown = { ...validBuilderOutput(), sneaky: true };
  assert.equal(builderOutputSchema.safeParse(withUnknown).success, false);
});

test('builder output enforces tag bounds (3..8)', () => {
  const tooFew = { ...validBuilderOutput(), tags: ['only', 'two'] };
  assert.equal(builderOutputSchema.safeParse(tooFew).success, false);
  const tooMany = { ...validBuilderOutput(), tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] };
  assert.equal(builderOutputSchema.safeParse(tooMany).success, false);
});

test('verifier output rejects scores with more than one decimal and unknown verdicts', () => {
  assert.ok(verifierOutputSchema.safeParse(validVerifierOutput()).success);
  assert.equal(verifierOutputSchema.safeParse(validVerifierOutput({ overallScore: 9.25 })).success, false);
  assert.equal(
    verifierOutputSchema.safeParse({ ...validVerifierOutput(), verdict: 'MAYBE' }).success,
    false,
  );
});

test('evidence refs must exist in the input index', () => {
  const index: EvidenceRef[] = [{ ref: 'cap:000000-000002', startMs: 0, endMs: 2000 }];
  assert.doesNotThrow(() => validateEvidenceRefs(validBuilderOutput(), index));
  assert.throws(() => validateEvidenceRefs(validBuilderOutput(), []), /UNKNOWN_EVIDENCE_REF/);
});

test('copyright reproduction detector flags long contiguous caption reuse', () => {
  const caption = 'the quick brown fox jumps over the lazy dog and then keeps running along the riverbank until sunset while narrating every single step in great detail for a long time';
  const reproduced = [{ text: caption }];
  const paraphrase = [{ text: '요약: 여우가 강가를 달렸습니다.' }];
  assert.equal(detectCopyrightReproduction(caption, reproduced), true);
  assert.equal(detectCopyrightReproduction(caption, paraphrase), false);
});

test('server gate is independent: PASS only at score >= 9.0 with zero critical failures', () => {
  assert.equal(computeServerGate(validVerifierOutput({ overallScore: 9.0 })).pass, true);
  assert.equal(computeServerGate(validVerifierOutput({ overallScore: 8.9 })).pass, false);
  // model says PASS but a critical failure is present -> server still fails
  assert.equal(
    computeServerGate(validVerifierOutput({ overallScore: 9.5, criticalFailures: ['COPYRIGHT_REPRODUCTION'] })).pass,
    false,
  );
  assert.equal(computeServerGate(validVerifierOutput({ verdict: 'REVISE', overallScore: 9.5 })).pass, false);
});

function policySnapshot(provider: 'deepseek' | 'fish_audio'): ProviderPolicySnapshot {
  return {
    provider,
    officialPolicyUrls: ['https://example/policy'],
    officialApiUrl: 'https://example/api',
    publicApiSurfaceId: provider === 'deepseek' ? 'deepseek.post.chat-completions' : 'fish.post.v1.tts',
    policyEffectiveOrUpdatedDate: '2026-02-10',
    reviewedAt: '2026-07-11T00:00:00.000Z',
    documentSetSha256: 'a'.repeat(64),
    lookupStatus: 'retrieved',
    publicStatementCodes: [...(provider === 'deepseek' ? DEEPSEEK_PUBLIC_STATEMENT_CODES : FISH_PUBLIC_STATEMENT_CODES)],
    verifiedLocalControlCodes: [...VERIFIED_LOCAL_CONTROL_CODES],
    controlsNotIndependentlyVerified: [...(provider === 'deepseek' ? DEEPSEEK_UNVERIFIED_CODES : FISH_UNVERIFIED_CODES)],
    providerPolicyAssurance: 'LIMITED_AND_UNVERIFIED',
    localDataControls: 'VERIFIED',
    providerSideDeletion: 'NOT_VERIFIED',
    providerSideNoTraining: 'NOT_VERIFIED',
    productionPrivacyApproval: 'NOT_GRANTED',
  };
}

test('policy snapshot validator enforces exact code sets and CONFIGURED_TIER only for Fish', () => {
  assert.doesNotThrow(() => assertValidPolicySnapshot(policySnapshot('deepseek')));
  assert.doesNotThrow(() => assertValidPolicySnapshot(policySnapshot('fish_audio')));
  const deepseekWithTier = policySnapshot('deepseek');
  deepseekWithTier.controlsNotIndependentlyVerified = [...DEEPSEEK_UNVERIFIED_CODES, 'CONFIGURED_TIER'];
  assert.throws(() => assertValidPolicySnapshot(deepseekWithTier));
  const unavailableWithHash = policySnapshot('deepseek');
  unavailableWithHash.lookupStatus = 'unavailable';
  assert.throws(() => assertValidPolicySnapshot(unavailableWithHash), /DOC_HASH_MUST_BE_NULL/);
});

test('assurance formatter emits the five literal labels and refuses prohibited claims', () => {
  const out = formatAssurance();
  assert.match(out, /PROVIDER_POLICY_ASSURANCE: LIMITED_AND_UNVERIFIED/);
  assert.match(out, /LOCAL_DATA_CONTROLS: VERIFIED/);
  assert.match(out, /PROVIDER_SIDE_DELETION: NOT_VERIFIED/);
  assert.match(out, /PROVIDER_SIDE_NO_TRAINING: NOT_VERIFIED/);
  assert.match(out, /PRODUCTION_PRIVACY_APPROVAL: NOT_GRANTED/);
  assert.throws(() => formatAssurance('inputs are never retained'), /PROHIBITED_ASSURANCE_CLAIM/);
  assert.throws(() => formatAssurance('provider-side deletion is verified'), /PROHIBITED_ASSURANCE_CLAIM/);
});

test('runtime binding HMAC is deterministic and enforces the role matrix', () => {
  const key = randomBytes(32);
  const a = providerBindingHmac(key, 'deepseek_builder', 'model_selector', 'model-x');
  const b = providerBindingHmac(key, 'deepseek_builder', 'model_selector', 'model-x');
  assert.equal(a, b);
  assert.notEqual(a, providerBindingHmac(key, 'deepseek_verifier', 'model_selector', 'model-x'));

  const builder = buildRuntimeBinding(key, {
    role: 'deepseek_builder',
    publicApiSurfaceId: 'deepseek.post.chat-completions',
    endpointOrigin: 'https://api.deepseek.com',
    modelSelector: 'builder-model',
    adapterSchemaVersion: 'builder-output.v1',
  });
  assert.equal(builder.reasoningSelectorHmac, null);
  assert.equal(builder.referenceSelectorHmac, null);

  assert.throws(() =>
    buildRuntimeBinding(key, {
      role: 'deepseek_builder',
      publicApiSurfaceId: 'deepseek.post.chat-completions',
      endpointOrigin: 'https://api.deepseek.com',
      modelSelector: 'm',
      reasoningSelector: 'high',
      adapterSchemaVersion: 'v',
    }),
  );
  const verifier = buildRuntimeBinding(key, {
    role: 'deepseek_verifier',
    publicApiSurfaceId: 'deepseek.post.chat-completions',
    endpointOrigin: 'https://api.deepseek.com',
    modelSelector: 'verifier-model',
    reasoningSelector: 'high',
    adapterSchemaVersion: 'v',
  });
  assert.ok(verifier.reasoningSelectorHmac);
  assert.equal(verifier.referenceSelectorHmac, null);
  const fish = buildRuntimeBinding(key, {
    role: 'fish_tts',
    publicApiSurfaceId: 'fish.post.v1.tts',
    endpointOrigin: 'https://api.fish.audio',
    modelSelector: 'fish-model',
    referenceSelector: 'ref-1',
    adapterSchemaVersion: 'tts-input.v1',
  });
  assert.ok(fish.referenceSelectorHmac);
  assert.equal(fish.reasoningSelectorHmac, null);
  assert.throws(() =>
    buildRuntimeBinding(key, {
      role: 'fish_tts',
      publicApiSurfaceId: 'fish.post.v1.tts',
      endpointOrigin: 'https://api.fish.audio',
      modelSelector: 'm',
      adapterSchemaVersion: 'v',
    }),
  );
});
