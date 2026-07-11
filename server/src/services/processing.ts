// D-009-A ProviderPayloadGuard, quality gate, and verifier attempt accounting (설계문서/18 §6.5, §7).
// Deterministic local code (not a provider). Constructs role-exact semantic payloads, rejects any
// unknown/forbidden field before a network request, and audits only field names / bytes / sha256.

import { createHash, randomUUID } from 'node:crypto';
import { closeSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, writeSync } from 'node:fs';
import { join } from 'node:path';

import type { Db } from '../db/connection';
import {
  BOUNDS,
  computeServerGate,
  detectCopyrightReproduction,
  type BuilderChunkOutput,
  type BuilderEvidenceChunk,
  type BuilderOutput,
  type EvidenceRef,
  type ProviderContext,
  type ProviderError,
  type TtsArtifact,
  type VerifierOutput,
} from '../domain/contracts';
import type { ExpandedScopeReason, ProviderPayloadGuardOutcome } from '../domain/enums';
import { chunkCues, type Cue } from '../providers/caption';
import { nextDailyCapEligibleAt, WORKER_HEARTBEAT_MS } from './scheduler';

export type ProviderRole = 'deepseek_builder_chunk' | 'deepseek_builder_aggregate' | 'deepseek_verifier' | 'fish_tts';

// Recursive allowlist of semantic field names per role (설계문서/18 §7.2 table).
const SOURCE_META_KEYS = [
  'sourceMeta',
  'videoId',
  'channelId',
  'canonicalUrl',
  'publicTitle',
  'publishedAt',
  'durationSec',
  'captionLanguages',
  'captionKinds',
  'promptVersion',
  'schemaVersion',
];
const BUILDER_OUTPUT_KEYS = [
  'title',
  'oneLineSummary',
  'contentKind',
  'category',
  'subcategory',
  'slug',
  'displayName',
  'topicClusters',
  'tags',
  'entities',
  'name',
  'kind',
  'claims',
  'claim',
  'numbers',
  'value',
  'context',
  'evidenceRefs',
  'ref',
  'startMs',
  'endMs',
  'audioScript',
  'language',
  'mode',
  'segments',
  'order',
  'text',
];
const CHUNK_OUTPUT_KEYS = ['chunkId', 'sectionSummary', 'claims', 'claim', 'numbers', 'value', 'context', 'entities', 'name', 'kind', 'evidenceRefs', 'ref', 'startMs', 'endMs', 'schemaVersion'];

const ALLOWED_KEYS: Record<ProviderRole, ReadonlySet<string>> = {
  deepseek_builder_chunk: new Set([...SOURCE_META_KEYS, 'chunk', 'chunkId', 'evidenceRefs', 'ref', 'startMs', 'endMs', 'text']),
  deepseek_builder_aggregate: new Set([
    ...SOURCE_META_KEYS,
    'chunkOutputs',
    ...CHUNK_OUTPUT_KEYS,
    'revision',
    'findings',
    'code',
    'priorCandidate',
    ...BUILDER_OUTPUT_KEYS,
    'priorOutputHash',
  ]),
  deepseek_verifier: new Set([
    ...SOURCE_META_KEYS,
    'candidate',
    ...BUILDER_OUTPUT_KEYS,
    'evidencePack',
    'chunkId',
    'attempt',
  ]),
  // Fish gets only the final approved script + configured voice reference id + minimal synth params.
  fish_tts: new Set(['language', 'format', 'speed', 'referenceId', 'segments', 'order', 'text']),
};

// Field-name markers that must never appear in any provider payload.
const FORBIDDEN_MARKERS = [
  'preference',
  'history',
  'conversation',
  'memory',
  'credential',
  'secret',
  'apikey',
  'api_key',
  'token',
  'authorization',
  'password',
  'health',
  'biometric',
  'payment',
  'account',
  'videocontentmap',
  'analyticsummary',
  'rawtranscript',
  'transcript',
  'playback',
  'private',
  'cookie',
  'note',
  'userdata',
];

export function recursiveFieldNames(value: unknown, out: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    for (const v of value) recursiveFieldNames(v, out);
  } else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      out.add(k);
      recursiveFieldNames(v, out);
    }
  }
  return out;
}

function forbiddenFieldsIn(fieldNames: Iterable<string>): string[] {
  const hits: string[] = [];
  for (const name of fieldNames) {
    const low = name.toLowerCase();
    if (FORBIDDEN_MARKERS.some((m) => low.includes(m))) hits.push(name);
  }
  return hits;
}

function unknownFieldsIn(role: ProviderRole, fieldNames: Iterable<string>): string[] {
  const allow = ALLOWED_KEYS[role];
  const unknown: string[] = [];
  for (const name of fieldNames) if (!allow.has(name)) unknown.push(name);
  return unknown;
}

export interface GuardInput {
  role: ProviderRole;
  payload: unknown;
  scopeActive: boolean;
  runtimeBindingValid: boolean;
  expandedScopeReason?: ExpandedScopeReason | null;
}

export interface GuardResult {
  outcome: ProviderPayloadGuardOutcome;
  fieldNames: string[];
  forbiddenFieldCount: number;
  byteCount: number | null;
  sha256: string | null;
  expandedScopeReason: ExpandedScopeReason | null;
  errorCode: 'SCOPE_ESCALATION_REQUIRED' | 'PAYLOAD_GUARD_REJECTED' | 'RUNTIME_BINDING_REJECTED' | null;
}

/** Runs the deterministic pre-network guard. Only an `allowed` result records bytes/hash and may be
 *  followed by a network request; every other outcome blocks before the wire. */
