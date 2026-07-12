// Real, fail-closed private acceptance runner (설계문서/18 §4.2, §8.2, §14.1, §14.4, §15, §16.1, §16.3).
// The normal CLI path uses only validated non-secret runtime config, the frozen server-only provider
// audit key, the real DB/providers/services/HTTP handler, and produces the frozen §14.4 evidence from
// OBSERVABLE, structurally-verified, job-bound evidence — never a constant, tautology, bare operator
// boolean, generic-tailnet inference, permissive empty record, precomputed flag, or the device bearer
// token as HMAC material. Live YouTube/DeepSeek/Fish/tailnet execution happens only when an operator
// later supplies real prerequisites; missing/invalid/stale evidence fails closed with a truthful
// non-zero NOT_RUN/BLOCKED and NEVER a public/mock/synthetic/sentinel fallback. It never opens
// .env.server.local, never prints any secret/key/model/reference/selector/HMAC/URL/host/route/device-id
// value, and emits only safe fixed source codes, statuses, counts, dates, digests, and timestamps. The
// five D-009-A labels are emitted only after every local gate passes.
//
// runPrivateAcceptance()/collectAccessEvidence()/resolveAuditKey()/provisionRoleBindings()/
// validateRoleBindings() are dependency-injected/exported so the synthetic test drives the exact same
// real paths with injected command/probe seams, isolated temp key paths, and no live call.

import { execFile } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { chmodSync, closeSync, constants as fsConstants, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, writeSync } from 'node:fs';
import { createConnection } from 'node:net';
import { networkInterfaces } from 'node:os';
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
import { buildPipelinePorts } from './worker';
import { buildApp } from './api';

// The single authorized official low-risk source frozen in §15.
export const AUTHORIZED_VIDEO_ID = '5JqK9JLD140';
export const AUTHORIZED_CHANNEL_ID = 'UCx_YiR733cfqVPRsQ1n8Fag';
export const ADAPTER_SCHEMA_VERSION = 'youtube-mvp.v1';
export const AUDIT_KEY_ID = 'provider-audit-hmac-v1';
export const AUDIT_KEY_FILE = 'provider-audit-hmac-v1.key';
const AUDIT_KEY_BYTES = 32;
const GATE_MIN_SCORE = 9.0;
const HOUR_MS = 60 * 60 * 1000;
const DEFAULT_ACCESS_MAX_AGE_MS = 5 * 60 * 1000;
const BINDING_FRESHNESS_MS = 30 * 24 * 60 * 60 * 1000;
const FORBIDDEN_RAW_RE = /\.(vtt|srt|sbv|ttml|txt|mp4|webm|mkv|mov|avi|m4v|ts|flv)$/i;

const sha8 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 8);

export interface AccessEvidence {
  status: 'ok' | 'denied' | 'failed';
  observedAt: number;
  source: string; // safe fixed source code, never an IP/host/route/device-id
  digest: string; // digest of canonical redacted fields, never raw output
}
export interface AccessEvidenceSet {
  loopbackBind: AccessEvidence;
  tailnetServeHttps: AccessEvidence;
  authorizedDeviceGrant: AccessEvidence;
  funnelDisabled: AccessEvidence;
  publicDenied: AccessEvidence;
}
export type AccessObserver = (now: number) => Promise<AccessEvidenceSet>;

export interface RuntimeSelectors {
  deepseekEndpointOrigin: string; // normalized configured base URL surface (scheme+host+path, no creds/query/fragment)
  builderModel: string;
  verifierModel: string;
  verifierReasoning: string;
  fishEndpointOrigin: string; // normalized configured base URL surface
  fishModel: string;
  fishReference: string;
}

/** Normalizes a configured base URL to its bindable surface: scheme + host(+port) + path, with any trailing
 *  slash removed and NO userinfo/query/fragment. Preserves a non-root base path (e.g. /v1) that URL.origin drops. */
export function normalizeBaseSurface(raw: string): string {
  const u = new URL(raw);
  const path = u.pathname.replace(/\/+$/, '');
  return `${u.protocol}//${u.host}${path}`;
}

export interface AcceptanceDeps {
  config: ServerConfig;
  db: Db;
  ports: PipelinePorts;
  evidence: PipelineEvidence;
  access: AccessObserver;
  accessMaxAgeMs: number;
  clock: () => number; // sampled AFTER per-fact access collection to bound freshness truthfully
  feedTransport: FeedTransport;
  audioDir: string;
  stagingDir: string;
  captionTempRoot: string;
  referenceId: string;
  guardVersion: string;
  auditKey: Buffer; // the loaded frozen server-only key; never printed
  selectors: RuntimeSelectors;
  now: number;
  videoId: string;
  channelId: string;
  emit: (line: string) => void;
}

export interface AcceptanceResult {
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  code: string;
  exitCode: number;
  labelsEmitted: boolean;
}

function arg(name: string): string | null {
  const argv = process.argv.slice(2);
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? (argv[i + 1] as string) : null;
}

