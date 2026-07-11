// Manual batch, channel, and library services (설계문서/18 §5, §6, §11). Sibling item failures are
// isolated; caps are enforced in immediate transactions; idempotency reuses an existing batch and
// rejects a same-key/different-body request. No provider work happens here (that is the worker).

import { createHash, randomUUID } from 'node:crypto';

import { XMLParser } from 'fast-xml-parser';

import type { Db } from '../db/connection';
import { FIXED_USER_ID } from '../domain/enums';
import { canonicalizeChannelInput, canonicalizeVideoUrl, CaptionCanonicalizationError, channelFeedUrl } from '../providers/caption';
import { AppError } from '../http/errors';

const SCOPE = 'public_low_risk_youtube_technology';
const SCOPE_VERSION = 'd009a.public-youtube-tech.v1';
const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

export interface BatchItemView {
  id: string;
  ordinal: number;
  videoId: string | null;
  publicTitle: string | null;
  status: string;
  stage: string | null;
  verifierAttempt: 0 | 1 | 2;
  deferReason: string | null;
  nextEligibleAt: string | null;
  error: { code: string; retryable: boolean; message: string } | null;
  contentItemId: string | null;
  audioAssetId: string | null;
  updatedAt: string;
}
export interface BatchView {
  id: string;
  status: string;
  sourceScope: 'public_low_risk_youtube_technology';
  approvedAt: string;
  items: BatchItemView[];
  createdAt: string;
  updatedAt: string;
}

function fingerprintFromHashes(hashes: string[]): string {
  return sha(JSON.stringify(hashes));
}