export function guardPayload(input: GuardInput): GuardResult {
  const names = [...recursiveFieldNames(input.payload)];
  const forbidden = forbiddenFieldsIn(names);
  const unknown = unknownFieldsIn(input.role, names);
  const base = {
    fieldNames: [...names].sort(),
    forbiddenFieldCount: forbidden.length,
    byteCount: null as number | null,
    sha256: null as string | null,
    expandedScopeReason: null as ExpandedScopeReason | null,
  };

  // 1. Any expanded/ambiguous scope stops before the network (SCOPE_ESCALATION_REQUIRED).
  if (input.expandedScopeReason) {
    return {
      ...base,
      fieldNames: [],
      outcome: 'scope_review_required',
      expandedScopeReason: input.expandedScopeReason,
      errorCode: 'SCOPE_ESCALATION_REQUIRED',
    };
  }
  // 2. Missing/revoked active scope approval blocks.
  if (!input.scopeActive) {
    return { ...base, outcome: 'payload_rejected', errorCode: 'PAYLOAD_GUARD_REJECTED' };
  }
  // 3. Forbidden or unknown (non-allowlisted) fields block.
  if (forbidden.length > 0 || unknown.length > 0) {
    return {
      ...base,
      forbiddenFieldCount: forbidden.length + unknown.length,
      outcome: 'payload_rejected',
      errorCode: 'PAYLOAD_GUARD_REJECTED',
    };
  }
  // 4. Runtime binding must be verified.
  if (!input.runtimeBindingValid) {
    return { ...base, outcome: 'runtime_binding_rejected', errorCode: 'RUNTIME_BINDING_REJECTED' };
  }
  // 5. Allowed: record only bytes and sha256 of the serialized semantic payload (no values).
  const serialized = JSON.stringify(input.payload);
  return {
    ...base,
    outcome: 'allowed',
    byteCount: Buffer.byteLength(serialized, 'utf8'),
    sha256: createHash('sha256').update(serialized, 'utf8').digest('hex'),
    errorCode: null,
  };
}

// ---------------------------------------------------------------------------
// Semantic payload constructors (only allowlisted fields). No secrets, no auth.
// ---------------------------------------------------------------------------
export interface PublicSourceMeta {
  videoId: string;
  channelId: string;
  canonicalUrl: string;
  publicTitle: string;
  publishedAt: string | null;
  durationSec: number;
  captionLanguages: string[];
  captionKinds: Array<'manual' | 'automatic'>;
}

export function buildBuilderChunkPayload(
  meta: PublicSourceMeta,
  chunk: { chunkId: string; evidenceRefs: Array<{ ref: string; startMs: number; endMs: number }>; text: string },
  versions: { promptVersion: string; schemaVersion: string },
): Record<string, unknown> {
  return { sourceMeta: meta, promptVersion: versions.promptVersion, schemaVersion: versions.schemaVersion, chunk };
}

export function buildBuilderAggregatePayload(
  meta: PublicSourceMeta,
  chunkOutputs: BuilderChunkOutput[],
  versions: { promptVersion: string; schemaVersion: string },
  revision?: { priorCandidate: BuilderOutput; findings: Array<{ code: string; evidenceRefs: string[] }>; priorOutputHash: string },
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    sourceMeta: meta,
    promptVersion: versions.promptVersion,
    schemaVersion: versions.schemaVersion,
    chunkOutputs,
  };
  if (revision) payload.revision = revision;
  return payload;
}

export function buildVerifierPayload(
  meta: PublicSourceMeta,
  candidate: BuilderOutput,
  evidencePack: Array<{ chunkId: string; evidenceRefs: Array<{ ref: string; startMs: number; endMs: number }>; text: string }>,
  attempt: 1 | 2,
  versions: { promptVersion: string; schemaVersion: string },
): Record<string, unknown> {
  return { sourceMeta: meta, promptVersion: versions.promptVersion, schemaVersion: versions.schemaVersion, candidate, evidencePack, attempt };
}

export function buildFishPayload(
  segments: Array<{ order: number; text: string }>,
  referenceId: string,
  params: { language: 'ko'; format: 'mp3'; speed: number },
): Record<string, unknown> {
  return { language: params.language, format: params.format, speed: params.speed, referenceId, segments };
}

// ---------------------------------------------------------------------------
// Quality gate + verifier attempt accounting (설계문서/18 §7.3)
// ---------------------------------------------------------------------------
export const MAX_VERIFIER_ATTEMPTS = 2;

export type PipelineDecision = 'tts_eligible' | 'revise' | 'human_review_required';

/** After a verifier submission, decide the next step. There is never a third verifier attempt.
 *  Server independently recomputes PASS from the verifier output. */
export function decideAfterVerify(output: VerifierOutput, attemptsUsed: number): { decision: PipelineDecision; reasons: string[] } {
  const gate = computeServerGate(output);
  if (gate.pass) return { decision: 'tts_eligible', reasons: [] };
  if (output.verdict === 'REVISE' && attemptsUsed < MAX_VERIFIER_ATTEMPTS) {
    return { decision: 'revise', reasons: gate.reasons };
  }
  return { decision: 'human_review_required', reasons: gate.reasons };
}

export function verifierSubmissionAllowed(attemptsUsed: number): boolean {
  return attemptsUsed < MAX_VERIFIER_ATTEMPTS;
}

// ---------------------------------------------------------------------------
// Dormant production pipeline orchestration (설계문서/18 §7, §8.3, §9).
// Providers are injected ports so tests drive the complete flow with fakes; the real adapters are
// wired only at live acceptance. No network call happens inside this function.
// ---------------------------------------------------------------------------

const CAPTION_TEMP_TTL_MS = 24 * 60 * 60 * 1000;
const DAILY_TTS_LIMIT = 10;
const FISH_REFERENCE_FIELD = 'referenceId';