// ---------------------------------------------------------------------------
// IR-F1-D1(b): dedicated per-fact observable access collector (seam-injectable)
// ---------------------------------------------------------------------------
export interface AccessCommandResult {
  code: number;
  stdout: string;
}
export interface AccessSeams {
  clock: () => number;
  command: (bin: string, args: string[]) => Promise<AccessCommandResult>; // read-only status commands
  loopbackHealthProbe: (host: string, port: number) => Promise<{ status: number | null }>;
  nonLoopbackBindProbe: (port: number) => Promise<{ open: boolean }>; // dedicated bounded probe; must observe closed
  deviceReachabilityProbe: (target: string) => Promise<{ reachable: boolean }>; // dedicated reachability probe against a validated tailnet IP derived from the matched device record
  publicDenyProbe: () => Promise<{ reachable: boolean }>; // dedicated bounded probe; must observe unreachable
}
export interface AccessCollectorConfig {
  apiPort: number;
  bindHost: string;
  authorizedDeviceId: string; // configured Leo device identity; never emitted
}

// Proves a Tailscale Serve HTTPS listener (a TLS :443 site entry) whose handler proxies to the exact
// loopback API port — not merely any Web proxy. A non-443 listener or malformed Web map fails closed.
function serveTargetsLoopbackPort(j: unknown, apiPort: number): boolean {
  const web = (j as { Web?: unknown })?.Web;
  if (!web || typeof web !== 'object' || Array.isArray(web)) return false;
  for (const [siteKey, siteRaw] of Object.entries(web as Record<string, unknown>)) {
    if (!/:443$/.test(siteKey)) continue; // require the HTTPS (TLS 443) Serve listener
    const handlers = (siteRaw as { Handlers?: unknown })?.Handlers;
    if (!handlers || typeof handlers !== 'object' || Array.isArray(handlers)) continue;
    for (const hRaw of Object.values(handlers as Record<string, unknown>)) {
      const proxy = typeof (hRaw as { Proxy?: unknown })?.Proxy === 'string' ? (hRaw as { Proxy: string }).Proxy : '';
      if (/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\]):\d+/.test(proxy) && new RegExp(`:${apiPort}(/|$)`).test(proxy)) return true;
    }
  }
  return false;
}
interface TsNode {
  ID?: unknown;
  Online?: unknown;
  InNetworkMap?: unknown;
  TailscaleIPs?: unknown;
}
// The authorized device is a DISTINCT online peer, never the server's own Self node. Strictly matches the
// configured device ID among Peers (online, in-network-map) and returns ONE validated Tailscale IP from that
// SAME peer for the reachability probe — not merely an 'Online' flag, and not Self. Returns null (grant fails
// closed) if unmatched, matched only by Self, or no valid tailnet IP is present. IP is never emitted.
function authorizedGrantedTailnetIp(j: unknown, deviceId: string): string | null {
  const peers = (j as { Peer?: Record<string, TsNode> })?.Peer;
  if (!peers || typeof peers !== 'object' || Array.isArray(peers)) return null;
  for (const p of Object.values(peers)) {
    if (p.ID !== deviceId || p.Online !== true || p.InNetworkMap !== true || !Array.isArray(p.TailscaleIPs)) continue;
    for (const ip of p.TailscaleIPs) if (isValidTailnetIp(ip)) return ip;
  }
  return null;
}
// Explicitly disabled ONLY when AllowFunnel is an object whose every entry is strictly boolean false.
// Absent/null/non-object, or ANY true or non-boolean (malformed/ambiguous) entry, fails closed as not-disabled.
function funnelExplicitlyDisabled(j: unknown): boolean {
  const af = (j as { AllowFunnel?: unknown })?.AllowFunnel;
  if (af === undefined || af === null || typeof af !== 'object' || Array.isArray(af)) return false;
  return Object.values(af as Record<string, unknown>).every((v) => v === false);
}

/** Gathers five independent, time-bound access facts, each from its own dedicated read-only command or
 *  bounded probe. A fact passes only from its own evidence; malformed/failed/unexpected observations
 *  yield 'failed'/'ok'(bad) and the runner blocks. Never emits raw output/host/route/device-id. */
