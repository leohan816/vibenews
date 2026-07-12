import assert from 'node:assert/strict';
import { createHash as cryptoHash, randomUUID as uuid } from 'node:crypto';
import { chmodSync, closeSync as fsCloseSync, fsyncSync as fsFsyncSync, lstatSync, mkdirSync, mkdtempSync, openSync as fsOpenSync, readFileSync, rmSync, symlinkSync, writeFileSync, writeSync as fsWriteSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import type { BuilderOutput, TtsArtifact, VerifierOutput } from '../../src/domain/contracts';
import { DEEPSEEK_PUBLIC_STATEMENT_CODES, DEEPSEEK_UNVERIFIED_CODES, FISH_PUBLIC_STATEMENT_CODES, FISH_UNVERIFIED_CODES, VERIFIED_LOCAL_CONTROL_CODES } from '../../src/domain/contracts';
import { openDatabase, type Db } from '../../src/db/connection';
import { runMigrations } from '../../src/db/migrate';
import type { BuilderPort, CaptionPort, PipelineEvidence, PipelinePorts, TtsPort, VerifierPort } from '../../src/services/processing';
import type { FeedResponseLike, FeedTransport } from '../../src/services/source';
import { runPrivateAcceptance, collectAccessEvidence, resolveAuditKey, provisionRoleBindings, validateRoleBindings, loadRoleBindings, prepareAuditKeyAndBindings, acceptancePreflight, derivePublicDenial, isGlobalUnicastPublic, normalizeBaseSurface, AuditKeyError, AUTHORIZED_VIDEO_ID, AUTHORIZED_CHANNEL_ID, type AccessSeams, type AccessCollectorConfig, type AcceptanceDeps, type AcceptanceResult, type BindingIds, type ConnectProbeResult, type RuntimeSelectors } from '../../src/bin/accept-private';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const T = 1_731_000_000_000;
const API_PORT = 8799;
const DEVICE_ID = 'nodekey:device-leo';
const ACCESS_MAX_AGE = 5 * 60 * 1000;
const BINDING_FRESH = 30 * 24 * 60 * 60 * 1000;
const SELECTORS: RuntimeSelectors = { deepseekEndpointOrigin: 'https://api.deepseek.com', builderModel: 'deepseek-chat', verifierModel: 'deepseek-reasoner', verifierReasoning: 'high', fishEndpointOrigin: 'https://api.fish.audio', fishModel: 'speech-1.6', fishReference: 'ref-authorized' };
const COLLECTOR_CFG: AccessCollectorConfig = { apiPort: API_PORT, bindHost: '127.0.0.1', authorizedDeviceId: DEVICE_ID };
const KEY_FILE = 'provider-audit-hmac-v1.key';
const DEVICE_TOKEN_HASH = 'd'.repeat(64); // config.deviceTokenSha256 (hex)
const DEVICE_TOKEN_KEY = Buffer.from(DEVICE_TOKEN_HASH, 'hex'); // the device bearer-token hash reused as key bytes — must never validate

function migrated(): { db: Db; root: string } {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  return { db, root: mkdtempSync(join(tmpdir(), 'vn-accept3-')) };
}
function seedPolicy(db: Db, opts: { policyBad?: 'empty-codes' | 'bad-url' } = {}): { ds: string; fish: string } {
  const ds = uuid();
  const fish = uuid();
  const ins = db.prepare('INSERT INTO provider_policy_snapshots (id, provider, official_policy_urls, official_api_url, public_api_surface_id, policy_effective_or_updated_date, reviewed_at, document_set_sha256, lookup_status, public_statement_codes, verified_local_control_codes, controls_not_independently_verified, provider_policy_assurance, local_data_controls, provider_side_deletion, provider_side_no_training, production_privacy_approval, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  const dsUrls = opts.policyBad === 'bad-url' ? '["http://insecure.example"]' : '["https://platform.deepseek.com/privacy"]';
  const dsStmt = opts.policyBad === 'empty-codes' ? '[]' : JSON.stringify([...DEEPSEEK_PUBLIC_STATEMENT_CODES]);
  ins.run(ds, 'deepseek', dsUrls, 'https://api.deepseek.com', 'deepseek.post.chat-completions', '2026-02-10', T, 'a'.repeat(64), 'retrieved', dsStmt, JSON.stringify([...VERIFIED_LOCAL_CONTROL_CODES]), JSON.stringify([...DEEPSEEK_UNVERIFIED_CODES]), 'LIMITED_AND_UNVERIFIED', 'VERIFIED', 'NOT_VERIFIED', 'NOT_VERIFIED', 'NOT_GRANTED', T);
  ins.run(fish, 'fish_audio', '["https://fish.audio/privacy"]', 'https://api.fish.audio', 'fish.post.v1.tts', '2024-08-28', T, 'b'.repeat(64), 'retrieved', JSON.stringify([...FISH_PUBLIC_STATEMENT_CODES]), JSON.stringify([...VERIFIED_LOCAL_CONTROL_CODES]), JSON.stringify([...FISH_UNVERIFIED_CODES]), 'LIMITED_AND_UNVERIFIED', 'VERIFIED', 'NOT_VERIFIED', 'NOT_VERIFIED', 'NOT_GRANTED', T);
  return { ds, fish };
}

const CAPTION_TEXT = 'This official Expo video introduces a performance monitoring tool for React Native applications and explains how it measures render times interaction latency startup cost and memory across the new architecture and the legacy bridge.';
function captionFake(): CaptionPort {
  return {
    async acquire() {
      return { artifactId: uuid(), relativeTempKey: 'job/cap.vtt', cues: [{ index: 0, startMs: 0, endMs: 2000, text: 'performance monitoring intro' }, { index: 1, startMs: 2000, endMs: 4000, text: 'render times and memory' }], captionText: CAPTION_TEXT, provenance: { channelId: AUTHORIZED_CHANNEL_ID, publicTitle: 'Observe', publishedAt: null, durationSec: 400, captionLanguages: ['en'], captionKinds: ['manual'], sha256: 'c'.repeat(64), byteCount: CAPTION_TEXT.length } };
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
      return { schemaVersion: 'builder-output.v1', title: 'Observe intro', oneLineSummary: '성능 관측 도구 요약', contentKind: 'analysis', category: 'developer', subcategory: { slug: 'dev_tools', displayName: 'Dev Tools' }, topicClusters: ['Performance'], tags: ['observe', 'react-native', 'performance'], entities: [{ name: 'Expo', kind: 'company' }], claims: [{ claim: '성능을 측정한다.', evidenceRefs: ['cap:000000-000001'] }], numbers: [{ value: '2', context: '두 지표', evidenceRefs: ['cap:000000-000001'] }], audioScript: { language: 'ko', mode: 'standard', segments: [{ order: 0, text: '오늘의 브리핑입니다. 성능 관측 도구를 짧게 요약합니다.', evidenceRefs: ['cap:000000-000001'] }] } } as BuilderOutput;
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
      const dir = join(tmpdir(), 'vn-accept3-tts');
      mkdirSync(dir, { recursive: true });
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

// Real seam-driven access collector fed with synthetic command/probe results (never okAccess()).
const DEVICE_TAILNET_IP = '100.100.0.2'; // derived-and-probed grant IP; must never appear in output
const GOOD_SERVE = { Web: { 'leo.ts.net:443': { Handlers: { '/': { Proxy: `http://127.0.0.1:${API_PORT}` } } } } };
// The authorized device is a DISTINCT online peer (in the network map, with a validated tailnet IP); Self is the server node.
const GOOD_STATUS = { Self: { ID: 'nodekey:server', Online: true, TailscaleIPs: ['100.100.0.1'] }, Peer: { 'nodekey:device-leo': { ID: DEVICE_ID, Online: true, InNetworkMap: true, TailscaleIPs: [DEVICE_TAILNET_IP] } } };
const GOOD_FUNNEL = { AllowFunnel: {} };
type CmdBodies = { serve?: unknown; status?: unknown; funnel?: unknown };
function cmdWith(over: CmdBodies = {}): AccessSeams['command'] {
  const map: Record<string, unknown> = { serve: over.serve ?? GOOD_SERVE, status: over.status ?? GOOD_STATUS, funnel: over.funnel ?? GOOD_FUNNEL };
  return async (_bin, args) => ({ code: 0, stdout: JSON.stringify(map[args[0] as string]) });
}
function goodSeams(over: Partial<AccessSeams> = {}): AccessSeams {
  return {
    clock: () => T,
    command: cmdWith(),
    loopbackHealthProbe: async () => ({ status: 200 }),
    nonLoopbackBindProbe: async () => ({ open: false }),
    deviceReachabilityProbe: async () => ({ reachable: true }),
    publicDenyProbe: async () => ({ reachable: false }),
    ...over,
  };
}

function baseDeps(over: Partial<AcceptanceDeps> = {}, seedOpts: { policyBad?: 'empty-codes' | 'bad-url' } = {}, provisionKey?: Buffer): { deps: AcceptanceDeps; lines: string[] } {
  const { db, root } = migrated();
  const key = resolveAuditKey(root, { allowCreate: true });
  const policy = seedPolicy(db, seedOpts);
  const bindings = provisionRoleBindings(db, provisionKey ?? key, SELECTORS, T);
  const evidence: PipelineEvidence = { deepseekPolicySnapshotId: policy.ds, fishPolicySnapshotId: policy.fish, builderBindingId: bindings.builderBindingId, verifierBindingId: bindings.verifierBindingId, fishBindingId: bindings.fishBindingId };
  const lines: string[] = [];
  const deps: AcceptanceDeps = {
    config: { env: 'test', bindHost: '127.0.0.1', port: API_PORT, stateDir: root, timezone: 'Asia/Seoul', deviceTokenSha256: 'd'.repeat(64), ytdlpBinary: '/usr/bin/yt-dlp' },
    db,
    ports: { caption: captionFake(), builder: builderFake(), verifier: verifier(['PASS']), tts: ttsFake() } as PipelinePorts,
    evidence,
    access: () => collectAccessEvidence(goodSeams(), COLLECTOR_CFG),
    accessMaxAgeMs: ACCESS_MAX_AGE,
    clock: () => T,
    feedTransport: fakeFeed(),
    audioDir: join(root, 'audio'),
    stagingDir: join(root, 'staging'),
    captionTempRoot: join(root, 'caption-temp'),
    referenceId: SELECTORS.fishReference,
    guardVersion: 'guard.v1',
    auditKey: key,
    selectors: SELECTORS,
    now: T,
    videoId: AUTHORIZED_VIDEO_ID,
    channelId: AUTHORIZED_CHANNEL_ID,
    emit: (l) => lines.push(l),
    ...over,
  };
  return { deps, lines };
}
const FIVE_LABELS = ['PROVIDER_POLICY_ASSURANCE: LIMITED_AND_UNVERIFIED', 'LOCAL_DATA_CONTROLS: VERIFIED', 'PROVIDER_SIDE_DELETION: NOT_VERIFIED', 'PROVIDER_SIDE_NO_TRAINING: NOT_VERIFIED', 'PRODUCTION_PRIVACY_APPROVAL: NOT_GRANTED'].join('\n');
const noVerified = (lines: string[]) => assert.ok(!lines.join('\n').includes('LOCAL_DATA_CONTROLS: VERIFIED'), 'no LOCAL_DATA_CONTROLS: VERIFIED');

test('PASS: access via the executed collector, real key+binding provisioning, and every §14.4 gate; labels only after preflight', async () => {
  const { deps, lines } = baseDeps();
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'PASS');
  assert.equal(res.labelsEmitted, true);
  const out = lines.join('\n');
  assert.match(out, /ACCESS_LOOPBACK_BIND: ok .* ok=true/);
  assert.match(out, /ACCESS_TAILNET_SERVE_HTTPS: ok .* ok=true/);
  assert.match(out, /ACCESS_AUTHORIZED_DEVICE_GRANT: ok .* ok=true/);
  assert.match(out, /ACCESS_FUNNEL_DISABLED: ok .* ok=true/);
  assert.match(out, /ACCESS_PUBLIC_DENIED: denied .* ok=true/);
  assert.match(out, /ACCESS_PROOFS_DISTINCT: true/);
  assert.match(out, /RUNTIME_BINDING_BUILDER_VALID: true/);
  assert.match(out, /RUNTIME_BINDING_VERIFIER_VALID: true/);
  assert.match(out, /RUNTIME_BINDING_FISH_VALID: true/);
  assert.match(out, /RUNTIME_BINDING_ROLES_DISTINCT: true/);
  assert.match(out, /TTS_FINALIZED_RECEIPTS_FOR_JOB: 1/);
  assert.match(out, /DAILY_SUCCESS_DELTA: 1/);
  assert.match(out, /AUDIO_RANGE_STATUS: 206/);
  assert.match(out, /CHANNEL_PROMOTE_ORDER_OK: true/);
  assert.ok(out.includes(FIVE_LABELS));
  assert.ok(out.indexOf('ACCESS_PUBLIC_DENIED') < out.indexOf('LOCAL_DATA_CONTROLS: VERIFIED'));
  assert.ok(!out.includes(CAPTION_TEXT) && !out.includes('briefing-audio-') && !out.includes(DEVICE_ID) && !out.includes(DEVICE_TAILNET_IP) && !out.includes('api.deepseek.com'));
  deps.db.close();
});

test('IR-F1-D1(d): a pre-seeded daily aggregate plus exactly one job increment still passes', async () => {
  const { deps, lines } = baseDeps();
  const localDate = new Date(T + 9 * 3600000).toISOString().slice(0, 10);
  deps.db.prepare("INSERT OR IGNORE INTO users (id, timezone, created_at, updated_at) VALUES ('leo','Asia/Seoul',?,?)").run(T, T);
  deps.db.prepare('INSERT INTO daily_tts_usage (user_id, local_date, reserved_count, successful_count, updated_at) VALUES (?,?,?,?,?)').run('leo', localDate, 0, 5, T);
  assert.equal((await runPrivateAcceptance(deps)).status, 'PASS');
  assert.match(lines.join('\n'), /DAILY_SUCCESS_DELTA: 1/);
  assert.ok(lines.join('\n').includes(FIVE_LABELS));
  deps.db.close();
});

test('IR-F1-D1(a): a retained raw transcript file under a bounded path fails closed with no labels', async () => {
  const { deps, lines } = baseDeps();
  mkdirSync(deps.stagingDir, { recursive: true });
  writeFileSync(join(deps.stagingDir, 'leaked-source.vtt'), 'x');
  assert.equal((await runPrivateAcceptance(deps)).status, 'FAIL');
  assert.match(lines.join('\n'), /RAW_MEDIA_OR_TRANSCRIPT_RETAINED: true/);
  noVerified(lines);
  deps.db.close();
});

// IR-F1-D1(b): the collector is executed with injected bad command/probe results, each isolating one dedicated
// fact (the other facts stay valid via GOOD_* bodies) so the intended observation is what fails closed.
const peerStatus = (peer: Record<string, unknown>): unknown => ({ Self: { ID: 'nodekey:server', Online: true, TailscaleIPs: ['100.100.0.1'] }, Peer: { 'nodekey:device-leo': { ID: DEVICE_ID, ...peer } } });
const ACCESS_NEGATIVES: Array<[string, Partial<AccessSeams>]> = [
  ['serve wrong loopback port', { command: cmdWith({ serve: { Web: { 'leo.ts.net:443': { Handlers: { '/': { Proxy: 'http://127.0.0.1:9999' } } } } } }) }],
  ['serve not an https :443 listener', { command: cmdWith({ serve: { Web: { 'leo.ts.net:8080': { Handlers: { '/': { Proxy: `http://127.0.0.1:${API_PORT}` } } } } } }) }],
  ['serve malformed web map', { command: cmdWith({ serve: { Web: [] } }) }],
  ['serve absent', { command: cmdWith({ serve: {} }) }],
  ['funnel enabled', { command: cmdWith({ funnel: { AllowFunnel: { 'leo.ts.net:443': true } } }) }],
  ['funnel malformed non-boolean value', { command: cmdWith({ funnel: { AllowFunnel: { 'leo.ts.net:443': 'yes' } } }) }],
  ['funnel unknown shape', { command: cmdWith({ funnel: { AllowFunnel: null } }) }],
  ['authorized device offline', { command: cmdWith({ status: peerStatus({ Online: false, InNetworkMap: true, TailscaleIPs: [DEVICE_TAILNET_IP] }) }) }],
  ['authorized device not in network map', { command: cmdWith({ status: peerStatus({ Online: true, InNetworkMap: false, TailscaleIPs: [DEVICE_TAILNET_IP] }) }) }],
  ['authorized device mismatched/malformed tailnet IP', { command: cmdWith({ status: peerStatus({ Online: true, InNetworkMap: true, TailscaleIPs: ['8.8.8.8', 'not-an-ip'] }) }) }],
  ['configured id is only the server Self, no matching peer', { command: cmdWith({ status: { Self: { ID: DEVICE_ID, Online: true, InNetworkMap: true, TailscaleIPs: ['100.100.0.1'] }, Peer: {} } }) }],
  ['authorized device unreachable', { deviceReachabilityProbe: async () => ({ reachable: false }) }],
  ['public reachable', { publicDenyProbe: async () => ({ reachable: true }) }],
  ['non-loopback reachable', { nonLoopbackBindProbe: async () => ({ open: true }) }],
  ['malformed command output', { command: async () => ({ code: 0, stdout: 'not json{' }) }],
  ['command failure', { command: async () => ({ code: 1, stdout: '' }) }],
  ['stale per-fact observation', { clock: () => T - 10 * ACCESS_MAX_AGE }],
];
for (const [name, over] of ACCESS_NEGATIVES) {
  test(`IR-F1-D1(b): access negative — ${name} blocks RUNTIME_ACCESS_REQUIRED with no labels`, async () => {
    const { deps, lines } = baseDeps({ access: () => collectAccessEvidence(goodSeams(over), COLLECTOR_CFG) });
    const res = await runPrivateAcceptance(deps);
    assert.equal(res.status, 'BLOCKED');
    assert.equal(res.code, 'RUNTIME_ACCESS_REQUIRED');
    noVerified(lines);
    deps.db.close();
  });
}

test('IR-F1-D1(c): zero channel discoveries fails closed with no labels', async () => {
  const { deps, lines } = baseDeps({ feedTransport: fakeFeed(0) });
  assert.equal((await runPrivateAcceptance(deps)).status, 'FAIL');
  noVerified(lines);
  deps.db.close();
});

test('IR-F1-D1(f): an empty policy statement-code set blocks with POLICY_SNAPSHOT_REQUIRED and no labels', async () => {
  const { deps, lines } = baseDeps({}, { policyBad: 'empty-codes' });
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'BLOCKED');
  assert.equal(res.code, 'POLICY_SNAPSHOT_REQUIRED');
  noVerified(lines);
  deps.db.close();
});

test('IR-F1-D1(g): resolveAuditKey creates idempotently and rejects missing/symlink/wrong-mode/size/dir-mode', () => {
  const root = mkdtempSync(join(tmpdir(), 'vn-key-'));
  assert.throws(() => resolveAuditKey(root, { allowCreate: false }), (e: unknown) => e instanceof AuditKeyError && e.message === 'AUDIT_KEY_MISSING');
  const k1 = resolveAuditKey(root, { allowCreate: true });
  assert.equal(k1.length, 32);
  assert.deepEqual(resolveAuditKey(root, { allowCreate: false }), k1); // idempotent load
  const keyPath = join(root, 'private', KEY_FILE);
  chmodSync(keyPath, 0o644);
  assert.throws(() => resolveAuditKey(root, { allowCreate: false }), /AUDIT_KEY_MODE/);
  chmodSync(keyPath, 0o600);
  // wrong size
  const r2 = mkdtempSync(join(tmpdir(), 'vn-key-'));
  mkdirSync(join(r2, 'private'));
  chmodSync(join(r2, 'private'), 0o700);
  writeFileSync(join(r2, 'private', KEY_FILE), Buffer.alloc(16));
  chmodSync(join(r2, 'private', KEY_FILE), 0o600);
  assert.throws(() => resolveAuditKey(r2, { allowCreate: false }), /AUDIT_KEY_SIZE/);
  // symlink
  const r3 = mkdtempSync(join(tmpdir(), 'vn-key-'));
  mkdirSync(join(r3, 'private'));
  chmodSync(join(r3, 'private'), 0o700);
  symlinkSync('/etc/hostname', join(r3, 'private', KEY_FILE));
  assert.throws(() => resolveAuditKey(r3, { allowCreate: false }), /AUDIT_KEY_NOT_REGULAR/);
  // wrong dir mode
  const r4 = mkdtempSync(join(tmpdir(), 'vn-key-'));
  mkdirSync(join(r4, 'private'));
  chmodSync(join(r4, 'private'), 0o755);
  assert.throws(() => resolveAuditKey(r4, { allowCreate: false }), /AUDIT_KEY_DIR_MODE/);
});

test('IR-F1-D1(g): validateRoleBindings rejects device-token key, wrong key-id, absent credential, stale/future, duplicate role', () => {
  const { db, root } = migrated();
  const key = resolveAuditKey(root, { allowCreate: true });
  const ids = provisionRoleBindings(db, key, SELECTORS, T);
  assert.equal(validateRoleBindings(db, key, ids, SELECTORS, T, BINDING_FRESH).ok, true);
  assert.deepEqual(provisionRoleBindings(db, key, SELECTORS, T), ids); // idempotent
  // reusing the device-token hash as the audit key must not validate (wrong HMAC/config recompute)
  assert.equal(validateRoleBindings(db, DEVICE_TOKEN_KEY, ids, SELECTORS, T, BINDING_FRESH).ok, false);
  // a changed configured base surface (non-root path added) must not validate — the base path is bound, not just the origin
  const otherBase: RuntimeSelectors = { ...SELECTORS, deepseekEndpointOrigin: `${SELECTORS.deepseekEndpointOrigin}/v1` };
  const mm = validateRoleBindings(db, key, ids, otherBase, T, BINDING_FRESH);
  assert.equal(mm.builder, false);
  assert.equal(mm.verifier, false);
  assert.equal(mm.ok, false);
  // wrong audit_key_id can never be stored — the DB CHECK enforces the frozen id, so the wrong-key-id case
  // fails closed at the storage layer (defense in depth for validateRoleBindings' audit_key_id check)
  assert.throws(() => db.prepare('UPDATE provider_runtime_bindings SET audit_key_id = ? WHERE id = ?').run('wrong', ids.builderBindingId), /CHECK/);
  // absent credential
  db.prepare('UPDATE provider_runtime_bindings SET credential_present = 0 WHERE id = ?').run(ids.verifierBindingId);
  assert.equal(validateRoleBindings(db, key, ids, SELECTORS, T, BINDING_FRESH).verifier, false);
  db.prepare('UPDATE provider_runtime_bindings SET credential_present = 1 WHERE id = ?').run(ids.verifierBindingId);
  // stale + future verified_at
  assert.equal(validateRoleBindings(db, key, ids, SELECTORS, T + BINDING_FRESH + 1, BINDING_FRESH).ok, false);
  assert.equal(validateRoleBindings(db, key, ids, SELECTORS, T - 1, BINDING_FRESH).ok, false);
  // duplicate role (verifier id points at the builder row)
  const dup = validateRoleBindings(db, key, { builderBindingId: ids.builderBindingId, verifierBindingId: ids.builderBindingId, fishBindingId: ids.fishBindingId }, SELECTORS, T, BINDING_FRESH);
  assert.equal(dup.rolesDistinct, false);
  assert.equal(dup.ok, false);
  db.close();
});

test('IR-F1-D1(g): acceptance with bindings provisioned by the device-token hash blocks with no labels', async () => {
  const { deps, lines } = baseDeps({}, {}, DEVICE_TOKEN_KEY); // bindings provisioned with the device-token hash; deps.auditKey is the real separate key
  const res = await runPrivateAcceptance(deps);
  assert.equal(res.status, 'BLOCKED');
  assert.equal(res.code, 'RUNTIME_BINDING_REQUIRED');
  assert.match(lines.join('\n'), /RUNTIME_BINDING_BUILDER_VALID: false/);
  noVerified(lines);
  deps.db.close();
});

test('IR-F1-D1(g): re-provisioning refreshes verified_at so a still-valid binding never becomes permanently stale', () => {
  const { db, root } = migrated();
  const key = resolveAuditKey(root, { allowCreate: true });
  const ids = provisionRoleBindings(db, key, SELECTORS, T);
  const later = T + BINDING_FRESH + 1;
  assert.equal(validateRoleBindings(db, key, ids, SELECTORS, later, BINDING_FRESH).ok, false); // stale after the window
  assert.deepEqual(provisionRoleBindings(db, key, SELECTORS, later), ids); // re-provision (same ids) refreshes verified_at
  assert.equal(validateRoleBindings(db, key, ids, SELECTORS, later, BINDING_FRESH).ok, true);
  db.close();
});

test('IR-F1-D1(b): derivePublicDenial probes only global-unicast public targets and fails closed on none/reachable/ambiguous', async () => {
  assert.equal(isGlobalUnicastPublic('10.0.0.5'), false);
  assert.equal(isGlobalUnicastPublic('172.16.4.4'), false);
  assert.equal(isGlobalUnicastPublic('192.168.1.2'), false);
  assert.equal(isGlobalUnicastPublic('169.254.1.1'), false);
  assert.equal(isGlobalUnicastPublic('100.100.0.2'), false); // CGNAT/Tailscale
  assert.equal(isGlobalUnicastPublic('fd7a:115c:a1e0::1'), false); // IPv6 ULA
  assert.equal(isGlobalUnicastPublic('fe80::1'), false); // link-local
  assert.equal(isGlobalUnicastPublic('8.8.8.8'), true);
  assert.equal(isGlobalUnicastPublic('2606:4700::1111'), true);
  const refuse: (a: string) => Promise<ConnectProbeResult> = async () => 'refused';
  const open: (a: string) => Promise<ConnectProbeResult> = async () => 'open';
  const unknown: (a: string) => Promise<ConnectProbeResult> = async () => 'unknown';
  // private/CGNAT/link-local-only host -> no probeable public target -> missing probe fails closed (blocks)
  assert.deepEqual(await derivePublicDenial(['10.0.0.5', '100.100.0.2', 'fe80::1'], refuse), { reachable: true });
  assert.deepEqual(await derivePublicDenial(['8.8.8.8'], refuse), { reachable: false }); // positively denied
  assert.deepEqual(await derivePublicDenial(['8.8.8.8'], open), { reachable: true }); // reachable -> not denied
  assert.deepEqual(await derivePublicDenial(['8.8.8.8'], unknown), { reachable: true }); // ambiguous -> fail closed
});

test('IR-F1-D1(g): normalizeBaseSurface preserves a non-root base path and strips creds/query/fragment', () => {
  assert.equal(normalizeBaseSurface('https://api.deepseek.com'), 'https://api.deepseek.com');
  assert.equal(normalizeBaseSurface('https://api.deepseek.com/v1/'), 'https://api.deepseek.com/v1');
  assert.equal(normalizeBaseSurface('https://user:pass@api.deepseek.com/v1?k=1#f'), 'https://api.deepseek.com/v1');
});

// ---------------------------------------------------------------------------
// IR-F1-D1(g)-L: fail-closed audit-key/binding lifecycle (row count checked BEFORE key resolution/creation)
// ---------------------------------------------------------------------------
const keyPathOf = (root: string): string => join(root, 'private', KEY_FILE);
function rowSnapshot(db: Db): string {
  return JSON.stringify(
    db.prepare('SELECT id, provider_role, public_api_surface_id, audit_key_id, endpoint_origin_hmac, model_selector_hmac, reasoning_selector_hmac, reference_selector_hmac, config_version_hash, credential_present, verified_at FROM provider_runtime_bindings ORDER BY id').all(),
  );
}
function keyState(root: string): { exists: boolean; bytes: string | null; mode: number | null; symlink: boolean } {
  try {
    const st = lstatSync(keyPathOf(root));
    return { exists: true, bytes: st.isSymbolicLink() ? null : readFileSync(keyPathOf(root)).toString('hex'), mode: st.mode & 0o777, symlink: st.isSymbolicLink() };
  } catch {
    return { exists: false, bytes: null, mode: null, symlink: false };
  }
}
const rowCount = (db: Db): number => (db.prepare('SELECT COUNT(*) AS c FROM provider_runtime_bindings').get() as { c: number }).c;
// Bootstrap an existing-binding state via the same seam: zero rows -> creates the key + exactly three rows.
function bootstrapExisting(): { db: Db; root: string } {
  const { db, root } = migrated();
  const prep = prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH);
  assert.equal(prep.ok, true);
  assert.equal(rowCount(db), 3);
  return { db, root };
}

test('IR-F1-D1(g)-L: zero rows allow ONE initial key creation and three-role provisioning, then validate', () => {
  const { db, root } = migrated();
  assert.equal(keyState(root).exists, false);
  assert.equal(rowCount(db), 0);
  const prep = prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH);
  assert.equal(prep.ok, true);
  assert.ok(prep.key);
  assert.ok(prep.bindingIds);
  assert.equal(prep.key.length, 32);
  assert.equal(keyState(root).exists, true); // key created exactly once
  assert.equal(rowCount(db), 3); // one three-role provisioning
  assert.equal(validateRoleBindings(db, prep.key, prep.bindingIds, SELECTORS, T, BINDING_FRESH).ok, true);
  assert.deepEqual(loadRoleBindings(db, prep.key, SELECTORS), prep.bindingIds); // load-only lookup agrees
  db.close();
});

test('IR-F1-D1(g)-L: existing rows + missing key -> RUNTIME_BINDING_REQUIRED; key stays absent, no key created, rows unchanged', () => {
  const { db, root } = bootstrapExisting();
  rmSync(keyPathOf(root)); // lose the key, keep the rows
  const beforeRows = rowSnapshot(db);
  assert.equal(keyState(root).exists, false);
  const prep = prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH);
  assert.equal(prep.ok, false);
  assert.equal(prep.code, 'RUNTIME_BINDING_REQUIRED');
  assert.equal(keyState(root).exists, false); // no replacement key created
  assert.equal(rowCount(db), 3);
  assert.equal(rowSnapshot(db), beforeRows); // complete row snapshot unchanged
  db.close();
});