export interface CaptionResult {
  artifactId: string;
  relativeTempKey: string;
  cues: Cue[];
  captionText: string;
  provenance: { channelId: string; publicTitle: string; publishedAt: string | null; durationSec: number; captionLanguages: string[]; captionKinds: Array<'manual' | 'automatic'>; sha256: string; byteCount: number };
}
export interface CaptionPort {
  acquire(input: { videoId: string; canonicalUrl: string }, ctx: ProviderContext): Promise<CaptionResult>;
  destroy(artifactId: string): Promise<void>;
}
export interface BuilderRevision {
  priorCandidate: BuilderOutput;
  findings: Array<{ code: string; evidenceRefs: string[] }>;
  priorOutputHash: string;
}
export interface BuilderPort {
  // One request per chunk and one per aggregate/revision, so each is guarded and audited separately.
  buildChunk(input: { meta: PublicSourceMeta; chunk: BuilderEvidenceChunk }, ctx: ProviderContext): Promise<BuilderChunkOutput>;
  buildAggregate(input: { meta: PublicSourceMeta; chunkOutputs: BuilderChunkOutput[]; revision?: BuilderRevision }, ctx: ProviderContext): Promise<BuilderOutput>;
}
export interface VerifierPort {
  verify(input: { meta: PublicSourceMeta; candidate: BuilderOutput; evidencePack: BuilderEvidenceChunk[]; attempt: 1 | 2 }, ctx: ProviderContext): Promise<VerifierOutput>;
}
export interface TtsPort {
  synthesize(input: { segments: Array<{ order: number; text: string }>; referenceId: string }, ctx: ProviderContext): Promise<TtsArtifact>;
}
export interface PipelinePorts {
  caption: CaptionPort;
  builder: BuilderPort;
  verifier: VerifierPort;
  tts: TtsPort;
}
export interface PipelineEvidence {
  deepseekPolicySnapshotId: string;
  fishPolicySnapshotId: string;
  builderBindingId: string;
  verifierBindingId: string;
  fishBindingId: string;
}
export interface PipelineContext {
  now: number;
  audioDir: string;
  stagingDir: string;
  referenceId: string;
  guardVersion: string;
  runtimeBindingValid: boolean;
  expandedScopeReason?: import('../domain/enums').ExpandedScopeReason | null;
  evidence: PipelineEvidence;
  // Called to refresh the real clock and heartbeat the singleton + job lease across long calls.
  // Returns the current epoch ms (or ctx.now). Invoked once before send and then on an interval
  // while any outbound request is pending.
  heartbeat?: () => number;
  // Stage deadline for an outbound provider call (abort + timed_out on expiry). Default 180s.
  providerTimeoutMs?: number;
  // How often to heartbeat while a call is pending. Default WORKER_HEARTBEAT_MS (30s).
  heartbeatIntervalMs?: number;
}
export interface PipelineOutcome {
  jobState: string;
  contentItemId: string | null;
  audioAssetId: string | null;
}

const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

function providerCtx(job: { id: string; idempotency_key: string }, now: number, ms: number): ProviderContext {
  return { jobId: job.id, idempotencyKey: job.idempotency_key, deadlineMs: now + ms, abortSignal: new AbortController().signal };
}

function auditCounter(): { next: () => number } {
  let n = 0;
  return { next: () => n++ };
}

const AUDIT_COLS =
  'INSERT INTO provider_payload_audits (id, job_id, provider_role, provider_attempt_id, guard_version, scope_attestation_version, outcome, field_names_json, semantic_payload_bytes, semantic_payload_sha256, forbidden_field_count, expanded_scope_reason, check_ordinal, checked_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

export interface AttemptRefs {
  policyId: string | null;
  bindingId: string | null;
  stage: 'builder' | 'verifier' | 'tts';
  substage: 'builder_chunk' | 'builder_aggregate' | 'verifier' | 'tts';
  ordinal: number;
  logicalAttempt: 1 | 2;
}

/** Guard, then (only if allowed) insert a `started` provider_attempt and the allowed audit that
 *  references it — BEFORE the network call. Returns the attempt id to finish, or null when the guard
 *  blocked (audit-only, no attempt, no network). */
function beginGuardedAttempt(
  db: Db,
  jobId: string,
  scopeApprovalId: string,
  providerRole: 'deepseek_builder' | 'deepseek_verifier' | 'fish_tts',
  guard: GuardResult,
  refs: AttemptRefs,
  checkOrdinal: number,
  now: number,
  guardVersion: string,
): string | null {
  if (guard.outcome === 'allowed') {
    const attemptId = randomUUID();
    db.prepare(
      'INSERT INTO provider_attempts (id, job_id, stage, substage, ordinal, logical_attempt, config_version_hash, request_hash, scope_approval_id, policy_snapshot_id, runtime_binding_id, status, started_at, finished_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NULL)',
    ).run(attemptId, jobId, refs.stage, refs.substage, refs.ordinal, refs.logicalAttempt, guardVersion, guard.sha256, scopeApprovalId, refs.policyId, refs.bindingId, 'started', now);
    db.prepare(AUDIT_COLS).run(randomUUID(), jobId, providerRole, attemptId, guardVersion, 'd009a.public-youtube-tech.v1', 'allowed', JSON.stringify(guard.fieldNames), guard.byteCount, guard.sha256, 0, null, checkOrdinal, now);
    return attemptId;
  }
  db.prepare(AUDIT_COLS).run(randomUUID(), jobId, providerRole, null, guardVersion, 'd009a.public-youtube-tech.v1', guard.outcome, JSON.stringify(guard.outcome === 'scope_review_required' ? [] : guard.fieldNames), null, null, guard.forbiddenFieldCount, guard.expandedScopeReason, checkOrdinal, now);
  return null;
}

/** Closes a started attempt with its real outcome (never pre-marked succeeded). */
function finishAttempt(db: Db, attemptId: string, status: 'succeeded' | 'failed' | 'timed_out', now: number, errorCode: string | null = null, outputHash: string | null = null): void {
  db.prepare('UPDATE provider_attempts SET status = ?, error_code = ?, output_hash = ?, finished_at = ? WHERE id = ?').run(status, errorCode, outputHash, now, attemptId);
}

export interface JobStanding {
  id: string;
  user_id: string;
  source_video_id: string;
  scope_approval_id: string;
  origin_kind: 'manual' | 'channel';
  manual_batch_item_id: string | null;
  channel_discovery_id: string | null;
  approval_version: number;
}

/** Re-reads the linked scope approval and, for a channel job, the channel standing (status/auto/
 *  version) at claim time and immediately before every outbound attempt. OFF/deleted/revoked or a
 *  version mismatch => inactive, so nothing is sent. */
export function scopeStanding(db: Db, job: JobStanding): boolean {
  const ap = db.prepare('SELECT status, approval_version FROM provider_scope_approvals WHERE id = ?').get(job.scope_approval_id) as { status: string; approval_version: number } | undefined;
  if (!ap || ap.status !== 'active' || ap.approval_version !== job.approval_version) return false;
  if (job.origin_kind === 'channel') {
    const disc = db.prepare('SELECT channel_id FROM channel_discoveries WHERE id = ?').get(job.channel_discovery_id) as { channel_id: string } | undefined;
    if (!disc) return false;
    const ch = db.prepare('SELECT status, auto_processing_enabled, approval_version FROM channels WHERE id = ?').get(disc.channel_id) as { status: string; auto_processing_enabled: number; approval_version: number } | undefined;
    if (!ch || ch.status !== 'active' || ch.auto_processing_enabled !== 1 || ch.approval_version !== job.approval_version) return false;
  }
  return true;
}

