// Concurrency-1 pipeline worker (설계문서/18 §9). Holds the singleton lease, claims jobs in fair
// order, and drives the full Builder->separate Verifier->Fish pipeline for each claimed job via the
// injected provider ports. The real adapters make provider/YouTube requests only at reviewed live
// acceptance; this pass never runs main() live. Provider secret values are read from env and never
// printed. buildPipelinePorts/processClaimedJobs are exported so synthetic tests drive the wiring
// with fake transports and a fake caption spawn — no network call.

import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConfig } from '../config';
import { openDatabase, type Db } from '../db/connection';
import { CaptionProvider, type CaptionSpawn } from '../providers/caption';
import { DeepSeekBuilderProvider, type Transport } from '../providers/deepseek-builder';
import { DeepSeekVerifierProvider } from '../providers/deepseek-verifier';
import { FishTtsProvider } from '../providers/fish-tts';
import {
  buildBuilderAggregatePayload,
  buildBuilderChunkPayload,
  buildVerifierPayload,
  runProcessingJob,
  type PipelineContext,
  type PipelinePorts,
} from '../services/processing';
import { acquireWorkerLease, claimNextJob, heartbeatWorkerLease, WORKER_LEASE_MS } from '../services/scheduler';

const OWNER = randomUUID();
const GUARD_VERSION = 'd009a.guard.v1';

// Versioned prompt scaffolds (not secrets, not references). The provider adapters attach model
// selectors and auth headers; the semantic payload here carries only allowlisted public fields.
const BUILDER_CHUNK_SYSTEM = 'Summarize this public YouTube caption chunk into the strict builder-chunk-output.v1 JSON. Only cite evidence refs present in the chunk. Return JSON only.';
const BUILDER_AGG_SYSTEM = 'Aggregate the chunk outputs into the strict builder-output.v1 JSON briefing with a Korean audio script grounded only in the provided evidence refs. Return JSON only.';
const VERIFIER_SYSTEM = 'Independently verify the candidate briefing against the evidence pack and return the strict verifier-output.v1 JSON with per-dimension scores and any critical failures. Return JSON only.';

export interface WorkerProviderConfig {
  ytdlpBinary: string;
  captionTempRoot: string;
  stagingDir: string;
  deepseek: { apiKey: string; baseUrl: string; builderModel: string; verifierModel: string; verifierReasoningEffort: string };
  fish: { apiKey: string; model: string; baseUrl?: string };
}

export interface WorkerTestHooks {
  captionSpawn?: CaptionSpawn;
  builderTransport?: Transport;
  verifierTransport?: Transport;
  fishTransport?: Transport;
}

/** Constructs the real provider adapters and wraps them as the pipeline ports. Injected hooks let a
 *  test drive the exact same wiring with fakes; without hooks the adapters use their live defaults. */
