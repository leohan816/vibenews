import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { closeSync, fsyncSync, mkdirSync, mkdtempSync, openSync, writeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import type { BuilderOutput, TtsArtifact, VerifierOutput } from '../../src/domain/contracts';
import { openDatabase, type Db } from '../../src/db/connection';
import { runMigrations } from '../../src/db/migrate';
import type { BuilderPort, CaptionPort, PipelineEvidence, PipelinePorts, TtsPort, VerifierPort } from '../../src/services/processing';
import type { FeedResponseLike, FeedTransport } from '../../src/services/source';
import { runPrivateAcceptance, AUTHORIZED_VIDEO_ID, AUTHORIZED_CHANNEL_ID, type AccessPreconditions, type AcceptanceDeps } from '../../src/bin/accept-private';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const T = 1_731_000_000_000;
const SECRET = 'synthetic-secret-must-never-appear';

function migrated(): { db: Db; audioDir: string; stagingDir: string } {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  const root = mkdtempSync(join(tmpdir(), 'vn-accept-'));
  return { db, audioDir: join(root, 'audio'), stagingDir: join(root, 'staging') };
}

function seedEvidence(db: Db): PipelineEvidence {
  const ds = randomUUID();
  const fish = randomUUID();
  const ins = db.prepare(
    'INSERT INTO provider_policy_snapshots (id, provider, official_policy_urls, official_api_url, public_api_surface_id, policy_effective_or_updated_date, reviewed_at, document_set_sha256, lookup_status, public_statement_codes, verified_local_control_codes, controls_not_independently_verified, provider_policy_assurance, local_data_controls, provider_side_deletion, provider_side_no_training, production_privacy_approval, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  );
  ins.run(ds, 'deepseek', '[]', 'u', 'deepseek.post.chat-completions', '2026-02-10', T, 'a'.repeat(64), 'retrieved', '[]', '[]', '[]', 'LIMITED_AND_UNVERIFIED', 'VERIFIED', 'NOT_VERIFIED', 'NOT_VERIFIED', 'NOT_GRANTED', T);
  ins.run(fish, 'fish_audio', '[]', 'u', 'fish.post.v1.tts', '2024-08-28', T, 'b'.repeat(64), 'retrieved', '[]', '[]', '[]', 'LIMITED_AND_UNVERIFIED', 'VERIFIED', 'NOT_VERIFIED', 'NOT_VERIFIED', 'NOT_GRANTED', T);
  const bi = db.prepare(
    'INSERT INTO provider_runtime_bindings (id, provider_role, public_api_surface_id, audit_key_id, endpoint_origin_hmac, model_selector_hmac, reasoning_selector_hmac, reference_selector_hmac, config_version_hash, credential_present, verified_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
  );
  const b = randomUUID();
  const v = randomUUID();
  const f = randomUUID();
  bi.run(b, 'deepseek_builder', 'deepseek.post.chat-completions', 'provider-audit-hmac-v1', 'h', 'h', null, null, 'cv1', 1, T);
  bi.run(v, 'deepseek_verifier', 'deepseek.post.chat-completions', 'provider-audit-hmac-v1', 'h', 'h', 'h', null, 'cv2', 1, T);
  bi.run(f, 'fish_tts', 'fish.post.v1.tts', 'provider-audit-hmac-v1', 'h', 'h', null, 'h', 'cv3', 1, T);
  return { deepseekPolicySnapshotId: ds, fishPolicySnapshotId: fish, builderBindingId: b, verifierBindingId: v, fishBindingId: f };
}

const CAPTION_TEXT = 'This official Expo video introduces a performance monitoring tool for React Native applications and explains how it measures render times interaction latency startup cost and memory across the new architecture and the legacy bridge.';

function captionFake(): CaptionPort {
  return {
    async acquire() {
      return {
        artifactId: randomUUID(),
        relativeTempKey: 'job/cap.vtt',
        cues: [
          { index: 0, startMs: 0, endMs: 2000, text: 'performance monitoring intro' },
          { index: 1, startMs: 2000, endMs: 4000, text: 'render times and memory' },
        ],
        captionText: CAPTION_TEXT,
        provenance: { channelId: AUTHORIZED_CHANNEL_ID, publicTitle: 'Observe', publishedAt: null, durationSec: 400, captionLanguages: ['en'], captionKinds: ['manual'], sha256: 'c'.repeat(64), byteCount: CAPTION_TEXT.length },
      };
    },
    async destroy() {},
  };
}

const CHUNK = { schemaVersion: 'builder-chunk-output.v1' as const, chunkId: 'chunk-000000', sectionSummary: '성능 관측 도구 소개', claims: [], numbers: [], entities: [] };
function builderFake(): BuilderPort {
  return {
    async buildChunk() {
      return CHUNK;
    },
    async buildAggregate() {
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
        claims: [{ claim: '성능을 측정한다.', evidenceRefs: ['cap:000000-000001'] }],
        numbers: [{ value: '2', context: '두 지표', evidenceRefs: ['cap:000000-000001'] }],
        audioScript: { language: 'ko', mode: 'standard', segments: [{ order: 0, text: '오늘의 브리핑입니다. 성능 관측 도구를 짧게 요약합니다.', evidenceRefs: ['cap:000000-000001'] }] },
      } as BuilderOutput;
    },
  };
}

function verifier(verdicts: VerifierOutput['verdict'][]): VerifierPort {
  let i = 0;
  return {
    async verify() {
      const verdict = verdicts[Math.min(i, verdicts.length - 1)] ?? 'PASS';
      i += 1;
      return { schemaVersion: 'verifier-output.v1', verdict, overallScore: verdict === 'PASS' ? 9.2 : 8.0, dimensionScores: { fidelity: 9, coverage: 9, clarity: 9, audioFitness: 9, provenance: 9 }, criticalFailures: [], findings: verdict === 'REVISE' ? [{ code: 'C1', severity: 'minor', evidenceRefs: [], instruction: 'x' }] : [] };
    },
  };
}

function ttsFake(): TtsPort {
  return {
    async synthesize(_input, ctx) {
      const bytes = Buffer.from(`synthetic-audio-${ctx.jobId}`);
      const dir = join(tmpdir(), 'vn-accept-tts');
      mkdirSync(dir, { recursive: true });
      const tempKey = join(dir, `${ctx.jobId}.mp3`);
      const fd = openSync(tempKey, 'w');
      writeSync(fd, bytes);
      fsyncSync(fd);
      closeSync(fd);
      return { mimeType: 'audio/mpeg', tempKey, byteCount: bytes.byteLength, durationMs: 134000, sha256: createHash('sha256').update(bytes).digest('hex') } as TtsArtifact;
    },
  };
}

function fakeFeed(): FeedTransport {
  const vids = ['5JqK9JLD140', 'abcdef12345', 'ghijk123456', 'lmnop123456', 'qrstu123456'];
  const entries = vids
    .map((v, i) => `<entry><yt:videoId>${v}</yt:videoId><yt:channelId>${AUTHORIZED_CHANNEL_ID}</yt:channelId><title>V${i}</title><published>2026-07-0${i + 1}T00:00:00+00:00</published></entry>`)
    .join('');
  const xml = `<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">${entries}</feed>`;
  return async (): Promise<FeedResponseLike> => ({
    status: 200,
    headers: { get: () => null },
    body: (async function* () {
      yield new TextEncoder().encode(xml);
    })(),
  });
}

function allAccess(): AccessPreconditions {
  return { loopbackBind: true, tailscaleServeHttps: true, authorizedDeviceGrant: true, funnelDisabled: true, publicUnreachable: true };
}

function baseDeps(over: Partial<AcceptanceDeps> = {}): AcceptanceDeps {
  const { db, audioDir, stagingDir } = migrated();
  const evidence = seedEvidence(db);
  const lines: string[] = [];
  const deps: AcceptanceDeps = {
    config: { env: 'test', bindHost: '127.0.0.1', port: 8799, stateDir: '/tmp/none', timezone: 'Asia/Seoul', deviceTokenSha256: 'd'.repeat(64), ytdlpBinary: '/usr/bin/yt-dlp' },
    db,
    ports: { caption: captionFake(), builder: builderFake(), verifier: verifier(['PASS']), tts: ttsFake() } as PipelinePorts,
    evidence,
    runtimeBindingValid: true,
    access: allAccess(),
    feedTransport: fakeFeed(),
    audioDir,
    stagingDir,
    referenceId: 'ref-1',
    guardVersion: 'guard.v1',
    now: T,
    videoId: AUTHORIZED_VIDEO_ID,
    channelId: AUTHORIZED_CHANNEL_ID,
    emit: (l) => lines.push(l),
    ...over,
  };
  (deps as unknown as { _lines: string[] })._lines = lines;
  return deps;
}
const linesOf = (deps: AcceptanceDeps): string[] => (deps as unknown as { _lines: string[] })._lines;

const FIVE_LABELS = [
  'PROVIDER_POLICY_ASSURANCE: LIMITED_AND_UNVERIFIED',
  'LOCAL_DATA_CONTROLS: VERIFIED',
  'PROVIDER_SIDE_DELETION: NOT_VERIFIED',
  'PROVIDER_SIDE_NO_TRAINING: NOT_VERIFIED',
  'PRODUCTION_PRIVACY_APPROVAL: NOT_GRANTED',
].join('\n');

test('PASS: drives the real pipeline ports, emits the §14.4 evidence shape, and the five labels only after preflight', async () => {
  const deps = baseDeps();
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'PASS');
  assert.equal(res.exitCode, 0);
  assert.equal(res.labelsEmitted, true);
  const out = linesOf(deps).join('\n');

  // §14.4 evidence items present (safe values only).
  assert.match(out, /SELECTED_VIDEO_ID: 5JqK9JLD140/);
  assert.match(out, /OFFICIAL_SOURCE_MATCH: true/);
  assert.match(out, /CAPTION_DELETED_WITHIN_DEADLINE: true/);
  assert.match(out, /BUILDER_OUTPUT_HASH: [0-9a-f]{64}/);
  assert.match(out, /VERIFIER_OUTPUT_HASH: [0-9a-f]{64}/);
  assert.match(out, /BUILDER_VERIFIER_SEPARATELY_VERSIONED: true/);
  assert.match(out, /VERIFIER_SCORE: 9\.2/);
  assert.match(out, /VERIFIER_CRITICAL_FAILURES: 0/);
  assert.match(out, /TTS_FINALIZED_RECEIPTS: 1/);
  assert.match(out, /DAILY_SUCCESSFUL_COUNT: 1/);
  assert.match(out, /READY_AUDIO_ASSETS: 1/);
  assert.match(out, /AUDIO_RANGE_READY: true/);
  assert.match(out, /PLAYBACK_SESSION_ID: [0-9a-f-]{36}/);
  assert.match(out, /CHANNEL_PROMOTE_BOUND_OK: true/);
  assert.match(out, /CHANNEL_NEXT_POLL_HOURLY: true/);
  assert.match(out, /ACTIVE_SCOPE_APPROVALS: [1-9]/);
  assert.match(out, /PAYLOAD_AUDITS_NON_ALLOWED: 0/);
  assert.match(out, /POLICY_SNAPSHOT_DEEPSEEK: retrieved/);
  assert.match(out, /POLICY_SNAPSHOT_FISH: retrieved/);
  assert.match(out, /RUNTIME_BINDING_HMAC_PRESENT: true/);
  assert.match(out, /RAW_MEDIA_OR_TRANSCRIPT_RETAINED: false/);

  // The five labels appear exactly, in order, and only after the evidence.
  assert.ok(out.includes(FIVE_LABELS), 'five labels present in exact literal form and order');
  assert.ok(out.indexOf('CAPTION_DELETED_WITHIN_DEADLINE') < out.indexOf('LOCAL_DATA_CONTROLS: VERIFIED'), 'labels emitted after local controls');
  assert.match(out, /LIVE_PRIVATE_ACCEPTANCE: PASS/);

  // No raw transcript / audio body / secret / sample-fallback ever appears.
  assert.ok(!out.includes(CAPTION_TEXT), 'no raw caption text');
  assert.ok(!out.includes('synthetic-audio-'), 'no raw audio body bytes leaked');
  assert.ok(!/\bfallback\b|Bearer /i.test(out), 'no fallback/bearer markers in acceptance output');
  assert.ok(!out.includes(SECRET), 'no secret marker leaked');
  deps.db.close();
});