test('IR-F1-D1(g)-L: existing rows + invalid but correctly-sized key -> fail closed; exact key bytes and rows preserved', () => {
  const { db, root } = bootstrapExisting();
  const invalid = Buffer.alloc(32, 0x5a);
  writeFileSync(keyPathOf(root), invalid);
  chmodSync(keyPathOf(root), 0o600);
  const beforeRows = rowSnapshot(db);
  const beforeKey = keyState(root);
  const prep = prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH);
  assert.equal(prep.ok, false);
  assert.equal(prep.code, 'RUNTIME_BINDING_REQUIRED');
  assert.deepEqual(keyState(root), beforeKey); // key file not replaced or rotated
  assert.equal(readFileSync(keyPathOf(root)).toString('hex'), invalid.toString('hex'));
  assert.equal(rowSnapshot(db), beforeRows);
  db.close();
});

test('IR-F1-D1(g)-L: existing rows + symlinked/wrong-mode/wrong-size key each fail closed and preserve exact state', () => {
  // symlink
  {
    const { db, root } = bootstrapExisting();
    rmSync(keyPathOf(root));
    symlinkSync('/etc/hostname', keyPathOf(root));
    const beforeRows = rowSnapshot(db);
    const beforeKey = keyState(root);
    const prep = prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH);
    assert.equal(prep.ok, false);
    assert.equal(prep.code, 'RUNTIME_BINDING_REQUIRED');
    assert.deepEqual(keyState(root), beforeKey); // still the symlink, not replaced
    assert.equal(rowSnapshot(db), beforeRows);
    db.close();
  }
  // wrong mode
  {
    const { db, root } = bootstrapExisting();
    chmodSync(keyPathOf(root), 0o644);
    const beforeRows = rowSnapshot(db);
    const beforeKey = keyState(root);
    const prep = prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH);
    assert.equal(prep.ok, false);
    assert.equal(prep.code, 'RUNTIME_BINDING_REQUIRED');
    assert.deepEqual(keyState(root), beforeKey); // mode unchanged (0644), not rewritten
    assert.equal(rowSnapshot(db), beforeRows);
    db.close();
  }
  // wrong size
  {
    const { db, root } = bootstrapExisting();
    writeFileSync(keyPathOf(root), Buffer.alloc(16, 0x11));
    chmodSync(keyPathOf(root), 0o600);
    const beforeRows = rowSnapshot(db);
    const beforeKey = keyState(root);
    const prep = prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH);
    assert.equal(prep.ok, false);
    assert.equal(prep.code, 'RUNTIME_BINDING_REQUIRED');
    assert.deepEqual(keyState(root), beforeKey);
    assert.equal(rowSnapshot(db), beforeRows);
    db.close();
  }
});

