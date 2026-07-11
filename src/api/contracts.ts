// Client-side API contracts mirroring the server DTOs (설계문서/18 §11). Types only; no secrets.
// The shared zod runtime contract lives on the server; the client keeps a typed view.

export type Id = string;
export type IsoInstant = string;

export type AutomaticPlaybackStatus = 'unheard' | 'in_progress' | 'completed' | 'skipped';
export type AutomaticEntryPoint = 'today_briefing' | 'listen_global' | 'category' | 'tag' | 'today_flow';
export type PlaybackMutationType = 'START' | 'CHECKPOINT' | 'SEEK' | 'PAUSE' | 'COMPLETE' | 'SKIP';
export const SCOPE_ATTESTATION_VERSION = 'd009a.public-youtube-tech.v1' as const;

export interface ApiSuccess<T> {
  data: T;
  requestId: string;
}
export interface ApiError {
  error: { code: string; message: string; retryable: boolean; fieldErrors?: Array<{ path: string; code: string }> };
  requestId: string;
}

export interface CreateManualBatchRequest {
  urls: string[];
  scopeAttested: true;
  scopeAttestationVersion: typeof SCOPE_ATTESTATION_VERSION;
}
export interface ManualBatchItemView {
  id: Id;
  ordinal: number;
  videoId: string | null;
  publicTitle: string | null;
  status: 'invalid' | 'duplicate' | 'queued' | 'processing' | 'deferred' | 'human_review_required' | 'audio_ready' | 'failed' | 'deleted';
  stage: 'caption' | 'builder' | 'verifier' | 'tts' | null;
  verifierAttempt: 0 | 1 | 2;
  deferReason: string | null;
  nextEligibleAt: IsoInstant | null;
  error: { code: string; retryable: boolean; message: string } | null;
  contentItemId: Id | null;
  audioAssetId: Id | null;
  updatedAt: IsoInstant;
}
export interface ManualBatchView {
  id: Id;
  status: 'accepted' | 'processing' | 'complete' | 'partial_failure' | 'failed' | 'deleted';
  sourceScope: 'public_low_risk_youtube_technology';
  approvedAt: IsoInstant;
  items: ManualBatchItemView[];
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

export interface CreateChannelRequest {
  url: string;
  autoProcessingEnabled: boolean;
  scopeAttested?: true;
  scopeAttestationVersion?: typeof SCOPE_ATTESTATION_VERSION;
}
export interface ChannelView {
  id: Id;
  youtubeChannelId: string;
  canonicalUrl: string;
  publicTitle: string;
  status: 'active' | 'disabled' | 'deleted';
  autoProcessingEnabled: boolean;
  approvalVersion: number;
  sourceScope: 'public_low_risk_youtube_technology' | null;
  deferredCount: number;
  lastPolledAt: IsoInstant | null;
  nextPollAt: IsoInstant | null;
  lastPollErrorCode: string | null;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

export interface LibraryItemView {
  contentItemId: Id;
  audioAssetId: Id;
  title: string;
  oneLineSummary: string;
  category: string;
  subcategory: string;
  tags: string[];
  entities: Array<{ name: string; kind: string }>;
  source: { videoId: string; channelId: string; canonicalUrl: string; publishedAt: IsoInstant | null };
  audioReadyAt: IsoInstant;
  durationSec: number;
  automaticStatus: AutomaticPlaybackStatus;
  lastPositionSec: number;
}
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CreateAutomaticSessionRequest {
  entryPoint: AutomaticEntryPoint;
  entryContextId?: string;
  deviceRunId: Id;
  existingSessionId?: Id;
}
export interface AutomaticSessionItemView {
  ordinal: number;
  contentItemId: Id;
  audioAssetId: Id | null;
  title: string;
  oneLineSummary: string;
  automaticStatus: AutomaticPlaybackStatus;
  audioReadyAt: IsoInstant | null;
  durationSec: number;
}
export interface AutomaticSessionView {
  id: Id;
  status: 'active' | 'interrupted' | 'completed';
  entryPoint: AutomaticEntryPoint;
  entryContextId: string | null;
  snapshotAt: IsoInstant;
  activeContentItemId: Id | null;
  resumePositionSec: number;
  revision: number;
  items: AutomaticSessionItemView[];
}

export interface GlobalPlaybackView {
  userId: 'leo';
  activeContentItemId: Id | null;
  activeSessionId: Id | null;
  automaticStatus: 'in_progress' | null;
  lastPositionSec: number;
  durationSec: number;
  revision: number;
  lastDeviceRunId: Id | null;
  lastDeviceSequence: number;
  updatedAt: IsoInstant;
}
export interface PlaybackMutationRequest {
  clientMutationId: Id;
  deviceRunId: Id;
  deviceSequence: number;
  baseRevision: number;
  sessionId: Id;
  contentItemId: Id;
  positionSec: number;
  durationSec: number;
  type: PlaybackMutationType;
}
export interface PlaybackMutationResponse {
  playback: GlobalPlaybackView;
  appliedRevision: number;
  outcome: 'applied' | 'idempotent_replay' | 'stale_discarded';
}
export interface ManualReplayGrant {
  replayId: Id;
  contentItemId: Id;
  audioAssetId: Id | null;
  durationSec: number;
  automaticPlaybackRevision: number;
}
export interface ReadyView {
  ready: boolean;
  checks: Array<{ name: string; ok: boolean; code: string }>;
}
