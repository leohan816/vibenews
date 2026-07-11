// Strict shared contracts for the provider pipeline (설계문서/18 §7, §8.2). Server-only.
// Zod schemas reject unknown keys and enforce the exact bounds; evidence refs must exist in the
// input index; the copyright-reproduction detector and the independent server gate live here.

import { createHash, createHmac } from 'node:crypto';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums used inside provider outputs
// ---------------------------------------------------------------------------
export const TOPIC_CATEGORY = [
  'news',
  'ai',
  'health',
  'finance',
  'skin_care',
  'beauty',
  'business',
  'developer',
  'science',
  'lifestyle',
  'internal',
] as const;
export type TopicCategory = (typeof TOPIC_CATEGORY)[number];

export const CONTENT_KIND = ['news', 'analysis', 'tutorial', 'product_update', 'document'] as const;
export type ContentKind = (typeof CONTENT_KIND)[number];

export const ENTITY_KIND = ['person', 'company', 'product', 'tool', 'repo'] as const;
export type EntityKind = (typeof ENTITY_KIND)[number];

export const CRITICAL_FAILURE = [
  'UNSUPPORTED_CLAIM',
  'MATERIAL_OMISSION',
  'NUMBER_OR_NAME_MISMATCH',
  'MISLEADING_CAUSALITY',
  'UNSAFE_OR_OUT_OF_SCOPE',
  'COPYRIGHT_REPRODUCTION',
  'INVALID_PROVENANCE',
] as const;
export type CriticalFailure = (typeof CRITICAL_FAILURE)[number];

export const PROVIDER_STAGE = ['caption', 'builder', 'verifier', 'tts'] as const;
export type ProviderStage = (typeof PROVIDER_STAGE)[number];

export const PROVIDER_ERROR_CODE = [
  'INVALID_INPUT',
  'AUTH_MISSING',
  'AUTH_REJECTED',
  'RATE_LIMITED',
  'TIMEOUT',
  'SOURCE_UNAVAILABLE',
  'PUBLIC_CAPTION_UNAVAILABLE',
  'SCOPE_ESCALATION_REQUIRED',
  'PAYLOAD_GUARD_REJECTED',
  'RUNTIME_BINDING_REJECTED',
  'OUTPUT_TOO_LARGE',
  'INVALID_SCHEMA',
  'POLICY_REJECTED',
  'UPSTREAM_5XX',
  'STORAGE_FAILURE',
  'INTERNAL',
] as const;
export type ProviderErrorCode = (typeof PROVIDER_ERROR_CODE)[number];

// ---------------------------------------------------------------------------
// Bounds (설계문서/18 §7.2)
// ---------------------------------------------------------------------------
export const BOUNDS = {
  builderRequestBytes: 512 * 1024,
  builderResponseBytes: 256 * 1024,
  verifierRequestBytes: 512 * 1024,
  verifierResponseBytes: 64 * 1024,
  normalizedTextChars: 240_000,
  chunkChars: 12_000,
  maxChunks: 20,
  evidencePackChars: 120_000,
  title: 200,
  oneLineSummary: 500,
  tagsMin: 3,
  tagsMax: 8,
  tag: 50,
  entities: 50,
  claims: 100,
  numbers: 100,
  scriptSegments: 60,
  segmentChars: 1_000,
  totalScriptChars: 40_000,
  verifierFindings: 100,
  instruction: 1_000,
  chunkClaims: 50,
  chunkNumbers: 50,
  chunkEntities: 50,
  chunkSummary: 2_000,
  topicClusters: 5,
  topicCluster: 100,
  subcategorySlug: 64,
  subcategoryName: 80,
  copyrightChars: 160,
  copyrightTokens: 30,
} as const;

// ---------------------------------------------------------------------------
// Interfaces (non-serialized orchestration types)
// ---------------------------------------------------------------------------
export interface ProviderError {
  stage: ProviderStage;
  code: ProviderErrorCode;
  retryable: boolean;
  safeMessage: string;
  upstreamStatus?: number;
}