test('IR-F1-D1(g)-L: existing rows + wrong KEY-FILE owner reach AUDIT_KEY_OWNER (dir owner passes) and fail closed; state preserved', () => {
  const { db, root } = bootstrapExisting();
  const beforeRows = rowSnapshot(db);
  const beforeKey = keyState(root);
  // Deterministic, no privileged chown: the injected key-owner seam maps the KEY FILE's observed owner UID to a
  // different value while the private DIRECTORY owner check sees the real UID and passes. This proves the resolver
  // reaches and rejects the key-file owner check specifically (AUDIT_KEY_OWNER), not only AUDIT_KEY_DIR_OWNER.
  assert.throws(
    () => resolveAuditKey(root, { allowCreate: false, keyOwnerUid: (u) => u + 7 }),
    (e: unknown) => e instanceof AuditKeyError && e.message === 'AUDIT_KEY_OWNER',
  );
  const prep = prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH, { keyOwnerUid: (u) => u + 7 });
  assert.equal(prep.ok, false);
  assert.equal(prep.code, 'RUNTIME_BINDING_REQUIRED');
  assert.deepEqual(keyState(root), beforeKey);
  assert.equal(rowSnapshot(db), beforeRows);
  // the same shared owner check passes with the real (default) key-owner metadata
  assert.equal(prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH).ok, true);
  db.close();
});