export async function collectAccessEvidence(seams: AccessSeams, cfg: AccessCollectorConfig): Promise<AccessEvidenceSet> {
  // Each fact is stamped with its OWN completion time (seams.clock() sampled after that observation) so a slow
  // collection is truthfully reflected in per-fact age and cannot masquerade as fresh.
  const mk = (status: AccessEvidence['status'], source: string, fields: string[]): AccessEvidence => ({ status, observedAt: seams.clock(), source, digest: sha8(fields.join('\u0000')) });

  let loopbackBind: AccessEvidence;
  try {
    const loopbackOnly = cfg.bindHost === '127.0.0.1' || cfg.bindHost === '::1';
    const health = await seams.loopbackHealthProbe(cfg.bindHost, cfg.apiPort);
    const nonloop = await seams.nonLoopbackBindProbe(cfg.apiPort);
    const ok = loopbackOnly && health.status === 200 && nonloop.open === false;
    loopbackBind = mk(ok ? 'ok' : 'failed', 'loopback.bind', ['lo', String(loopbackOnly), String(health.status), String(nonloop.open)]);
  } catch {
    loopbackBind = mk('failed', 'loopback.bind', ['error']);
  }

  let tailnetServeHttps: AccessEvidence;
  try {
    const r = await seams.command('tailscale', ['serve', 'status', '--json']);
    if (r.code !== 0) throw new Error('cmd');
    const ok = serveTargetsLoopbackPort(JSON.parse(r.stdout), cfg.apiPort);
    tailnetServeHttps = mk(ok ? 'ok' : 'failed', 'tailscale.serve', ['serve', String(ok)]);
  } catch {
    tailnetServeHttps = mk('failed', 'tailscale.serve', ['error']);
  }

  let authorizedDeviceGrant: AccessEvidence;
  try {
    const r = await seams.command('tailscale', ['status', '--json']);
    if (r.code !== 0) throw new Error('cmd');
    // Strictly match the configured identity, then derive one validated tailnet IP from the SAME record and
    // probe reachability against it (never the stable node ID, never emitted).
    const grantIp = authorizedGrantedTailnetIp(JSON.parse(r.stdout), cfg.authorizedDeviceId);
    const granted = grantIp !== null;
    const reach = grantIp ? await seams.deviceReachabilityProbe(grantIp) : { reachable: false };
    const ok = granted && reach.reachable === true;
    authorizedDeviceGrant = mk(ok ? 'ok' : 'failed', 'tailscale.grant', ['grant', String(granted), String(reach.reachable)]);
  } catch {
    authorizedDeviceGrant = mk('failed', 'tailscale.grant', ['error']);
  }

  let funnelDisabled: AccessEvidence;
  try {
    const r = await seams.command('tailscale', ['funnel', 'status', '--json']);
    if (r.code !== 0) throw new Error('cmd');
    const off = funnelExplicitlyDisabled(JSON.parse(r.stdout));
    funnelDisabled = mk(off ? 'ok' : 'failed', 'tailscale.funnel', ['funnel', String(off)]);
  } catch {
    funnelDisabled = mk('failed', 'tailscale.funnel', ['error']);
  }

  let publicDenied: AccessEvidence;
  try {
    const deny = await seams.publicDenyProbe();
    // Denial is proven from verified loopback-only binding + explicit Funnel-off + a dedicated probe,
    // never inferred from tailnet-up alone.
    const combined = loopbackBind.status === 'ok' && funnelDisabled.status === 'ok' && deny.reachable === false;
    publicDenied = mk(combined ? 'denied' : 'failed', 'public.deny', ['deny', String(loopbackBind.status === 'ok'), String(funnelDisabled.status === 'ok'), String(deny.reachable)]);
  } catch {
    publicDenied = mk('failed', 'public.deny', ['error']);
  }

  return { loopbackBind, tailnetServeHttps, authorizedDeviceGrant, funnelDisabled, publicDenied };
}

// ---------------------------------------------------------------------------
// IR-F1-D1(g): frozen server-only audit key + real binding provisioning/validation
// ---------------------------------------------------------------------------
export class AuditKeyError extends Error {
  constructor(code: string) {
    super(code);
    this.name = 'AuditKeyError';
  }
}

/** Resolves the frozen server-only audit key at <stateDir>/private/provider-audit-hmac-v1.key. Rejects
 *  symlinks, non-regular files, wrong size/mode/owner, and a private dir/file not exactly 0700/0600. With
 *  allowCreate a missing key is created exclusively (O_EXCL, random 32 bytes, exact modes, fsync) with
 *  fail-closed cleanup on partial creation. Never returns/logs the path or key bytes. */
export function resolveAuditKey(stateDir: string, opts: { allowCreate: boolean; currentUid?: () => number | undefined; keyOwnerUid?: (actualUid: number) => number }): Buffer {
  const dir = join(stateDir, 'private');
  const keyPath = join(dir, AUDIT_KEY_FILE);
  // Narrow injected seams used by the normal resolver (defaults preserve exact production behavior): currentUid is
  // the expected process UID; keyOwnerUid maps the key file's observed owner UID. Together they let the exact shared
  // owner-check reject the KEY FILE specifically (dir passing) deterministically without a privileged chown.
  const uidOf = opts.currentUid ?? (() => (typeof process.getuid === 'function' ? process.getuid() : undefined));
  let dst: ReturnType<typeof lstatSync> | null = null;
  try {
    dst = lstatSync(dir);
  } catch {
    dst = null;
  }
  if (dst) {
    if (dst.isSymbolicLink() || !dst.isDirectory()) throw new AuditKeyError('AUDIT_KEY_DIR_INVALID');
    if ((dst.mode & 0o777) !== 0o700) throw new AuditKeyError('AUDIT_KEY_DIR_MODE');
    const myUid = uidOf();
    if (myUid !== undefined && dst.uid !== myUid) throw new AuditKeyError('AUDIT_KEY_DIR_OWNER');
  } else {
    if (!opts.allowCreate) throw new AuditKeyError('AUDIT_KEY_MISSING');
    mkdirSync(dir, { recursive: false });
    chmodSync(dir, 0o700);
  }

  let kst: ReturnType<typeof lstatSync> | null = null;
  try {
    kst = lstatSync(keyPath);
  } catch {
    kst = null;
  }
  if (kst) {
    if (kst.isSymbolicLink() || !kst.isFile()) throw new AuditKeyError('AUDIT_KEY_NOT_REGULAR');
    if ((kst.mode & 0o777) !== 0o600) throw new AuditKeyError('AUDIT_KEY_MODE');
    if (kst.size !== AUDIT_KEY_BYTES) throw new AuditKeyError('AUDIT_KEY_SIZE');
    const expectedKeyUid = uidOf();
    const observedKeyUid = opts.keyOwnerUid ? opts.keyOwnerUid(kst.uid) : kst.uid;
    if (expectedKeyUid !== undefined && observedKeyUid !== expectedKeyUid) throw new AuditKeyError('AUDIT_KEY_OWNER');
    const key = readFileSync(keyPath);
    if (key.length !== AUDIT_KEY_BYTES) throw new AuditKeyError('AUDIT_KEY_SIZE');
    return key;
  }
  if (!opts.allowCreate) throw new AuditKeyError('AUDIT_KEY_MISSING');
  const key = randomBytes(AUDIT_KEY_BYTES);
  let fd: number | undefined;
  try {
    fd = openSync(keyPath, fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL, 0o600);
    writeSync(fd, key);
    fsyncSync(fd);
    closeSync(fd);
    fd = undefined;
    chmodSync(keyPath, 0o600);
  } catch {
    if (fd !== undefined) {
      try {
        closeSync(fd);
      } catch {
        /* already closed */
      }
    }
    try {
      if (existsSync(keyPath)) rmSync(keyPath, { force: true });
    } catch {
      /* best-effort cleanup */
    }
    throw new AuditKeyError('AUDIT_KEY_CREATE_FAILED');
  }
  return key;
}

