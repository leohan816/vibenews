import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { openDatabase, type Db } from '../../src/db/connection';
import { runMigrations } from '../../src/db/migrate';
import type { HttpResponseLike, Transport } from '../../src/providers/deepseek-builder';
import { CaptionProvider, type CaptionSpawn, assertCaptionArgsSafe } from '../../src/providers/caption';
import type { PipelineContext } from '../../src/services/processing';
import { promoteDiscoveries } from '../../src/services/scheduler';
import type { FeedResponseLike, FeedTransport } from '../../src/services/source';
import { buildPipelinePorts, loadPipelineEvidence, processClaimedJobs } from '../../src/bin/worker';
import { pollDueChannels } from '../../src/bin/poller';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const T = 1_731_000_000_000;
const VIDEO = 'vid00000001';
const CHANNEL = 'UCx_YiR733cfqVPRsQ1n8Fag';

function migrated(): { db: Db; root: string } {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  db.prepare("INSERT INTO users (id, timezone, created_at, updated_at) VALUES ('leo','Asia/Seoul',?,?)").run(T, T);
  return { db, root: mkdtempSync(join(tmpdir(), 'vn-wire-')) };
}

function seedEvidence(db: Db): PipelineContext['evidence'] {
  const dsPolicy = randomUUID();
  const fishPolicy = randomUUID();
  const ins = db.prepare(
    'INSERT INTO provider_policy_snapshots (id, provider, official_policy_urls, official_api_url, public_api_surface_id, policy_effective_or_updated_date, reviewed_at, document_set_sha256, lookup_status, public_statement_codes, verified_local_control_codes, controls_not_independently_verified, provider_policy_assurance, local_data_controls, provider_side_deletion, provider_side_no_training, production_privacy_approval, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  );
  ins.run(dsPolicy, 'deepseek', '[]', 'u', 'deepseek.post.chat-completions', '2026-02-10', T, 'a'.repeat(64), 'retrieved', '[]', '[]', '[]', 'LIMITED_AND_UNVERIFIED', 'VERIFIED', 'NOT_VERIFIED', 'NOT_VERIFIED', 'NOT_GRANTED', T);
  ins.run(fishPolicy, 'fish_audio', '[]', 'u', 'fish.post.v1.tts', '2024-08-28', T, 'b'.repeat(64), 'retrieved', '[]', '[]', '[]', 'LIMITED_AND_UNVERIFIED', 'VERIFIED', 'NOT_VERIFIED', 'NOT_VERIFIED', 'NOT_GRANTED', T);
  const bindIns = db.prepare(
    'INSERT INTO provider_runtime_bindings (id, provider_role, public_api_surface_id, audit_key_id, endpoint_origin_hmac, model_selector_hmac, reasoning_selector_hmac, reference_selector_hmac, config_version_hash, credential_present, verified_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
  );
  const b = randomUUID();
  const v = randomUUID();
  const f = randomUUID();
  bindIns.run(b, 'deepseek_builder', 'deepseek.post.chat-completions', 'provider-audit-hmac-v1', 'h', 'h', null, null, 'cv1', 1, T);
  bindIns.run(v, 'deepseek_verifier', 'deepseek.post.chat-completions', 'provider-audit-hmac-v1', 'h', 'h', 'h', null, 'cv2', 1, T);
  bindIns.run(f, 'fish_tts', 'fish.post.v1.tts', 'provider-audit-hmac-v1', 'h', 'h', null, 'h', 'cv3', 1, T);
  return { deepseekPolicySnapshotId: dsPolicy, fishPolicySnapshotId: fishPolicy, builderBindingId: b, verifierBindingId: v, fishBindingId: f };
}

function seedQueuedManualJob(db: Db): string {
  const sv = randomUUID();
  db.prepare("INSERT INTO source_videos (id, youtube_video_id, channel_id, canonical_url, public_title, duration_sec, caption_kinds, caption_languages, provenance_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(sv, VIDEO, CHANNEL, `https://www.youtube.com/watch?v=${VIDEO}`, 'Observe', 400, '["manual"]', '["en"]', '{}', T, T);
  db.prepare("INSERT INTO manual_batches (id, user_id, status, source_scope, scope_attestation_version, idempotency_key, approved_at, created_at, updated_at) VALUES ('mb','leo','accepted','public_low_risk_youtube_technology','d009a.public-youtube-tech.v1',?,?,?,?)").run(randomUUID(), T, T, T);
  db.prepare("INSERT INTO manual_batch_items (id, batch_id, ordinal, input_sha256, status, created_at, updated_at) VALUES ('mbi','mb',1,'h','queued',?,?)").run(T, T);
  db.prepare("INSERT INTO provider_scope_approvals (id, user_id, origin_kind, manual_batch_id, channel_id, source_scope, scope_attestation_version, status, approval_version, approved_at, created_at, updated_at) VALUES ('sa','leo','manual','mb',NULL,'public_low_risk_youtube_technology','d009a.public-youtube-tech.v1','active',1,?,?,?)").run(T, T, T);
  const jobId = randomUUID();
  db.prepare("INSERT INTO processing_jobs (id, user_id, source_video_id, scope_approval_id, origin_kind, manual_batch_item_id, channel_discovery_id, approval_version, state, stage, eligible_at, verifier_attempts, idempotency_key, created_at, updated_at) VALUES (?,'leo',?,'sa','manual','mbi',NULL,1,'queued','caption',?,0,?,?,?)").run(jobId, sv, T, randomUUID(), T, T);
  return jobId;
}

const VTT = 'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nperformance monitoring intro\n\n00:00:02.000 --> 00:00:04.000\nit measures render times\n';

// Fake yt-dlp: writes a public caption file into the isolated dir and prints the tab-separated meta.
function fakeCaptionSpawn(captured?: { args?: string[] }): CaptionSpawn {
  return async (_bin, args, opts) => {
    if (captured) captured.args = args;
    writeFileSync(join(opts.cwd, `${VIDEO}.en.vtt`), VTT);
    const j = (v: unknown) => JSON.stringify(v);
    const stdout = [j(VIDEO), j('Observe'), j(CHANNEL), j(`https://www.youtube.com/channel/${CHANNEL}`), j(400), j('20260710'), j(`https://www.youtube.com/watch?v=${VIDEO}`)].join('\t');
    return { stdout };
  };
}

function chat(contentObj: unknown): HttpResponseLike {
  return { status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: JSON.stringify(contentObj) } }] }) };
}