test('fail closed: absent runtime access never runs the slice and never emits LOCAL_DATA_CONTROLS: VERIFIED', async () => {
  const deps = baseDeps({ access: { ...allAccess(), tailscaleServeHttps: false } });
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'BLOCKED');
  assert.equal(res.code, 'RUNTIME_ACCESS_REQUIRED');
  assert.equal(res.exitCode, 2);
  assert.equal(res.labelsEmitted, false);
  const out = linesOf(deps).join('\n');
  assert.ok(!out.includes('LOCAL_DATA_CONTROLS: VERIFIED'));
  assert.match(out, /LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_ACCESS_REQUIRED/);
  deps.db.close();
});

test('fail closed: invalid runtime binding evidence blocks with no labels', async () => {
  const deps = baseDeps({ runtimeBindingValid: false });
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'BLOCKED');
  assert.equal(res.code, 'RUNTIME_BINDING_REQUIRED');
  assert.equal(res.labelsEmitted, false);
  assert.ok(!linesOf(deps).join('\n').includes('LOCAL_DATA_CONTROLS: VERIFIED'));
  deps.db.close();
});

test('fail closed: a verifier that never passes fails the slice with no labels', async () => {
  const deps = baseDeps({ ports: { caption: captionFake(), builder: builderFake(), verifier: verifier(['REVISE', 'REVISE']), tts: ttsFake() } as PipelinePorts });
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'FAIL');
  assert.equal(res.labelsEmitted, false);
  const out = linesOf(deps).join('\n');
  assert.ok(!out.includes('LOCAL_DATA_CONTROLS: VERIFIED'));
  assert.match(out, /VERTICAL_SLICE_HUMAN_REVIEW_REQUIRED/);
  deps.db.close();
});

test('fail closed: a non-authorized source is rejected before any provisioning', async () => {
  const deps = baseDeps({ videoId: 'wrongid1234' });
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'BLOCKED');
  assert.equal(res.code, 'AUTHORIZED_SOURCE_REQUIRED');
  assert.equal(res.labelsEmitted, false);
  assert.ok(!linesOf(deps).join('\n').includes('LOCAL_DATA_CONTROLS: VERIFIED'));
  deps.db.close();
});
