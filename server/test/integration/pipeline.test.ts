import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { closeSync, fsyncSync, mkdirSync, mkdtempSync, openSync, readFileSync, writeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import type { BuilderOutput, EvidenceRef, TtsArtifact, VerifierOutput } from '../../src/domain/contracts';
import { openDatabase, type Db } from '../../src/db/connection';
import { runMigrations } from '../../src/db/migrate';
import { parseChannelFeed, recordDiscoveries } from '../../src/services/source';
import {
  runProcessingJob,
  type BuilderPort,
  type CaptionPort,
  type PipelineContext,
  type PipelinePorts,
  type TtsPort,
  type VerifierPort,
} from '../../src/services/processing';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const T = 1_731_000_000_000;

function migrated(): { db: Db; audioDir: string; stagingDir: string } {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  db.prepare("INSERT INTO users (id, timezone, created_at, updated_at) VALUES ('leo','Asia/Seoul',?,?)").run(T, T);
  const root = mkdtempSync(join(tmpdir(), 'vn-pipe-'));
  return { db, audioDir: join(root, 'audio'), stagingDir: join(root, 'staging') };
}

function seedEvidence(db: Db): PipelineContext['evidence'] {
  const dsPolicy = randomUUID();
  const fishPolicy = randomUUID();
  const ins = db.prepare(
    "INSERT INTO provider_policy_snapshots (id, provider, official_policy_urls, official_api_url, public_api_surface_id, policy_effective_or_updated_date, reviewed_at, document_set_sha256, lookup_status, public_statement_codes, verified_local_control_codes, controls_not_independently_verified, provider_policy_assurance, local_data_controls, provider_side_deletion, provider_side_no_training, production_privacy_approval, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
  );
  ins.run(dsPolicy, 'deepseek', '[]', 'u', 'deepseek.post.chat-completions', '2026-02-10', T, 'a'.repeat(64), 'retrieved', '[]', '[]', '[]', 'LIMITED_AND_UNVERIFIED', 'VERIFIED', 'NOT_VERIFIED', 'NOT_VERIFIED', 'NOT_GRANTED', T);
  ins.run(fishPolicy, 'fish_audio', '[]', 'u', 'fish.post.v1.tts', '2024-08-28', T, 'b'.repeat(64), 'retrieved', '[]', '[]', '[]', 'LIMITED_AND_UNVERIFIED', 'VERIFIED', 'NOT_VERIFIED', 'NOT_VERIFIED', 'NOT_GRANTED', T);
  const bindIns = db.prepare(
    'INSERT INTO provider_runtime_bindings (id, provider_role, public_api_surface_id, audit_key_id, endpoint_origin_hmac, model_selector_hmac, reasoning_selector_hmac, reference_selector_hmac, config_version_hash, credential_present, verified_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
  );
  const builderBinding = randomUUID();
  const verifierBinding = randomUUID();
  const fishBinding = randomUUID();
  bindIns.run(builderBinding, 'deepseek_builder', 'deepseek.post.chat-completions', 'provider-audit-hmac-v1', 'h', 'h', null, null, 'cv1', 1, T);
  bindIns.run(verifierBinding, 'deepseek_verifier', 'deepseek.post.chat-completions', 'provider-audit-hmac-v1', 'h', 'h', 'h', null, 'cv2', 1, T);
  bindIns.run(fishBinding, 'fish_tts', 'fish.post.v1.tts', 'provider-audit-hmac-v1', 'h', 'h', null, 'h', 'cv3', 1, T);
  return { deepseekPolicySnapshotId: dsPolicy, fishPolicySnapshotId: fishPolicy, builderBindingId: builderBinding, verifierBindingId: verifierBinding, fishBindingId: fishBinding };
}

function seedJob(db: Db): { jobId: string; sourceVideoId: string } {
  const sv = randomUUID();
  db.prepare("INSERT INTO source_videos (id, youtube_video_id, channel_id, canonical_url, public_title, duration_sec, caption_kinds, caption_languages, provenance_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(sv, 'vid00000001', 'UCx', 'https://www.youtube.com/watch?v=vid00000001', 'Observe', 400, '["manual"]', '["en"]', '{}', T, T);
  db.prepare("INSERT INTO manual_batches (id, user_id, status, source_scope, scope_attestation_version, idempotency_key, approved_at, created_at, updated_at) VALUES ('mb','leo','accepted','public_low_risk_youtube_technology','d009a.public-youtube-tech.v1',?,?,?,?)").run(randomUUID(), T, T, T);
  db.prepare("INSERT INTO manual_batch_items (id, batch_id, ordinal, input_sha256, status, created_at, updated_at) VALUES ('mbi','mb',1,'h','queued',?,?)").run(T, T);
  db.prepare("INSERT INTO provider_scope_approvals (id, user_id, origin_kind, manual_batch_id, channel_id, source_scope, scope_attestation_version, status, approval_version, approved_at, created_at, updated_at) VALUES ('sa','leo','manual','mb',NULL,'public_low_risk_youtube_technology','d009a.public-youtube-tech.v1','active',1,?,?,?)").run(T, T, T);
  const jobId = randomUUID();
  db.prepare("INSERT INTO processing_jobs (id, user_id, source_video_id, scope_approval_id, origin_kind, manual_batch_item_id, channel_discovery_id, approval_version, state, stage, eligible_at, verifier_attempts, idempotency_key, created_at, updated_at) VALUES (?,'leo',?,'sa','manual','mbi',NULL,1,'queued','caption',?,0,?,?,?)").run(jobId, sv, T, randomUUID(), T, T);
  return { jobId, sourceVideoId: sv };
}

// Long enough that a full reproduction exceeds the 160-char / 30-token threshold.
const CAPTION_TEXT =
  'This video introduces a performance monitoring tool for React Native applications and explains how it measures render times interaction latency startup cost memory usage and frame drops across both the new architecture and the legacy bridge in production builds with dashboards and alerts.';

function captionFake(destroyed: string[]): CaptionPort {
  return {
    async acquire() {
      return {
        artifactId: randomUUID(),
        relativeTempKey: 'job/cap.vtt',
        cues: [
          { index: 0, startMs: 0, endMs: 2000, text: '성능 관측 도구 소개' },
          { index: 1, startMs: 2000, endMs: 4000, text: '렌더링 시간 측정' },
        ],
        captionText: CAPTION_TEXT,
        provenance: { channelId: 'UCx', publicTitle: 'Observe', publishedAt: null, durationSec: 400, captionLanguages: ['en'], captionKinds: ['manual'], sha256: 'x', byteCount: 100 },
      };
    },
    async destroy(id: string) {
      destroyed.push(id);
    },
  };
}

function builderOutputFrom(index: EvidenceRef[], scriptText = '오늘의 브리핑입니다. 성능 관측 도구를 짧게 요약합니다.'): BuilderOutput {
  const ref = index[0]?.ref ?? 'cap:000000-000000';
  return {
    schemaVersion: 'builder-output.v1',
    title: 'Observe intro',
    oneLineSummary: '성능 관측 도구 요약',
    contentKind: 'analysis',
    category: 'developer',
    subcategory: { slug: 'dev_tools', displayName: 'Dev Tools' },
    topicClusters: ['Performance'],
    tags: ['observe', 'react-native', 'performance'],
    entities: [{ name: 'Expo', kind: 'company' }],
    claims: [{ claim: '성능을 측정한다.', evidenceRefs: [ref] }],
    numbers: [{ value: '2', context: '두 지표', evidenceRefs: [ref] }],
    audioScript: { language: 'ko', mode: 'standard', segments: [{ order: 0, text: scriptText, evidenceRefs: [ref] }] },
  };
}

const CHUNK_OUT = { schemaVersion: 'builder-chunk-output.v1' as const, chunkId: 'chunk-000000', sectionSummary: '성능 관측 도구 소개', claims: [], numbers: [], entities: [] };
function builderFake(scriptText?: string): BuilderPort {
  return {
    async buildChunk() {
      return CHUNK_OUT;
    },
    async buildAggregate() {
      return builderOutputFrom([{ ref: 'cap:000000-000001', startMs: 0, endMs: 2000 }], scriptText);
    },
  };
}

function verifier(verdicts: VerifierOutput['verdict'][]): VerifierProviderStub {
  let i = 0;
  return {
    async verify() {
      const verdict = verdicts[Math.min(i, verdicts.length - 1)] ?? 'PASS';
      i += 1;
      return {
        schemaVersion: 'verifier-output.v1',
        verdict,
        overallScore: verdict === 'PASS' ? 9.2 : 8.0,
        dimensionScores: { fidelity: 9, coverage: 9, clarity: 9, audioFitness: 9, provenance: 9 },
        criticalFailures: [],
        findings: verdict === 'REVISE' ? [{ code: 'C1', severity: 'minor', evidenceRefs: [], instruction: 'tighten' }] : [],
      };
    },
  };
}
type VerifierProviderStub = VerifierPort;

function ttsFake(): TtsPort {
  return {
    async synthesize(_input, ctx) {
      const bytes = Buffer.from(`synthetic-audio-${ctx.jobId}`);
      const dir = join(tmpdir(), 'vn-tts-staging');
      mkdirSync(dir, { recursive: true });
      const tempKey = join(dir, `${ctx.jobId}.mp3`);
      const fd = openSync(tempKey, 'w');
      writeSync(fd, bytes);
      fsyncSync(fd);
      closeSync(fd);
      const artifact: TtsArtifact = { mimeType: 'audio/mpeg', tempKey, byteCount: bytes.byteLength, durationMs: 134000, sha256: createHash('sha256').update(bytes).digest('hex') };
      return artifact;
    },
  };
}

function ctxFor(db: Db, audioDir: string, stagingDir: string): PipelineContext {
  return { now: T, audioDir, stagingDir, referenceId: 'ref-1', guardVersion: 'guard.v1', runtimeBindingValid: true, evidence: seedEvidence(db) };
}

test('happy path: caption -> builder -> verifier PASS -> Fish -> real audio persisted, success counted', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  const destroyed: string[] = [];
  const ports: PipelinePorts = { caption: captionFake(destroyed), builder: builderFake(), verifier: verifier(['PASS']), tts: ttsFake() };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'audio_ready');
  assert.ok(out.contentItemId && out.audioAssetId);

  const asset = db.prepare('SELECT status, byte_count, sha256 FROM audio_assets WHERE id = ?').get(out.audioAssetId) as { status: string; byte_count: number; sha256: string };
  assert.equal(asset.status, 'ready');
  // the persisted file exists with the exact bytes/sha
  const persisted = readFileSync(join(audioDir, `${out.audioAssetId}.mp3`));
  assert.equal(persisted.byteLength, asset.byte_count);
  assert.equal(createHash('sha256').update(persisted).digest('hex'), asset.sha256);

  const usage = db.prepare("SELECT reserved_count, successful_count FROM daily_tts_usage WHERE user_id='leo'").get() as { reserved_count: number; successful_count: number };
  assert.equal(usage.successful_count, 1);
  assert.equal(usage.reserved_count, 0);
  assert.equal(destroyed.length, 1, 'caption temp cleaned up');
  const temp = db.prepare("SELECT delete_status FROM temporary_caption_artifacts WHERE job_id = ?").get(jobId) as { delete_status: string };
  assert.equal(temp.delete_status, 'deleted');
  const attempts = db.prepare('SELECT substage FROM provider_attempts WHERE job_id = ? ORDER BY started_at').all(jobId) as Array<{ substage: string }>;
  const substages = attempts.map((a) => a.substage);
  assert.ok(substages.includes('caption') && substages.includes('builder_aggregate') && substages.includes('verifier') && substages.includes('tts'));
  const audits = db.prepare("SELECT outcome FROM provider_payload_audits WHERE job_id = ?").all(jobId) as Array<{ outcome: string }>;
  assert.ok(audits.length >= 3 && audits.every((a) => a.outcome === 'allowed'));
  db.close();
});