test('IR-F1-D1(g)-L: existing rows + a superfluous (extra) binding row fails closed with no provisioning/mutation', () => {
  const { db, root } = bootstrapExisting();
  // Insert a valid-shaped but extra row for a different config version (ambiguous table state).
  db.prepare("INSERT INTO provider_runtime_bindings (id, provider_role, public_api_surface_id, audit_key_id, endpoint_origin_hmac, model_selector_hmac, reasoning_selector_hmac, reference_selector_hmac, config_version_hash, credential_present, verified_at) VALUES ('extra','deepseek_builder','deepseek.post.chat-completions','provider-audit-hmac-v1','x','y',NULL,NULL,'other-config',1,?)").run(T);
  const beforeRows = rowSnapshot(db);
  const prep = prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH);
  assert.equal(prep.ok, false);
  assert.equal(prep.code, 'RUNTIME_BINDING_REQUIRED');
  assert.equal(rowCount(db), 4); // no fallback provisioning; the extra row is neither used nor removed
  assert.equal(rowSnapshot(db), beforeRows);
  db.close();
});

test('IR-F1-D1(g)-L: existing rows + correct valid key succeed repeatedly with same key, same row IDs, unchanged rows (load-only)', () => {
  const { db, root } = bootstrapExisting();
  const first = prepareAuditKeyAndBindings(db, root, SELECTORS, T, BINDING_FRESH);
  assert.equal(first.ok, true);
  assert.ok(first.key);
  assert.ok(first.bindingIds);
  const beforeRows = rowSnapshot(db);
  const second = prepareAuditKeyAndBindings(db, root, SELECTORS, T + 1000, BINDING_FRESH);
  assert.equal(second.ok, true);
  assert.ok(second.key);
  assert.ok(second.bindingIds);
  assert.deepEqual(second.bindingIds, first.bindingIds); // same row IDs
  assert.equal(second.key.toString('hex'), first.key.toString('hex')); // same key reused
  assert.equal(rowCount(db), 3);
  assert.equal(rowSnapshot(db), beforeRows); // load-only: no insert, rotation, or refresh mutation
  db.close();
});

