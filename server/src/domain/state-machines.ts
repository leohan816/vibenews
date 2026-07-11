// Deterministic state machines for the processing pipeline and playback (설계문서/18 §8.3, §10.2).
// Forward-only pipeline; retry resumes the same stage via `deferred` + eligible_at, never a jump
// back to `queued`. `human_review_required` can never transition into any TTS/audio state.

import type { AutomaticPlaybackStatus, ContentItemState, JobState } from './enums';

export type PlaybackAction = 'start_playing' | 'checkpoint' | 'complete' | 'skip' | 'manual_replay';

const JOB_TRANSITIONS: Readonly<Record<JobState, readonly JobState[]>> = {
  queued: ['captioning', 'deferred', 'canceled', 'deleted'],
  captioning: ['building', 'deferred', 'human_review_required', 'failed', 'canceled', 'deleted'],
  building: ['verifying', 'deferred', 'human_review_required', 'failed', 'canceled', 'deleted'],
  // verifying -> building allows a single bounded Builder revision before the second verifier attempt.
  verifying: [
    'tts_queued',
    'building',
    'deferred',
    'human_review_required',
    'failed',
    'canceled',
    'deleted',
  ],
  tts_queued: ['synthesizing', 'deferred', 'canceled', 'deleted'],
  synthesizing: [
    'audio_ready',
    'tts_queued',
    'deferred',
    'human_review_required',
    'failed',
    'canceled',
    'deleted',
  ],
  audio_ready: ['deleted'],
  // retryable terminal: resumes the exact stage it deferred from, never `queued`.
  deferred: ['captioning', 'building', 'verifying', 'tts_queued', 'synthesizing', 'canceled', 'deleted'],
  human_review_required: ['canceled', 'deleted'],
  failed: ['canceled', 'deleted'],
  canceled: ['deleted'],
  deleted: [],
};

const TTS_OR_AUDIO_JOB_STATES: ReadonlySet<JobState> = new Set<JobState>([
  'tts_queued',
  'synthesizing',
  'audio_ready',
]);

export function isTtsOrAudioJobState(state: JobState): boolean {
  return TTS_OR_AUDIO_JOB_STATES.has(state);
}

export function canTransitionJob(from: JobState, to: JobState): boolean {
  return JOB_TRANSITIONS[from].includes(to);
}

export function assertJobTransition(from: JobState, to: JobState): void {
  if (!canTransitionJob(from, to)) {
    throw new Error(`ILLEGAL_JOB_TRANSITION:${from}->${to}`);
  }
  if (from === 'human_review_required' && isTtsOrAudioJobState(to)) {
    // Defense in depth; unreachable via the table above.
    throw new Error(`HUMAN_REVIEW_CANNOT_ENTER_TTS:${to}`);
  }
}

const CONTENT_ITEM_TRANSITIONS: Readonly<Record<ContentItemState, readonly ContentItemState[]>> = {
  built: ['verified', 'human_review_required', 'failed', 'deleted'],
  verified: ['audio_pending', 'human_review_required', 'failed', 'deleted'],
  audio_pending: ['audio_ready', 'human_review_required', 'failed', 'deleted'],
  audio_ready: ['deleted'],
  human_review_required: ['deleted'],
  failed: ['deleted'],
  deleted: [],
};

export function canTransitionContentItem(from: ContentItemState, to: ContentItemState): boolean {
  return CONTENT_ITEM_TRANSITIONS[from].includes(to);
}

export function assertContentItemTransition(from: ContentItemState, to: ContentItemState): void {
  if (!canTransitionContentItem(from, to)) {
    throw new Error(`ILLEGAL_CONTENT_TRANSITION:${from}->${to}`);
  }
  if (from === 'human_review_required' && to === 'audio_ready') {
    throw new Error('HUMAN_REVIEW_CONTENT_CANNOT_BECOME_AUDIO_READY');
  }
}

/**
 * Automatic playback status transition. Returns the next status for the given real action.
 * - Only a real `playing=true` (start_playing) moves unheard -> in_progress.
 * - Only `didJustFinish` (complete) moves in_progress -> completed.
 * - Only an explicit user skip moves unheard/in_progress -> skipped.
 * - `manual_replay` never changes automatic status.
 * A load/tap/buffer does not advance status; callers pass `checkpoint` for those.
 * Returns null when the action is not permitted from the current status.
 */
export function nextPlaybackStatus(
  current: AutomaticPlaybackStatus,
  action: PlaybackAction,
): AutomaticPlaybackStatus | null {
  if (action === 'manual_replay') return current; // isolated: no automatic change
  switch (current) {
    case 'unheard':
      if (action === 'start_playing') return 'in_progress';
      if (action === 'skip') return 'skipped';
      if (action === 'checkpoint') return 'unheard';
      return null; // no completion from unheard without playing
    case 'in_progress':
      if (action === 'start_playing') return 'in_progress';
      if (action === 'checkpoint') return 'in_progress';
      if (action === 'complete') return 'completed';
      if (action === 'skip') return 'skipped';
      return null;
    case 'completed':
    case 'skipped':
      // terminal for automatic; only manual replay touches them and it is a no-op above.
      return null;
    default:
      return null;
  }
}

export function isExcludedFromAutomatic(status: AutomaticPlaybackStatus): boolean {
  return status === 'completed' || status === 'skipped';
}