test('verifier REVISE then PASS uses a second attempt and still finalizes', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['REVISE', 'PASS']), tts: ttsFake() };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'audio_ready');
  const job = db.prepare('SELECT verifier_attempts FROM processing_jobs WHERE id = ?').get(jobId) as { verifier_attempts: number };
  assert.equal(job.verifier_attempts, 2);
  db.close();
});

test('verifier never passes -> human_review_required, no TTS, no success counted', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['REVISE', 'REVISE']), tts: ttsFake() };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'human_review_required');
  const usage = db.prepare("SELECT successful_count FROM daily_tts_usage WHERE user_id='leo'").get() as { successful_count: number } | undefined;
  assert.ok(!usage || usage.successful_count === 0);
  db.close();
});

test('copyright reproduction is a critical failure -> human_review even if the model says PASS', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  const reproduced = CAPTION_TEXT; // verbatim reuse exceeds the reproduction threshold
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(reproduced), verifier: verifier(['PASS']), tts: ttsFake() };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'human_review_required');
  db.close();
});

test('daily TTS cap defers without discard and does not call TTS', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  const localDate = new Date(T + 9 * 3600000).toISOString().slice(0, 10);
  db.prepare('INSERT INTO daily_tts_usage (user_id, local_date, reserved_count, successful_count, updated_at) VALUES (?,?,?,?,?)').run('leo', localDate, 0, 10, T);
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['PASS']), tts: ttsFake() };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'deferred');
  const job = db.prepare('SELECT defer_reason FROM processing_jobs WHERE id = ?').get(jobId) as { defer_reason: string };
  assert.equal(job.defer_reason, 'daily_tts_cap');
  db.close();
});