export interface ProviderContext {
  jobId: string;
  idempotencyKey: string;
  deadlineMs: number;
  abortSignal: AbortSignal;
}

export interface SourceProvenance {
  sourceType: 'youtube';
  videoId: string;
  canonicalUrl: string;
  channelId: string;
  channelUrl: string;
  publicTitle: string;
  publishedAt: string | null;
  durationSec: number;
  captionLanguages: string[];
  captionKinds: Array<'manual' | 'automatic'>;
  captionSha256: string;
  extractor: 'yt-dlp-public-caption';
  extractorProfileVersion: 'youtube-public-caption.v1';
  acquiredAt: string;
}

export interface EvidenceRef {
  ref: string;
  startMs: number;
  endMs: number;
}

export interface BuilderEvidenceChunk {
  chunkId: string;
  evidenceRefs: EvidenceRef[];
  text: string; // request-lifetime only; never persisted
}

// ---------------------------------------------------------------------------
// Zod strict schemas
// ---------------------------------------------------------------------------
const evidenceRefString = z.string().regex(/^cap:\d{6}-\d{6}$/);

const chunkEntitySchema = z
  .object({ name: z.string().min(1).max(120), kind: z.enum(ENTITY_KIND) })
  .strict();

export const builderChunkOutputSchema = z
  .object({
    schemaVersion: z.literal('builder-chunk-output.v1'),
    chunkId: z.string().min(1).max(80),
    sectionSummary: z.string().min(1).max(BOUNDS.chunkSummary),
    claims: z
      .array(z.object({ claim: z.string().min(1).max(2000), evidenceRefs: z.array(evidenceRefString).max(50) }).strict())
      .max(BOUNDS.chunkClaims),
    numbers: z
      .array(
        z
          .object({ value: z.string().min(1).max(200), context: z.string().max(2000), evidenceRefs: z.array(evidenceRefString).max(50) })
          .strict(),
      )
      .max(BOUNDS.chunkNumbers),
    entities: z.array(chunkEntitySchema).max(BOUNDS.chunkEntities),
  })
  .strict();
export type BuilderChunkOutput = z.infer<typeof builderChunkOutputSchema>;

const audioSegmentSchema = z
  .object({
    order: z.number().int().nonnegative(),
    text: z.string().min(1).max(BOUNDS.segmentChars),
    evidenceRefs: z.array(evidenceRefString).max(50),
  })
  .strict();

export const builderOutputSchema = z
  .object({
    schemaVersion: z.literal('builder-output.v1'),
    title: z.string().min(1).max(BOUNDS.title),
    oneLineSummary: z.string().min(1).max(BOUNDS.oneLineSummary),
    contentKind: z.enum(CONTENT_KIND),
    category: z.enum(TOPIC_CATEGORY),
    subcategory: z
      .object({
        slug: z
          .string()
          .max(BOUNDS.subcategorySlug)
          .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
        displayName: z.string().min(1).max(BOUNDS.subcategoryName),
      })
      .strict(),
    topicClusters: z.array(z.string().min(1).max(BOUNDS.topicCluster)).max(BOUNDS.topicClusters),
    tags: z.array(z.string().min(1).max(BOUNDS.tag)).min(BOUNDS.tagsMin).max(BOUNDS.tagsMax),
    entities: z.array(chunkEntitySchema).max(BOUNDS.entities),
    claims: z
      .array(z.object({ claim: z.string().min(1).max(2000), evidenceRefs: z.array(evidenceRefString).max(50) }).strict())
      .max(BOUNDS.claims),
    numbers: z
      .array(
        z
          .object({ value: z.string().min(1).max(200), context: z.string().max(2000), evidenceRefs: z.array(evidenceRefString).max(50) })
          .strict(),
      )
      .max(BOUNDS.numbers),
    audioScript: z
      .object({
        language: z.literal('ko'),
        mode: z.enum(['quick', 'standard', 'deep']),
        segments: z.array(audioSegmentSchema).min(1).max(BOUNDS.scriptSegments),
      })
      .strict(),
  })
  .strict();
export type BuilderOutput = z.infer<typeof builderOutputSchema>;