export interface BindingIds {
  builderBindingId: string;
  verifierBindingId: string;
  fishBindingId: string;
}

function roleInputs(selectors: RuntimeSelectors): Record<ProviderRole, RuntimeBindingInput> {
  return {
    deepseek_builder: { role: 'deepseek_builder', publicApiSurfaceId: 'deepseek.post.chat-completions', endpointOrigin: selectors.deepseekEndpointOrigin, modelSelector: selectors.builderModel, adapterSchemaVersion: ADAPTER_SCHEMA_VERSION },
    deepseek_verifier: { role: 'deepseek_verifier', publicApiSurfaceId: 'deepseek.post.chat-completions', endpointOrigin: selectors.deepseekEndpointOrigin, modelSelector: selectors.verifierModel, reasoningSelector: selectors.verifierReasoning, adapterSchemaVersion: ADAPTER_SCHEMA_VERSION },
    fish_tts: { role: 'fish_tts', publicApiSurfaceId: 'fish.post.v1.tts', endpointOrigin: selectors.fishEndpointOrigin, modelSelector: selectors.fishModel, referenceSelector: selectors.fishReference, adapterSchemaVersion: ADAPTER_SCHEMA_VERSION },
  };
}

/** Transaction-bound, idempotent provisioning of the three role bindings from the current selectors and
 *  the loaded separate audit key, honoring UNIQUE(provider_role, config_version_hash). Returns only safe
 *  row IDs; stores only the safe audit_key_id and value-free HMACs. */
export function provisionRoleBindings(db: Db, key: Buffer, selectors: RuntimeSelectors, now: number): BindingIds {
  const inputs = roleInputs(selectors);
  const tx = db.transaction((): BindingIds => {
    const ids: Partial<Record<ProviderRole, string>> = {};
    for (const role of ['deepseek_builder', 'deepseek_verifier', 'fish_tts'] as ProviderRole[]) {
      const rb = buildRuntimeBinding(key, inputs[role]);
      const existing = db.prepare('SELECT id FROM provider_runtime_bindings WHERE provider_role = ? AND config_version_hash = ?').get(rb.providerRole, rb.configVersionHash) as { id: string } | undefined;
      if (existing) {
        // Freshness refresh path: re-provisioning an unchanged binding re-affirms the credential presence and
        // re-stamps verified_at to `now`, so a still-valid binding never becomes permanently stale.
        db.prepare('UPDATE provider_runtime_bindings SET credential_present = 1, verified_at = ? WHERE id = ?').run(now, existing.id);
        ids[role] = existing.id;
        continue;
      }
      const id = randomUUID();
      db.prepare('INSERT INTO provider_runtime_bindings (id, provider_role, public_api_surface_id, audit_key_id, endpoint_origin_hmac, model_selector_hmac, reasoning_selector_hmac, reference_selector_hmac, config_version_hash, credential_present, verified_at) VALUES (?,?,?,?,?,?,?,?,?,1,?)').run(id, rb.providerRole, rb.publicApiSurfaceId, rb.auditKeyId, rb.endpointOriginHmac, rb.modelSelectorHmac, rb.reasoningSelectorHmac, rb.referenceSelectorHmac, rb.configVersionHash, now);
      ids[role] = id;
    }
    return { builderBindingId: ids.deepseek_builder as string, verifierBindingId: ids.deepseek_verifier as string, fishBindingId: ids.fish_tts as string };
  });
  return tx();
}

export interface BindingValidation {
  ok: boolean;
  builder: boolean;
  verifier: boolean;
  fish: boolean;
  rolesDistinct: boolean;
}

/** Recomputes each role binding with the LOADED separate key and verifies audit_key_id,
 *  credential_present, verified_at (finite/not-future/fresh), the distinct 3-role matrix, API surface,
 *  every required/forbidden selector HMAC, and the config-version hash. Never returns key/HMAC material. */