test('a stage failure still guarantees caption cleanup', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  const destroyed: string[] = [];
  const throwingBuilder: BuilderPort = {
    async buildChunk() {
      throw { stage: 'builder', code: 'UPSTREAM_5XX', retryable: true, safeMessage: 'x' };
    },
    async buildAggregate() {
      throw { stage: 'builder', code: 'UPSTREAM_5XX', retryable: true, safeMessage: 'x' };
    },
  };
  const ports: PipelinePorts = { caption: captionFake(destroyed), builder: throwingBuilder, verifier: verifier(['PASS']), tts: ttsFake() };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'deferred'); // UPSTREAM_5XX -> deferred
  assert.equal(destroyed.length, 1, 'caption cleaned up even on failure');
  db.close();
});

test('channel feed parsing extracts allowlisted fields and records new discoveries', () => {
  const { db } = migrated();
  db.prepare("INSERT INTO channels (id, user_id, youtube_channel_id, canonical_url, public_title, status, auto_processing_enabled, approval_version, created_at, updated_at) VALUES ('ch','leo','UCx_YiR733cfqVPRsQ1n8Fag','u','Expo','active',1,0,?,?)").run(T, T);
  const xml = `<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"><entry><yt:videoId>5JqK9JLD140</yt:videoId><yt:channelId>UCx_YiR733cfqVPRsQ1n8Fag</yt:channelId><title>Observe</title><published>2026-07-10T00:00:00+00:00</published></entry><entry><yt:videoId>abcdef12345</yt:videoId><yt:channelId>UCx_YiR733cfqVPRsQ1n8Fag</yt:channelId><title>Two</title><published>2026-07-09T00:00:00+00:00</published></entry></feed>`;
  const entries = parseChannelFeed(xml, 'UCx_YiR733cfqVPRsQ1n8Fag');
  assert.equal(entries.length, 2);
  assert.equal(entries[0]?.videoId, '5JqK9JLD140');
  assert.equal(entries[0]?.canonicalUrl, 'https://www.youtube.com/watch?v=5JqK9JLD140');
  const added = recordDiscoveries(db, 'ch', entries, T);
  assert.equal(added, 2);
  assert.equal(recordDiscoveries(db, 'ch', entries, T), 0, 'idempotent: no duplicate discoveries');
  // DOCTYPE/entity is rejected
  assert.throws(() => parseChannelFeed('<!DOCTYPE feed><feed></feed>', 'UCx_YiR733cfqVPRsQ1n8Fag'));
  db.close();
});

