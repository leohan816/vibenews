import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { openDatabase, type Db } from '../../src/db/connection';
import { runMigrations } from '../../src/db/migrate';
import {
  applyMutation,
  createManualReplay,
  createOrResumeAutomaticSession,
  ensureUserAndGlobal,
  getGlobalView,
  PlaybackConflictError,
  type MutationInput,
  type MutationType,
} from '../../src/services/playback';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(HERE, '..', '..', 'migrations');
const T = 1_731_000_000_000;

function migrated(): Db {
  const db = openDatabase(':memory:');
  runMigrations(db, MIGRATIONS_DIR, { now: T });
  return db;
}

let seededTaxonomy = false;
function seedReady(db: Db, id: string, audioReadyAt: number): void {
  if (!seededTaxonomy) {
    db.prepare('INSERT INTO categories (id, slug, display_name, status, created_at, updated_at) VALUES (?,?,?,?,?,?)').run('cat', 'developer', 'Developer', 'active', T, T);
    db.prepare('INSERT INTO subcategories (id, category_id, slug, display_name, created_at, updated_at) VALUES (?,?,?,?,?,?)').run('sub', 'cat', 'dev_tools', 'Dev Tools', T, T);
  }
  seededTaxonomy = true;
  db.prepare(
    'INSERT INTO source_videos (id, youtube_video_id, channel_id, canonical_url, public_title, duration_sec, caption_kinds, caption_languages, provenance_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
  ).run(`sv-${id}`, `${id}0000000`.slice(0, 11), 'UCx', `https://www.youtube.com/watch?v=${id}`, id, 400, '[]', '[]', '{}', T, T);
  db.prepare(
    `INSERT INTO content_items (id,user_id,source_video_id,content_kind,category_id,subcategory_id,builder_output_json,builder_output_hash,builder_schema_version,builder_prompt_version,verifier_output_json,verifier_score,verifier_schema_version,verifier_prompt_version,title,one_line_summary,state,audio_ready_at,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(id, 'leo', `sv-${id}`, 'analysis', 'cat', 'sub', '{}', 'h', 'builder-output.v1', 'builder.aggregate.youtube-mvp.v1', '{}', 9.2, 'verifier-output.v1', 'verifier.youtube-mvp.v1', `Title ${id}`, 'Summary', 'audio_ready', audioReadyAt, T, T);
  db.prepare('INSERT INTO audio_assets (id, content_item_id, status, storage_key, mime_type, byte_count, duration_ms, sha256, generated_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(`aa-${id}`, id, 'ready', `k-${id}`, 'audio/mpeg', 1000, 400000, 'x', audioReadyAt, T, T);
  db.prepare('INSERT INTO playback_items (user_id, content_item_id, status, last_position_ms, duration_ms, revision, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)').run('leo', id, 'unheard', 0, 400000, 0, T, T);
}

function mutate(db: Db, over: Partial<MutationInput> & Pick<MutationInput, 'type' | 'clientMutationId' | 'deviceSequence' | 'baseRevision' | 'sessionId' | 'contentItemId'>, now: number) {
  const input: MutationInput = {
    deviceRunId: 'run-1',
    positionSec: 0,
    durationSec: 400,
    ...over,
  };
  return applyMutation(db, input, now);
}

test('A/B/C/D: immutable snapshot, resume, exclusion, revision/idempotency, manual-replay isolation', () => {
  seededTaxonomy = false;
  const db = migrated();
  ensureUserAndGlobal(db, T);
  seedReady(db, 'A', T - 3000);
  seedReady(db, 'B', T - 2000);
  seedReady(db, 'C', T - 1000);

  // S1 snapshots A, B, C
  const s1 = createOrResumeAutomaticSession(db, { entryPoint: 'listen_global', deviceRunId: 'run-1' }, T);
  assert.deepEqual(s1.items.map((i) => i.contentItemId), ['A', 'B', 'C']);

  // Start A, checkpoint to 2:14
  const started = mutate(db, { type: 'START', clientMutationId: 'm1', deviceSequence: 1, baseRevision: 0, sessionId: s1.id, contentItemId: 'A' }, T);
  assert.equal(started.outcome, 'applied');
  assert.equal(started.playback.revision, 1);
  const cp = mutate(db, { type: 'CHECKPOINT', clientMutationId: 'm2', deviceSequence: 2, baseRevision: 1, sessionId: s1.id, contentItemId: 'A', positionSec: 134 }, T);
  assert.equal(cp.playback.revision, 2);
  assert.equal(getGlobalView(db).lastPositionSec, 134);
  assert.equal(getGlobalView(db).activeContentItemId, 'A');

  // D becomes ready AFTER S1 -> absent from S1 even on same-run resume
  seedReady(db, 'D', T + 10_000);
  const resume = createOrResumeAutomaticSession(db, { entryPoint: 'category', deviceRunId: 'run-1' }, T + 20_000);
  assert.equal(resume.id, s1.id, 'same run returns the same session');
  assert.deepEqual(resume.items.map((i) => i.contentItemId), ['A', 'B', 'C']);

  // revision conflict + idempotent replay
  assert.throws(
    () => mutate(db, { type: 'CHECKPOINT', clientMutationId: 'm-stale', deviceSequence: 9, baseRevision: 0, sessionId: s1.id, contentItemId: 'A', positionSec: 1 }, T),
    (e: unknown) => e instanceof PlaybackConflictError,
  );
  assert.equal(mutate(db, { type: 'CHECKPOINT', clientMutationId: 'm2', deviceSequence: 2, baseRevision: 1, sessionId: s1.id, contentItemId: 'A', positionSec: 134 }, T).outcome, 'idempotent_replay');

  // Cold start: new run -> S2 has active A first, then unheard B, C, D
  const s2 = createOrResumeAutomaticSession(db, { entryPoint: 'today_briefing', deviceRunId: 'run-2' }, T + 20_000);
  assert.notEqual(s2.id, s1.id);
  assert.deepEqual(s2.items.map((i) => i.contentItemId), ['A', 'B', 'C', 'D']);

  // Complete A and skip C -> excluded everywhere
  const doneA = applyMutation(db, { type: 'COMPLETE' as MutationType, clientMutationId: 'm3', deviceRunId: 'run-2', deviceSequence: 1, baseRevision: 2, sessionId: s2.id, contentItemId: 'A', positionSec: 400, durationSec: 400 }, T + 20_000);
  assert.equal(doneA.playback.revision, 3);
  assert.equal(getGlobalView(db).activeContentItemId, null);
  applyMutation(db, { type: 'SKIP' as MutationType, clientMutationId: 'm4', deviceRunId: 'run-2', deviceSequence: 2, baseRevision: 3, sessionId: s2.id, contentItemId: 'C', positionSec: 0, durationSec: 400 }, T + 20_000);

  const s3 = createOrResumeAutomaticSession(db, { entryPoint: 'listen_global', deviceRunId: 'run-3' }, T + 30_000);
  assert.deepEqual(s3.items.map((i) => i.contentItemId), ['B', 'D'], 'completed A and skipped C are excluded');

  // Manual replay of completed content changes nothing automatic
  const revisionBefore = getGlobalView(db).revision;
  const grant = createManualReplay(db, { contentItemId: 'B', clientMutationId: 'mr1' }, T + 30_000);
  assert.equal(grant.automaticPlaybackRevision, revisionBefore);
  assert.equal(getGlobalView(db).revision, revisionBefore);
  const b = db.prepare("SELECT manual_replay_count, status FROM playback_items WHERE content_item_id='B'").get() as { manual_replay_count: number; status: string };
  assert.equal(b.manual_replay_count, 1);
  assert.equal(b.status, 'unheard', 'manual replay did not change automatic status');
  db.close();
});