export function validateRoleBindings(db: Db, key: Buffer, ids: BindingIds, selectors: RuntimeSelectors, now: number, freshnessMs: number): BindingValidation {
  const inputs = roleInputs(selectors);
  const check = (id: string, role: ProviderRole): boolean => {
    const row = db.prepare('SELECT provider_role, public_api_surface_id, audit_key_id, credential_present, verified_at, endpoint_origin_hmac, model_selector_hmac, reasoning_selector_hmac, reference_selector_hmac, config_version_hash FROM provider_runtime_bindings WHERE id = ?').get(id) as
      | { provider_role: string; public_api_surface_id: string; audit_key_id: string; credential_present: number; verified_at: number; endpoint_origin_hmac: string; model_selector_hmac: string; reasoning_selector_hmac: string | null; reference_selector_hmac: string | null; config_version_hash: string }
      | undefined;
    if (!row || row.provider_role !== role) return false;
    if (row.audit_key_id !== AUDIT_KEY_ID) return false;
    if (row.credential_present !== 1) return false;
    if (typeof row.verified_at !== 'number' || !Number.isFinite(row.verified_at) || row.verified_at > now || now - row.verified_at > freshnessMs) return false;
    let expected;
    try {
      expected = buildRuntimeBinding(key, inputs[role]);
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
  };
  const builder = check(ids.builderBindingId, 'deepseek_builder');
  const verifier = check(ids.verifierBindingId, 'deepseek_verifier');
  const fish = check(ids.fishBindingId, 'fish_tts');
  const roles = (db.prepare('SELECT provider_role FROM provider_runtime_bindings WHERE id IN (?,?,?)').all(ids.builderBindingId, ids.verifierBindingId, ids.fishBindingId) as Array<{ provider_role: string }>).map((r) => r.provider_role);
  const rolesDistinct = roles.length === 3 && new Set(roles).size === 3 && ['deepseek_builder', 'deepseek_verifier', 'fish_tts'].every((r) => roles.includes(r));
  return { ok: builder && verifier && fish && rolesDistinct, builder, verifier, fish, rolesDistinct };
}

/** Load-only lookup of the three existing role bindings for the CURRENT key+configuration by their computed
 *  config-version hashes. Inserts/updates nothing. Returns null if any role's row is absent for this key. */
export function loadRoleBindings(db: Db, key: Buffer, selectors: RuntimeSelectors): BindingIds | null {
  const inputs = roleInputs(selectors);
  const find = (role: ProviderRole): string | null => {
    let rb;
    try {
      rb = buildRuntimeBinding(key, inputs[role]);
    } catch {
      return null;
    }
    const row = db.prepare('SELECT id FROM provider_runtime_bindings WHERE provider_role = ? AND config_version_hash = ?').get(rb.providerRole, rb.configVersionHash) as { id: string } | undefined;
    return row?.id ?? null;
  };
  const builderBindingId = find('deepseek_builder');
  const verifierBindingId = find('deepseek_verifier');
  const fishBindingId = find('fish_tts');
  if (!builderBindingId || !verifierBindingId || !fishBindingId) return null;
  return { builderBindingId, verifierBindingId, fishBindingId };
}

export interface LifecyclePrep {
  ok: boolean;
  code?: string; // 'RUNTIME_BINDING_REQUIRED' on any failure
  key?: Buffer;
  bindingIds?: BindingIds;
}
export interface LifecycleOpts {
  currentUid?: () => number | undefined; // expected UID, forwarded to the resolver's owner check (deterministic testing)
  keyOwnerUid?: (actualUid: number) => number; // observed key-file owner UID, forwarded to the resolver's key owner check
}

/** IR-F1-D1(g)-L fail-closed audit-key/binding lifecycle used unchanged by main(). Row count is checked BEFORE
 *  the key is resolved or created: only an empty table permits secure initial key creation + one-time three-role
 *  provisioning; with any existing row, key resolution is load-only and provisioning is forbidden. Every failure
 *  returns a sanitized RUNTIME_BINDING_REQUIRED, mutates neither the filesystem nor the binding table, discards
 *  any loaded key buffer, and never reaches acceptance. Only an empty table (initial) or the exact valid key +
 *  exactly the three matching existing rows succeeds; success is idempotent and inserts/rotates nothing. */
export function prepareAuditKeyAndBindings(db: Db, stateDir: string, selectors: RuntimeSelectors, now: number, freshnessMs: number, opts: LifecycleOpts = {}): LifecyclePrep {
  const fail = (key?: Buffer): LifecyclePrep => {
    key?.fill(0);
    return { ok: false, code: 'RUNTIME_BINDING_REQUIRED' };
  };
  const rowCount = (db.prepare('SELECT COUNT(*) AS c FROM provider_runtime_bindings').get() as { c: number }).c;

  if (rowCount === 0) {
    // Initial bootstrap only: no rows exist, so secure key creation and one-time provisioning are allowed.
    let key: Buffer;
    try {
      key = resolveAuditKey(stateDir, { allowCreate: true, currentUid: opts.currentUid, keyOwnerUid: opts.keyOwnerUid });
    } catch {
      return fail();
    }
    let ids: BindingIds;
    try {
      ids = provisionRoleBindings(db, key, selectors, now);
    } catch {
      return fail(key);
    }
    if (!validateRoleBindings(db, key, ids, selectors, now, freshnessMs).ok) return fail(key);
    return { ok: true, key, bindingIds: ids };
  }

  // Existing rows: load-only key, no provisioning, no mutation. Exactly the three matching rows must be present;
  // a missing/extra/ambiguous table, an unresolvable key, or a validation miss fails closed before any change.
  if (rowCount !== 3) return fail();
  let key: Buffer;
  try {
    key = resolveAuditKey(stateDir, { allowCreate: false, currentUid: opts.currentUid, keyOwnerUid: opts.keyOwnerUid });
  } catch {
    return fail();
  }
  const ids = loadRoleBindings(db, key, selectors);
  if (!ids) return fail(key);
  if (!validateRoleBindings(db, key, ids, selectors, now, freshnessMs).ok) return fail(key);
  return { ok: true, key, bindingIds: ids };
}

export interface PreflightInputs {
  db: Db;
  stateDir: string;
  selectors: RuntimeSelectors;
  now: number;
  freshnessMs: number;
  emit: (line: string) => void;
  downstream: (key: Buffer, bindingIds: BindingIds) => Promise<AcceptanceResult>;
  lifecycleOpts?: LifecycleOpts;
}

/** The CLI preflight gate used unchanged by main(): it runs the fail-closed lifecycle and ONLY on success invokes
 *  the downstream acceptance (runPrivateAcceptance). On any lifecycle failure it emits exactly the sanitized
 *  `LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_BINDING_REQUIRED` line, never calls downstream, never emits any of the
 *  five D-009 success labels, and returns a non-zero exit code. The prepared key buffer is zeroed after use. */
export async function acceptancePreflight(p: PreflightInputs): Promise<number> {
  const prep = prepareAuditKeyAndBindings(p.db, p.stateDir, p.selectors, p.now, p.freshnessMs, p.lifecycleOpts);
  if (!prep.ok || !prep.key || !prep.bindingIds) {
    p.emit('LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_BINDING_REQUIRED');
    return 2;
  }
  const key = prep.key;
  try {
    return (await p.downstream(key, prep.bindingIds)).exitCode;
  } finally {
    key.fill(0);
  }
}

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

/** Runs the bounded real private vertical slice for the authorized source against injected ports and
 *  emits every §14.4 item from observable/verified evidence. Fail-closed everywhere; the five labels
 *  emit only after every local evidence gate passes and never from a constant, bare flag, or wrong key. */
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

  // --- §14.4(9) IR-F1-D1(b): five independent, fresh, distinct-proof access observations ---
  const acc = await deps.access(now);
  const accessNow = deps.clock(); // sampled AFTER per-fact collection; ages are relative to real completion time
  const fresh = (e: AccessEvidence, want: 'ok' | 'denied'): boolean => e.status === want && e.source.length > 0 && e.digest.length > 0 && accessNow - e.observedAt >= 0 && accessNow - e.observedAt <= deps.accessMaxAgeMs;
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
    E(`${label}: ${ev.status} want=${want} src=${ev.source} ageMs=${accessNow - ev.observedAt} digest=${ev.digest.slice(0, 8)} ok=${ok}`);
  }
  const digestsDistinct = new Set(accessChecks.map(([, ev]) => ev.digest)).size === accessChecks.length;
  E(`ACCESS_PROOFS_DISTINCT: ${digestsDistinct}`);
  if (!accessOk || !digestsDistinct) return blocked('RUNTIME_ACCESS_REQUIRED');

  // --- §14.4(11) IR-F1-D1(f): fully parsed/validated D-009-A policy snapshots ---
  const dsPolicyOk = validatePolicySnapshot(db, deps.evidence.deepseekPolicySnapshotId, 'deepseek');
  const fishPolicyOk = validatePolicySnapshot(db, deps.evidence.fishPolicySnapshotId, 'fish_audio');
  E(`POLICY_SNAPSHOT_DEEPSEEK_VALID: ${dsPolicyOk}`);
  E(`POLICY_SNAPSHOT_FISH_VALID: ${fishPolicyOk}`);
  if (!dsPolicyOk || !fishPolicyOk) return blocked('POLICY_SNAPSHOT_REQUIRED');

  // --- §14.4(11) IR-F1-D1(g): recompute+validate bindings with the LOADED separate audit key ---
  const bindingV = validateRoleBindings(db, deps.auditKey, { builderBindingId: deps.evidence.builderBindingId, verifierBindingId: deps.evidence.verifierBindingId, fishBindingId: deps.evidence.fishBindingId }, deps.selectors, now, BINDING_FRESHNESS_MS);
  E(`RUNTIME_BINDING_BUILDER_VALID: ${bindingV.builder}`);
  E(`RUNTIME_BINDING_VERIFIER_VALID: ${bindingV.verifier}`);
  E(`RUNTIME_BINDING_FISH_VALID: ${bindingV.fish}`);
  E(`RUNTIME_BINDING_ROLES_DISTINCT: ${bindingV.rolesDistinct}`);
  const bindingsOk = bindingV.ok;
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
  const localControlsPass = contentRow.state === 'audio_ready' && scorePass && ttsOk && !rawRetained && rangeOk && channelOk && scopeActive && auditsClean && accessOk && digestsDistinct && dsPolicyOk && fishPolicyOk && bindingsOk;
  E(`LOCAL_PREFLIGHT: vertical=${scorePass && ttsOk} raw=${!rawRetained} range=${rangeOk} channel=${channelOk} scope=${scopeActive} audits=${auditsClean} access=${accessOk} policy=${dsPolicyOk && fishPolicyOk} binding=${bindingsOk}`);
  if (!localControlsPass) return failed('LOCAL_CONTROLS_NOT_VERIFIED');

  E(formatAssurance());
  E('LIVE_PRIVATE_ACCEPTANCE: PASS');
  return { status: 'PASS', code: 'OK', exitCode: 0, labelsEmitted: true };
}