export function buildPipelinePorts(cfg: WorkerProviderConfig, hooks: WorkerTestHooks = {}): PipelinePorts {
  const caption = new CaptionProvider({ ytdlpBinary: cfg.ytdlpBinary, tempRoot: cfg.captionTempRoot }, hooks.captionSpawn);
  const builder = new DeepSeekBuilderProvider(
    { apiKey: cfg.deepseek.apiKey, baseUrl: cfg.deepseek.baseUrl, model: cfg.deepseek.builderModel },
    hooks.builderTransport,
  );
  const verifier = new DeepSeekVerifierProvider(
    { apiKey: cfg.deepseek.apiKey, baseUrl: cfg.deepseek.baseUrl, model: cfg.deepseek.verifierModel, reasoningEffort: cfg.deepseek.verifierReasoningEffort },
    hooks.verifierTransport,
  );
  const fish = new FishTtsProvider(
    { apiKey: cfg.fish.apiKey, model: cfg.fish.model, stagingDir: cfg.stagingDir, ...(cfg.fish.baseUrl ? { baseUrl: cfg.fish.baseUrl } : {}) },
    hooks.fishTransport,
  );

  return {
    caption,
    builder: {
      // One request per chunk, then the aggregate/revision — the pipeline guards and audits each.
      async buildChunk(input, ctx) {
        const payload = buildBuilderChunkPayload(input.meta, { chunkId: input.chunk.chunkId, evidenceRefs: input.chunk.evidenceRefs, text: input.chunk.text }, { promptVersion: 'builder.chunk.youtube-mvp.v1', schemaVersion: 'builder-chunk-output.v1' });
        return builder.buildChunk(payload, BUILDER_CHUNK_SYSTEM, ctx);
      },
      async buildAggregate(input, ctx) {
        const payload = buildBuilderAggregatePayload(input.meta, input.chunkOutputs, { promptVersion: 'builder.aggregate.youtube-mvp.v1', schemaVersion: 'builder-output.v1' }, input.revision);
        return builder.buildAggregate(payload, BUILDER_AGG_SYSTEM, ctx);
      },
    },
    verifier: {
      async verify(input, ctx) {
        // Independent selector/prompt/schema; the two-attempt maximum is enforced by the caller.
        const payload = buildVerifierPayload(
          input.meta,
          input.candidate,
          input.evidencePack.map((c) => ({ chunkId: c.chunkId, evidenceRefs: c.evidenceRefs, text: c.text })),
          input.attempt,
          { promptVersion: 'verifier.youtube-mvp.v1', schemaVersion: 'verifier-output.v1' },
        );
        return verifier.verify(payload, VERIFIER_SYSTEM, ctx);
      },
    },
    tts: {
      async synthesize(input, ctx) {
        return fish.synthesize({ language: 'ko', format: 'mp3', speed: 1, referenceId: input.referenceId, segments: input.segments }, ctx);
      },
    },
  };
}

export interface PipelineEvidenceLoad {
  evidence: PipelineContext['evidence'];
  runtimeBindingValid: boolean;
}

/** Loads the current provider policy snapshots and runtime bindings the pipeline audits reference.
 *  Returns null when acceptance has not yet provisioned them, so the worker processes nothing. */
export function loadPipelineEvidence(db: Db): PipelineEvidenceLoad | null {
  const policy = (provider: string) =>
    db.prepare("SELECT id FROM provider_policy_snapshots WHERE provider = ? AND lookup_status = 'retrieved' ORDER BY reviewed_at DESC LIMIT 1").get(provider) as { id: string } | undefined;
  const binding = (role: string) =>
    db.prepare('SELECT id FROM provider_runtime_bindings WHERE provider_role = ? AND credential_present = 1 ORDER BY verified_at DESC LIMIT 1').get(role) as { id: string } | undefined;
  const ds = policy('deepseek');
  const fish = policy('fish_audio');
  const b = binding('deepseek_builder');
  const v = binding('deepseek_verifier');
  const f = binding('fish_tts');
  if (!ds || !fish || !b || !v || !f) return null;
  return {
    evidence: { deepseekPolicySnapshotId: ds.id, fishPolicySnapshotId: fish.id, builderBindingId: b.id, verifierBindingId: v.id, fishBindingId: f.id },
    runtimeBindingValid: true,
  };
}

export interface ProcessOptions {
  owner: string;
  now: number;
  audioDir: string;
  stagingDir: string;
  referenceId: string;
  guardVersion: string;
  evidence: PipelineContext['evidence'];
  runtimeBindingValid: boolean;
  maxJobs?: number;
}

/** Drains currently-eligible jobs once through the pipeline, heartbeating the lease between claims.
 *  A job is processed at most once per pass (guards against a same-tick re-claim of a deferred job);
 *  restart recovery reclaims expired leases via claimNextJob's expired-lease path on the next run. */
