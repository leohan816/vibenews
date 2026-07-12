import assert from 'node:assert/strict';
import { createHash as cryptoHash, randomUUID as uuid } from 'node:crypto';
import { closeSync as fsCloseSync, fsyncSync as fsFsyncSync, mkdirSync as fsMkdirSync, mkdtempSync as fsMkdtempSync, openSync as fsOpenSync, writeFileSync, writeSync as fsWriteSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import type { BuilderOutput, TtsArtifact, VerifierOutput } from '../../src/domain/contracts';
import { buildRuntimeBinding, DEEPSEEK_PUBLIC_STATEMENT_CODES, DEEPSEEK_UNVERIFIED_CODES, FISH_PUBLIC_STATEMENT_CODES, FISH_UNVERIFIED_CODES, VERIFIED_LOCAL_CONTROL_CODES } from '../../src/domain/contracts';
import { openDatabase, type Db } from '../../src/db/connection';
import { runMigrations } from '../../src/db/migrate';
import type { BuilderPort, CaptionPort, PipelineEvidence, PipelinePorts, TtsPort, VerifierPort } from '../../src/services/processing';
import type { FeedResponseLike, FeedTransport } from '../../src/services/source';
import { runPrivateAcceptance, AUTHORIZED_VIDEO_ID, AUTHORIZED_CHANNEL_ID, ADAPTER_SCHEMA_VERSION, type AccessEvidenceSet, type AccessObserver, type AcceptanceDeps, type RuntimeSelectors } from '../../src/bin/accept-private';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const T = 1_731_000_000_000;
const SECRET = 'synthetic-secret-must-never-appear';
const AUDIT_KEY = Buffer.from('a'.repeat(64), 'hex');
const SELECTORS: RuntimeSelectors = {
  deepseekEndpointOrigin: 'https://api.deepseek.com',
  builderModel: 'deepseek-chat',
  verifierModel: 'deepseek-reasoner',
  verifierReasoning: 'high',
  fishEndpointOrigin: 'https://api.fish.audio',
  fishModel: 'speech-1.6',
  fishReference: 'ref-authorized',
};

function migrated(): { db: Db; root: string } {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  return { db, root: fsMkdtempSync(join(tmpdir(), 'vn-accept2-')) };
}

function seedPolicy(db: Db, opts: { policyBad?: 'empty-codes' | 'bad-url' } = {}): { ds: string; fish: string } {
  const ds = uuid();
  const fish = uuid();
  const ins = db.prepare(
    'INSERT INTO provider_policy_snapshots (id, provider, official_policy_urls, official_api_url, public_api_surface_id, policy_effective_or_updated_date, reviewed_at, document_set_sha256, lookup_status, public_statement_codes, verified_local_control_codes, controls_not_independently_verified, provider_policy_assurance, local_data_controls, provider_side_deletion, provider_side_no_training, production_privacy_approval, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  );
  const dsUrls = opts.policyBad === 'bad-url' ? '["http://insecure.example"]' : '["https://platform.deepseek.com/privacy"]';
  const dsStmt = opts.policyBad === 'empty-codes' ? '[]' : JSON.stringify([...DEEPSEEK_PUBLIC_STATEMENT_CODES]);
  ins.run(ds, 'deepseek', dsUrls, 'https://api.deepseek.com', 'deepseek.post.chat-completions', '2026-02-10', T, 'a'.repeat(64), 'retrieved', dsStmt, JSON.stringify([...VERIFIED_LOCAL_CONTROL_CODES]), JSON.stringify([...DEEPSEEK_UNVERIFIED_CODES]), 'LIMITED_AND_UNVERIFIED', 'VERIFIED', 'NOT_VERIFIED', 'NOT_VERIFIED', 'NOT_GRANTED', T);
  ins.run(fish, 'fish_audio', '["https://fish.audio/privacy"]', 'https://api.fish.audio', 'fish.post.v1.tts', '2024-08-28', T, 'b'.repeat(64), 'retrieved', JSON.stringify([...FISH_PUBLIC_STATEMENT_CODES]), JSON.stringify([...VERIFIED_LOCAL_CONTROL_CODES]), JSON.stringify([...FISH_UNVERIFIED_CODES]), 'LIMITED_AND_UNVERIFIED', 'VERIFIED', 'NOT_VERIFIED', 'NOT_VERIFIED', 'NOT_GRANTED', T);
  return { ds, fish };
}

function seedBindings(db: Db, opts: { bindingBad?: 'wrong-model' } = {}): { b: string; v: string; f: string } {
  const insRb = (input: Parameters<typeof buildRuntimeBinding>[1]): string => {
    const rb = buildRuntimeBinding(AUDIT_KEY, input);
    const id = uuid();
    db.prepare(
      'INSERT INTO provider_runtime_bindings (id, provider_role, public_api_surface_id, audit_key_id, endpoint_origin_hmac, model_selector_hmac, reasoning_selector_hmac, reference_selector_hmac, config_version_hash, credential_present, verified_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    ).run(id, rb.providerRole, rb.publicApiSurfaceId, rb.auditKeyId, rb.endpointOriginHmac, rb.modelSelectorHmac, rb.reasoningSelectorHmac, rb.referenceSelectorHmac, rb.configVersionHash, 1, T);
    return id;
  };
  const b = insRb({ role: 'deepseek_builder', publicApiSurfaceId: 'deepseek.post.chat-completions', endpointOrigin: SELECTORS.deepseekEndpointOrigin, modelSelector: SELECTORS.builderModel, adapterSchemaVersion: ADAPTER_SCHEMA_VERSION });
  const v = insRb({ role: 'deepseek_verifier', publicApiSurfaceId: 'deepseek.post.chat-completions', endpointOrigin: SELECTORS.deepseekEndpointOrigin, modelSelector: opts.bindingBad === 'wrong-model' ? 'wrong-model' : SELECTORS.verifierModel, reasoningSelector: SELECTORS.verifierReasoning, adapterSchemaVersion: ADAPTER_SCHEMA_VERSION });
  const f = insRb({ role: 'fish_tts', publicApiSurfaceId: 'fish.post.v1.tts', endpointOrigin: SELECTORS.fishEndpointOrigin, modelSelector: SELECTORS.fishModel, referenceSelector: SELECTORS.fishReference, adapterSchemaVersion: ADAPTER_SCHEMA_VERSION });
  return { b, v, f };
}

function seedEvidence(db: Db, opts: { policyBad?: 'empty-codes' | 'bad-url'; bindingBad?: 'wrong-model' } = {}): PipelineEvidence {
  const p = seedPolicy(db, opts);
  const bnd = seedBindings(db, opts);
  return { deepseekPolicySnapshotId: p.ds, fishPolicySnapshotId: p.fish, builderBindingId: bnd.b, verifierBindingId: bnd.v, fishBindingId: bnd.f };
}

const CAPTION_TEXT = 'This official Expo video introduces a performance monitoring tool for React Native applications and explains how it measures render times interaction latency startup cost and memory across the new architecture and the legacy bridge.';
function captionFake(): CaptionPort {
  return {
    async acquire() {
      return {
        artifactId: uuid(),
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
      const bytes = Buffer.from(`briefing-audio-${ctx.jobId}`);
      const dir = join(tmpdir(), 'vn-accept2-tts');
      fsMkdirSync(dir, { recursive: true });
      const tempKey = join(dir, `${ctx.jobId}.mp3`);
      const fd = fsOpenSync(tempKey, 'w');
      fsWriteSync(fd, bytes);
      fsFsyncSync(fd);
      fsCloseSync(fd);
      return { mimeType: 'audio/mpeg', tempKey, byteCount: bytes.byteLength, durationMs: 134000, sha256: cryptoHash('sha256').update(bytes).digest('hex') } as TtsArtifact;
    },
  };
}
function fakeFeed(count = 5): FeedTransport {
  const vids = ['5JqK9JLD140', 'abcdef12345', 'ghijk123456', 'lmnop123456', 'qrstu123456'].slice(0, count);
  const entries = vids.map((v, i) => `<entry><yt:videoId>${v}</yt:videoId><yt:channelId>${AUTHORIZED_CHANNEL_ID}</yt:channelId><title>V${i}</title><published>2026-07-0${i + 1}T00:00:00+00:00</published></entry>`).join('');
  const xml = `<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">${entries}</feed>`;
  return async (): Promise<FeedResponseLike> => ({ status: 200, headers: { get: () => null }, body: (async function* () { yield new TextEncoder().encode(xml); })() });
}
function okAccess(overrides: Partial<AccessEvidenceSet> = {}): AccessObserver {
  return async (now: number) => {
    const e = (status: 'ok' | 'denied' | 'failed'): AccessEvidenceSet['loopbackBind'] => ({ status, observedAt: now - 1000, source: 'test.observer', digest: 'deadbeefcafef00d' });
    return { loopbackBind: e('ok'), tailnetServeHttps: e('ok'), authorizedDeviceGrant: e('ok'), funnelDisabled: e('ok'), publicDenied: e('denied'), ...overrides };
  };
}

function baseDeps(over: Partial<AcceptanceDeps> = {}, seedOpts: { policyBad?: 'empty-codes' | 'bad-url'; bindingBad?: 'wrong-model' } = {}): AcceptanceDeps {
  const { db, root } = migrated();
  const evidence = seedEvidence(db, seedOpts);
  const lines: string[] = [];
  const deps: AcceptanceDeps = {
    config: { env: 'test', bindHost: '127.0.0.1', port: 8799, stateDir: root, timezone: 'Asia/Seoul', deviceTokenSha256: 'd'.repeat(64), ytdlpBinary: '/usr/bin/yt-dlp' },
    db,
    ports: { caption: captionFake(), builder: builderFake(), verifier: verifier(['PASS']), tts: ttsFake() } as PipelinePorts,
    evidence,
    access: okAccess(),
    accessMaxAgeMs: 5 * 60 * 1000,
    feedTransport: fakeFeed(),
    audioDir: join(root, 'audio'),
    stagingDir: join(root, 'staging'),
    captionTempRoot: join(root, 'caption-temp'),
    referenceId: SELECTORS.fishReference,
    guardVersion: 'guard.v1',
    auditKey: AUDIT_KEY,
    selectors: SELECTORS,
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
const FIVE_LABELS = ['PROVIDER_POLICY_ASSURANCE: LIMITED_AND_UNVERIFIED', 'LOCAL_DATA_CONTROLS: VERIFIED', 'PROVIDER_SIDE_DELETION: NOT_VERIFIED', 'PROVIDER_SIDE_NO_TRAINING: NOT_VERIFIED', 'PRODUCTION_PRIVACY_APPROVAL: NOT_GRANTED'].join('\n');
const noVerified = (deps: AcceptanceDeps) => assert.ok(!linesOf(deps).join('\n').includes('LOCAL_DATA_CONTROLS: VERIFIED'), 'no LOCAL_DATA_CONTROLS: VERIFIED');

test('PASS: every §14.4 gate is derived from observable/verified evidence and the five labels emit only after preflight', async () => {
  const deps = baseDeps();
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'PASS');
  assert.equal(res.exitCode, 0);
  assert.equal(res.labelsEmitted, true);
  const out = linesOf(deps).join('\n');
  // Observable, structurally-verified gate outputs.
  assert.match(out, /ACCESS_PUBLIC_DENIED: denied want=denied .* ok=true/);
  assert.match(out, /POLICY_SNAPSHOT_DEEPSEEK_VALID: true/);
  assert.match(out, /POLICY_SNAPSHOT_FISH_VALID: true/);
  assert.match(out, /RUNTIME_BINDING_BUILDER_VALID: true/);
  assert.match(out, /RUNTIME_BINDING_VERIFIER_VALID: true/);
  assert.match(out, /RUNTIME_BINDING_FISH_VALID: true/);
  assert.match(out, /RUNTIME_BINDING_ROLES_DISTINCT: true/);
  assert.match(out, /CAPTION_DELETED_WITHIN_DEADLINE: true/);
  assert.match(out, /RAW_MEDIA_OR_TRANSCRIPT_RETAINED: false/);
  assert.match(out, /VERIFIER_SCORE: 9\.2/);
  assert.match(out, /TTS_FINALIZED_RECEIPTS_FOR_JOB: 1/);
  assert.match(out, /DAILY_SUCCESS_DELTA: 1/);
  assert.match(out, /AUDIO_RANGE_STATUS: 206/);
  assert.match(out, /AUDIO_RANGE_CONTENT_RANGE_MATCH: true/);
  assert.match(out, /AUDIO_RANGE_CACHE_PRIVATE_NOSTORE: true/);
  assert.match(out, /AUDIO_RANGE_UNAUTHORIZED_DENIED: true/);
  assert.match(out, /CHANNEL_IDENTITY_MATCH: true/);
  assert.match(out, /CHANNEL_PROMOTED: 3/);
  assert.match(out, /CHANNEL_PROMOTE_ORDER_OK: true/);
  assert.match(out, /CHANNEL_NEXT_POLL_HOURLY: true/);
  // Five labels exact + only after preflight.
  assert.ok(out.includes(FIVE_LABELS), 'five labels exact literal form/order');
  assert.ok(out.indexOf('CHANNEL_NEXT_POLL_HOURLY') < out.indexOf('LOCAL_DATA_CONTROLS: VERIFIED'));
  assert.match(out, /LIVE_PRIVATE_ACCEPTANCE: PASS/);
  // No raw transcript / audio body / secret / fallback.
  assert.ok(!out.includes(CAPTION_TEXT) && !out.includes('briefing-audio-') && !out.includes(SECRET));
  assert.ok(!/\bfallback\b|Bearer /i.test(out));
  deps.db.close();
});

test('IR-F1-D1(d): a pre-seeded daily aggregate plus exactly one job increment still passes', async () => {
  const deps = baseDeps();
  const localDate = new Date(T + 9 * 3600000).toISOString().slice(0, 10);
  deps.db.prepare("INSERT OR IGNORE INTO users (id, timezone, created_at, updated_at) VALUES ('leo','Asia/Seoul',?,?)").run(T, T);
  deps.db.prepare('INSERT INTO daily_tts_usage (user_id, local_date, reserved_count, successful_count, updated_at) VALUES (?,?,?,?,?)').run('leo', localDate, 0, 5, T);
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'PASS');
  const out = linesOf(deps).join('\n');
  assert.match(out, /DAILY_SUCCESS_DELTA: 1/); // +1 caused by this run, not the aggregate 6
  assert.ok(out.includes(FIVE_LABELS));
  deps.db.close();
});

test('IR-F1-D1(a): a retained raw transcript file under a bounded path fails closed with no labels', async () => {
  const deps = baseDeps();
  fsMkdirSync(deps.stagingDir, { recursive: true });
  writeFileSync(join(deps.stagingDir, 'leaked-source.vtt'), 'x');
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'FAIL');
  assert.match(linesOf(deps).join('\n'), /RAW_MEDIA_OR_TRANSCRIPT_RETAINED: true/);
  noVerified(deps);
  deps.db.close();
});

test('IR-F1-D1(b): access supplied by stale/wrong evidence blocks with RUNTIME_ACCESS_REQUIRED and no labels', async () => {
  const stale: AccessObserver = async (now) => {
    const e = (status: 'ok' | 'denied' | 'failed', age: number) => ({ status, observedAt: now - age, source: 'test.observer', digest: 'deadbeef' });
    return { loopbackBind: e('ok', 1000), tailnetServeHttps: e('ok', 10 * 60 * 1000), authorizedDeviceGrant: e('ok', 1000), funnelDisabled: e('ok', 1000), publicDenied: e('ok', 1000) };
  };
  const deps = baseDeps({ access: stale });
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'BLOCKED');
  assert.equal(res.code, 'RUNTIME_ACCESS_REQUIRED');
  noVerified(deps);
  deps.db.close();
});

test('IR-F1-D1(c): zero channel discoveries fails closed with no labels', async () => {
  const deps = baseDeps({ feedTransport: fakeFeed(0) });
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'FAIL');
  assert.match(linesOf(deps).join('\n'), /CHANNEL_IDENTITY_MATCH: false|CHANNEL_POLL: FAIL/);
  noVerified(deps);
  deps.db.close();
});

test('IR-F1-D1(f): an empty policy statement-code set blocks with POLICY_SNAPSHOT_REQUIRED and no labels', async () => {
  const deps = baseDeps({}, { policyBad: 'empty-codes' });
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'BLOCKED');
  assert.equal(res.code, 'POLICY_SNAPSHOT_REQUIRED');
  assert.match(linesOf(deps).join('\n'), /POLICY_SNAPSHOT_DEEPSEEK_VALID: false/);
  noVerified(deps);
  deps.db.close();
});

test('IR-F1-D1(g): a mismatched role-selector binding blocks with RUNTIME_BINDING_REQUIRED and no labels', async () => {
  const deps = baseDeps({}, { bindingBad: 'wrong-model' });
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'BLOCKED');
  assert.equal(res.code, 'RUNTIME_BINDING_REQUIRED');
  assert.match(linesOf(deps).join('\n'), /RUNTIME_BINDING_VERIFIER_VALID: false/);
  noVerified(deps);
  deps.db.close();
});

test('regression: never-passing verifier fails the slice, and a non-authorized source is rejected — both without labels', async () => {
  const d1 = baseDeps({ ports: { caption: captionFake(), builder: builderFake(), verifier: verifier(['REVISE', 'REVISE']), tts: ttsFake() } as PipelinePorts });
  const r1 = await runPrivateAcceptance(d1);
  assert.equal(r1.status, 'FAIL');
  noVerified(d1);
  d1.db.close();
  const d2 = baseDeps({ videoId: 'wrongid1234' });
  const r2 = await runPrivateAcceptance(d2);
  assert.equal(r2.status, 'BLOCKED');
  assert.equal(r2.code, 'AUTHORIZED_SOURCE_REQUIRED');
  noVerified(d2);
  d2.db.close();
});
