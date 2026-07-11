// Hourly channel discovery poller (설계문서/18 §9). For each due approved channel it performs the
// bounded public Atom feed fetch, parses the allowlisted fields, records new discoveries, and
// promotes at most three unseen items (existing deferred first). The live HTTPS fetch runs only at
// reviewed acceptance; this pass never runs main() live. pollDueChannels is exported so synthetic
// tests drive the flow with a fake feed transport — no YouTube request.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConfig } from '../config';
import { openDatabase, type Db } from '../db/connection';
import { fetchChannelFeed, parseChannelFeed, recordDiscoveries, type FeedTransport } from '../services/source';
import { promoteDiscoveries, POLL_INTERVAL_MS } from '../services/scheduler';

export interface PollResult {
  channelId: string;
  discovered: number;
  promoted: number;
  ok: boolean;
}

export interface PollOptions {
  transport?: FeedTransport;
  maxBytes?: number;
  timeoutMs?: number;
}

/** Polls every due active channel once. Per-channel failures are isolated and still advance
 *  next_poll_at so a broken channel cannot hot-loop. */
export async function pollDueChannels(db: Db, now: number, opts: PollOptions = {}): Promise<PollResult[]> {
  const due = db
    .prepare("SELECT id, youtube_channel_id FROM channels WHERE status = 'active' AND next_poll_at IS NOT NULL AND next_poll_at <= ? ORDER BY next_poll_at ASC, id ASC")
    .all(now) as Array<{ id: string; youtube_channel_id: string }>;
  const results: PollResult[] = [];
  for (const ch of due) {
    try {
      const xml = await fetchChannelFeed(ch.youtube_channel_id, opts);
      const entries = parseChannelFeed(xml, ch.youtube_channel_id);
      const discovered = recordDiscoveries(db, ch.id, entries, now); // also advances next_poll_at
      const promoted = promoteDiscoveries(db, ch.id, now).length; // deferred first, then new, <= 3
      results.push({ channelId: ch.id, discovered, promoted, ok: true });
    } catch {
      // Isolate the failure and still advance the cursor so the channel is not re-polled immediately.
      db.prepare('UPDATE channels SET last_polled_at = ?, next_poll_at = ?, updated_at = ? WHERE id = ?').run(now, now + POLL_INTERVAL_MS, now, ch.id);
      results.push({ channelId: ch.id, discovered: 0, promoted: 0, ok: false });
    }
  }
  return results;
}

async function main(): Promise<void> {
  const cfg = loadConfig(process.env);
  const db = openDatabase(join(cfg.stateDir, 'db', 'vibenews.sqlite3'));
  const now = Date.now();
  const results = await pollDueChannels(db, now);
  const promoted = results.reduce((a, r) => a + r.promoted, 0);
  process.stdout.write(`POLLER_DONE channels=${results.length} promoted=${promoted}\n`);
}

const HERE = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) || process.argv[1].startsWith(join(HERE, 'poller')))) {
  void main();
}