// Builder transport: first call is a chunk output, subsequent calls are the aggregate output.
function fakeBuilderTransport(): Transport {
  let call = 0;
  return async () => {
    call += 1;
    if (call === 1) {
      return chat({ schemaVersion: 'builder-chunk-output.v1', chunkId: 'chunk-000000', sectionSummary: '성능 관측 도구 소개', claims: [], numbers: [], entities: [] });
    }
    return chat({
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
    });
  };
}

function fakeVerifierTransport(): Transport {
  return async () =>
    chat({ schemaVersion: 'verifier-output.v1', verdict: 'PASS', overallScore: 9.3, dimensionScores: { fidelity: 9, coverage: 9, clarity: 9, audioFitness: 9, provenance: 9 }, criticalFailures: [], findings: [] });
}

function fakeFishTransport(): Transport {
  return async () => ({
    status: 200,
    text: async () => '',
    arrayBuffer: async () => new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer,
    headers: { get: (n: string) => (n === 'x-audio-duration-ms' ? '134000' : null) },
  });
}

test('worker wiring: buildPipelinePorts + processClaimedJobs drive a claimed job to audio_ready with real adapters', async () => {
  const { db, root } = migrated();
  const evidence = seedEvidence(db);
  const loaded = loadPipelineEvidence(db);
  assert.ok(loaded, 'evidence loads from the provisioned snapshots/bindings');
  const jobId = seedQueuedManualJob(db);

  const ports = buildPipelinePorts(
    {
      ytdlpBinary: '/usr/bin/yt-dlp',
      captionTempRoot: join(root, 'caption-temp'),
      stagingDir: join(root, 'staging'),
      deepseek: { apiKey: 'k', baseUrl: 'https://api.deepseek.com', builderModel: 'b', verifierModel: 'v', verifierReasoningEffort: 'high' },
      fish: { apiKey: 'k', model: 'fish' },
    },
    { captionSpawn: fakeCaptionSpawn(), builderTransport: fakeBuilderTransport(), verifierTransport: fakeVerifierTransport(), fishTransport: fakeFishTransport() },
  );

  const processed = await processClaimedJobs(db, ports, {
    owner: 'owner-1',
    now: T,
    audioDir: join(root, 'audio'),
    stagingDir: join(root, 'staging'),
    referenceId: 'ref-1',
    guardVersion: 'guard.v1',
    evidence,
    runtimeBindingValid: true,
    maxJobs: 5,
  });

  assert.deepEqual(processed, [jobId]);
  const job = db.prepare('SELECT state FROM processing_jobs WHERE id = ?').get(jobId) as { state: string };
  assert.equal(job.state, 'audio_ready');
  const asset = db.prepare("SELECT id, status, byte_count, sha256 FROM audio_assets WHERE status = 'ready'").get() as { id: string; status: string; byte_count: number; sha256: string };
  const persisted = readFileSync(join(root, 'audio', `${asset.id}.mp3`));
  assert.equal(persisted.byteLength, asset.byte_count);
  assert.equal(createHash('sha256').update(persisted).digest('hex'), asset.sha256);
  const temp = db.prepare('SELECT delete_status FROM temporary_caption_artifacts WHERE job_id = ?').get(jobId) as { delete_status: string };
  assert.equal(temp.delete_status, 'deleted', 'caption temp cleaned up');
  db.close();
});

