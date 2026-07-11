import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AUTOMATIC_PLAYBACK_STATUS,
  CONTENT_ITEM_STATE,
  EXPANDED_SCOPE_REASON,
  JOB_STATE,
  PROVIDER_ATTEMPT_SUBSTAGE,
  isMember,
} from '../../src/domain/enums';
import {
  assertContentItemTransition,
  assertJobTransition,
  canTransitionContentItem,
  canTransitionJob,
  isExcludedFromAutomatic,
  isTtsOrAudioJobState,
  nextPlaybackStatus,
} from '../../src/domain/state-machines';

test('automatic playback has exactly the four canonical states', () => {
  assert.deepEqual([...AUTOMATIC_PLAYBACK_STATUS], ['unheard', 'in_progress', 'completed', 'skipped']);
});

test('expanded scope reasons include every D-009-A category', () => {
  assert.equal(EXPANDED_SCOPE_REASON.length, 10);
  assert.ok(EXPANDED_SCOPE_REASON.includes('scope_ambiguous'));
  assert.ok(EXPANDED_SCOPE_REASON.includes('children_or_biometric_data'));
});

test('provider attempt substages separate builder chunk and aggregate from verifier', () => {
  assert.deepEqual(
    [...PROVIDER_ATTEMPT_SUBSTAGE],
    ['caption', 'builder_chunk', 'builder_aggregate', 'verifier', 'tts'],
  );
});

test('isMember guards enum membership', () => {
  assert.ok(isMember(JOB_STATE, 'synthesizing'));
  assert.ok(!isMember(JOB_STATE, 'not_a_state'));
  assert.ok(!isMember(JOB_STATE, 42));
});

test('job pipeline advances forward and never re-queues from a terminal', () => {
  assert.ok(canTransitionJob('queued', 'captioning'));
  assert.ok(canTransitionJob('captioning', 'building'));
  assert.ok(canTransitionJob('building', 'verifying'));
  assert.ok(canTransitionJob('verifying', 'tts_queued'));
  assert.ok(canTransitionJob('verifying', 'building')); // bounded builder revision
  assert.ok(canTransitionJob('synthesizing', 'audio_ready'));
  assert.ok(!canTransitionJob('failed', 'queued'));
  assert.ok(!canTransitionJob('audio_ready', 'queued'));
  assert.ok(canTransitionJob('deferred', 'building')); // resume exact stage
});

test('human_review_required job can never enter any TTS/audio state', () => {
  for (const to of JOB_STATE) {
    if (isTtsOrAudioJobState(to)) {
      assert.ok(!canTransitionJob('human_review_required', to), `must not go to ${to}`);
    }
  }
  assert.throws(() => assertJobTransition('human_review_required', 'synthesizing'));
  assert.throws(() => assertJobTransition('human_review_required', 'tts_queued'));
  assert.throws(() => assertJobTransition('human_review_required', 'audio_ready'));
  assert.doesNotThrow(() => assertJobTransition('human_review_required', 'deleted'));
});

test('content item cannot jump from human_review_required to audio_ready', () => {
  assert.ok(canTransitionContentItem('built', 'verified'));
  assert.ok(canTransitionContentItem('verified', 'audio_pending'));
  assert.ok(canTransitionContentItem('audio_pending', 'audio_ready'));
  assert.ok(!canTransitionContentItem('human_review_required', 'audio_ready'));
  assert.throws(() => assertContentItemTransition('human_review_required', 'audio_ready'));
  assert.equal(CONTENT_ITEM_STATE.length, 7);
});

test('playback status only advances on real events; manual replay is isolated', () => {
  assert.equal(nextPlaybackStatus('unheard', 'start_playing'), 'in_progress');
  assert.equal(nextPlaybackStatus('unheard', 'checkpoint'), 'unheard');
  assert.equal(nextPlaybackStatus('unheard', 'complete'), null); // no completion without playing
  assert.equal(nextPlaybackStatus('in_progress', 'checkpoint'), 'in_progress');
  assert.equal(nextPlaybackStatus('in_progress', 'complete'), 'completed');
  assert.equal(nextPlaybackStatus('in_progress', 'skip'), 'skipped');
  assert.equal(nextPlaybackStatus('unheard', 'skip'), 'skipped');
  // manual replay never changes automatic status
  assert.equal(nextPlaybackStatus('completed', 'manual_replay'), 'completed');
  assert.equal(nextPlaybackStatus('skipped', 'manual_replay'), 'skipped');
  assert.equal(nextPlaybackStatus('in_progress', 'manual_replay'), 'in_progress');
  // completed/skipped are terminal for automatic
  assert.equal(nextPlaybackStatus('completed', 'start_playing'), null);
  assert.equal(nextPlaybackStatus('skipped', 'complete'), null);
});

test('completed and skipped are excluded from automatic surfaces', () => {
  assert.ok(isExcludedFromAutomatic('completed'));
  assert.ok(isExcludedFromAutomatic('skipped'));
  assert.ok(!isExcludedFromAutomatic('unheard'));
  assert.ok(!isExcludedFromAutomatic('in_progress'));
});