export const verifierOutputSchema = z
  .object({
    schemaVersion: z.literal('verifier-output.v1'),
    verdict: z.enum(['PASS', 'REVISE', 'HUMAN_REVIEW']),
    overallScore: z
      .number()
      .min(0)
      .max(10)
      .refine((n) => Number.isFinite(n) && Math.round(n * 10) === n * 10, 'one decimal max'),
    dimensionScores: z
      .object({
        fidelity: z.number().min(0).max(10),
        coverage: z.number().min(0).max(10),
        clarity: z.number().min(0).max(10),
        audioFitness: z.number().min(0).max(10),
        provenance: z.number().min(0).max(10),
      })
      .strict(),
    criticalFailures: z.array(z.enum(CRITICAL_FAILURE)),
    findings: z
      .array(
        z
          .object({
            code: z.string().min(1).max(80),
            severity: z.enum(['critical', 'major', 'minor']),
            evidenceRefs: z.array(evidenceRefString).max(50),
            instruction: z.string().max(BOUNDS.instruction),
          })
          .strict(),
      )
      .max(BOUNDS.verifierFindings),
  })
  .strict();
export type VerifierOutput = z.infer<typeof verifierOutputSchema>;

export interface TtsInput {
  schemaVersion: 'tts-input.v1';
  contentItemId: string;
  language: 'ko';
  scriptSegments: BuilderOutput['audioScript']['segments'];
  scriptHash: string;
}
export interface TtsArtifact {
  mimeType: 'audio/mpeg';
  tempKey: string;
  byteCount: number;
  durationMs: number;
  sha256: string;
}

export interface CaptionProvider {
  acquire(input: { canonicalVideoId: string; canonicalUrl: string }, ctx: ProviderContext): Promise<CaptionArtifact>;
  destroy(artifact: CaptionArtifact): Promise<void>;
}
export interface CaptionArtifact {
  artifactId: string;
  relativeTempKey: string;
  languages: string[];
  captionKinds: Array<'manual' | 'automatic'>;
  byteCount: number;
  sha256: string;
  acquiredAt: string;
  expiresAt: string;
  provenance: SourceProvenance;
}

export interface BuilderProvider {
  build(input: unknown, ctx: ProviderContext): Promise<BuilderOutput>;
}
export interface VerifierProvider {
  verify(input: unknown, ctx: ProviderContext): Promise<VerifierOutput>;
}
export interface TtsProvider {
  synthesize(input: TtsInput, ctx: ProviderContext): Promise<TtsArtifact>;
}

// ---------------------------------------------------------------------------
// Evidence-ref validation and independent server gate
// ---------------------------------------------------------------------------
export function collectEvidenceRefs(output: BuilderOutput): string[] {
  const refs: string[] = [];
  for (const c of output.claims) refs.push(...c.evidenceRefs);
  for (const n of output.numbers) refs.push(...n.evidenceRefs);
  for (const s of output.audioScript.segments) refs.push(...s.evidenceRefs);
  return refs;
}

/** Every referenced ref must exist in the input index; no unknown refs. */
export function validateEvidenceRefs(output: BuilderOutput, index: EvidenceRef[]): void {
  const known = new Set(index.map((e) => e.ref));
  for (const ref of collectEvidenceRefs(output)) {
    if (!known.has(ref)) {
      throw new Error(`UNKNOWN_EVIDENCE_REF:${ref}`);
    }
  }
}

