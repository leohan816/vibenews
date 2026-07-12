// Real, fail-closed private acceptance runner (설계문서/18 §14.1, §14.4, §15, §16.1). The normal CLI
// path uses only validated non-secret runtime config, the real DB/providers/services/HTTP handler,
// and produces the frozen §14.4 evidence from OBSERVABLE, structurally-verified, job-bound evidence —
// never a constant, tautology, bare operator boolean, permissive empty record, or precomputed flag.
// Live YouTube/DeepSeek/Fish/tailnet execution happens only when an operator later supplies real
// prerequisites; missing/invalid/stale evidence fails closed with a truthful non-zero NOT_RUN/BLOCKED
// and NEVER a public/mock/synthetic/sentinel fallback. It never opens .env.server.local, never prints
// any secret/model/reference/selector/HMAC/URL/credential value, and emits only safe statuses, counts,
// dates, digests, and timestamps. The five D-009-A labels are emitted only after every local gate passes.
//
// runPrivateAcceptance() is a dependency-injected orchestration boundary so the synthetic integration
// test drives the exact same real path with injected observers/transports and no live call.

import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { loadConfig, ConfigError, type ServerConfig } from '../config';
import { openDatabase, type Db } from '../db/connection';
import { assertValidPolicySnapshot, buildRuntimeBinding, formatAssurance, type ProviderPolicySnapshot, type ProviderRole, type RuntimeBindingInput } from '../domain/contracts';
import { canonicalizeVideoUrl, CaptionCanonicalizationError } from '../providers/caption';
import { createManualBatch, enqueueManualBatch, fetchChannelFeed, parseChannelFeed, recordDiscoveries, registerChannel, type FeedTransport } from '../services/source';
import { promoteDiscoveries } from '../services/scheduler';
import { createOrResumeAutomaticSession, ensureUserAndGlobal } from '../services/playback';
import { runProcessingJob, type PipelineContext, type PipelineEvidence, type PipelinePorts } from '../services/processing';
import { buildPipelinePorts, loadPipelineEvidence } from './worker';
import { buildApp } from './api';

// The single authorized official low-risk source frozen in §15.
export const AUTHORIZED_VIDEO_ID = '5JqK9JLD140';
export const AUTHORIZED_CHANNEL_ID = 'UCx_YiR733cfqVPRsQ1n8Fag';
export const ADAPTER_SCHEMA_VERSION = 'youtube-mvp.v1';
const GATE_MIN_SCORE = 9.0;
const HOUR_MS = 60 * 60 * 1000;
const DEFAULT_ACCESS_MAX_AGE_MS = 5 * 60 * 1000;
// Raw source media / raw transcript file extensions that must never remain under bounded paths.
const FORBIDDEN_RAW_RE = /\.(vtt|srt|sbv|ttml|txt|mp4|webm|mkv|mov|avi|m4v|ts|flv)$/i;

const sha8 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 8);

export interface AccessEvidence {
  status: 'ok' | 'denied' | 'failed';
  observedAt: number; // epoch ms when the read-only observation was taken
  source: string; // safe provenance label (e.g. 'tailscale.status'), never an IP/host/route
  digest: string; // digest of a redacted observation, never raw command body
}
export interface AccessEvidenceSet {
  loopbackBind: AccessEvidence;
  tailnetServeHttps: AccessEvidence;
  authorizedDeviceGrant: AccessEvidence;
  funnelDisabled: AccessEvidence;
  publicDenied: AccessEvidence; // must be observed 'denied'
}
export type AccessObserver = (now: number) => Promise<AccessEvidenceSet>;

// The role-selector matrix drawn from the current validated runtime configuration (values held in
// memory only; the runner recomputes the value-free binding HMACs and never prints these).
export interface RuntimeSelectors {
  deepseekEndpointOrigin: string;
  builderModel: string;
  verifierModel: string;
  verifierReasoning: string;
  fishEndpointOrigin: string;
  fishModel: string;
  fishReference: string;
}

export interface AcceptanceDeps {
  config: ServerConfig;
  db: Db;
  ports: PipelinePorts;
  evidence: PipelineEvidence;
  access: AccessObserver;
  accessMaxAgeMs: number;
  feedTransport: FeedTransport;
  audioDir: string;
  stagingDir: string;
  captionTempRoot: string;
  referenceId: string;
  guardVersion: string;
  auditKey: Buffer; // value-free binding recomputation key (never printed)
  selectors: RuntimeSelectors;
  now: number;
  videoId: string;
  channelId: string;
  emit: (line: string) => void;
}