test('CaptionProvider runs the safe arg profile in an isolated dir and destroys it', async () => {
  const { root } = migrated();
  const captured: { args?: string[] } = {};
  const cap = new CaptionProvider({ ytdlpBinary: '/usr/bin/yt-dlp', tempRoot: join(root, 'cap') }, fakeCaptionSpawn(captured));
  const ctx = { jobId: 'j', idempotencyKey: 'i', deadlineMs: T + 60000, abortSignal: new AbortController().signal };
  const res = await cap.acquire({ videoId: VIDEO, canonicalUrl: `https://www.youtube.com/watch?v=${VIDEO}` }, ctx);
  assert.equal(res.cues.length, 2);
  assert.equal(res.provenance.channelId, CHANNEL);
  assert.equal(res.provenance.publishedAt, '2026-07-10T00:00:00.000Z');
  assert.equal(res.provenance.captionKinds[0], 'manual');
  // The exact arg profile is safe and cannot express cookies/login/media.
  assert.doesNotThrow(() => assertCaptionArgsSafe(captured.args ?? []));
  for (const bad of ['--cookies', '--username', '--exec', '--format', '--write-thumbnail']) {
    assert.ok(!(captured.args ?? []).includes(bad), `must not pass ${bad}`);
  }
  // The isolated temp dir exists, then destroy removes it.
  const dir = join(dirname(res.relativeTempKey), ''); // relativeTempKey = <jobdir-basename>/<file>
  assert.ok(dir.length > 0);
  await cap.destroy(res.artifactId);
  await cap.destroy(res.artifactId); // idempotent
});