function normalizeForMatch(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** True when a script segment contiguously reproduces caption text beyond the allowed threshold
 *  (설계문서/18 §7.2: >160 chars OR >30 whitespace tokens, whichever comes first). */
export function detectCopyrightReproduction(captionText: string, segments: Array<{ text: string }>): boolean {
  const cap = normalizeForMatch(captionText);
  if (cap.length === 0) return false;
  for (const seg of segments) {
    const s = normalizeForMatch(seg.text);
    const charWindow = BOUNDS.copyrightChars + 1; // strictly greater than 160
    for (let i = 0; i + charWindow <= s.length; i++) {
      if (cap.includes(s.slice(i, i + charWindow))) return true;
    }
    const toks = s.split(' ').filter(Boolean);
    const tokWindow = BOUNDS.copyrightTokens + 1; // strictly greater than 30
    for (let i = 0; i + tokWindow <= toks.length; i++) {
      if (cap.includes(toks.slice(i, i + tokWindow).join(' '))) return true;
    }
  }
  return false;
}

export interface ServerGateResult {
  pass: boolean;
  reasons: string[];
}

/** Server independently computes PASS; a model self-declared PASS is not authoritative. */
export function computeServerGate(output: VerifierOutput): ServerGateResult {
  const reasons: string[] = [];
  if (output.verdict !== 'PASS') reasons.push(`VERDICT_${output.verdict}`);
  if (output.overallScore < 9.0) reasons.push('SCORE_BELOW_9_0');
  if (output.criticalFailures.length > 0) reasons.push('CRITICAL_FAILURE_PRESENT');
  return { pass: reasons.length === 0, reasons };
}

// ---------------------------------------------------------------------------
// Provider policy snapshots and D-009-A assurance (설계문서/18 §7.5)
// ---------------------------------------------------------------------------
export const ASSURANCE_LABELS = {
  PROVIDER_POLICY_ASSURANCE: 'LIMITED_AND_UNVERIFIED',
  LOCAL_DATA_CONTROLS: 'VERIFIED',
  PROVIDER_SIDE_DELETION: 'NOT_VERIFIED',
  PROVIDER_SIDE_NO_TRAINING: 'NOT_VERIFIED',
  PRODUCTION_PRIVACY_APPROVAL: 'NOT_GRANTED',
} as const;

export const DEEPSEEK_PUBLIC_STATEMENT_CODES = [
  'INPUT_COLLECTED',
  'SERVICE_IMPROVEMENT_OR_TRAINING_STATED',
  'OPT_OUT_RIGHT_STATED',
  'DELETION_RIGHT_STATED',
  'PURPOSE_BUSINESS_LEGAL_RETENTION_STATED',
  'DOWNSTREAM_APP_PROCESSING_NOT_COVERED',
] as const;
export const FISH_PUBLIC_STATEMENT_CODES = [
  'USER_CONTENT_COLLECTED',
  'RESEARCH_ANALYTICS_PRODUCT_DEVELOPMENT_STATED',
  'SYSTEM_NEED_RETENTION_STATED',
  'DELETION_RIGHT_STATED',
  'FREE_TIER_MODEL_IMPROVEMENT_STATED',
] as const;
export const VERIFIED_LOCAL_CONTROL_CODES = [
  'VERSIONED_SCOPE_ATTESTATION',
  'PRE_PROVIDER_PAYLOAD_ALLOWLIST',
  'NO_RAW_PROVIDER_BODY_LOG',
  'EPHEMERAL_CAPTION_LOCAL_DELETION',
] as const;
export const DEEPSEEK_UNVERIFIED_CODES = [
  'CONFIGURED_ACCOUNT_NO_TRAINING_EFFECT',
  'CONFIGURED_ACCOUNT_OPT_OUT_EFFECT',
  'PROVIDER_RETENTION_WINDOW',
  'PROVIDER_SIDE_DELETION',
] as const;
export const FISH_UNVERIFIED_CODES = [...DEEPSEEK_UNVERIFIED_CODES, 'CONFIGURED_TIER'] as const;

export type ProviderPolicyLookupStatus = 'retrieved' | 'unavailable' | 'changed_since_review';

export interface ProviderPolicySnapshot {
  provider: 'deepseek' | 'fish_audio';
  officialPolicyUrls: string[];
  officialApiUrl: string;
  publicApiSurfaceId: 'deepseek.post.chat-completions' | 'fish.post.v1.tts';
  policyEffectiveOrUpdatedDate: string;
  reviewedAt: string;
  documentSetSha256: string | null;
  lookupStatus: ProviderPolicyLookupStatus;
  publicStatementCodes: string[];
  verifiedLocalControlCodes: string[];
  controlsNotIndependentlyVerified: string[];
  providerPolicyAssurance: 'LIMITED_AND_UNVERIFIED';
  localDataControls: 'VERIFIED';
  providerSideDeletion: 'NOT_VERIFIED';
  providerSideNoTraining: 'NOT_VERIFIED';
  productionPrivacyApproval: 'NOT_GRANTED';
}

/** Strict validator: exact per-provider statement/unverified code sets, host/surface, labels.
 *  Throws on unknown/missing codes. CONFIGURED_TIER only for Fish. */
export function assertValidPolicySnapshot(s: ProviderPolicySnapshot): void {
  const expectStatements = s.provider === 'deepseek' ? DEEPSEEK_PUBLIC_STATEMENT_CODES : FISH_PUBLIC_STATEMENT_CODES;
  const expectUnverified = s.provider === 'deepseek' ? DEEPSEEK_UNVERIFIED_CODES : FISH_UNVERIFIED_CODES;
  const surface = s.provider === 'deepseek' ? 'deepseek.post.chat-completions' : 'fish.post.v1.tts';
  if (s.publicApiSurfaceId !== surface) throw new Error('POLICY_SURFACE_MISMATCH');
  const setEq = (a: readonly string[], b: readonly string[]) =>
    a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
  if (!setEq(s.publicStatementCodes, expectStatements)) throw new Error('POLICY_STATEMENT_CODES_INVALID');
  if (!setEq(s.controlsNotIndependentlyVerified, expectUnverified)) throw new Error('POLICY_UNVERIFIED_CODES_INVALID');
  if (!setEq(s.verifiedLocalControlCodes, VERIFIED_LOCAL_CONTROL_CODES))
    throw new Error('POLICY_LOCAL_CODES_INVALID');
  if (s.provider === 'deepseek' && s.controlsNotIndependentlyVerified.includes('CONFIGURED_TIER'))
    throw new Error('CONFIGURED_TIER_ONLY_FISH');
  if (s.providerPolicyAssurance !== ASSURANCE_LABELS.PROVIDER_POLICY_ASSURANCE) throw new Error('LABEL_INVALID');
  if (s.localDataControls !== ASSURANCE_LABELS.LOCAL_DATA_CONTROLS) throw new Error('LABEL_INVALID');
  if (s.providerSideDeletion !== ASSURANCE_LABELS.PROVIDER_SIDE_DELETION) throw new Error('LABEL_INVALID');
  if (s.providerSideNoTraining !== ASSURANCE_LABELS.PROVIDER_SIDE_NO_TRAINING) throw new Error('LABEL_INVALID');
  if (s.productionPrivacyApproval !== ASSURANCE_LABELS.PRODUCTION_PRIVACY_APPROVAL) throw new Error('LABEL_INVALID');
  const docHashRequired = s.lookupStatus === 'retrieved' || s.lookupStatus === 'changed_since_review';
  if (docHashRequired && s.documentSetSha256 === null) throw new Error('DOC_HASH_REQUIRED');
  if (s.lookupStatus === 'unavailable' && s.documentSetSha256 !== null) throw new Error('DOC_HASH_MUST_BE_NULL');
}

const PROHIBITED_CLAIM_PATTERNS = [
  /provider[-\s]?side deletion (is )?verified/i,
  /never retained/i,
  /not retained/i,
  /never (used for )?train/i,
  /no[-\s]?training verified/i,
  /production (privacy )?(compliance|approved|approval granted)/i,
  /equals? production compliance/i,
  /inputs are never/i,
];

/** Emits exactly the five literal labels. Refuses any prohibited retention/training/deletion/
 *  production-compliance claim in supplemental text. */
export function formatAssurance(supplemental = ''): string {
  for (const re of PROHIBITED_CLAIM_PATTERNS) {
    if (re.test(supplemental)) throw new Error('PROHIBITED_ASSURANCE_CLAIM');
  }
  return [
    `PROVIDER_POLICY_ASSURANCE: ${ASSURANCE_LABELS.PROVIDER_POLICY_ASSURANCE}`,
    `LOCAL_DATA_CONTROLS: ${ASSURANCE_LABELS.LOCAL_DATA_CONTROLS}`,
    `PROVIDER_SIDE_DELETION: ${ASSURANCE_LABELS.PROVIDER_SIDE_DELETION}`,
    `PROVIDER_SIDE_NO_TRAINING: ${ASSURANCE_LABELS.PROVIDER_SIDE_NO_TRAINING}`,
    `PRODUCTION_PRIVACY_APPROVAL: ${ASSURANCE_LABELS.PRODUCTION_PRIVACY_APPROVAL}`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Role-specific runtime-binding HMAC (설계문서/18 §8.2). Values never leave the server.
// ---------------------------------------------------------------------------
export type ProviderRole = 'deepseek_builder' | 'deepseek_verifier' | 'fish_tts';
const BINDING_PREFIX = 'vibenews.provider-binding.v1';

export function providerBindingHmac(key: Buffer, role: ProviderRole, fieldName: string, value: string): string {
  const bytes = Buffer.byteLength(value, 'utf8');
  const message = `${BINDING_PREFIX}\0${role}\0${fieldName}\0${bytes}\0${value}`;
  return createHmac('sha256', key).update(message, 'utf8').digest('base64url');
}

export interface RuntimeBindingInput {
  role: ProviderRole;
  publicApiSurfaceId: 'deepseek.post.chat-completions' | 'fish.post.v1.tts';
  endpointOrigin: string;
  modelSelector: string;
  reasoningSelector?: string;
  referenceSelector?: string;
  adapterSchemaVersion: string;
}

export interface RuntimeBinding {
  providerRole: ProviderRole;
  publicApiSurfaceId: string;
  auditKeyId: 'provider-audit-hmac-v1';
  endpointOriginHmac: string;
  modelSelectorHmac: string;
  reasoningSelectorHmac: string | null;
  referenceSelectorHmac: string | null;
  configVersionHash: string;
}

/** Enforces the exact role matrix: all roles bind endpoint+model; Verifier alone binds reasoning;
 *  Fish alone binds reference; every other nullable selector must be absent. */
export function buildRuntimeBinding(key: Buffer, input: RuntimeBindingInput): RuntimeBinding {
  const { role } = input;
  if (role === 'deepseek_builder' && (input.reasoningSelector || input.referenceSelector))
    throw new Error('BUILDER_HAS_NO_REASONING_OR_REFERENCE');
  if (role === 'deepseek_verifier' && (!input.reasoningSelector || input.referenceSelector))
    throw new Error('VERIFIER_REQUIRES_REASONING_ONLY');
  if (role === 'fish_tts' && (!input.referenceSelector || input.reasoningSelector))
    throw new Error('FISH_REQUIRES_REFERENCE_ONLY');

  const endpointOriginHmac = providerBindingHmac(key, role, 'endpoint_origin', input.endpointOrigin);
  const modelSelectorHmac = providerBindingHmac(key, role, 'model_selector', input.modelSelector);
  const reasoningSelectorHmac = input.reasoningSelector
    ? providerBindingHmac(key, role, 'reasoning_selector', input.reasoningSelector)
    : null;
  const referenceSelectorHmac = input.referenceSelector
    ? providerBindingHmac(key, role, 'reference_selector', input.referenceSelector)
    : null;
  const configVersionHash = createHash('sha256')
    .update(
      JSON.stringify({
        publicApiSurfaceId: input.publicApiSurfaceId,
        role,
        endpointOriginHmac,
        modelSelectorHmac,
        reasoningSelectorHmac,
        referenceSelectorHmac,
        adapterSchemaVersion: input.adapterSchemaVersion,
      }),
      'utf8',
    )
    .digest('hex');

  return {
    providerRole: role,
    publicApiSurfaceId: input.publicApiSurfaceId,
    auditKeyId: 'provider-audit-hmac-v1',
    endpointOriginHmac,
    modelSelectorHmac,
    reasoningSelectorHmac,
    referenceSelectorHmac,
    configVersionHash,
  };
}