const FIVE_LABEL_KEYS = ['PROVIDER_POLICY_ASSURANCE', 'LOCAL_DATA_CONTROLS: VERIFIED', 'PROVIDER_SIDE_DELETION', 'PROVIDER_SIDE_NO_TRAINING', 'PRODUCTION_PRIVACY_APPROVAL'];

test('IR-F1-D1(g)-L: acceptancePreflight (the seam main() uses) — a failing lifecycle never calls the downstream and emits only the blocked line', async () => {
  const { db, root } = bootstrapExisting();
  rmSync(keyPathOf(root)); // existing rows + missing key -> lifecycle fails closed
  const lines: string[] = [];
  let downstreamCalls = 0;
  const downstream = async (): Promise<AcceptanceResult> => {
    downstreamCalls += 1;
    return { status: 'PASS', code: 'OK', exitCode: 0, labelsEmitted: true };
  };
  const code = await acceptancePreflight({ db, stateDir: root, selectors: SELECTORS, now: T, freshnessMs: BINDING_FRESH, emit: (l) => lines.push(l), downstream });
  assert.equal(code, 2); // non-zero
  assert.equal(downstreamCalls, 0); // runPrivateAcceptance spy NOT called
  const out = lines.join('\n');
  assert.equal(out, 'LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_BINDING_REQUIRED'); // only the blocked line
  for (const label of FIVE_LABEL_KEYS) assert.ok(!out.includes(label), `no success label ${label}`);
  db.close();
});