/** Idempotent: reuses an existing ContentItem for (user, source video); otherwise persists the
 *  verified candidate with the REAL verifier JSON/score/versions and its pending AudioAsset/playback
 *  rows. Never overwrites or duplicates on a restart. */
function upsertTaxonomyAndContent(db: Db, userId: string, sourceVideoId: string, output: BuilderOutput, verifier: VerifierOutput, now: number): string {
  const existing = db.prepare('SELECT id FROM content_items WHERE user_id = ? AND source_video_id = ?').get(userId, sourceVideoId) as { id: string } | undefined;
  if (existing) return existing.id;
  db.prepare('INSERT OR IGNORE INTO categories (id, slug, display_name, status, created_at, updated_at) VALUES (?,?,?,?,?,?)').run(randomUUID(), output.category, output.category, 'active', now, now);
  const cat = db.prepare('SELECT id FROM categories WHERE slug = ?').get(output.category) as { id: string };
  db.prepare('INSERT OR IGNORE INTO subcategories (id, category_id, slug, display_name, created_at, updated_at) VALUES (?,?,?,?,?,?)').run(randomUUID(), cat.id, output.subcategory.slug, output.subcategory.displayName, now, now);
  const sub = db.prepare('SELECT id FROM subcategories WHERE category_id = ? AND slug = ?').get(cat.id, output.subcategory.slug) as { id: string };
  const contentId = randomUUID();
  db.prepare(
    `INSERT INTO content_items (id,user_id,source_video_id,content_kind,category_id,subcategory_id,builder_output_json,builder_output_hash,builder_schema_version,builder_prompt_version,verifier_output_json,verifier_score,verifier_schema_version,verifier_prompt_version,title,one_line_summary,state,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(contentId, userId, sourceVideoId, output.contentKind, cat.id, sub.id, JSON.stringify(output), sha(JSON.stringify(output)), 'builder-output.v1', 'builder.aggregate.youtube-mvp.v1', JSON.stringify(verifier), verifier.overallScore, 'verifier-output.v1', 'verifier.youtube-mvp.v1', output.title, output.oneLineSummary, 'audio_pending', now, now);
  for (const tag of output.tags) {
    const norm = tag.normalize('NFKC').trim();
    db.prepare('INSERT OR IGNORE INTO tags (id, normalized_name, created_at) VALUES (?,?,?)').run(randomUUID(), norm, now);
    const t = db.prepare('SELECT id FROM tags WHERE normalized_name = ?').get(norm) as { id: string };
    db.prepare('INSERT OR IGNORE INTO content_item_tags (content_item_id, tag_id) VALUES (?,?)').run(contentId, t.id);
  }
  db.prepare('INSERT OR IGNORE INTO audio_assets (id, content_item_id, status, created_at, updated_at) VALUES (?,?,?,?,?)').run(randomUUID(), contentId, 'pending', now, now);
  db.prepare('INSERT OR IGNORE INTO playback_items (user_id, content_item_id, status, last_position_ms, duration_ms, revision, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)').run(userId, contentId, 'unheard', 0, 0, 0, now, now);
  return contentId;
}

function mapProviderError(code: ProviderError['code']): string {
  if (code === 'PUBLIC_CAPTION_UNAVAILABLE' || code === 'SOURCE_UNAVAILABLE') return 'failed';
  if (code === 'SCOPE_ESCALATION_REQUIRED') return 'human_review_required';
  if (code === 'TIMEOUT' || code === 'RATE_LIMITED' || code === 'UPSTREAM_5XX') return 'deferred';
  if (code === 'POLICY_REJECTED' || code === 'INVALID_SCHEMA' || code === 'OUTPUT_TOO_LARGE') return 'human_review_required';
  return 'failed';
}

const APPROVAL_REVOKED_DEFER_MS = 7 * 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const isProviderError = (e: unknown): e is ProviderError => typeof e === 'object' && e !== null && 'code' in e && 'stage' in e;

export type AttemptOutcome<T> =
  | { ok: true; value: T }
  | { ok: false; kind: 'scope_revoked' }
  | { ok: false; kind: 'guard_blocked'; outcome: string }
  | { ok: false; kind: 'call_failed'; code: string };

/** Shared outbound-request runtime for EVERY Builder chunk/aggregate/revision, Verifier, and Fish
 *  call: (a) re-check current scope standing immediately before send, (b) guard + a `started`
 *  attempt, (c) a live AbortController that aborts on the stage deadline, (d) heartbeat the singleton
 *  + job every heartbeatIntervalMs while the call is pending, (e) clear the timer/interval in finally
 *  and close the attempt with the fresh clock. A hung call is aborted and recorded timed_out. */
async function runAttempt<T>(
  db: Db,
  ctx: PipelineContext,
  jobId: string,
  job: JobStanding,
  providerRole: 'deepseek_builder' | 'deepseek_verifier' | 'fish_tts',
  guard: GuardResult,
  refs: AttemptRefs,
  checkOrdinal: number,
  call: (pctx: ProviderContext) => Promise<T>,
  hashOf: (value: T) => string,
): Promise<AttemptOutcome<T>> {
  if (!scopeStanding(db, job)) return { ok: false, kind: 'scope_revoked' };
  const attemptId = beginGuardedAttempt(db, jobId, job.scope_approval_id, providerRole, guard, refs, checkOrdinal, ctx.now, ctx.guardVersion);
  if (!attemptId) return { ok: false, kind: 'guard_blocked', outcome: guard.outcome };
  const clock = () => ctx.heartbeat?.() ?? ctx.now;
  const timeoutMs = ctx.providerTimeoutMs ?? 180_000;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  const interval = setInterval(() => {
    ctx.heartbeat?.();
  }, ctx.heartbeatIntervalMs ?? WORKER_HEARTBEAT_MS);
  ctx.heartbeat?.(); // once before send, then on the interval while pending
  try {
    const pctx: ProviderContext = { jobId, idempotencyKey: `${jobId}:${refs.substage}:${refs.ordinal}:${refs.logicalAttempt}`, deadlineMs: ctx.now + timeoutMs, abortSignal: ac.signal };
    const value = await call(pctx);
    finishAttempt(db, attemptId, 'succeeded', clock(), null, hashOf(value));
    return { ok: true, value };
  } catch (e) {
    const aborted = ac.signal.aborted;
    const code = aborted ? 'TIMEOUT' : isProviderError(e) ? e.code : 'INTERNAL';
    finishAttempt(db, attemptId, aborted || code === 'TIMEOUT' ? 'timed_out' : 'failed', clock(), code);
    return { ok: false, kind: 'call_failed', code };
  } finally {
    clearTimeout(timer);
    clearInterval(interval);
  }
}

/** Runs one job end to end against injected provider ports. Re-reads scope standing at claim and
 *  before every attempt, persists a started->finished audit/attempt for every actual request, is
 *  restart-idempotent (reuses ContentItem/AudioAsset/playback and never double-calls Fish), and
 *  clears the lease on any terminal/deferred state. Never makes a network call itself; only the
 *  injected ports do, and only at live acceptance. */
export async function runProcessingJob(db: Db, jobId: string, ports: PipelinePorts, ctx: PipelineContext): Promise<PipelineOutcome> {
  const job = db.prepare('SELECT id, user_id, source_video_id, scope_approval_id, origin_kind, manual_batch_item_id, channel_discovery_id, approval_version, idempotency_key, verifier_attempts FROM processing_jobs WHERE id = ?').get(jobId) as
    | (JobStanding & { idempotency_key: string; verifier_attempts: number })
    | undefined;
  if (!job) throw new Error('JOB_NOT_FOUND');
  const source = db.prepare('SELECT youtube_video_id, channel_id, canonical_url, public_title, published_at, duration_sec, caption_languages, caption_kinds FROM source_videos WHERE id = ?').get(job.source_video_id) as
    | { youtube_video_id: string; channel_id: string; canonical_url: string; public_title: string; published_at: number | null; duration_sec: number; caption_languages: string; caption_kinds: string }
    | undefined;
  if (!source) throw new Error('SOURCE_NOT_FOUND');

  const meta: PublicSourceMeta = {
    videoId: source.youtube_video_id,
    channelId: source.channel_id,
    canonicalUrl: source.canonical_url,
    publicTitle: source.public_title,
    publishedAt: source.published_at ? new Date(source.published_at).toISOString() : null,
    durationSec: source.duration_sec,
    captionLanguages: JSON.parse(source.caption_languages || '[]'),
    captionKinds: JSON.parse(source.caption_kinds || '[]'),
  };
  const pctx = providerCtx(job, ctx.now, 180_000);
  const counter = auditCounter();
  const localDate = new Date(ctx.now + KST_OFFSET_MS).toISOString().slice(0, 10);

  const setStage = (state: string) => db.prepare('UPDATE processing_jobs SET state = ?, updated_at = ? WHERE id = ?').run(state, ctx.now, jobId);
  const mirrorItem = (status: string) => {
    if (job.origin_kind === 'manual' && job.manual_batch_item_id) {
      db.prepare("UPDATE manual_batch_items SET status = ?, updated_at = ? WHERE id = ? AND status NOT IN ('deleted')").run(status, ctx.now, job.manual_batch_item_id);
    }
  };
  // Terminal/deferred: clear the lease so a dead owner cannot pin the job, and mirror item status.
  const finishJob = (state: string, deferReason: string | null = null, eligibleAt: number = ctx.now): PipelineOutcome => {
    db.prepare('UPDATE processing_jobs SET state = ?, defer_reason = ?, eligible_at = ?, lease_owner = NULL, lease_expires_at = NULL, updated_at = ? WHERE id = ?').run(state, deferReason, eligibleAt, ctx.now, jobId);
    if (['audio_ready', 'human_review_required', 'failed', 'deferred'].includes(state)) mirrorItem(state === 'deferred' ? 'deferred' : state);
    return { ...out, jobState: state };
  };
  const scopeOk = () => scopeStanding(db, job);
  const failFrom = (r: Exclude<AttemptOutcome<unknown>, { ok: true }>): PipelineOutcome =>
    r.kind === 'scope_revoked'
      ? finishJob('deferred', 'approval_revoked', ctx.now + APPROVAL_REVOKED_DEFER_MS)
      : r.kind === 'guard_blocked'
        ? finishJob(r.outcome === 'scope_review_required' ? 'human_review_required' : 'failed')
        : finishJob(mapProviderError(r.code as ProviderError['code']));

  let artifactId: string | null = null;
  const out: PipelineOutcome = { jobState: 'failed', contentItemId: null, audioAssetId: null };

  // Restart-idempotency: a prior run may have already produced the ContentItem. If audio is ready we
  // are done; if it is audio_pending we resume at TTS (never re-run caption/builder/verifier, never
  // duplicate rows). Otherwise run the full pipeline.
  const existingContent = db.prepare("SELECT id, state, builder_output_json FROM content_items WHERE user_id = ? AND source_video_id = ?").get(job.user_id, job.source_video_id) as
    | { id: string; state: string; builder_output_json: string }
    | undefined;

  try {
    // Claim-time scope re-check (OFF/deleted/revoked => defer, no work).
    if (!scopeOk()) return finishJob('deferred', 'approval_revoked', ctx.now + APPROVAL_REVOKED_DEFER_MS);

    let contentId: string;
    let candidate: BuilderOutput;

    if (existingContent && existingContent.state === 'audio_ready') {
      out.contentItemId = existingContent.id;
      const asset = db.prepare("SELECT id FROM audio_assets WHERE content_item_id = ? AND status = 'ready'").get(existingContent.id) as { id: string } | undefined;
      out.audioAssetId = asset?.id ?? null;
      return finishJob('audio_ready');
    } else if (existingContent) {
      // Resume at TTS with the already-persisted candidate.
      contentId = existingContent.id;
      candidate = JSON.parse(existingContent.builder_output_json) as BuilderOutput;
      out.contentItemId = contentId;
    } else {
      // --- CAPTION (local; guaranteed cleanup in finally) ---
      setStage('captioning');
      const cap = await ports.caption.acquire({ videoId: meta.videoId, canonicalUrl: meta.canonicalUrl }, pctx);
      artifactId = cap.artifactId;
      db.prepare(
        'INSERT INTO temporary_caption_artifacts (id, job_id, relative_temp_key, sha256, byte_count, languages, kinds, delete_status, created_at, expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      ).run(cap.artifactId, jobId, cap.relativeTempKey, cap.provenance.sha256, cap.provenance.byteCount, JSON.stringify(cap.provenance.captionLanguages), JSON.stringify(cap.provenance.captionKinds), 'pending', ctx.now, ctx.now + CAPTION_TEMP_TTL_MS);
      db.prepare('INSERT INTO provider_attempts (id, job_id, stage, substage, ordinal, logical_attempt, scope_approval_id, status, started_at, finished_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(randomUUID(), jobId, 'caption', 'caption', 0, 1, job.scope_approval_id, 'succeeded', ctx.now, ctx.now);

      // Defect #6: update SourceVideo + Builder metadata from acquired public caption provenance
      // BEFORE anything is sent to a provider.
      const durationSec = Math.max(1, Math.min(7200, Math.round(cap.provenance.durationSec) || meta.durationSec || 1));
      const publishedAtMs = cap.provenance.publishedAt ? Date.parse(cap.provenance.publishedAt) : source.published_at;
      db.prepare('UPDATE source_videos SET channel_id = ?, public_title = ?, duration_sec = ?, published_at = ?, caption_kinds = ?, caption_languages = ?, provenance_json = ?, updated_at = ? WHERE id = ?').run(
        cap.provenance.channelId || meta.channelId,
        cap.provenance.publicTitle || meta.publicTitle,
        durationSec,
        publishedAtMs ?? null,
        JSON.stringify(cap.provenance.captionKinds),
        JSON.stringify(cap.provenance.captionLanguages),
        JSON.stringify({ sha256: cap.provenance.sha256, byteCount: cap.provenance.byteCount, extractor: 'yt-dlp-public-caption', profile: 'youtube-public-caption.v1' }),
        ctx.now,
        job.source_video_id,
      );
      meta.channelId = cap.provenance.channelId || meta.channelId;
      meta.publicTitle = cap.provenance.publicTitle || meta.publicTitle;
      meta.durationSec = durationSec;
      meta.publishedAt = cap.provenance.publishedAt ?? meta.publishedAt;
      meta.captionLanguages = cap.provenance.captionLanguages;
      meta.captionKinds = cap.provenance.captionKinds;

      const { chunks } = chunkCues(cap.cues, { chunkChars: BOUNDS.chunkChars, maxChunks: BOUNDS.maxChunks });

      // --- BUILDER: one guarded/audited request per chunk (shared runtime), then the aggregate ---
      setStage('building');
      const chunkOutputs: BuilderChunkOutput[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i] as BuilderEvidenceChunk;
        const g = guardPayload({ role: 'deepseek_builder_chunk', payload: buildBuilderChunkPayload(meta, chunk, { promptVersion: 'builder.chunk.youtube-mvp.v1', schemaVersion: 'builder-chunk-output.v1' }), scopeActive: true, runtimeBindingValid: ctx.runtimeBindingValid, ...(ctx.expandedScopeReason ? { expandedScopeReason: ctx.expandedScopeReason } : {}) });
        const r = await runAttempt(db, ctx, jobId, job, 'deepseek_builder', g, { policyId: ctx.evidence.deepseekPolicySnapshotId, bindingId: ctx.evidence.builderBindingId, stage: 'builder', substage: 'builder_chunk', ordinal: i + 1, logicalAttempt: 1 }, counter.next(), (pctx) => ports.builder.buildChunk({ meta, chunk }, pctx), (co) => sha(JSON.stringify(co)));
        if (!r.ok) return failFrom(r);
        chunkOutputs.push(r.value);
      }

      const agg = await runAggregate(db, ports, ctx, jobId, job, meta, chunkOutputs, undefined, counter, 1);
      if (!agg.ok) return failFrom(agg);
      candidate = agg.value;

      // --- VERIFIER (separate selector; at most two submissions; server-computed gate) ---
      setStage('verifying');
      let passingVerifier: VerifierOutput | null = null;
      let attempt: 1 | 2 = 1;
      for (;;) {
        const vg = guardPayload({ role: 'deepseek_verifier', payload: buildVerifierPayload(meta, candidate, chunks, attempt, { promptVersion: 'verifier.youtube-mvp.v1', schemaVersion: 'verifier-output.v1' }), scopeActive: true, runtimeBindingValid: ctx.runtimeBindingValid });
        const vr = await runAttempt(db, ctx, jobId, job, 'deepseek_verifier', vg, { policyId: ctx.evidence.deepseekPolicySnapshotId, bindingId: ctx.evidence.verifierBindingId, stage: 'verifier', substage: 'verifier', ordinal: 0, logicalAttempt: attempt }, counter.next(), (pctx) => ports.verifier.verify({ meta, candidate, evidencePack: chunks, attempt }, pctx), (v) => sha(JSON.stringify(v)));
        if (!vr.ok) return vr.kind === 'guard_blocked' ? finishJob('human_review_required') : failFrom(vr);
        const verdict = vr.value;
        db.prepare('UPDATE processing_jobs SET verifier_attempts = ?, updated_at = ? WHERE id = ?').run(attempt, ctx.now, jobId);
        const gate = computeServerGate(verdict);
        const copyright = detectCopyrightReproduction(cap.captionText, candidate.audioScript.segments);
        if (gate.pass && !copyright) {
          passingVerifier = verdict;
          break;
        }
        if (verdict.verdict === 'REVISE' && attempt < MAX_VERIFIER_ATTEMPTS && !copyright) {
          const rev = await runAggregate(db, ports, ctx, jobId, job, meta, chunkOutputs, { priorCandidate: candidate, findings: verdict.findings.map((f) => ({ code: f.code, evidenceRefs: f.evidenceRefs })), priorOutputHash: sha(JSON.stringify(candidate)) }, counter, 2);
          if (!rev.ok) return failFrom(rev);
          candidate = rev.value;
          attempt = 2;
          continue;
        }
        return finishJob('human_review_required');
      }

      // --- Persist ContentItem (verified -> audio_pending) with the REAL passing verifier output ---
      contentId = upsertTaxonomyAndContent(db, job.user_id, job.source_video_id, candidate, passingVerifier, ctx.now);
      out.contentItemId = contentId;
    }

    // --- TTS (daily reservation cap; approved script only; receipt/recovery; restart-idempotent) ---
    return await runTts(db, ports, ctx, jobId, job, contentId, candidate, localDate, counter, finishJob, out);
  } catch (e) {
    const code = isProviderError(e) ? e.code : undefined;
    return finishJob(code ? mapProviderError(code) : 'failed');
  } finally {
    // Guaranteed caption cleanup on success, failure, timeout, or signal.
    if (artifactId) {
      try {
        await ports.caption.destroy(artifactId);
        db.prepare("UPDATE temporary_caption_artifacts SET delete_status = 'deleted', deleted_at = ? WHERE id = ?").run(ctx.now, artifactId);
      } catch {
        db.prepare("UPDATE temporary_caption_artifacts SET delete_status = 'failed' WHERE id = ?").run(artifactId);
      }
    }
  }
}

/** One guarded/audited aggregate (or revision) request through the shared attempt runtime. */
async function runAggregate(
  db: Db,
  ports: PipelinePorts,
  ctx: PipelineContext,
  jobId: string,
  job: JobStanding,
  meta: PublicSourceMeta,
  chunkOutputs: BuilderChunkOutput[],
  revision: BuilderRevision | undefined,
  counter: { next: () => number },
  logicalAttempt: 1 | 2,
): Promise<AttemptOutcome<BuilderOutput>> {
  const g = guardPayload({ role: 'deepseek_builder_aggregate', payload: buildBuilderAggregatePayload(meta, chunkOutputs, { promptVersion: 'builder.aggregate.youtube-mvp.v1', schemaVersion: 'builder-output.v1' }, revision), scopeActive: true, runtimeBindingValid: ctx.runtimeBindingValid });
  return runAttempt(db, ctx, jobId, job, 'deepseek_builder', g, { policyId: ctx.evidence.deepseekPolicySnapshotId, bindingId: ctx.evidence.builderBindingId, stage: 'builder', substage: 'builder_aggregate', ordinal: 0, logicalAttempt }, counter.next(), (pctx) => ports.builder.buildAggregate({ meta, chunkOutputs, ...(revision ? { revision } : {}) }, pctx), (o) => sha(JSON.stringify(o)));
}

/** TTS phase: daily reservation cap, approved-script-only Fish call, receipt lifecycle. Exception-
 *  safe (explicit failure releases the reservation; a timeout keeps it as outcome_unknown) and
 *  restart-idempotent (a prior generated/staged/storage_failed receipt resumes storage without a
 *  second Fish call; requested/outcome_unknown never re-calls Fish). */
async function runTts(
  db: Db,
  ports: PipelinePorts,
  ctx: PipelineContext,
  jobId: string,
  job: JobStanding,
  contentId: string,
  candidate: BuilderOutput,
  localDate: string,
  counter: { next: () => number },
  finishJob: (state: string, deferReason?: string | null, eligibleAt?: number) => PipelineOutcome,
  out: PipelineOutcome,
): Promise<PipelineOutcome> {
  const asset = db.prepare("SELECT id, status FROM audio_assets WHERE content_item_id = ?").get(contentId) as { id: string; status: string } | undefined;
  if (!asset) throw new Error('AUDIO_ASSET_MISSING');
  const assetId = asset.id;
  if (asset.status === 'ready') {
    out.audioAssetId = assetId;
    return finishJob('audio_ready');
  }

  const markStorageFailed = (receiptId: string): PipelineOutcome => {
    db.prepare("UPDATE tts_generation_receipts SET status = 'storage_failed', updated_at = ? WHERE id = ?").run(ctx.now, receiptId);
    return finishJob('deferred', 'lease_recovery');
  };

  const finalize = (byteCount: number, durationMs: number, sha256: string, receiptId: string): PipelineOutcome => {
    db.transaction(() => {
      db.prepare("UPDATE tts_generation_receipts SET status = 'staged', updated_at = ? WHERE id = ?").run(ctx.now, receiptId);
      db.prepare("UPDATE audio_assets SET status = 'ready', storage_key = ?, mime_type = 'audio/mpeg', byte_count = ?, duration_ms = ?, sha256 = ?, generated_at = ?, updated_at = ? WHERE id = ?").run(assetId, byteCount, durationMs, sha256, ctx.now, ctx.now, assetId);
      db.prepare("UPDATE content_items SET state = 'audio_ready', audio_ready_at = ?, updated_at = ? WHERE id = ?").run(ctx.now, ctx.now, contentId);
      db.prepare('UPDATE playback_items SET duration_ms = ?, updated_at = ? WHERE user_id = ? AND content_item_id = ?').run(durationMs, ctx.now, job.user_id, contentId);
      db.prepare("UPDATE tts_generation_receipts SET status = 'finalized', updated_at = ? WHERE id = ?").run(ctx.now, receiptId);
    })();
    out.audioAssetId = assetId;
    return finishJob('audio_ready');
  };

  // Moves the exact staged bytes into private storage (no Fish call). Verifies bytes, atomically
  // writes + fsync + rename, re-verifies the persisted file, then publishes.
  const storeFromStaging = (stagingKey: string, byteCount: number, sha256: string, durationMs: number, receiptId: string): PipelineOutcome => {
    let staged: Buffer;
    try {
      staged = readFileSync(stagingKey);
    } catch {
      return markStorageFailed(receiptId);
    }
    if (staged.byteLength !== byteCount || createHash('sha256').update(staged).digest('hex') !== sha256) return markStorageFailed(receiptId);
    mkdirSync(ctx.audioDir, { recursive: true });
    const finalPath = join(ctx.audioDir, `${assetId}.mp3`);
    const tmpPath = `${finalPath}.tmp-${randomUUID()}`;
    const fd = openSync(tmpPath, 'w', 0o600);
    try {
      writeSync(fd, staged);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    renameSync(tmpPath, finalPath);
    const persisted = readFileSync(finalPath);
    if (persisted.byteLength !== byteCount || createHash('sha256').update(persisted).digest('hex') !== sha256) return markStorageFailed(receiptId);
    return finalize(byteCount, durationMs, sha256, receiptId);
  };

  // RESTART: a prior run may already have a receipt for this job.
  const prior = db.prepare('SELECT id, status, staging_key, artifact_bytes, artifact_sha256, artifact_duration_ms FROM tts_generation_receipts WHERE job_id = ?').get(jobId) as
    | { id: string; status: string; staging_key: string | null; artifact_bytes: number | null; artifact_sha256: string | null; artifact_duration_ms: number | null }
    | undefined;
  if (prior) {
    if (prior.status === 'finalized') return finalize(prior.artifact_bytes ?? 0, prior.artifact_duration_ms ?? 0, prior.artifact_sha256 ?? '', prior.id);
    if (['generated', 'staged', 'storage_failed'].includes(prior.status) && prior.staging_key && prior.artifact_sha256 && prior.artifact_bytes != null) {
      // Fish already produced audio once; resume storage without a second Fish call.
      return storeFromStaging(prior.staging_key, prior.artifact_bytes, prior.artifact_sha256, prior.artifact_duration_ms ?? 0, prior.id);
    }
    if (prior.status === 'provider_failed') return finishJob('human_review_required');
    // requested/outcome_unknown: outcome is unknown; never re-call Fish (would double-charge). Keep
    // the reservation and route to review.
    db.prepare("UPDATE tts_generation_receipts SET status = 'outcome_unknown', updated_at = ? WHERE id = ?").run(ctx.now, prior.id);
    return finishJob('human_review_required');
  }

  // FRESH TTS.
  db.prepare("UPDATE processing_jobs SET state = 'tts_queued', updated_at = ? WHERE id = ?").run(ctx.now, jobId);
  db.prepare('INSERT OR IGNORE INTO daily_tts_usage (user_id, local_date, reserved_count, successful_count, revision, updated_at) VALUES (?,?,0,0,0,?)').run(job.user_id, localDate, ctx.now);
  const usage = db.prepare('SELECT reserved_count, successful_count FROM daily_tts_usage WHERE user_id = ? AND local_date = ?').get(job.user_id, localDate) as { reserved_count: number; successful_count: number };
  if (usage.reserved_count + usage.successful_count >= DAILY_TTS_LIMIT) {
    // Defer without discard to the next Asia/Seoul midnight + deterministic jitter (not immediate).
    return finishJob('deferred', 'daily_tts_cap', nextDailyCapEligibleAt(ctx.now, jobId));
  }
  if (!scopeStanding(db, job)) return finishJob('deferred', 'approval_revoked', ctx.now + APPROVAL_REVOKED_DEFER_MS);

  const receiptId = randomUUID();
  const releaseReservation = () => db.prepare('UPDATE daily_tts_usage SET reserved_count = reserved_count - 1, updated_at = ? WHERE user_id = ? AND local_date = ?').run(ctx.now, job.user_id, localDate);
  db.transaction(() => {
    db.prepare('UPDATE daily_tts_usage SET reserved_count = reserved_count + 1, updated_at = ? WHERE user_id = ? AND local_date = ?').run(ctx.now, job.user_id, localDate);
    db.prepare("INSERT INTO tts_generation_receipts (id, user_id, job_id, content_item_id, provider_idempotency_key, local_date, status, created_at, updated_at) VALUES (?,?,?,?,?,?,'requested',?,?)").run(receiptId, job.user_id, jobId, contentId, `${jobId}:tts`, localDate, ctx.now, ctx.now);
  })();

  db.prepare("UPDATE processing_jobs SET state = 'synthesizing', updated_at = ? WHERE id = ?").run(ctx.now, jobId);
  const fishGuard = guardPayload({ role: 'fish_tts', payload: buildFishPayload(candidate.audioScript.segments.map((s) => ({ order: s.order, text: s.text })), ctx.referenceId, { language: 'ko', format: 'mp3', speed: 1 }), scopeActive: true, runtimeBindingValid: ctx.runtimeBindingValid });
  const fr = await runAttempt(db, ctx, jobId, job, 'fish_tts', fishGuard, { policyId: ctx.evidence.fishPolicySnapshotId, bindingId: ctx.evidence.fishBindingId, stage: 'tts', substage: 'tts', ordinal: 0, logicalAttempt: 1 }, counter.next(), (pctx) => ports.tts.synthesize({ segments: candidate.audioScript.segments.map((s) => ({ order: s.order, text: s.text })), referenceId: ctx.referenceId }, pctx), (a) => a.sha256);
  if (!fr.ok) {
    if (fr.kind === 'call_failed' && fr.code === 'TIMEOUT') {
      // Outcome unknown: KEEP the reservation, mark outcome_unknown, defer for reconciliation.
      db.prepare("UPDATE tts_generation_receipts SET status = 'outcome_unknown', updated_at = ? WHERE id = ?").run(ctx.now, receiptId);
      return finishJob('deferred', 'lease_recovery');
    }
    // scope revoked / guard blocked / explicit failure: nothing generated, so release the reservation.
    db.transaction(() => {
      releaseReservation();
      db.prepare("UPDATE tts_generation_receipts SET status = 'provider_failed', updated_at = ? WHERE id = ?").run(ctx.now, receiptId);
    })();
    if (fr.kind === 'scope_revoked') return finishJob('deferred', 'approval_revoked', ctx.now + APPROVAL_REVOKED_DEFER_MS);
    if (fr.kind === 'guard_blocked') return finishJob('human_review_required');
    return finishJob(mapProviderError(fr.code as ProviderError['code']));
  }
  const artifact = fr.value;

  // Valid audio == successful generation (§7.4): release the reservation and count the success now,
  // recording the exact byte/hash regardless of the later storage outcome. No auto re-call.
  db.transaction(() => {
    db.prepare('UPDATE daily_tts_usage SET reserved_count = reserved_count - 1, successful_count = successful_count + 1, updated_at = ? WHERE user_id = ? AND local_date = ?').run(ctx.now, job.user_id, localDate);
    db.prepare("UPDATE tts_generation_receipts SET status = 'generated', artifact_sha256 = ?, artifact_bytes = ?, artifact_duration_ms = ?, staging_key = ?, updated_at = ? WHERE id = ?").run(artifact.sha256, artifact.byteCount, artifact.durationMs, artifact.tempKey, ctx.now, receiptId);
  })();
  return storeFromStaging(artifact.tempKey, artifact.byteCount, artifact.sha256, artifact.durationMs, receiptId);
}
