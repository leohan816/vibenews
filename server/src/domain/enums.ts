// Canonical server enums for VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001 (설계문서/18 §8.1).
// Values are the exact stored strings. No elapsed-time / percentage exclusion rule exists;
// automatic playback has exactly four states.

export const AUTOMATIC_PLAYBACK_STATUS = ['unheard', 'in_progress', 'completed', 'skipped'] as const;
export type AutomaticPlaybackStatus = (typeof AUTOMATIC_PLAYBACK_STATUS)[number];

export const BATCH_STATUS = [
  'accepted',
  'processing',
  'complete',
  'partial_failure',
  'failed',
  'deleted',
] as const;
export type BatchStatus = (typeof BATCH_STATUS)[number];

export const BATCH_ITEM_STATUS = [
  'invalid',
  'duplicate',
  'queued',
  'processing',
  'deferred',
  'human_review_required',
  'audio_ready',
  'failed',
  'deleted',
] as const;
export type BatchItemStatus = (typeof BATCH_ITEM_STATUS)[number];

export const CHANNEL_STATUS = ['active', 'disabled', 'deleted'] as const;
export type ChannelStatus = (typeof CHANNEL_STATUS)[number];

export const DISCOVERY_STATUS = [
  'discovered',
  'deferred',
  'queued',
  'duplicate',
  'revoked',
  'deleted',
] as const;
export type DiscoveryStatus = (typeof DISCOVERY_STATUS)[number];

export const JOB_STATE = [
  'queued',
  'captioning',
  'building',
  'verifying',
  'tts_queued',
  'synthesizing',
  'audio_ready',
  'deferred',
  'human_review_required',
  'failed',
  'canceled',
  'deleted',
] as const;
export type JobState = (typeof JOB_STATE)[number];

export const JOB_STAGE = ['caption', 'builder', 'verifier', 'tts'] as const;
export type JobStage = (typeof JOB_STAGE)[number];

export const DEFER_REASON = [
  'daily_tts_cap',
  'channel_poll_cap',
  'approval_revoked',
  'lease_recovery',
  'retry_backoff',
  'worker_unavailable',
  'active_content_correction',
] as const;
export type DeferReason = (typeof DEFER_REASON)[number];

export const SESSION_STATUS = ['active', 'interrupted', 'completed'] as const;
export type SessionStatus = (typeof SESSION_STATUS)[number];

export const AUDIO_STATUS = ['pending', 'generating', 'ready', 'failed', 'deleted'] as const;
export type AudioStatus = (typeof AUDIO_STATUS)[number];

export const TTS_GENERATION_RECEIPT_STATUS = [
  'requested',
  'outcome_unknown',
  'provider_failed',
  'generated',
  'staged',
  'finalized',
  'storage_failed',
  'reconciled',
] as const;
export type TtsGenerationReceiptStatus = (typeof TTS_GENERATION_RECEIPT_STATUS)[number];

export const CONTENT_ITEM_STATE = [
  'built',
  'verified',
  'human_review_required',
  'audio_pending',
  'audio_ready',
  'failed',
  'deleted',
] as const;
export type ContentItemState = (typeof CONTENT_ITEM_STATE)[number];

export const PROVIDER_ATTEMPT_STATUS = ['started', 'succeeded', 'failed', 'timed_out'] as const;
export type ProviderAttemptStatus = (typeof PROVIDER_ATTEMPT_STATUS)[number];

export const PROVIDER_ATTEMPT_SUBSTAGE = [
  'caption',
  'builder_chunk',
  'builder_aggregate',
  'verifier',
  'tts',
] as const;
export type ProviderAttemptSubstage = (typeof PROVIDER_ATTEMPT_SUBSTAGE)[number];

export const PROVIDER_POLICY_LOOKUP_STATUS = [
  'retrieved',
  'unavailable',
  'changed_since_review',
] as const;
export type ProviderPolicyLookupStatus = (typeof PROVIDER_POLICY_LOOKUP_STATUS)[number];

export const PROVIDER_PAYLOAD_GUARD_OUTCOME = [
  'allowed',
  'scope_review_required',
  'payload_rejected',
  'runtime_binding_rejected',
] as const;
export type ProviderPayloadGuardOutcome = (typeof PROVIDER_PAYLOAD_GUARD_OUTCOME)[number];

export const SCOPE_APPROVAL_STATUS = ['active', 'revoked', 'superseded'] as const;
export type ScopeApprovalStatus = (typeof SCOPE_APPROVAL_STATUS)[number];

export const CAPTION_ARTIFACT_DELETE_STATUS = ['pending', 'deleted', 'overdue', 'failed'] as const;
export type CaptionArtifactDeleteStatus = (typeof CAPTION_ARTIFACT_DELETE_STATUS)[number];

export const PLAYBACK_MODE = ['automatic', 'manual_replay'] as const;
export type PlaybackMode = (typeof PLAYBACK_MODE)[number];

export const SOURCE_SCOPE = 'public_low_risk_youtube_technology' as const;
export type SourceScope = typeof SOURCE_SCOPE;

export const EXPANDED_SCOPE_REASON = [
  'private_or_user_uploaded_document',
  'internal_company_data',
  'personal_conversation_or_memory',
  'personal_data_health_finance_legal_or_election',
  'children_or_biometric_data',
  'multi_user_production',
  'public_commercial_launch',
  'third_party_customer_content',
  'confidential_or_regulated_information',
  'scope_ambiguous',
] as const;
export type ExpandedScopeReason = (typeof EXPANDED_SCOPE_REASON)[number];

export const SCOPE_ATTESTATION_VERSION = 'd009a.public-youtube-tech.v1' as const;
export type ScopeAttestationVersion = typeof SCOPE_ATTESTATION_VERSION;

export const FIXED_USER_ID = 'leo' as const;
export const USER_TIMEZONE = 'Asia/Seoul' as const;

export function isMember<T extends readonly string[]>(list: T, value: unknown): value is T[number] {
  return typeof value === 'string' && (list as readonly string[]).includes(value);
}