export async function processClaimedJobs(db: Db, ports: PipelinePorts, opts: ProcessOptions): Promise<string[]> {
  const processed: string[] = [];
  const seen = new Set<string>();
  const limit = opts.maxJobs ?? Number.MAX_SAFE_INTEGER;
  while (processed.length < limit) {
    heartbeatWorkerLease(db, opts.owner, opts.now);
    const claimed = claimNextJob(db, opts.owner, opts.now);
    if (!claimed || seen.has(claimed.id)) break;
    seen.add(claimed.id);
    try {
      const jobId = claimed.id;
      const ctx: PipelineContext = {
        now: opts.now,
        audioDir: opts.audioDir,
        stagingDir: opts.stagingDir,
        referenceId: opts.referenceId,
        guardVersion: opts.guardVersion,
        runtimeBindingValid: opts.runtimeBindingValid,
        evidence: opts.evidence,
        // Refresh the real clock and heartbeat the singleton + this job's lease across long calls.
        heartbeat: () => {
          const t = Date.now();
          heartbeatWorkerLease(db, opts.owner, t);
          db.prepare('UPDATE processing_jobs SET lease_expires_at = ?, lease_heartbeat_at = ?, updated_at = ? WHERE id = ? AND lease_owner = ?').run(t + WORKER_LEASE_MS, t, t, jobId, opts.owner);
          return t;
        },
      };
      await runProcessingJob(db, jobId, ports, ctx);
    } catch {
      // runProcessingJob sets a safe terminal/deferred state internally; isolate any residual throw
      // so one job cannot stop the drain.
    }
    processed.push(claimed.id);
  }
  return processed;
}

function providerConfigFromEnv(stateDir: string, ytdlpBinary: string): WorkerProviderConfig {
  const env = process.env;
  const req = (k: string): string => {
    const v = env[k];
    if (!v) throw new Error(`MISSING_ENV:${k}`);
    return v;
  };
  return {
    ytdlpBinary,
    captionTempRoot: join(stateDir, 'caption-temp'),
    stagingDir: join(stateDir, 'staging'),
    deepseek: {
      apiKey: req('DEEPSEEK_API_KEY'),
      baseUrl: req('DEEPSEEK_BASE_URL'),
      builderModel: req('DEEPSEEK_BUILDER_MODEL'),
      verifierModel: req('DEEPSEEK_VERIFIER_MODEL'),
      verifierReasoningEffort: req('DEEPSEEK_VERIFIER_REASONING_EFFORT'),
    },
    fish: { apiKey: req('FISH_API_KEY'), model: req('FISH_TTS_MODEL') },
  };
}

async function main(): Promise<void> {
  const cfg = loadConfig(process.env);
  const db = openDatabase(join(cfg.stateDir, 'db', 'vibenews.sqlite3'));
  const now = Date.now();
  if (!acquireWorkerLease(db, OWNER, now)) {
    process.stdout.write('WORKER_LEASE_HELD_BY_OTHER\n');
    return;
  }
  heartbeatWorkerLease(db, OWNER, now);
  const evidence = loadPipelineEvidence(db);
  if (!evidence) {
    process.stdout.write(`WORKER_READY owner=${OWNER} provider_evidence=absent processed=0\n`);
    return;
  }
  const providerCfg = providerConfigFromEnv(cfg.stateDir, cfg.ytdlpBinary);
  const ports = buildPipelinePorts(providerCfg);
  const processed = await processClaimedJobs(db, ports, {
    owner: OWNER,
    now,
    audioDir: join(cfg.stateDir, 'audio'),
    stagingDir: providerCfg.stagingDir,
    referenceId: process.env.FISH_REFERENCE_ID ?? '',
    guardVersion: GUARD_VERSION,
    evidence: evidence.evidence,
    runtimeBindingValid: evidence.runtimeBindingValid,
  });
  process.stdout.write(`WORKER_DONE owner=${OWNER} processed=${processed.length}\n`);
}

const HERE = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) || process.argv[1].startsWith(join(HERE, 'worker')))) {
  void main();
}