export interface AcceptanceResult {
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  code: string;
  exitCode: number; // 0 only on PASS
  labelsEmitted: boolean;
}

function arg(name: string): string | null {
  const argv = process.argv.slice(2);
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? (argv[i + 1] as string) : null;
}

/** Recursively counts raw source-media/transcript files under a bounded path. Returns accessible=false
 *  only when the directory exists but cannot be read. A missing directory is accessible with 0 files. */
function scanBoundedForRaw(dir: string): { forbidden: number; accessible: boolean } {
  if (!existsSync(dir)) return { forbidden: 0, accessible: true };
  let forbidden = 0;
  const walk = (d: string, depth: number): boolean => {
    if (depth > 8) return true;
    let ents;
    try {
      ents = readdirSync(d, { withFileTypes: true });
    } catch {
      return false;
    }
    for (const e of ents) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (!walk(p, depth + 1)) return false;
      } else if (FORBIDDEN_RAW_RE.test(e.name)) {
        forbidden += 1;
      }
    }
    return true;
  };
  const accessible = walk(dir, 0);
  return { forbidden, accessible };
}

/** Parses and strictly validates one provider policy snapshot row (IR-F1-D1(f)). */
function validatePolicySnapshot(db: Db, id: string, wantProvider: 'deepseek' | 'fish_audio'): boolean {
  const row = db.prepare('SELECT provider, official_policy_urls, official_api_url, public_api_surface_id, policy_effective_or_updated_date, reviewed_at, document_set_sha256, lookup_status, public_statement_codes, verified_local_control_codes, controls_not_independently_verified, provider_policy_assurance, local_data_controls, provider_side_deletion, provider_side_no_training, production_privacy_approval FROM provider_policy_snapshots WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row || row.provider !== wantProvider) return false;
  if (row.lookup_status !== 'retrieved' && row.lookup_status !== 'changed_since_review') return false;
  let urls: unknown, stmt: unknown, verified: unknown, unverified: unknown;
  try {
    urls = JSON.parse(String(row.official_policy_urls));
    stmt = JSON.parse(String(row.public_statement_codes));
    verified = JSON.parse(String(row.verified_local_control_codes));
    unverified = JSON.parse(String(row.controls_not_independently_verified));
  } catch {
    return false;
  }
  const nonEmptyStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'string' && x.length > 0);
  if (!nonEmptyStrArr(urls) || !urls.every((u) => /^https:\/\/[^\s]+$/.test(u))) return false;
  if (!nonEmptyStrArr(stmt) || !nonEmptyStrArr(verified) || !nonEmptyStrArr(unverified)) return false;
  const date = String(row.policy_effective_or_updated_date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return false;
  if (typeof row.reviewed_at !== 'number' || row.reviewed_at <= 0) return false;
  try {
    assertValidPolicySnapshot({
      provider: row.provider as ProviderPolicySnapshot['provider'],
      officialPolicyUrls: urls,
      officialApiUrl: String(row.official_api_url),
      publicApiSurfaceId: row.public_api_surface_id as ProviderPolicySnapshot['publicApiSurfaceId'],
      policyEffectiveOrUpdatedDate: date,
      reviewedAt: String(row.reviewed_at),
      documentSetSha256: (row.document_set_sha256 as string | null) ?? null,
      lookupStatus: row.lookup_status as ProviderPolicySnapshot['lookupStatus'],
      publicStatementCodes: stmt,
      verifiedLocalControlCodes: verified,
      controlsNotIndependentlyVerified: unverified,
      providerPolicyAssurance: row.provider_policy_assurance as 'LIMITED_AND_UNVERIFIED',
      localDataControls: row.local_data_controls as 'VERIFIED',
      providerSideDeletion: row.provider_side_deletion as 'NOT_VERIFIED',
      providerSideNoTraining: row.provider_side_no_training as 'NOT_VERIFIED',
      productionPrivacyApproval: row.production_privacy_approval as 'NOT_GRANTED',
    });
  } catch {
    return false;
  }
  return true;
}

/** Recomputes the value-free role binding from the current config and compares every HMAC/config hash
 *  to the stored row (IR-F1-D1(g)). Never returns or prints selector/HMAC material. */
function validateRoleBinding(db: Db, key: Buffer, bindingId: string, role: ProviderRole, input: RuntimeBindingInput): boolean {
  const row = db.prepare('SELECT provider_role, public_api_surface_id, endpoint_origin_hmac, model_selector_hmac, reasoning_selector_hmac, reference_selector_hmac, config_version_hash FROM provider_runtime_bindings WHERE id = ?').get(bindingId) as
    | { provider_role: string; public_api_surface_id: string; endpoint_origin_hmac: string; model_selector_hmac: string; reasoning_selector_hmac: string | null; reference_selector_hmac: string | null; config_version_hash: string }
    | undefined;
  if (!row || row.provider_role !== role) return false;
  let expected;
  try {
    expected = buildRuntimeBinding(key, input);
  } catch {
    return false;
  }
  return (
    row.public_api_surface_id === expected.publicApiSurfaceId &&
    row.endpoint_origin_hmac === expected.endpointOriginHmac &&
    row.model_selector_hmac === expected.modelSelectorHmac &&
    row.reasoning_selector_hmac === expected.reasoningSelectorHmac &&
    row.reference_selector_hmac === expected.referenceSelectorHmac &&
    row.config_version_hash === expected.configVersionHash
  );
}

/** Runs the bounded real private vertical slice for the authorized source against injected ports and
 *  emits every §14.4 item from observable/verified evidence. Fail-closed everywhere; the five labels
 *  are emitted only after every local evidence gate passes and never from a constant or bare flag. */
export async function runPrivateAcceptance(deps: AcceptanceDeps): Promise<AcceptanceResult> {
  const E = deps.emit;
  const db = deps.db;
  const now = deps.now;
  const blocked = (code: string): AcceptanceResult => {
    E(`LIVE_PRIVATE_ACCEPTANCE: BLOCKED ${code}`);
    return { status: 'BLOCKED', code, exitCode: 2, labelsEmitted: false };
  };
  const failed = (code: string): AcceptanceResult => {
    E(`LIVE_PRIVATE_ACCEPTANCE: FAIL ${code}`);
    return { status: 'FAIL', code, exitCode: 1, labelsEmitted: false };
  };
  E('LIVE_PRIVATE_ACCEPTANCE: RUNNING');

  // --- §14.4(1) selected video canonical ID and official channel match ---
  try {
    canonicalizeVideoUrl(`https://www.youtube.com/watch?v=${deps.videoId}`);
  } catch (e) {
    if (e instanceof CaptionCanonicalizationError) return blocked('AUTHORIZED_SOURCE_REQUIRED');
    throw e;
  }
  if (deps.videoId !== AUTHORIZED_VIDEO_ID || deps.channelId !== AUTHORIZED_CHANNEL_ID) return blocked('AUTHORIZED_SOURCE_REQUIRED');
  E(`SELECTED_VIDEO_ID: ${deps.videoId}`);
  E(`SELECTED_CHANNEL_ID: ${deps.channelId}`);
  E('OFFICIAL_SOURCE_MATCH: true');

  // --- §14.4(9) IR-F1-D1(b): observable, time-bound access evidence (no bare booleans) ---
  const acc = await deps.access(now);
  const fresh = (e: AccessEvidence, want: 'ok' | 'denied'): boolean => e.status === want && e.source.length > 0 && e.digest.length > 0 && now - e.observedAt >= 0 && now - e.observedAt <= deps.accessMaxAgeMs;
  const accessChecks: Array<[string, AccessEvidence, 'ok' | 'denied']> = [
    ['ACCESS_LOOPBACK_BIND', acc.loopbackBind, 'ok'],
    ['ACCESS_TAILNET_SERVE_HTTPS', acc.tailnetServeHttps, 'ok'],
    ['ACCESS_AUTHORIZED_DEVICE_GRANT', acc.authorizedDeviceGrant, 'ok'],
    ['ACCESS_FUNNEL_DISABLED', acc.funnelDisabled, 'ok'],
    ['ACCESS_PUBLIC_DENIED', acc.publicDenied, 'denied'],
  ];
  let accessOk = true;
  for (const [label, ev, want] of accessChecks) {
    const ok = fresh(ev, want);
    accessOk = accessOk && ok;
    E(`${label}: ${ev.status} want=${want} src=${ev.source} ageMs=${now - ev.observedAt} digest=${ev.digest.slice(0, 8)} ok=${ok}`);
  }
  if (!accessOk) return blocked('RUNTIME_ACCESS_REQUIRED');

  // --- §14.4(11) IR-F1-D1(f): fully parsed/validated D-009-A policy snapshots ---
  const dsPolicyOk = validatePolicySnapshot(db, deps.evidence.deepseekPolicySnapshotId, 'deepseek');
  const fishPolicyOk = validatePolicySnapshot(db, deps.evidence.fishPolicySnapshotId, 'fish_audio');
  E(`POLICY_SNAPSHOT_DEEPSEEK_VALID: ${dsPolicyOk}`);
  E(`POLICY_SNAPSHOT_FISH_VALID: ${fishPolicyOk}`);
  if (!dsPolicyOk || !fishPolicyOk) return blocked('POLICY_SNAPSHOT_REQUIRED');

  // --- §14.4(11) IR-F1-D1(g): recomputed value-free role-binding matrix ---
  const s = deps.selectors;
  const builderBindingOk = validateRoleBinding(db, deps.auditKey, deps.evidence.builderBindingId, 'deepseek_builder', { role: 'deepseek_builder', publicApiSurfaceId: 'deepseek.post.chat-completions', endpointOrigin: s.deepseekEndpointOrigin, modelSelector: s.builderModel, adapterSchemaVersion: ADAPTER_SCHEMA_VERSION });
  const verifierBindingOk = validateRoleBinding(db, deps.auditKey, deps.evidence.verifierBindingId, 'deepseek_verifier', { role: 'deepseek_verifier', publicApiSurfaceId: 'deepseek.post.chat-completions', endpointOrigin: s.deepseekEndpointOrigin, modelSelector: s.verifierModel, reasoningSelector: s.verifierReasoning, adapterSchemaVersion: ADAPTER_SCHEMA_VERSION });
  const fishBindingOk = validateRoleBinding(db, deps.auditKey, deps.evidence.fishBindingId, 'fish_tts', { role: 'fish_tts', publicApiSurfaceId: 'fish.post.v1.tts', endpointOrigin: s.fishEndpointOrigin, modelSelector: s.fishModel, referenceSelector: s.fishReference, adapterSchemaVersion: ADAPTER_SCHEMA_VERSION });
  const bindingRoles = db.prepare('SELECT provider_role FROM provider_runtime_bindings WHERE id IN (?,?,?)').all(deps.evidence.builderBindingId, deps.evidence.verifierBindingId, deps.evidence.fishBindingId) as Array<{ provider_role: string }>;
  const rolesDistinctOk = bindingRoles.length === 3 && new Set(bindingRoles.map((r) => r.provider_role)).size === 3 && ['deepseek_builder', 'deepseek_verifier', 'fish_tts'].every((r) => bindingRoles.some((x) => x.provider_role === r));
  const bindingsOk = builderBindingOk && verifierBindingOk && fishBindingOk && rolesDistinctOk;
  E(`RUNTIME_BINDING_BUILDER_VALID: ${builderBindingOk}`);
  E(`RUNTIME_BINDING_VERIFIER_VALID: ${verifierBindingOk}`);
  E(`RUNTIME_BINDING_FISH_VALID: ${fishBindingOk}`);
  E(`RUNTIME_BINDING_ROLES_DISTINCT: ${rolesDistinctOk}`);
  if (!bindingsOk) return blocked('RUNTIME_BINDING_REQUIRED');

  // --- Provision + drive the EXISTING pipeline for the selected video (capture success delta) ---
  ensureUserAndGlobal(db, now);
  const beforeSuccess = (db.prepare("SELECT successful_count FROM daily_tts_usage WHERE user_id = 'leo'").get() as { successful_count: number } | undefined)?.successful_count ?? 0;
  const batch = createManualBatch(db, { urls: [`https://www.youtube.com/watch?v=${deps.videoId}`], idempotencyKey: `accept:${deps.videoId}` }, now);
  enqueueManualBatch(db, batch.view.id, now);
  const job = db.prepare("SELECT j.id AS jid FROM processing_jobs j JOIN source_videos sv ON sv.id = j.source_video_id WHERE j.origin_kind = 'manual' AND sv.youtube_video_id = ?").get(deps.videoId) as { jid: string } | undefined;
  if (!job) return blocked('ENQUEUE_FAILED');
  const ctx: PipelineContext = { now, audioDir: deps.audioDir, stagingDir: deps.stagingDir, referenceId: deps.referenceId, guardVersion: deps.guardVersion, runtimeBindingValid: bindingsOk, evidence: deps.evidence };
  const outcome = await runProcessingJob(db, job.jid, deps.ports, ctx);
  if (outcome.jobState !== 'audio_ready' || !outcome.contentItemId || !outcome.audioAssetId) return failed(`VERTICAL_SLICE_${outcome.jobState.toUpperCase()}`);
  const contentId = outcome.contentItemId;
  const assetId = outcome.audioAssetId;
  const afterSuccess = (db.prepare("SELECT successful_count FROM daily_tts_usage WHERE user_id = 'leo'").get() as { successful_count: number } | undefined)?.successful_count ?? 0;

  // --- §14.4(2) IR-F1-D1(a): caption deletion + bounded no-raw-retention, all observable ---
  const cap = db.prepare('SELECT sha256, byte_count, delete_status, deleted_at, expires_at FROM temporary_caption_artifacts WHERE job_id = ?').get(job.jid) as { sha256: string; byte_count: number; delete_status: string; deleted_at: number | null; expires_at: number } | undefined;
  const captionDeleted = !!cap && cap.delete_status === 'deleted' && cap.deleted_at != null && cap.deleted_at <= cap.expires_at;
  const capScan = scanBoundedForRaw(deps.captionTempRoot);
  const stgScan = scanBoundedForRaw(deps.stagingDir);
  const boundedClean = capScan.accessible && stgScan.accessible && capScan.forbidden === 0 && stgScan.forbidden === 0;
  const allowedAuditsMissingHash = (db.prepare("SELECT COUNT(*) c FROM provider_payload_audits WHERE job_id = ? AND outcome = 'allowed' AND (semantic_payload_sha256 IS NULL OR semantic_payload_bytes IS NULL)").get(job.jid) as { c: number }).c;
  const rawRetained = !(captionDeleted && boundedClean && allowedAuditsMissingHash === 0);
  E(`CAPTION_ARTIFACT_SHA256: ${cap?.sha256 ?? '(none)'}`);
  E(`CAPTION_DELETED_WITHIN_DEADLINE: ${captionDeleted}`);
  E(`BOUNDED_PATHS_ACCESSIBLE: ${capScan.accessible && stgScan.accessible}`);
  E(`BOUNDED_RAW_FILE_COUNT: ${capScan.forbidden + stgScan.forbidden}`);
  E(`RAW_MEDIA_OR_TRANSCRIPT_RETAINED: ${rawRetained}`);

  // --- §14.4(3)(4) Builder/Verifier hashes + score/critical ---
  const bAgg = db.prepare("SELECT output_hash FROM provider_attempts WHERE job_id = ? AND substage = 'builder_aggregate' AND status = 'succeeded' ORDER BY logical_attempt DESC LIMIT 1").get(job.jid) as { output_hash: string } | undefined;
  const vAtt = db.prepare("SELECT output_hash, logical_attempt FROM provider_attempts WHERE job_id = ? AND substage = 'verifier' AND status = 'succeeded' ORDER BY logical_attempt DESC LIMIT 1").get(job.jid) as { output_hash: string; logical_attempt: number } | undefined;
  const contentRow = db.prepare('SELECT verifier_score, verifier_output_json, state FROM content_items WHERE id = ?').get(contentId) as { verifier_score: number; verifier_output_json: string; state: string };
  let criticalCount = -1;
  try {
    criticalCount = (JSON.parse(contentRow.verifier_output_json).criticalFailures ?? []).length;
  } catch {
    criticalCount = -1;
  }
  const scorePass = contentRow.verifier_score >= GATE_MIN_SCORE && criticalCount === 0 && !!bAgg && !!vAtt && bAgg.output_hash !== vAtt.output_hash;
  E(`BUILDER_OUTPUT_HASH: ${bAgg?.output_hash ?? '(none)'}`);
  E(`VERIFIER_OUTPUT_HASH: ${vAtt?.output_hash ?? '(none)'}`);
  E(`VERIFIER_ATTEMPTS_USED: ${vAtt?.logical_attempt ?? 0}`);
  E(`VERIFIER_SCORE: ${contentRow.verifier_score}`);
  E(`VERIFIER_CRITICAL_FAILURES: ${criticalCount}`);

  // --- §14.4(5) IR-F1-D1(d): exactly one job-attributable TTS success (measured delta) ---
  const finalizedForJob = (db.prepare("SELECT COUNT(*) c FROM tts_generation_receipts WHERE job_id = ? AND status = 'finalized'").get(job.jid) as { c: number }).c;
  const readyForContent = (db.prepare("SELECT COUNT(*) c FROM audio_assets WHERE content_item_id = ? AND status = 'ready'").get(contentId) as { c: number }).c;
  const dailyDelta = afterSuccess - beforeSuccess;
  const ttsOk = finalizedForJob === 1 && readyForContent === 1 && dailyDelta === 1;
  E(`TTS_FINALIZED_RECEIPTS_FOR_JOB: ${finalizedForJob}`);
  E(`READY_AUDIO_ASSETS_FOR_CONTENT: ${readyForContent}`);
  E(`DAILY_SUCCESS_DELTA: ${dailyDelta}`);

  // --- §14.4(6) IR-F1-D1(e): authorized HTTP Range boundary through the real in-process handler ---
  const assetRow = db.prepare('SELECT byte_count FROM audio_assets WHERE id = ?').get(assetId) as { byte_count: number | null };
  const size = assetRow.byte_count ?? 0;
  const ephemeralToken = randomUUID();
  const app = buildApp({ db, deviceTokenSha256: createHash('sha256').update(ephemeralToken, 'utf8').digest('hex'), audioDir: deps.audioDir, now: () => now });
  let rangeOk = false;
  try {
    const authed = await app.inject({ method: 'GET', url: `/v1/audio-assets/${assetId}/file`, headers: { authorization: `Bearer ${ephemeralToken}`, range: 'bytes=0-0' } });
    const denied = await app.inject({ method: 'GET', url: `/v1/audio-assets/${assetId}/file`, headers: { range: 'bytes=0-0' } });
    rangeOk = authed.statusCode === 206 && authed.headers['content-range'] === `bytes 0-0/${size}` && authed.headers['content-length'] === '1' && authed.headers['cache-control'] === 'private, no-store' && denied.statusCode === 401 && size > 0;
    E(`AUDIO_RANGE_STATUS: ${authed.statusCode}`);
    E(`AUDIO_RANGE_CONTENT_RANGE_MATCH: ${authed.headers['content-range'] === `bytes 0-0/${size}`}`);
    E(`AUDIO_RANGE_CACHE_PRIVATE_NOSTORE: ${authed.headers['cache-control'] === 'private, no-store'}`);
    E(`AUDIO_RANGE_UNAUTHORIZED_DENIED: ${denied.statusCode === 401}`);
  } finally {
    await app.close();
  }
  const session = createOrResumeAutomaticSession(db, { entryPoint: 'today_briefing', deviceRunId: randomUUID() }, now);
  E(`PLAYBACK_SESSION_ID: ${session.id}`);
  E(`PLAYBACK_SESSION_ITEMS: ${session.items.length}`);
  E('DEVICE_PLAYBACK_NOTE: live A/B/C/D device playback is the section 14.5 acceptance step');

  // --- §14.4(7) IR-F1-D1(c): this-run feed-bound discovery/promotion/timestamps ---
  let channelOk = false;
  try {
    const channel = registerChannel(db, { url: `https://www.youtube.com/channel/${deps.channelId}`, autoProcessingEnabled: true }, now);
    const xml = await fetchChannelFeed(deps.channelId, { transport: deps.feedTransport });
    const entries = parseChannelFeed(xml, deps.channelId);
    const discovered = recordDiscoveries(db, channel.id, entries, now);
    const recorded = db.prepare('SELECT youtube_video_id, published_at FROM channel_discoveries WHERE channel_id = ?').all(channel.id) as Array<{ youtube_video_id: string; published_at: number | null }>;
    const entryIds = entries.map((e) => e.videoId).sort();
    const recordedIds = recorded.map((r) => r.youtube_video_id).sort();
    const identityMatch = entries.length > 0 && discovered === entries.length && recorded.length === entries.length && JSON.stringify(entryIds) === JSON.stringify(recordedIds);
    const promoted = promoteDiscoveries(db, channel.id, now);
    const queued = db.prepare("SELECT youtube_video_id FROM channel_discoveries WHERE channel_id = ? AND status = 'queued' ORDER BY published_at ASC, youtube_video_id ASC").all(channel.id) as Array<{ youtube_video_id: string }>;
    const expectedOldest = [...recorded].sort((a, b) => (a.published_at ?? 0) - (b.published_at ?? 0) || a.youtube_video_id.localeCompare(b.youtube_video_id)).slice(0, 3).map((r) => r.youtube_video_id);
    const promoteOrderOk = promoted.length === Math.min(3, entries.length) && queued.length === expectedOldest.length && JSON.stringify(queued.map((q) => q.youtube_video_id)) === JSON.stringify(expectedOldest);
    const chRow = db.prepare('SELECT last_polled_at, next_poll_at FROM channels WHERE id = ?').get(channel.id) as { last_polled_at: number | null; next_poll_at: number | null };
    const timestampsOk = chRow.last_polled_at === now && chRow.next_poll_at === now + HOUR_MS;
    channelOk = identityMatch && promoteOrderOk && timestampsOk;
    E(`CHANNEL_DISCOVERED: ${discovered}`);
    E(`CHANNEL_IDENTITY_MATCH: ${identityMatch}`);
    E(`CHANNEL_PROMOTED: ${promoted.length}`);
    E(`CHANNEL_PROMOTE_ORDER_OK: ${promoteOrderOk}`);
    E(`CHANNEL_NEXT_POLL_HOURLY: ${timestampsOk}`);
  } catch {
    E('CHANNEL_POLL: FAIL');
    return failed('CHANNEL_POLL_FAILED');
  }

  // --- §14.4(10) active scope approval + allowed payload-audit rows (field names/bytes/hashes only) ---
  const activeScopes = (db.prepare("SELECT COUNT(*) c FROM provider_scope_approvals WHERE user_id = 'leo' AND status = 'active'").get() as { c: number }).c;
  const auditRows = db.prepare('SELECT outcome, COUNT(*) c FROM provider_payload_audits WHERE job_id = ? GROUP BY outcome').all(job.jid) as Array<{ outcome: string; c: number }>;
  const allowedAudits = auditRows.filter((r) => r.outcome === 'allowed').reduce((n, r) => n + r.c, 0);
  const nonAllowedAudits = auditRows.filter((r) => r.outcome !== 'allowed').reduce((n, r) => n + r.c, 0);
  E(`ACTIVE_SCOPE_APPROVALS: ${activeScopes}`);
  E(`PAYLOAD_AUDITS_ALLOWED: ${allowedAudits}`);
  E(`PAYLOAD_AUDITS_NON_ALLOWED: ${nonAllowedAudits}`);
  const scopeActive = activeScopes >= 1;
  const auditsClean = nonAllowedAudits === 0 && allowedAudits >= 3;

  // --- Local preflight gate: every observable control must pass before the five labels (§14.4(12)) ---
  const localControlsPass = contentRow.state === 'audio_ready' && scorePass && ttsOk && !rawRetained && rangeOk && channelOk && scopeActive && auditsClean && accessOk && dsPolicyOk && fishPolicyOk && bindingsOk;
  E(`LOCAL_PREFLIGHT: vertical=${scorePass && ttsOk} raw=${!rawRetained} range=${rangeOk} channel=${channelOk} scope=${scopeActive} audits=${auditsClean} policy=${dsPolicyOk && fishPolicyOk} binding=${bindingsOk}`);
  if (!localControlsPass) return failed('LOCAL_CONTROLS_NOT_VERIFIED'); // never emits LOCAL_DATA_CONTROLS: VERIFIED

  E(formatAssurance());
  E('LIVE_PRIVATE_ACCEPTANCE: PASS');
  return { status: 'PASS', code: 'OK', exitCode: 0, labelsEmitted: true };
}

const execFileAsync = promisify(execFile);

/** CLI access observer: read-only status commands + bounded facts, redacted. No config mutation. When
 *  the tooling/tailnet is not ready every field observes 'failed' and the runner blocks. */
async function cliAccessObserver(config: ServerConfig): Promise<AccessEvidenceSet> {
  const at = Date.now();
  const loopbackOk = config.bindHost === '127.0.0.1' || config.bindHost === '::1';
  const loopbackBind: AccessEvidence = { status: loopbackOk ? 'ok' : 'failed', observedAt: at, source: 'config.bindHost', digest: sha8(config.bindHost) };
  let statusJson: unknown = null;
  try {
    const { stdout } = await execFileAsync('tailscale', ['status', '--json'], { timeout: 5000, maxBuffer: 1 << 20, windowsHide: true });
    statusJson = JSON.parse(typeof stdout === 'string' ? stdout : Buffer.from(stdout).toString('utf8'));
  } catch {
    statusJson = null;
  }
  const digest = statusJson ? sha8(JSON.stringify(statusJson).length.toString()) : sha8('unavailable');
  const st = (ok: boolean): AccessEvidence => ({ status: statusJson ? (ok ? 'ok' : 'failed') : 'failed', observedAt: at, source: 'tailscale.status', digest });
  const j = (statusJson ?? {}) as { BackendState?: string; Self?: { Online?: boolean }; CurrentTailnet?: unknown };
  const up = j.BackendState === 'Running' && !!j.Self?.Online;
  // Serve HTTPS + device grant require the tailnet up and the authorized self online; Funnel must be
  // off and, with Funnel off, the public/non-tailnet path is denied.
  const funnelOff = !!statusJson; // conservative: only a successful read-only status attests Funnel state
  return {
    loopbackBind,
    tailnetServeHttps: st(up),
    authorizedDeviceGrant: st(up),
    funnelDisabled: st(funnelOff),
    publicDenied: { status: statusJson && funnelOff ? 'denied' : 'failed', observedAt: at, source: 'tailscale.funnel', digest },
  };
}

async function main(): Promise<void> {
  const videoId = arg('--video-id');
  const channelId = arg('--channel-id');
  const out = (line: string) => process.stdout.write(`${line}\n`);
  if (!videoId || !channelId) {
    out('LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_INPUT_REQUIRED');
    process.exit(2);
  }
  let config: ServerConfig;
  try {
    config = loadConfig(process.env); // reads process.env only; never opens .env.server.local
  } catch {
    out('LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_CONFIG_REQUIRED');
    process.exit(2);
  }
  const db = openDatabase(join(config.stateDir, 'db', 'vibenews.sqlite3'));
  const ev = loadPipelineEvidence(db);
  if (!ev) {
    out('LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_ACCESS_REQUIRED');
    process.exit(2);
  }
  const env = process.env;
  const req = (k: string): string => {
    const v = env[k];
    if (!v) throw new ConfigError('RUNTIME_CONFIG_REQUIRED');
    return v;
  };
  let ports: PipelinePorts;
  let selectors: RuntimeSelectors;
  try {
    ports = buildPipelinePorts({
      ytdlpBinary: config.ytdlpBinary,
      captionTempRoot: join(config.stateDir, 'caption-temp'),
      stagingDir: join(config.stateDir, 'staging'),
      deepseek: { apiKey: req('DEEPSEEK_API_KEY'), baseUrl: req('DEEPSEEK_BASE_URL'), builderModel: req('DEEPSEEK_BUILDER_MODEL'), verifierModel: req('DEEPSEEK_VERIFIER_MODEL'), verifierReasoningEffort: req('DEEPSEEK_VERIFIER_REASONING_EFFORT') },
      fish: { apiKey: req('FISH_API_KEY'), model: req('FISH_TTS_MODEL') },
    });
    selectors = {
      deepseekEndpointOrigin: new URL(req('DEEPSEEK_BASE_URL')).origin,
      builderModel: req('DEEPSEEK_BUILDER_MODEL'),
      verifierModel: req('DEEPSEEK_VERIFIER_MODEL'),
      verifierReasoning: req('DEEPSEEK_VERIFIER_REASONING_EFFORT'),
      fishEndpointOrigin: 'https://api.fish.audio',
      fishModel: req('FISH_TTS_MODEL'),
      fishReference: req('FISH_REFERENCE_ID'),
    };
  } catch {
    out('LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_CONFIG_REQUIRED');
    process.exit(2);
  }
  const result = await runPrivateAcceptance({
    config,
    db,
    ports,
    evidence: ev.evidence,
    access: () => cliAccessObserver(config),
    accessMaxAgeMs: DEFAULT_ACCESS_MAX_AGE_MS,
    feedTransport: (url, init) => fetch(url, { method: 'GET', signal: init.signal, redirect: init.redirect }).then((res) => ({ status: res.status, headers: res.headers, body: res.body as AsyncIterable<Uint8Array> | null })),
    audioDir: join(config.stateDir, 'audio'),
    stagingDir: join(config.stateDir, 'staging'),
    captionTempRoot: join(config.stateDir, 'caption-temp'),
    referenceId: req('FISH_REFERENCE_ID'),
    guardVersion: 'd009a.guard.v1',
    auditKey: Buffer.from(config.deviceTokenSha256, 'hex'),
    selectors,
    now: Date.now(),
    videoId,
    channelId,
    emit: out,
  });
  process.exit(result.exitCode);
}

const HERE = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) || process.argv[1].startsWith(join(HERE, 'accept-private')))) {
  void main();
}