const execFileAsync = promisify(execFile);

// True ONLY for a globally-routable public unicast address. Excludes loopback, link-local, RFC1918 private,
// CGNAT/Tailscale (100.64/10), IPv6 ULA (fc00::/7), multicast/reserved, and special-use test ranges.
export function isGlobalUnicastPublic(addr: string): boolean {
  if (addr.includes(':')) {
    return /^[23][0-9a-f]{3}:/i.test(addr); // IPv6 global unicast 2000::/3 only
  }
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(addr);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if ([a, b, Number(m[3]), Number(m[4])].some((x) => x > 255)) return false;
  if (a === 0 || a === 10 || a === 127) return false; // this-network, RFC1918 10/8, loopback
  if (a === 172 && b >= 16 && b <= 31) return false; // RFC1918 172.16/12
  if (a === 192 && b === 168) return false; // RFC1918 192.168/16
  if (a === 169 && b === 254) return false; // link-local
  if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT/Tailscale 100.64/10
  if (a >= 224) return false; // multicast 224/4 + reserved 240/4
  if (a === 192 && b === 0) return false; // 192.0.0.0/24 + 192.0.2.0/24 TEST-NET-1
  if (a === 198 && (b === 18 || b === 19)) return false; // 198.18.0.0/15 benchmark
  if (a === 198 && b === 51) return false; // 198.51.100.0/24 TEST-NET-2
  if (a === 203 && b === 0) return false; // 203.0.113.0/24 TEST-NET-3
  return true;
}
// A validated Tailscale node address: CGNAT 100.64.0.0/10 or Tailscale ULA fd7a:115c:a1e0::/48.
function isValidTailnetIp(addr: unknown): addr is string {
  if (typeof addr !== 'string') return false;
  const m = /^100\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(addr);
  if (m && [Number(m[1]), Number(m[2]), Number(m[3])].every((x) => x <= 255) && Number(m[1]) >= 64 && Number(m[1]) <= 127) return true;
  return /^fd7a:115c:a1e0:[0-9a-f:]+$/i.test(addr);
}
// Non-internal host addresses, excluding IPv4/IPv6 link-local, matching an extra predicate.
function nonLoopbackHostAddrs(extra: (addr: string) => boolean): string[] {
  return Object.values(networkInterfaces())
    .flatMap((a) => a ?? [])
    .filter((a) => !a.internal && !/^fe80:/i.test(a.address) && !/^169\.254\./.test(a.address) && extra(a.address))
    .map((a) => a.address);
}
export type ConnectProbeResult = 'refused' | 'open' | 'unknown';
// Bounded read-only TCP connect probe: 'refused' (refused/unreachable), 'open' (accepted), or 'unknown'
// (timeout/other error). The socket is destroyed immediately; nothing is written; no state is mutated.
function boundedConnectProbe(host: string, port: number, timeoutMs: number): Promise<ConnectProbeResult> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (r: ConnectProbeResult): void => {
      if (settled) return;
      settled = true;
      try {
        sock.destroy();
      } catch {
        /* ignore */
      }
      resolve(r);
    };
    const sock = createConnection({ host, port });
    sock.setTimeout(timeoutMs);
    sock.once('connect', () => finish('open'));
    sock.once('timeout', () => finish('unknown'));
    sock.once('error', (e: NodeJS.ErrnoException) => finish(e.code === 'ECONNREFUSED' || e.code === 'EHOSTUNREACH' || e.code === 'ENETUNREACH' ? 'refused' : 'unknown'));
  });
}