// --- Pipeline integrity: scope re-check, attempt lifecycle, real verifier, cap timing, restart ---

test('scope revoked before the run defers as approval_revoked with no outbound call', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  db.prepare("UPDATE provider_scope_approvals SET status = 'revoked' WHERE id = 'sa'").run();
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['PASS']), tts: ttsFake() };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'deferred');
  const job = db.prepare('SELECT defer_reason, lease_owner, eligible_at FROM processing_jobs WHERE id = ?').get(jobId) as { defer_reason: string; lease_owner: string | null; eligible_at: number };
  assert.equal(job.defer_reason, 'approval_revoked');
  assert.equal(job.lease_owner, null, 'lease cleared on defer');
  assert.ok(job.eligible_at > T, 'not immediately re-eligible');
  assert.equal((db.prepare('SELECT COUNT(*) c FROM content_items').get() as { c: number }).c, 0, 'nothing built');
  assert.equal((db.prepare('SELECT COUNT(*) c FROM provider_payload_audits').get() as { c: number }).c, 0, 'no outbound audit');
  db.close();
});

test('a provider timeout records a timed_out attempt (never pre-succeeded) and defers', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  const timeoutBuilder: BuilderPort = {
    async buildChunk() {
      throw { stage: 'builder', code: 'TIMEOUT', retryable: true, safeMessage: 't' };
    },
    async buildAggregate() {
      throw { stage: 'builder', code: 'TIMEOUT', retryable: true, safeMessage: 't' };
    },
  };
  const ports: PipelinePorts = { caption: captionFake([]), builder: timeoutBuilder, verifier: verifier(['PASS']), tts: ttsFake() };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'deferred');
  const at = db.prepare("SELECT status FROM provider_attempts WHERE substage = 'builder_chunk'").get() as { status: string };
  assert.equal(at.status, 'timed_out', 'the started attempt is closed as timed_out');
  db.close();
});