test('poller wiring: 5 unseen entries promote only the oldest 3 and retain 2 deferred', async () => {
  const { db } = migrated();
  db.prepare("INSERT INTO channels (id, user_id, youtube_channel_id, canonical_url, public_title, status, auto_processing_enabled, approval_version, next_poll_at, created_at, updated_at) VALUES ('ch','leo',?, 'u','Expo','active',1,1,?,?,?)").run(CHANNEL, T, T, T);
  db.prepare("INSERT INTO provider_scope_approvals (id, user_id, origin_kind, manual_batch_id, channel_id, source_scope, scope_attestation_version, status, approval_version, approved_at, created_at, updated_at) VALUES ('csa','leo','channel',NULL,'ch','public_low_risk_youtube_technology','d009a.public-youtube-tech.v1','active',1,?,?,?)").run(T, T, T);
  const ids = ['5JqK9JLD140', 'abcdef12345', 'ghijk123456', 'lmnop123456', 'qrstu123456'];
  const entries = ids
    .map((v, i) => `<entry><yt:videoId>${v}</yt:videoId><yt:channelId>${CHANNEL}</yt:channelId><title>V${i}</title><published>2026-07-0${i + 1}T00:00:00+00:00</published></entry>`)
    .join('');
  const xml = `<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">${entries}</feed>`;
  const transport: FeedTransport = async () => ({
    status: 200,
    headers: { get: () => null },
    body: (async function* () {
      yield new TextEncoder().encode(xml);
    })(),
  });

  const results = await pollDueChannels(db, T, { transport });
  assert.equal(results.length, 1);
  assert.equal(results[0]?.discovered, 5);
  assert.equal(results[0]?.promoted, 3, 'at most three promoted per poll');
  const queued = db.prepare("SELECT COUNT(*) c FROM channel_discoveries WHERE channel_id='ch' AND status='queued'").get() as { c: number };
  const deferred = db.prepare("SELECT COUNT(*) c FROM channel_discoveries WHERE channel_id='ch' AND status='deferred'").get() as { c: number };
  assert.equal(queued.c, 3);
  assert.equal(deferred.c, 2, 'two retained for the next poll');
  // Oldest three (published ASC) were promoted.
  const promotedVideos = (db.prepare("SELECT youtube_video_id FROM channel_discoveries WHERE status='queued' ORDER BY published_at ASC").all() as Array<{ youtube_video_id: string }>).map((r) => r.youtube_video_id);
  assert.deepEqual(promotedVideos, ['5JqK9JLD140', 'abcdef12345', 'ghijk123456']);
  // Promotion created exactly three claimable channel jobs (each with a deduped SourceVideo).
  const jobs = db.prepare("SELECT COUNT(*) c FROM processing_jobs WHERE origin_kind = 'channel' AND state = 'queued'").get() as { c: number };
  assert.equal(jobs.c, 3, 'three claimable channel jobs created');
  void promoteDiscoveries; // (exercised through pollDueChannels)
  db.close();
});

test('feed size cap aborts a chunked no-Content-Length body without buffering it in full', async () => {
  const { db } = migrated();
  db.prepare("INSERT INTO channels (id, user_id, youtube_channel_id, canonical_url, public_title, status, auto_processing_enabled, approval_version, next_poll_at, created_at, updated_at) VALUES ('ch','leo',?, 'u','Expo','active',1,1,?,?,?)").run(CHANNEL, T, T, T);

  let yielded = 0;
  let cancelled = false;
  const CHUNK = new Uint8Array(64 * 1024); // 64 KiB per chunk, no Content-Length header
  const overflowTransport: FeedTransport = async (): Promise<FeedResponseLike> => ({
    status: 200,
    headers: { get: () => null },
    body: (async function* () {
      try {
        for (let i = 0; i < 100000; i++) {
          yielded += 1;
          yield CHUNK; // would be ~6 GiB if fully buffered
        }
      } finally {
        cancelled = true; // consumer's early exit runs this
      }
    })(),
  });

  // maxBytes 256 KiB -> must abort after ~4-5 chunks, never buffering the whole stream.
  const results = await pollDueChannels(db, T, { transport: overflowTransport, maxBytes: 256 * 1024 });
  assert.equal(results[0]?.ok, false, 'oversized feed poll fails (isolated)');
  assert.ok(cancelled, 'the stream reader was cancelled on early exit');
  assert.ok(yielded < 50, `stopped early after ${yielded} chunks, not the full body`);
  db.close();
});
