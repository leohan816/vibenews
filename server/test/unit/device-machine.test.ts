import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyStatus,
  coalesceOutbox,
  drainOrder,
  isExcluded,
  reduceLocal,
  rebaseOutbox,
  type LocalMutation,
  type LocalPlaybackCache,
} from '../../../src/audio/global-playback-machine';

function m(partial: Partial<LocalMutation> & Pick<LocalMutation, 'type' | 'deviceSequence'>): LocalMutation {
  return {
    clientMutationId: `cm-${partial.deviceSequence}`,
    deviceRunId: 'run-1',
    baseRevision: 0,
    sessionId: 's1',
    contentItemId: 'A',
    positionSec: 0,
    durationSec: 400,
    createdAt: partial.deviceSequence,
    ...partial,
  };
}

test('device four-state transitions match the real-event rules', () => {
  assert.equal(applyStatus('unheard', 'START'), 'in_progress');
  assert.equal(applyStatus('unheard', 'CHECKPOINT'), 'unheard');
  assert.equal(applyStatus('unheard', 'COMPLETE'), null);
  assert.equal(applyStatus('in_progress', 'CHECKPOINT'), 'in_progress');
  assert.equal(applyStatus('in_progress', 'SEEK'), 'in_progress');
  assert.equal(applyStatus('in_progress', 'COMPLETE'), 'completed');
  assert.equal(applyStatus('in_progress', 'SKIP'), 'skipped');
  assert.equal(applyStatus('completed', 'START'), null);
  assert.ok(isExcluded('completed') && isExcluded('skipped'));
});

test('reduceLocal makes an item active on START and clears on completion/skip', () => {
  const base: LocalPlaybackCache = {
    activeContentId: null,
    activeSessionId: null,
    status: null,
    positionSec: 0,
    durationSec: 0,
    revision: 0,
    deviceRunId: 'run-1',
    nextSequence: 1,
  };
  const started = reduceLocal(base, m({ type: 'START', deviceSequence: 1 }));
  assert.equal(started.activeContentId, 'A');
  assert.equal(started.status, 'in_progress');
  assert.equal(started.revision, 1);
  assert.equal(started.nextSequence, 2);
  const seeked = reduceLocal(started, m({ type: 'SEEK', deviceSequence: 2, positionSec: 134 }));
  assert.equal(seeked.positionSec, 134);
  const completed = reduceLocal(seeked, m({ type: 'COMPLETE', deviceSequence: 3, positionSec: 400 }));
  assert.equal(completed.activeContentId, null);
  assert.equal(completed.status, null);
});

test('only consecutive same-item checkpoints coalesce; explicit actions never merge', () => {
  const outbox = [
    m({ type: 'START', deviceSequence: 1 }),
    m({ type: 'CHECKPOINT', deviceSequence: 2, positionSec: 10 }),
    m({ type: 'CHECKPOINT', deviceSequence: 3, positionSec: 20 }),
    m({ type: 'SEEK', deviceSequence: 4, positionSec: 5 }),
    m({ type: 'PAUSE', deviceSequence: 5, positionSec: 5 }),
  ];
  const coalesced = coalesceOutbox(outbox);
  // the two checkpoints collapse to the later (positionSec 20); START/SEEK/PAUSE remain
  assert.equal(coalesced.length, 4);
  assert.equal(coalesced[1]?.type, 'CHECKPOINT');
  assert.equal(coalesced[1]?.positionSec, 20);
  assert.equal(coalesced[2]?.type, 'SEEK');
});

test('rebase preserves an explicit backward seek and drops old-active mutations', () => {
  const outbox = [
    m({ type: 'CHECKPOINT', deviceSequence: 1, contentItemId: 'A', positionSec: 200 }),
    m({ type: 'SEEK', deviceSequence: 2, contentItemId: 'A', positionSec: 20 }), // deliberate rewind
    m({ type: 'CHECKPOINT', deviceSequence: 3, contentItemId: 'B', positionSec: 5 }), // stale item
  ];
  const rebased = rebaseOutbox(outbox, { activeContentId: 'A', activeSessionId: 's1' });
  // B mutation dropped (not the active item); backward SEEK to 20 preserved
  assert.ok(rebased.every((x) => x.contentItemId === 'A'));
  assert.ok(rebased.some((x) => x.type === 'SEEK' && x.positionSec === 20));
});

test('a bare checkpoint superseded by a later explicit action on the same item is dropped', () => {
  const outbox = [
    m({ type: 'CHECKPOINT', deviceSequence: 1, contentItemId: 'A', positionSec: 100 }),
    m({ type: 'PAUSE', deviceSequence: 2, contentItemId: 'A', positionSec: 105 }),
  ];
  const rebased = rebaseOutbox(outbox, { activeContentId: 'A', activeSessionId: 's1' });
  assert.equal(rebased.length, 1);
  assert.equal(rebased[0]?.type, 'PAUSE');
});

test('drainOrder sorts by created_at then run then sequence', () => {
  const outbox = [
    m({ type: 'CHECKPOINT', deviceSequence: 3, createdAt: 30 }),
    m({ type: 'CHECKPOINT', deviceSequence: 1, createdAt: 10 }),
    m({ type: 'CHECKPOINT', deviceSequence: 2, createdAt: 20 }),
  ];
  assert.deepEqual(
    drainOrder(outbox).map((x) => x.deviceSequence),
    [1, 2, 3],
  );
});