test('the real passing verifier JSON/score/versions are persisted (not hardcoded)', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['PASS']), tts: ttsFake() };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'audio_ready');
  const c = db.prepare('SELECT verifier_score, verifier_output_json, verifier_schema_version, verifier_prompt_version FROM content_items WHERE id = ?').get(out.contentItemId) as { verifier_score: number; verifier_output_json: string; verifier_schema_version: string; verifier_prompt_version: string };
  assert.equal(c.verifier_score, 9.2, 'the model score, not a hardcoded 9.0');
  const parsed = JSON.parse(c.verifier_output_json);
  assert.equal(parsed.verdict, 'PASS');
  assert.equal(parsed.overallScore, 9.2);
  assert.equal(c.verifier_schema_version, 'verifier-output.v1');
  assert.equal(c.verifier_prompt_version, 'verifier.youtube-mvp.v1');
  db.close();
});

test('daily cap defers to a future Asia/Seoul eligibility with the lease cleared and no discard', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  const localDate = new Date(T + 9 * 3600000).toISOString().slice(0, 10);
  db.prepare('INSERT INTO daily_tts_usage (user_id, local_date, reserved_count, successful_count, updated_at) VALUES (?,?,?,?,?)').run('leo', localDate, 0, 10, T);
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['PASS']), tts: ttsFake() };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'deferred');
  const job = db.prepare('SELECT defer_reason, eligible_at, lease_owner FROM processing_jobs WHERE id = ?').get(jobId) as { defer_reason: string; eligible_at: number; lease_owner: string | null };
  assert.equal(job.defer_reason, 'daily_tts_cap');
  assert.ok(job.eligible_at > T + 3600000, 'eligible at a future KST midnight, not an immediate re-claim');
  assert.equal(job.lease_owner, null);
  const cst = db.prepare('SELECT state FROM content_items WHERE id = ?').get(out.contentItemId) as { state: string };
  assert.equal(cst.state, 'audio_pending', 'content retained, not discarded');
  db.close();
});

function countingTts(): { port: TtsPort; calls: () => number } {
  let n = 0;
  const inner = ttsFake();
  return { port: { async synthesize(input, ctx) { n += 1; return inner.synthesize(input, ctx); } }, calls: () => n };
}

test('restart is idempotent: no duplicate rows and no second Fish call once audio is ready', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  const ct = countingTts();
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['PASS']), tts: ct.port };
  assert.equal((await runProcessingJob(db, jobId, ports, ctx)).jobState, 'audio_ready');
  assert.equal((await runProcessingJob(db, jobId, ports, ctx)).jobState, 'audio_ready');
  assert.equal(ct.calls(), 1, 'no second Fish call for an already-ready job');
  assert.equal((db.prepare('SELECT COUNT(*) c FROM content_items').get() as { c: number }).c, 1);
  assert.equal((db.prepare('SELECT COUNT(*) c FROM audio_assets').get() as { c: number }).c, 1);
  assert.equal((db.prepare('SELECT COUNT(*) c FROM playback_items').get() as { c: number }).c, 1);
  assert.equal((db.prepare('SELECT COUNT(*) c FROM tts_generation_receipts').get() as { c: number }).c, 1);
  assert.equal((db.prepare("SELECT successful_count FROM daily_tts_usage WHERE user_id='leo'").get() as { successful_count: number }).successful_count, 1, 'success counted once');
  db.close();
});