test('IR-F1-D1(g)-L: acceptancePreflight — a valid lifecycle calls the downstream exactly once with the prepared key/bindings and propagates its exit code', async () => {
  const { db, root } = bootstrapExisting();
  const lines: string[] = [];
  let calls = 0;
  let seenLen = -1;
  let seenIds: BindingIds | null = null;
  const downstream = async (key: Buffer, bindingIds: BindingIds): Promise<AcceptanceResult> => {
    calls += 1;
    seenLen = key.length;
    seenIds = bindingIds;
    return { status: 'FAIL', code: 'DOWNSTREAM', exitCode: 1, labelsEmitted: false };
  };
  const code = await acceptancePreflight({ db, stateDir: root, selectors: SELECTORS, now: T, freshnessMs: BINDING_FRESH, emit: (l) => lines.push(l), downstream });
  assert.equal(calls, 1); // downstream invoked exactly once on lifecycle success
  assert.equal(code, 1); // downstream exit code propagated
  assert.equal(seenLen, 32); // real prepared key handed to the downstream
  assert.deepEqual(seenIds, loadRoleBindings(db, resolveAuditKey(root, { allowCreate: false }), SELECTORS));
  assert.equal(lines.length, 0); // the gate itself emits nothing on success
  db.close();
});

test('regression: never-passing verifier fails the slice, and a non-authorized source is rejected — both without labels', async () => {
  const a = baseDeps({ ports: { caption: captionFake(), builder: builderFake(), verifier: verifier(['REVISE', 'REVISE']), tts: ttsFake() } as PipelinePorts });
  assert.equal((await runPrivateAcceptance(a.deps)).status, 'FAIL');
  noVerified(a.lines);
  a.deps.db.close();
  const b = baseDeps({ videoId: 'wrongid1234' });
  const r = await runPrivateAcceptance(b.deps);
  assert.equal(r.status, 'BLOCKED');
  assert.equal(r.code, 'AUTHORIZED_SOURCE_REQUIRED');
  noVerified(b.lines);
  b.deps.db.close();
});