/** Derives public-denial evidence from host addresses and a bounded connect probe. Only globally-routable
 *  public unicast addresses are probeable targets: if NONE exist the dedicated probe is missing and this fails
 *  closed (reachable:true → blocks). Denial (reachable:false) requires EVERY public target to refuse; any open
 *  target, or any ambiguous/timeout result, fails closed. Never returns a bare denial constant. */
export async function derivePublicDenial(hostAddrs: string[], probe: (addr: string) => Promise<ConnectProbeResult>): Promise<{ reachable: boolean }> {
  const publicAddrs = hostAddrs.filter(isGlobalUnicastPublic);
  if (publicAddrs.length === 0) return { reachable: true }; // no probeable public target: missing probe fails closed
  const results = await Promise.all(publicAddrs.map((a) => probe(a)));
  if (results.every((r) => r === 'refused')) return { reachable: false }; // positively denied on every public target
  return { reachable: true }; // any open, or any ambiguous/timeout: fail closed
}

/** Real read-only CLI access seams: bounded status commands + bounded loopback/non-loopback/public/device
 *  probes. Every probe fails closed on error/timeout and returns no denial constant. Mutates no Tailscale/
 *  Serve/Funnel/grant/firewall/bind/systemd state. */
function realAccessSeams(config: ServerConfig): AccessSeams {
  return {
    clock: () => Date.now(),
    command: async (bin, args) => {
      try {
        const { stdout } = await execFileAsync(bin, args, { timeout: 5000, maxBuffer: 1 << 20, windowsHide: true });
        return { code: 0, stdout: typeof stdout === 'string' ? stdout : Buffer.from(stdout).toString('utf8') };
      } catch (e) {
        return { code: typeof (e as { code?: number }).code === 'number' ? (e as { code: number }).code : 1, stdout: '' };
      }
    },
    loopbackHealthProbe: async (host, port) => {
      try {
        const res = await fetch(`http://${host === '::1' ? '[::1]' : host}:${port}/v1/health/live`, { signal: AbortSignal.timeout(3000) });
        return { status: res.status };
      } catch {
        return { status: null };
      }
    },
    // The API port must NOT be directly reachable on any non-loopback interface. Any accepted connection => open
    // (bad); all refused/unreachable => closed; any timeout/ambiguity or no probeable interface fails closed as open.
    nonLoopbackBindProbe: async (port) => {
      const addrs = nonLoopbackHostAddrs(() => true);
      if (addrs.length === 0) return { open: true };
      const results = await Promise.all(addrs.map((a) => boundedConnectProbe(a, port, 1500)));
      if (results.some((r) => r === 'open')) return { open: true };
      if (results.every((r) => r === 'refused')) return { open: false };
      return { open: true };
    },
    // HTTPS (443) must be positively denied on EVERY globally-routable public interface. No public target, any
    // reachable target, or any ambiguous/timeout result fails closed (see derivePublicDenial).
    publicDenyProbe: async () => derivePublicDenial(nonLoopbackHostAddrs(() => true), (addr) => boundedConnectProbe(addr, 443, 1500)),
    // Dedicated read-only reachability probe against the validated Tailscale IP derived from the matched device
    // record (bounded `tailscale ping`, count 1). Fails closed on empty/invalid target, non-success, or timeout.
    // Mutates no tailnet config; the address is never emitted.
    deviceReachabilityProbe: async (target) => {
      if (!isValidTailnetIp(target)) return { reachable: false };
      try {
        const { stdout } = await execFileAsync('tailscale', ['ping', '--c', '1', '--timeout', '3s', '--until-direct=false', target], { timeout: 6000, maxBuffer: 1 << 20, windowsHide: true });
        return { reachable: /\bpong\b|\bvia\b/i.test(typeof stdout === 'string' ? stdout : Buffer.from(stdout).toString('utf8')) };
      } catch {
        return { reachable: false };
      }
    },
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
      deepseekEndpointOrigin: normalizeBaseSurface(req('DEEPSEEK_BASE_URL')), // bind the full configured base surface incl. any non-root path
      builderModel: req('DEEPSEEK_BUILDER_MODEL'),
      verifierModel: req('DEEPSEEK_VERIFIER_MODEL'),
      verifierReasoning: req('DEEPSEEK_VERIFIER_REASONING_EFFORT'),
      fishEndpointOrigin: normalizeBaseSurface('https://api.fish.audio'),
      fishModel: req('FISH_TTS_MODEL'),
      fishReference: req('FISH_REFERENCE_ID'),
    };
  } catch {
    out('LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_CONFIG_REQUIRED');
    process.exit(2);
  }
  const now = Date.now();
  // IR-F1-D1(g)-L: the CLI preflight gate checks the binding-row count BEFORE the key is resolved/created and
  // only invokes the downstream acceptance when the fail-closed lifecycle succeeds. Any lifecycle failure emits
  // BLOCKED RUNTIME_BINDING_REQUIRED, never reaches runPrivateAcceptance, and exits non-zero.
  const downstream = async (auditKey: Buffer, bindingIds: BindingIds): Promise<AcceptanceResult> => {
    const dsPolicy = db.prepare("SELECT id FROM provider_policy_snapshots WHERE provider = 'deepseek' AND lookup_status IN ('retrieved','changed_since_review') ORDER BY reviewed_at DESC LIMIT 1").get() as { id: string } | undefined;
    const fishPolicy = db.prepare("SELECT id FROM provider_policy_snapshots WHERE provider = 'fish_audio' AND lookup_status IN ('retrieved','changed_since_review') ORDER BY reviewed_at DESC LIMIT 1").get() as { id: string } | undefined;
    if (!dsPolicy || !fishPolicy) {
      out('LIVE_PRIVATE_ACCEPTANCE: BLOCKED POLICY_SNAPSHOT_REQUIRED');
      return { status: 'BLOCKED', code: 'POLICY_SNAPSHOT_REQUIRED', exitCode: 2, labelsEmitted: false };
    }
    const collectorCfg: AccessCollectorConfig = { apiPort: config.port, bindHost: config.bindHost, authorizedDeviceId: env.VIBENEWS_AUTHORIZED_DEVICE_ID ?? '' };
    return runPrivateAcceptance({
      config,
      db,
      ports,
      evidence: { deepseekPolicySnapshotId: dsPolicy.id, fishPolicySnapshotId: fishPolicy.id, builderBindingId: bindingIds.builderBindingId, verifierBindingId: bindingIds.verifierBindingId, fishBindingId: bindingIds.fishBindingId },
      access: () => collectAccessEvidence(realAccessSeams(config), collectorCfg),
      accessMaxAgeMs: DEFAULT_ACCESS_MAX_AGE_MS,
      clock: () => Date.now(), // sampled after collection to bound access freshness truthfully
      feedTransport: (url, init) => fetch(url, { method: 'GET', signal: init.signal, redirect: init.redirect }).then((res) => ({ status: res.status, headers: res.headers, body: res.body as AsyncIterable<Uint8Array> | null })),
      audioDir: join(config.stateDir, 'audio'),
      stagingDir: join(config.stateDir, 'staging'),
      captionTempRoot: join(config.stateDir, 'caption-temp'),
      referenceId: req('FISH_REFERENCE_ID'),
      guardVersion: 'd009a.guard.v1',
      auditKey,
      selectors,
      now,
      videoId,
      channelId,
      emit: out,
    });
  };
  const exitCode = await acceptancePreflight({ db, stateDir: config.stateDir, selectors, now, freshnessMs: BINDING_FRESHNESS_MS, emit: out, downstream });
  process.exit(exitCode);
}

const HERE = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) || process.argv[1].startsWith(join(HERE, 'accept-private')))) {
  void main();
}
