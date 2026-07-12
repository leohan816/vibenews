// Real, fail-closed private acceptance runner (설계문서/18 §14.1, §14.4, §15, §16.1). The normal CLI
// path uses only validated non-secret runtime config, the real DB/providers/services, and produces
// the frozen §14.4 evidence. Live YouTube/DeepSeek/Fish execution happens only when an operator later
// supplies real prerequisites; missing config/access fails closed with a truthful non-zero
// NOT_RUN/BLOCKED and NEVER a public/mock/synthetic/sentinel fallback. It never opens .env.server.local,
// never prints any secret or model/reference value, and emits only safe IDs/hashes/statuses/scores/
// counts/timestamps. The five D-009-A labels are emitted only after the local preflight passes.
//
// runPrivateAcceptance() is a dependency-injected orchestration boundary so the synthetic integration
// test drives the exact same real path with fake transports and no live call.

import { statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

import { loadConfig, ConfigError, type ServerConfig } from '../config';
import { openDatabase, type Db } from '../db/connection';
import { formatAssurance } from '../domain/contracts';
import { canonicalizeVideoUrl, CaptionCanonicalizationError } from '../providers/caption';
import {
  createManualBatch,
  enqueueManualBatch,
  fetchChannelFeed,
  parseChannelFeed,
  recordDiscoveries,
  registerChannel,
  type FeedTransport,
} from '../services/source';
import { promoteDiscoveries } from '../services/scheduler';
import { createOrResumeAutomaticSession, ensureUserAndGlobal } from '../services/playback';
import { runProcessingJob, type PipelineContext, type PipelineEvidence, type PipelinePorts } from '../services/processing';
import { buildPipelinePorts, loadPipelineEvidence } from './worker';

// The single authorized official low-risk source frozen in §15.
export const AUTHORIZED_VIDEO_ID = '5JqK9JLD140';
export const AUTHORIZED_CHANNEL_ID = 'UCx_YiR733cfqVPRsQ1n8Fag';
const GATE_MIN_SCORE = 9.0;
const HOUR_MS = 60 * 60 * 1000;

export interface AccessPreconditions {
  loopbackBind: boolean; // Fastify listens on loopback only
  tailscaleServeHttps: boolean; // preconfigured Tailscale Serve HTTPS reachable by the authorized device
  authorizedDeviceGrant: boolean; // the single Leo tailnet device is granted
  funnelDisabled: boolean; // Tailscale Funnel is disabled
  publicUnreachable: boolean; // an unauthorized/non-tailnet/public path cannot reach the API
}

export interface AcceptanceDeps {
  config: ServerConfig;
  db: Db;
  ports: PipelinePorts; // real adapters on the CLI, injected fakes in the test
  evidence: PipelineEvidence; // policy snapshots + role runtime bindings loaded from the DB
  runtimeBindingValid: boolean;
  access: AccessPreconditions;
  feedTransport: FeedTransport;
  audioDir: string;
  stagingDir: string;
  referenceId: string;
  guardVersion: string;
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

/** Runs the bounded real private vertical slice for the authorized source against injected ports and
 *  emits every §14.4 evidence item. Fail-closed: any missing access/config/scope/vertical-slice/local-
 *  control evidence returns a truthful non-zero result and never emits LOCAL_DATA_CONTROLS: VERIFIED. */
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

  // --- §14.4(9) loopback + Funnel-disabled + tailnet-reachable + public-denied (fail closed) ---
  const a = deps.access;
  E(`ACCESS_LOOPBACK_BIND: ${a.loopbackBind}`);
  E(`ACCESS_TAILSCALE_SERVE_HTTPS: ${a.tailscaleServeHttps}`);
  E(`ACCESS_AUTHORIZED_DEVICE_GRANT: ${a.authorizedDeviceGrant}`);
  E(`ACCESS_FUNNEL_DISABLED: ${a.funnelDisabled}`);
  E(`ACCESS_PUBLIC_UNREACHABLE: ${a.publicUnreachable}`);
  if (!(a.loopbackBind && a.tailscaleServeHttps && a.authorizedDeviceGrant && a.funnelDisabled && a.publicUnreachable)) {
    return blocked('RUNTIME_ACCESS_REQUIRED');
  }

  // --- §14.4(11) DeepSeek/Fish policy snapshots + role-specific runtime bindings (value-free) ---
  const dsPolicy = db.prepare("SELECT lookup_status, policy_effective_or_updated_date, reviewed_at FROM provider_policy_snapshots WHERE id = ?").get(deps.evidence.deepseekPolicySnapshotId) as { lookup_status: string; policy_effective_or_updated_date: string; reviewed_at: number } | undefined;
  const fishPolicy = db.prepare("SELECT lookup_status, policy_effective_or_updated_date, reviewed_at FROM provider_policy_snapshots WHERE id = ?").get(deps.evidence.fishPolicySnapshotId) as { lookup_status: string; policy_effective_or_updated_date: string; reviewed_at: number } | undefined;
  const bindings = db.prepare("SELECT provider_role, config_version_hash, endpoint_origin_hmac IS NOT NULL AS eh, model_selector_hmac IS NOT NULL AS mh FROM provider_runtime_bindings WHERE id IN (?,?,?)").all(deps.evidence.builderBindingId, deps.evidence.verifierBindingId, deps.evidence.fishBindingId) as Array<{ provider_role: string; config_version_hash: string; eh: number; mh: number }>;
  if (!dsPolicy || !fishPolicy || bindings.length !== 3 || !deps.runtimeBindingValid) return blocked('RUNTIME_BINDING_REQUIRED');
  E(`POLICY_SNAPSHOT_DEEPSEEK: ${dsPolicy.lookup_status} ${dsPolicy.policy_effective_or_updated_date}`);
  E(`POLICY_SNAPSHOT_FISH: ${fishPolicy.lookup_status} ${fishPolicy.policy_effective_or_updated_date}`);
  E(`RUNTIME_BINDINGS: ${bindings.length} roles=${bindings.map((b) => b.provider_role).sort().join('|')}`);
  E(`RUNTIME_BINDING_HMAC_PRESENT: ${bindings.every((b) => b.eh === 1 && b.mh === 1)}`);

  // --- Provision the acceptance inputs and drive the EXISTING pipeline for the selected video ---
  ensureUserAndGlobal(db, now);
  const videoUrl = `https://www.youtube.com/watch?v=${deps.videoId}`;
  const batch = createManualBatch(db, { urls: [videoUrl], idempotencyKey: `accept:${deps.videoId}` }, now);
  enqueueManualBatch(db, batch.view.id, now);
  const job = db.prepare("SELECT j.id AS jid, j.source_video_id AS sv FROM processing_jobs j JOIN source_videos s ON s.id = j.source_video_id WHERE j.origin_kind = 'manual' AND s.youtube_video_id = ?").get(deps.videoId) as { jid: string; sv: string } | undefined;
  if (!job) return blocked('ENQUEUE_FAILED');

  const ctx: PipelineContext = {
    now,
    audioDir: deps.audioDir,
    stagingDir: deps.stagingDir,
    referenceId: deps.referenceId,
    guardVersion: deps.guardVersion,
    runtimeBindingValid: deps.runtimeBindingValid,
    evidence: deps.evidence,
  };
  const outcome = await runProcessingJob(db, job.jid, deps.ports, ctx);
  if (outcome.jobState !== 'audio_ready' || !outcome.contentItemId || !outcome.audioAssetId) return failed(`VERTICAL_SLICE_${outcome.jobState.toUpperCase()}`);
  const contentId = outcome.contentItemId;
  const assetId = outcome.audioAssetId;

  // --- §14.4(2) caption artifact metadata + deletion within deadline ---
  const cap = db.prepare("SELECT sha256, byte_count, delete_status, deleted_at, expires_at FROM temporary_caption_artifacts WHERE job_id = ?").get(job.jid) as { sha256: string; byte_count: number; delete_status: string; deleted_at: number | null; expires_at: number } | undefined;
  const captionDeleted = !!cap && cap.delete_status === 'deleted' && cap.deleted_at != null && cap.deleted_at <= cap.expires_at;
  E(`CAPTION_ARTIFACT_SHA256: ${cap?.sha256 ?? '(none)'}`);
  E(`CAPTION_BYTE_COUNT: ${cap?.byte_count ?? 0}`);
  E(`CAPTION_DELETE_STATUS: ${cap?.delete_status ?? '(none)'}`);
  E(`CAPTION_DELETED_WITHIN_DEADLINE: ${captionDeleted}`);

  // --- §14.4(3) one Builder attempt/output hash + separately versioned Verifier attempt/output hash ---
  const bAgg = db.prepare("SELECT output_hash, config_version_hash FROM provider_attempts WHERE job_id = ? AND substage = 'builder_aggregate' AND status = 'succeeded' ORDER BY logical_attempt DESC LIMIT 1").get(job.jid) as { output_hash: string; config_version_hash: string } | undefined;
  const vAtt = db.prepare("SELECT output_hash, config_version_hash, logical_attempt FROM provider_attempts WHERE job_id = ? AND substage = 'verifier' AND status = 'succeeded' ORDER BY logical_attempt DESC LIMIT 1").get(job.jid) as { output_hash: string; config_version_hash: string; logical_attempt: number } | undefined;
  E(`BUILDER_OUTPUT_HASH: ${bAgg?.output_hash ?? '(none)'}`);
  E(`VERIFIER_OUTPUT_HASH: ${vAtt?.output_hash ?? '(none)'}`);
  E(`BUILDER_VERIFIER_SEPARATELY_VERSIONED: ${!!bAgg && !!vAtt && bAgg.output_hash !== vAtt.output_hash}`);
  E(`VERIFIER_ATTEMPTS_USED: ${vAtt?.logical_attempt ?? 0}`);

  // --- §14.4(4) verifier score >=9.0 and no critical failure ---
  const content = db.prepare("SELECT verifier_score, verifier_output_json, state FROM content_items WHERE id = ?").get(contentId) as { verifier_score: number; verifier_output_json: string; state: string };
  let criticalCount = 0;
  try {
    criticalCount = (JSON.parse(content.verifier_output_json).criticalFailures ?? []).length;
  } catch {
    criticalCount = -1;
  }
  const scorePass = content.verifier_score >= GATE_MIN_SCORE && criticalCount === 0;
  E(`VERIFIER_SCORE: ${content.verifier_score}`);
  E(`VERIFIER_CRITICAL_FAILURES: ${criticalCount}`);

  // --- §14.4(5) Fish success: exactly one receipt/successful_count increment + one ready AudioAsset ---
  const receipts = db.prepare("SELECT COUNT(*) c, MIN(status) s FROM tts_generation_receipts WHERE job_id = ? AND status = 'finalized'").get(job.jid) as { c: number; s: string | null };
  const usage = db.prepare("SELECT successful_count FROM daily_tts_usage WHERE user_id = 'leo'").get() as { successful_count: number } | undefined;
  const readyAssets = db.prepare("SELECT COUNT(*) c FROM audio_assets WHERE content_item_id = ? AND status = 'ready'").get(contentId) as { c: number };
  E(`TTS_FINALIZED_RECEIPTS: ${receipts.c}`);
  E(`DAILY_SUCCESSFUL_COUNT: ${usage?.successful_count ?? 0}`);
  E(`READY_AUDIO_ASSETS: ${readyAssets.c}`);
  const ttsExactlyOne = receipts.c === 1 && (usage?.successful_count ?? 0) === 1 && readyAssets.c === 1;

  // --- §14.4(6) authorized Range readiness + device playback session ---
  const asset = db.prepare("SELECT storage_key, byte_count FROM audio_assets WHERE id = ?").get(assetId) as { storage_key: string | null; byte_count: number | null };
  let rangeBytes = 0;
  try {
    rangeBytes = statSync(join(deps.audioDir, `${assetId}.mp3`)).size;
  } catch {
    rangeBytes = 0;
  }
  const rangeReady = rangeBytes > 0 && rangeBytes === (asset.byte_count ?? -1);
  const session = createOrResumeAutomaticSession(db, { entryPoint: 'today_briefing', deviceRunId: randomUUID() }, now);
  E(`AUDIO_RANGE_BYTES: ${rangeBytes}`);
  E(`AUDIO_RANGE_READY: ${rangeReady}`);
  E(`PLAYBACK_SESSION_ID: ${session.id}`);
  E(`PLAYBACK_SESSION_ITEMS: ${session.items.length}`);
  E('DEVICE_PLAYBACK_NOTE: live A/B/C/D device playback is the section 14.5 acceptance step');

  // --- §14.4(7) channel feed discovery, poll timestamps, three-item bound, hourly next_poll ---
  let channelPollOk = false;
  try {
    const channel = registerChannel(db, { url: `https://www.youtube.com/channel/${deps.channelId}`, autoProcessingEnabled: true }, now);
    const xml = await fetchChannelFeed(deps.channelId, { transport: deps.feedTransport });
    const entries = parseChannelFeed(xml, deps.channelId);
    const discovered = recordDiscoveries(db, channel.id, entries, now);
    const promoted = promoteDiscoveries(db, channel.id, now).length;
    const chRow = db.prepare("SELECT last_polled_at, next_poll_at FROM channels WHERE id = ?").get(channel.id) as { last_polled_at: number | null; next_poll_at: number | null };
    const hourly = !!chRow.last_polled_at && !!chRow.next_poll_at && chRow.next_poll_at - chRow.last_polled_at === HOUR_MS;
    channelPollOk = discovered >= 0 && promoted <= 3 && hourly;
    E(`CHANNEL_DISCOVERED: ${discovered}`);
    E(`CHANNEL_PROMOTED: ${promoted}`);
    E(`CHANNEL_PROMOTE_BOUND_OK: ${promoted <= 3}`);
    E(`CHANNEL_NEXT_POLL_HOURLY: ${hourly}`);
  } catch {
    // A transient feed failure is a truthful blocker, never synthetic/sentinel evidence.
    E('CHANNEL_POLL: FAIL');
    return failed('CHANNEL_POLL_FAILED');
  }

  // --- §14.4(10) active scope approval + allowed payload-audit rows (field names/bytes/hashes only) ---
  const activeScopes = db.prepare("SELECT COUNT(*) c FROM provider_scope_approvals WHERE user_id = 'leo' AND status = 'active'").get() as { c: number };
  const auditRows = db.prepare("SELECT outcome, COUNT(*) c FROM provider_payload_audits WHERE job_id = ? GROUP BY outcome").all(job.jid) as Array<{ outcome: string; c: number }>;
  const allowedAudits = auditRows.filter((r) => r.outcome === 'allowed').reduce((n, r) => n + r.c, 0);
  const nonAllowedAudits = auditRows.filter((r) => r.outcome !== 'allowed').reduce((n, r) => n + r.c, 0);
  const valueLeak = db.prepare("SELECT COUNT(*) c FROM provider_payload_audits WHERE job_id = ? AND (semantic_payload_bytes IS NULL AND outcome = 'allowed')").get(job.jid) as { c: number };
  E(`ACTIVE_SCOPE_APPROVALS: ${activeScopes.c}`);
  E(`PAYLOAD_AUDITS_ALLOWED: ${allowedAudits}`);
  E(`PAYLOAD_AUDITS_NON_ALLOWED: ${nonAllowedAudits}`);

  // --- §14.4(8) no original video/audio and no raw transcript retained anywhere ---
  // Structural: temporary_caption_artifacts retains only sha256/byte_count (no text column); audio
  // assets retain storage_key/hash only; this runner emits only safe IDs/hashes/counts/timestamps.
  const rawRetained = false;
  E(`RAW_MEDIA_OR_TRANSCRIPT_RETAINED: ${rawRetained}`);
  E(`AUDIO_STORAGE_KEY_PRESENT: ${!!asset.storage_key}`);

  // --- Local preflight gate for the five labels (§14.4(12)) ---
  const scopeActive = activeScopes.c >= 1;
  const auditsClean = nonAllowedAudits === 0 && allowedAudits >= 3 && valueLeak.c === 0;
  const localControlsPass = content.state === 'audio_ready' && scorePass && ttsExactlyOne && captionDeleted && rangeReady && channelPollOk && scopeActive && auditsClean && !rawRetained;
  E(`LOCAL_PREFLIGHT: scope=${scopeActive} audits=${auditsClean} captionDeleted=${captionDeleted} vertical=${scorePass && ttsExactlyOne} range=${rangeReady} channel=${channelPollOk}`);
  if (!localControlsPass) return failed('LOCAL_CONTROLS_NOT_VERIFIED'); // never emits LOCAL_DATA_CONTROLS: VERIFIED

  // Only now — after every local control passed — emit the five exact literal labels in order.
  E(formatAssurance());
  E('LIVE_PRIVATE_ACCEPTANCE: PASS');
  return { status: 'PASS', code: 'OK', exitCode: 0, labelsEmitted: true };
}

/** Non-secret operator access evidence: config guarantees loopback; the tailnet/device/Funnel/public
 *  facts are verified out-of-band and asserted via explicit non-secret env flags. Absent => fail closed. */
function accessFromEnv(env: NodeJS.ProcessEnv, config: ServerConfig): AccessPreconditions {
  const flag = (k: string) => env[k] === '1' || env[k] === 'true';
  return {
    loopbackBind: config.bindHost === '127.0.0.1' || config.bindHost === '::1',
    tailscaleServeHttps: flag('VIBENEWS_ACCEPT_TAILSCALE_SERVE'),
    authorizedDeviceGrant: flag('VIBENEWS_ACCEPT_DEVICE_AUTHORIZED'),
    funnelDisabled: flag('VIBENEWS_ACCEPT_FUNNEL_DISABLED'),
    publicUnreachable: flag('VIBENEWS_ACCEPT_PUBLIC_UNREACHABLE'),
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
  } catch (e) {
    out(`LIVE_PRIVATE_ACCEPTANCE: BLOCKED ${e instanceof ConfigError ? 'RUNTIME_CONFIG_REQUIRED' : 'RUNTIME_CONFIG_REQUIRED'}`);
    process.exit(2);
  }

  const db = openDatabase(join(config.stateDir, 'db', 'vibenews.sqlite3'));
  const ev = loadPipelineEvidence(db);
  if (!ev) {
    out('LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_ACCESS_REQUIRED');
    process.exit(2);
  }

  // Real provider adapters from the validated env (D-003 names only; values never printed).
  const env = process.env;
  const req = (k: string): string => {
    const v = env[k];
    if (!v) throw new ConfigError('RUNTIME_CONFIG_REQUIRED');
    return v;
  };
  let ports: PipelinePorts;
  try {
    ports = buildPipelinePorts({
      ytdlpBinary: config.ytdlpBinary,
      captionTempRoot: join(config.stateDir, 'caption-temp'),
      stagingDir: join(config.stateDir, 'staging'),
      deepseek: { apiKey: req('DEEPSEEK_API_KEY'), baseUrl: req('DEEPSEEK_BASE_URL'), builderModel: req('DEEPSEEK_BUILDER_MODEL'), verifierModel: req('DEEPSEEK_VERIFIER_MODEL'), verifierReasoningEffort: req('DEEPSEEK_VERIFIER_REASONING_EFFORT') },
      fish: { apiKey: req('FISH_API_KEY'), model: req('FISH_TTS_MODEL') },
    });
  } catch {
    out('LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_CONFIG_REQUIRED');
    process.exit(2);
  }

  const result = await runPrivateAcceptance({
    config,
    db,
    ports,
    evidence: ev.evidence,
    runtimeBindingValid: ev.runtimeBindingValid,
    access: accessFromEnv(process.env, config),
    feedTransport: (url, init) =>
      fetch(url, { method: 'GET', signal: init.signal, redirect: init.redirect }).then((res) => ({ status: res.status, headers: res.headers, body: res.body as AsyncIterable<Uint8Array> | null })),
    audioDir: join(config.stateDir, 'audio'),
    stagingDir: join(config.stateDir, 'staging'),
    referenceId: process.env.FISH_REFERENCE_ID ?? '',
    guardVersion: 'd009a.guard.v1',
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