export function createManualBatch(
  db: Db,
  input: { urls: string[]; idempotencyKey: string },
  now: number,
  userId: string = FIXED_USER_ID,
): { view: BatchView; created: boolean } {
  const normalized = input.urls.map((u) => u.trim()).filter((u) => u.length > 0);
  if (normalized.length === 0 || normalized.length > 10) throw new AppError('BATCH_LIMIT_EXCEEDED');
  const incomingHashes = normalized.map((u) => sha(u));
  const fingerprint = fingerprintFromHashes(incomingHashes);

  const existing = db.prepare('SELECT id FROM manual_batches WHERE user_id = ? AND idempotency_key = ?').get(userId, input.idempotencyKey) as
    | { id: string }
    | undefined;
  if (existing) {
    const items = db.prepare('SELECT input_sha256 FROM manual_batch_items WHERE batch_id = ? ORDER BY ordinal ASC').all(existing.id) as Array<{ input_sha256: string }>;
    const storedFingerprint = fingerprintFromHashes(items.map((i) => i.input_sha256));
    if (storedFingerprint !== fingerprint) throw new AppError('IDEMPOTENCY_CONFLICT');
    return { view: getBatchView(db, existing.id, userId), created: false };
  }

  const batchId = randomUUID();
  const tx = db.transaction(() => {
    db.prepare('INSERT OR IGNORE INTO users (id, timezone, created_at, updated_at) VALUES (?, ?, ?, ?)').run(userId, 'Asia/Seoul', now, now);
    db.prepare(
      'INSERT INTO manual_batches (id, user_id, status, source_scope, scope_attestation_version, idempotency_key, approved_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
    ).run(batchId, userId, 'accepted', SCOPE, SCOPE_VERSION, input.idempotencyKey, now, now, now);
    db.prepare(
      'INSERT INTO provider_scope_approvals (id, user_id, origin_kind, manual_batch_id, channel_id, source_scope, scope_attestation_version, status, approval_version, approved_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    ).run(randomUUID(), userId, 'manual', batchId, null, SCOPE, SCOPE_VERSION, 'active', 1, now, now, now);

    const seen = new Set<string>();
    normalized.forEach((url, i) => {
      const ordinal = i + 1;
      const inputHash = incomingHashes[i] as string;
      let status = 'queued';
      let canonicalUrl: string | null = null;
      let videoId: string | null = null;
      let errorCode: string | null = null;
      try {
        const c = canonicalizeVideoUrl(url);
        videoId = c.videoId;
        canonicalUrl = c.canonicalUrl;
        if (seen.has(videoId)) {
          status = 'duplicate';
        } else {
          seen.add(videoId);
        }
      } catch (e) {
        status = 'invalid';
        errorCode = e instanceof CaptionCanonicalizationError ? 'UNSUPPORTED_YOUTUBE_URL' : 'INVALID_INPUT';
      }
      db.prepare(
        'INSERT INTO manual_batch_items (id, batch_id, ordinal, input_sha256, canonical_url, youtube_video_id, status, error_code, error_retryable, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      ).run(randomUUID(), batchId, ordinal, inputHash, canonicalUrl, videoId, status, errorCode, errorCode ? 0 : null, now, now);
    });
  });
  tx();
  return { view: getBatchView(db, batchId, userId), created: true };
}

export function getBatchView(db: Db, batchId: string, userId: string = FIXED_USER_ID): BatchView {
  const b = db.prepare('SELECT * FROM manual_batches WHERE id = ? AND user_id = ?').get(batchId, userId) as
    | { id: string; status: string; approved_at: number; created_at: number; updated_at: number }
    | undefined;
  if (!b) throw new AppError('NOT_FOUND');
  const items = db.prepare('SELECT * FROM manual_batch_items WHERE batch_id = ? ORDER BY ordinal ASC').all(batchId) as Array<{
    id: string;
    ordinal: number;
    youtube_video_id: string | null;
    status: string;
    error_code: string | null;
    error_retryable: number | null;
    updated_at: number;
  }>;
  return {
    id: b.id,
    status: b.status,
    sourceScope: SCOPE,
    approvedAt: new Date(b.approved_at).toISOString(),
    items: items.map((i) => ({
      id: i.id,
      ordinal: i.ordinal,
      videoId: i.youtube_video_id,
      publicTitle: null,
      status: i.status,
      stage: null,
      verifierAttempt: 0,
      deferReason: null,
      nextEligibleAt: null,
      error: i.error_code ? { code: i.error_code, retryable: i.error_retryable === 1, message: 'item failed' } : null,
      contentItemId: null,
      audioAssetId: null,
      updatedAt: new Date(i.updated_at).toISOString(),
    })),
    createdAt: new Date(b.created_at).toISOString(),
    updatedAt: new Date(b.updated_at).toISOString(),
  };
}

export interface ChannelView {
  id: string;
  youtubeChannelId: string;
  canonicalUrl: string;
  publicTitle: string;
  status: string;
  autoProcessingEnabled: boolean;
  approvalVersion: number;
  sourceScope: string | null;
  deferredCount: number;
  lastPolledAt: string | null;
  nextPollAt: string | null;
  lastPollErrorCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export function registerChannel(
  db: Db,
  input: { url: string; autoProcessingEnabled: boolean },
  now: number,
  userId: string = FIXED_USER_ID,
): ChannelView {
  const canonical = canonicalizeChannelInput(input.url);
  if (canonical.kind !== 'id') {
    // Handle resolution requires a live constrained metadata lookup, deferred to acceptance.
    throw new AppError('UNSUPPORTED_YOUTUBE_URL');
  }
  const channelId = randomUUID();
  const tx = db.transaction((): string => {
    db.prepare('INSERT OR IGNORE INTO users (id, timezone, created_at, updated_at) VALUES (?, ?, ?, ?)').run(userId, 'Asia/Seoul', now, now);
    const existing = db.prepare("SELECT id FROM channels WHERE user_id = ? AND youtube_channel_id = ? AND deleted_at IS NULL").get(userId, canonical.channelId) as { id: string } | undefined;
    if (existing) return existing.id;
    const count = (db.prepare("SELECT COUNT(*) c FROM channels WHERE user_id = ? AND deleted_at IS NULL").get(userId) as { c: number }).c;
    if (count >= 5) throw new AppError('CHANNEL_LIMIT_EXCEEDED');
    const status = input.autoProcessingEnabled ? 'active' : 'disabled';
    db.prepare(
      'INSERT INTO channels (id, user_id, youtube_channel_id, canonical_url, public_title, status, auto_processing_enabled, approval_version, next_poll_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    ).run(channelId, userId, canonical.channelId, canonical.canonicalUrl, canonical.channelId, status, input.autoProcessingEnabled ? 1 : 0, 0, input.autoProcessingEnabled ? now : null, now, now);
    if (input.autoProcessingEnabled) {
      db.prepare(
        'INSERT INTO provider_scope_approvals (id, user_id, origin_kind, manual_batch_id, channel_id, source_scope, scope_attestation_version, status, approval_version, approved_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      ).run(randomUUID(), userId, 'channel', null, channelId, SCOPE, SCOPE_VERSION, 'active', 0, now, now, now);
    }
    return channelId;
  });
  return getChannelView(db, tx(), userId);
}

export function patchChannel(db: Db, channelId: string, autoEnabled: boolean, now: number, userId: string = FIXED_USER_ID): ChannelView {
  const tx = db.transaction(() => {
    const ch = db.prepare("SELECT id, approval_version FROM channels WHERE id = ? AND user_id = ? AND deleted_at IS NULL").get(channelId, userId) as { id: string; approval_version: number } | undefined;
    if (!ch) throw new AppError('NOT_FOUND');
    const nextVersion = ch.approval_version + 1;
    if (autoEnabled) {
      db.prepare("UPDATE channels SET status = 'active', auto_processing_enabled = 1, approval_version = ?, next_poll_at = ?, updated_at = ? WHERE id = ?").run(nextVersion, now, now, channelId);
      db.prepare(
        'INSERT INTO provider_scope_approvals (id, user_id, origin_kind, manual_batch_id, channel_id, source_scope, scope_attestation_version, status, approval_version, approved_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      ).run(randomUUID(), userId, 'channel', null, channelId, SCOPE, SCOPE_VERSION, 'active', nextVersion, now, now, now);
    } else {
      db.prepare("UPDATE channels SET status = 'disabled', auto_processing_enabled = 0, approval_version = ?, next_poll_at = NULL, updated_at = ? WHERE id = ?").run(nextVersion, now, channelId);
      db.prepare("UPDATE provider_scope_approvals SET status = 'revoked', revoked_at = ?, updated_at = ? WHERE channel_id = ? AND status = 'active'").run(now, now, channelId);
    }
  });
  tx();
  return getChannelView(db, channelId, userId);
}

export function deleteChannel(db: Db, channelId: string, now: number, userId: string = FIXED_USER_ID): { id: string; status: 'deleted' } {
  const tx = db.transaction(() => {
    const ch = db.prepare("SELECT id FROM channels WHERE id = ? AND user_id = ? AND deleted_at IS NULL").get(channelId, userId) as { id: string } | undefined;
    if (!ch) throw new AppError('NOT_FOUND');
    db.prepare("UPDATE channels SET status = 'deleted', auto_processing_enabled = 0, deleted_at = ?, updated_at = ? WHERE id = ?").run(now, now, channelId);
    db.prepare("UPDATE provider_scope_approvals SET status = 'revoked', revoked_at = ?, updated_at = ? WHERE channel_id = ? AND status = 'active'").run(now, now, channelId);
  });
  tx();
  return { id: channelId, status: 'deleted' };
}

export function getChannelView(db: Db, channelId: string, userId: string = FIXED_USER_ID): ChannelView {
  const c = db.prepare('SELECT * FROM channels WHERE id = ? AND user_id = ?').get(channelId, userId) as
    | {
        id: string;
        youtube_channel_id: string;
        canonical_url: string;
        public_title: string;
        status: string;
        auto_processing_enabled: number;
        approval_version: number;
        last_polled_at: number | null;
        next_poll_at: number | null;
        last_poll_error_code: string | null;
        created_at: number;
        updated_at: number;
      }
    | undefined;
  if (!c) throw new AppError('NOT_FOUND');
  const deferred = (db.prepare("SELECT COUNT(*) c FROM channel_discoveries WHERE channel_id = ? AND status = 'deferred'").get(channelId) as { c: number }).c;
  return {
    id: c.id,
    youtubeChannelId: c.youtube_channel_id,
    canonicalUrl: c.canonical_url,
    publicTitle: c.public_title,
    status: c.status,
    autoProcessingEnabled: c.auto_processing_enabled === 1,
    approvalVersion: c.approval_version,
    sourceScope: c.auto_processing_enabled === 1 ? SCOPE : null,
    deferredCount: deferred,
    lastPolledAt: c.last_polled_at ? new Date(c.last_polled_at).toISOString() : null,
    nextPollAt: c.next_poll_at ? new Date(c.next_poll_at).toISOString() : null,
    lastPollErrorCode: c.last_poll_error_code,
    createdAt: new Date(c.created_at).toISOString(),
    updatedAt: new Date(c.updated_at).toISOString(),
  };
}

export function listChannels(db: Db, userId: string = FIXED_USER_ID): ChannelView[] {
  const rows = db.prepare("SELECT id FROM channels WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at ASC").all(userId) as Array<{ id: string }>;
  return rows.map((r) => getChannelView(db, r.id, userId));
}

export interface LibraryItemView {
  contentItemId: string;
  audioAssetId: string | null;
  title: string;
  oneLineSummary: string;
  audioReadyAt: string | null;
  durationSec: number;
  automaticStatus: string;
  lastPositionSec: number;
}

// ---------------------------------------------------------------------------
// Channel feed discovery (설계문서/18 §6.2). Allowlist-only extraction; entry cap 50; DTD/entities
// rejected. The live HTTPS fetch is the acceptance step and is not performed here.
// ---------------------------------------------------------------------------
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;
const FEED_MAX_ENTRIES = 50;

export interface FeedEntry {
  videoId: string;
  canonicalUrl: string;
  title: string;
  publishedAt: string | null;
}

export function parseChannelFeed(xml: string, expectedChannelId: string): FeedEntry[] {
  if (/<!DOCTYPE/i.test(xml) || /<!ENTITY/i.test(xml)) throw new AppError('VALIDATION_ERROR');
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', processEntities: false });
  const parsed = parser.parse(xml) as { feed?: { entry?: unknown } };
  const rawEntries = parsed.feed?.entry;
  const list = Array.isArray(rawEntries) ? rawEntries : rawEntries ? [rawEntries] : [];
  const out: FeedEntry[] = [];
  for (const raw of list.slice(0, FEED_MAX_ENTRIES)) {
    const entry = raw as Record<string, unknown>;
    const videoId = String(entry['yt:videoId'] ?? '');
    const channelId = String(entry['yt:channelId'] ?? '');
    if (!VIDEO_ID.test(videoId)) continue;
    if (expectedChannelId && channelId && channelId !== expectedChannelId) continue;
    const published = entry.published ? String(entry.published) : null;
    out.push({ videoId, canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`, title: String(entry.title ?? ''), publishedAt: published });
  }
  return out;
}

/** Records new feed entries as discoveries before the cursor advances (설계문서/18 §9.2). */
export function recordDiscoveries(db: Db, channelId: string, entries: FeedEntry[], now: number): number {
  const tx = db.transaction((): number => {
    let added = 0;
    for (const e of entries) {
      const exists = db.prepare('SELECT 1 FROM channel_discoveries WHERE channel_id = ? AND youtube_video_id = ?').get(channelId, e.videoId);
      if (exists) continue;
      db.prepare("INSERT INTO channel_discoveries (id, channel_id, youtube_video_id, published_at, status, eligible_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)").run(
        randomUUID(),
        channelId,
        e.videoId,
        e.publishedAt ? Date.parse(e.publishedAt) : null,
        'discovered',
        now,
        now,
        now,
      );
      added += 1;
    }
    db.prepare("UPDATE channels SET last_polled_at = ?, next_poll_at = ?, updated_at = ? WHERE id = ?").run(now, now + 60 * 60 * 1000, now, channelId);
    return added;
  });
  void CHANNEL_ID;
  return tx();
}

// Bounded public Atom feed fetch (설계문서/18 §6.2, §16.3). Exact YouTube feed host/path only,
// redirects rejected (re-validated), byte/time bounded, IP-literal/private hosts refused. The
// transport is injected so tests exercise the bounds without a network call; the default fetch is
// used only at reviewed live acceptance.
export const FEED_MAX_BYTES = 2 * 1024 * 1024;
export const FEED_TIMEOUT_MS = 15_000;
const FEED_HOST = 'www.youtube.com';
const FEED_PATH = '/feeds/videos.xml';

export interface FeedResponseLike {
  status: number;
  headers: { get(name: string): string | null };
  // A byte stream, not a buffered string: the reader accumulates incrementally and cancels the
  // moment the cap is exceeded, so a body with no Content-Length can never be fully buffered.
  body: AsyncIterable<Uint8Array> | null;
}
export type FeedTransport = (url: string, init: { signal: AbortSignal; redirect: 'error' }) => Promise<FeedResponseLike>;

async function* readerToIterable(stream: ReadableStream<Uint8Array>): AsyncGenerator<Uint8Array> {
  const reader = stream.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) yield value;
    }
  } finally {
    // Early exit (overflow throw) runs this: cancel the underlying network body immediately.
    try {
      await reader.cancel();
    } catch {
      /* already closed */
    }
  }
}

const defaultFeedTransport: FeedTransport = async (url, init) => {
  const res = await fetch(url, { method: 'GET', signal: init.signal, redirect: init.redirect });
  return { status: res.status, headers: res.headers, body: res.body ? readerToIterable(res.body) : null };
};

export async function fetchChannelFeed(
  channelId: string,
  opts: { transport?: FeedTransport; maxBytes?: number; timeoutMs?: number } = {},
): Promise<string> {
  const url = channelFeedUrl(channelId); // throws on a malformed channel id; builds the fixed host/path
  const u = new URL(url);
  // Reject anything but the exact https host/path, and refuse IP-literal hosts outright.
  if (u.protocol !== 'https:' || u.hostname !== FEED_HOST || u.pathname !== FEED_PATH || /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(u.hostname) || u.hostname.includes(':')) {
    throw new AppError('VALIDATION_ERROR');
  }
  const maxBytes = opts.maxBytes ?? FEED_MAX_BYTES;
  const transport = opts.transport ?? defaultFeedTransport;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), opts.timeoutMs ?? FEED_TIMEOUT_MS);
  try {
    let res: FeedResponseLike;
    try {
      res = await transport(url, { signal: ac.signal, redirect: 'error' }); // a redirect rejects here
    } catch {
      throw new AppError('PROVIDER_UNAVAILABLE', true);
    }
    if (res.status !== 200) throw new AppError('PROVIDER_UNAVAILABLE', true);
    // Early rejection: an honest Content-Length over the cap fails before any body is read.
    const len = res.headers.get('content-length');
    if (len && /^\d+$/.test(len) && Number(len) > maxBytes) throw new AppError('VALIDATION_ERROR');
    // Streamed accumulation: stop and cancel the instant total decoded bytes exceed the cap, so a
    // chunked response with no Content-Length is never buffered in full.
    const decoder = new TextDecoder('utf-8');
    let total = 0;
    let body = '';
    if (res.body) {
      for await (const chunk of res.body) {
        total += chunk.byteLength;
        if (total > maxBytes) {
          ac.abort(); // cancel the network read immediately; the iterator's finally cancels the reader
          throw new AppError('VALIDATION_ERROR');
        }
        body += decoder.decode(chunk, { stream: true });
      }
      body += decoder.decode(); // flush any trailing multibyte sequence
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Enqueue transitions (설계문서/18 §5, §9). Manual items and promoted channel discoveries become
// claimable ProcessingJobs. Dedupe SourceVideo provenance, create exactly one job with the right
// origin/scope/user/state/eligibility/idempotency, and flip the source row status in the SAME
// transaction. No provider work happens here.
// ---------------------------------------------------------------------------

/** Dedupes/creates the SourceVideo provenance row keyed by public video id. Minimal metadata now;
 *  the worker fills real title/duration/captions from acquired public provenance before sending. */
export function ensureSourceVideo(db: Db, videoId: string, channelId: string, canonicalUrl: string, now: number): string {
  const ex = db.prepare('SELECT id FROM source_videos WHERE youtube_video_id = ?').get(videoId) as { id: string } | undefined;
  if (ex) return ex.id;
  const id = randomUUID();
  db.prepare(
    'INSERT INTO source_videos (id, youtube_video_id, channel_id, canonical_url, public_title, duration_sec, published_at, caption_kinds, caption_languages, provenance_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
  ).run(id, videoId, channelId, canonicalUrl, '', 1, null, '[]', '[]', '{}', now, now);
  return id;
}

/** Atomically enqueues one ProcessingJob per queued manual item under an ACTIVE manual scope
 *  approval. Duplicate videos reuse a single SourceVideo; a re-run creates no extra job (unique
 *  manual_batch_item_id); an inactive/absent approval enqueues nothing. Returns jobs created. */
export function enqueueManualBatch(db: Db, batchId: string, now: number, userId: string = FIXED_USER_ID): number {
  const tx = db.transaction((): number => {
    const approval = db
      .prepare("SELECT id, approval_version FROM provider_scope_approvals WHERE manual_batch_id = ? AND origin_kind = 'manual' AND status = 'active' ORDER BY approval_version DESC LIMIT 1")
      .get(batchId) as { id: string; approval_version: number } | undefined;
    if (!approval) return 0; // OFF/revoked/absent approval => nothing becomes claimable
    const items = db
      .prepare("SELECT id, youtube_video_id, canonical_url FROM manual_batch_items WHERE batch_id = ? AND status = 'queued' AND youtube_video_id IS NOT NULL ORDER BY ordinal ASC")
      .all(batchId) as Array<{ id: string; youtube_video_id: string; canonical_url: string }>;
    let created = 0;
    for (const it of items) {
      if (db.prepare('SELECT id FROM processing_jobs WHERE manual_batch_item_id = ?').get(it.id)) continue;
      const svId = ensureSourceVideo(db, it.youtube_video_id, '', it.canonical_url, now);
      db.prepare(
        "INSERT INTO processing_jobs (id, user_id, source_video_id, scope_approval_id, origin_kind, manual_batch_item_id, channel_discovery_id, approval_version, state, stage, eligible_at, verifier_attempts, idempotency_key, created_at, updated_at) VALUES (?,?,?,?,'manual',?,NULL,?,'queued','caption',?,0,?,?,?)",
      ).run(randomUUID(), userId, svId, approval.id, it.id, approval.approval_version, now, `job:${it.id}`, now, now);
      db.prepare("UPDATE manual_batch_items SET status = 'processing', updated_at = ? WHERE id = ?").run(now, it.id);
      created += 1;
    }
    return created;
  });
  return tx();
}

export function getLibrary(db: Db, limit: number, userId: string = FIXED_USER_ID): { items: LibraryItemView[]; nextCursor: string | null } {
  const rows = db
    .prepare(
      `SELECT c.id AS cid, a.id AS aid, c.title AS title, c.one_line_summary AS sum, c.audio_ready_at AS ar, a.duration_ms AS dur, p.status AS st, p.last_position_ms AS pos
       FROM content_items c
       LEFT JOIN audio_assets a ON a.content_item_id = c.id AND a.status = 'ready'
       LEFT JOIN playback_items p ON p.user_id = c.user_id AND p.content_item_id = c.id
       WHERE c.user_id = ? AND c.state = 'audio_ready' AND c.deleted_at IS NULL
       ORDER BY c.audio_ready_at ASC, c.id ASC LIMIT ?`,
    )
    .all(userId, limit) as Array<{ cid: string; aid: string | null; title: string; sum: string; ar: number | null; dur: number | null; st: string | null; pos: number | null }>;
  return {
    items: rows.map((r) => ({
      contentItemId: r.cid,
      audioAssetId: r.aid,
      title: r.title,
      oneLineSummary: r.sum,
      audioReadyAt: r.ar ? new Date(r.ar).toISOString() : null,
      durationSec: (r.dur ?? 0) / 1000,
      automaticStatus: r.st ?? 'unheard',
      lastPositionSec: (r.pos ?? 0) / 1000,
    })),
    nextCursor: null,
  };
}