test('a storage failure never triggers a second Fish call on retry', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId } = seedJob(db);
  let n = 0;
  const corruptTts: TtsPort = {
    async synthesize(_input, c) {
      n += 1;
      const bytes = Buffer.from(`audio-${c.jobId}`);
      const dir = join(tmpdir(), 'vn-tts-corrupt');
      mkdirSync(dir, { recursive: true });
      const tempKey = join(dir, `${c.jobId}.mp3`);
      const fd = openSync(tempKey, 'w');
      writeSync(fd, bytes);
      fsyncSync(fd);
      closeSync(fd);
      // report a WRONG byte count so durable-storage verification fails
      return { mimeType: 'audio/mpeg', tempKey, byteCount: bytes.byteLength + 5, durationMs: 1000, sha256: createHash('sha256').update(bytes).digest('hex') };
    },
  };
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['PASS']), tts: corruptTts };
  assert.equal((await runProcessingJob(db, jobId, ports, ctx)).jobState, 'deferred');
  assert.equal((db.prepare('SELECT status FROM tts_generation_receipts WHERE job_id = ?').get(jobId) as { status: string }).status, 'storage_failed');
  assert.equal((await runProcessingJob(db, jobId, ports, ctx)).jobState, 'deferred');
  assert.equal(n, 1, 'Fish is not called again after storage_failed');
  db.close();
});

test('source video + builder meta are updated from acquired caption provenance before sending', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx = ctxFor(db, audioDir, stagingDir);
  const { jobId, sourceVideoId } = seedJob(db);
  db.prepare("UPDATE source_videos SET public_title = 'STALE', duration_sec = 1 WHERE id = ?").run(sourceVideoId);
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['PASS']), tts: ttsFake() };
  assert.equal((await runProcessingJob(db, jobId, ports, ctx)).jobState, 'audio_ready');
  const sv = db.prepare('SELECT public_title, duration_sec FROM source_videos WHERE id = ?').get(sourceVideoId) as { public_title: string; duration_sec: number };
  assert.equal(sv.public_title, 'Observe', 'title updated from provenance');
  assert.equal(sv.duration_sec, 400, 'duration updated from provenance');
  db.close();
});

test('a hung provider call is aborted at the stage deadline and recorded timed_out', async () => {
  const { db, audioDir, stagingDir } = migrated();
  const ctx: PipelineContext = { ...ctxFor(db, audioDir, stagingDir), providerTimeoutMs: 40, heartbeatIntervalMs: 10 };
  const { jobId } = seedJob(db);
  const hungTts: TtsPort = {
    synthesize(_input, pctx) {
      return new Promise((_resolve, reject) => {
        const fail = () => reject({ stage: 'tts', code: 'TIMEOUT', retryable: true, safeMessage: 'aborted' });
        if (pctx.abortSignal.aborted) fail();
        else pctx.abortSignal.addEventListener('abort', fail);
      });
    },
  };
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['PASS']), tts: hungTts };
  const out = await runProcessingJob(db, jobId, ports, ctx);
  assert.equal(out.jobState, 'deferred'); // aborted TTS => outcome_unknown => deferred
  assert.equal((db.prepare("SELECT status FROM provider_attempts WHERE substage = 'tts'").get() as { status: string }).status, 'timed_out');
  assert.equal((db.prepare('SELECT status FROM tts_generation_receipts WHERE job_id = ?').get(jobId) as { status: string }).status, 'outcome_unknown', 'a timeout keeps the reservation as outcome_unknown');
  db.close();
});

test('the singleton/job lease is heartbeated on an interval while a call is pending', async () => {
  const { db, audioDir, stagingDir } = migrated();
  let beats = 0;
  const ctx: PipelineContext = { ...ctxFor(db, audioDir, stagingDir), heartbeatIntervalMs: 8, heartbeat: () => { beats += 1; return T; } };
  const { jobId } = seedJob(db);
  const inner = ttsFake();
  const slowTts: TtsPort = {
    async synthesize(input, pctx) {
      await new Promise((r) => setTimeout(r, 60)); // spans several heartbeat intervals
      return inner.synthesize(input, pctx);
    },
  };
  const ports: PipelinePorts = { caption: captionFake([]), builder: builderFake(), verifier: verifier(['PASS']), tts: slowTts };
  assert.equal((await runProcessingJob(db, jobId, ports, ctx)).jobState, 'audio_ready');
  assert.ok(beats >= 3, `heartbeat fired mid-flight multiple times (got ${beats})`);
  db.close();
});
