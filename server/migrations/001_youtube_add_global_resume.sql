-- Migration 001: YouTube Add + Global Resume MVP (설계문서/18 §8.2).
-- Additive, forward-only. All timestamps are INTEGER milliseconds (UTC). IDs are UUID TEXT.
-- Deletion is tombstone/file-cleanup, never physical cascade, so FKs default ON DELETE RESTRICT.

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id TEXT PRIMARY KEY CHECK (id = 'leo'),
  timezone TEXT NOT NULL CHECK (timezone = 'Asia/Seoul'),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- manual batches / items
-- ---------------------------------------------------------------------------
CREATE TABLE manual_batches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('accepted','processing','complete','partial_failure','failed','deleted')),
  source_scope TEXT NOT NULL CHECK (source_scope = 'public_low_risk_youtube_technology'),
  scope_attestation_version TEXT NOT NULL CHECK (scope_attestation_version = 'd009a.public-youtube-tech.v1'),
  idempotency_key TEXT NOT NULL,
  approved_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (user_id, idempotency_key)
);
CREATE INDEX idx_manual_batches_user_created ON manual_batches (user_id, created_at DESC);

CREATE TABLE manual_batch_items (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES manual_batches (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  ordinal INTEGER NOT NULL CHECK (ordinal BETWEEN 1 AND 10),
  input_sha256 TEXT NOT NULL,
  canonical_url TEXT,
  youtube_video_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('invalid','duplicate','queued','processing','deferred','human_review_required','audio_ready','failed','deleted')),
  error_code TEXT,
  error_retryable INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (batch_id, ordinal)
);
CREATE INDEX idx_manual_batch_items_batch_status ON manual_batch_items (batch_id, status);

-- ---------------------------------------------------------------------------
-- channels / discoveries
-- ---------------------------------------------------------------------------
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  youtube_channel_id TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  public_title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','disabled','deleted')),
  auto_processing_enabled INTEGER NOT NULL CHECK (auto_processing_enabled IN (0,1)),
  approval_version INTEGER NOT NULL DEFAULT 0,
  etag TEXT,
  last_modified TEXT,
  feed_cursor TEXT,
  last_polled_at INTEGER,
  next_poll_at INTEGER,
  last_poll_error_code TEXT,
  deleted_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  CHECK (
    (status = 'active' AND auto_processing_enabled = 1 AND deleted_at IS NULL)
    OR (status = 'disabled' AND auto_processing_enabled = 0 AND deleted_at IS NULL)
    OR (status = 'deleted' AND deleted_at IS NOT NULL)
  )
);
CREATE UNIQUE INDEX uq_channels_user_channel_active ON channels (user_id, youtube_channel_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_channels_status_nextpoll ON channels (status, next_poll_at);

-- ---------------------------------------------------------------------------
-- provider scope approvals (D-009-A)
-- ---------------------------------------------------------------------------
CREATE TABLE provider_scope_approvals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  origin_kind TEXT NOT NULL CHECK (origin_kind IN ('manual','channel')),
  manual_batch_id TEXT REFERENCES manual_batches (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  channel_id TEXT REFERENCES channels (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  source_scope TEXT NOT NULL CHECK (source_scope = 'public_low_risk_youtube_technology'),
  scope_attestation_version TEXT NOT NULL CHECK (scope_attestation_version = 'd009a.public-youtube-tech.v1'),
  status TEXT NOT NULL CHECK (status IN ('active','revoked','superseded')),
  approval_version INTEGER NOT NULL,
  approved_at INTEGER NOT NULL,
  revoked_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  CHECK (
    (origin_kind = 'manual' AND manual_batch_id IS NOT NULL AND channel_id IS NULL)
    OR (origin_kind = 'channel' AND channel_id IS NOT NULL AND manual_batch_id IS NULL)
  )
);
CREATE UNIQUE INDEX uq_scope_approval_manual_active ON provider_scope_approvals (manual_batch_id, approval_version) WHERE status = 'active' AND manual_batch_id IS NOT NULL;
CREATE UNIQUE INDEX uq_scope_approval_channel_active ON provider_scope_approvals (channel_id, approval_version) WHERE status = 'active' AND channel_id IS NOT NULL;
CREATE INDEX idx_scope_approval_status_approved ON provider_scope_approvals (status, approved_at);

CREATE TABLE channel_discoveries (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES channels (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  youtube_video_id TEXT NOT NULL,
  published_at INTEGER,
  status TEXT NOT NULL CHECK (status IN ('discovered','deferred','queued','duplicate','revoked','deleted')),
  first_seen_poll_id TEXT,
  eligible_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (channel_id, youtube_video_id)
);
CREATE INDEX idx_discoveries_channel_status_eligible ON channel_discoveries (channel_id, status, eligible_at);

-- ---------------------------------------------------------------------------
-- source videos
-- ---------------------------------------------------------------------------
CREATE TABLE source_videos (
  id TEXT PRIMARY KEY,
  youtube_video_id TEXT NOT NULL UNIQUE,
  channel_id TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  public_title TEXT NOT NULL,
  duration_sec INTEGER NOT NULL CHECK (duration_sec BETWEEN 1 AND 7200),
  published_at INTEGER,
  caption_kinds TEXT NOT NULL,
  caption_languages TEXT NOT NULL,
  provenance_json TEXT NOT NULL,
  deleted_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_source_videos_channel_published ON source_videos (channel_id, published_at);
CREATE INDEX idx_source_videos_created ON source_videos (created_at);

-- ---------------------------------------------------------------------------
-- provider policy snapshots / runtime bindings
-- ---------------------------------------------------------------------------
CREATE TABLE provider_policy_snapshots (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('deepseek','fish_audio')),
  official_policy_urls TEXT NOT NULL,
  official_api_url TEXT NOT NULL,
  public_api_surface_id TEXT NOT NULL CHECK (public_api_surface_id IN ('deepseek.post.chat-completions','fish.post.v1.tts')),
  policy_effective_or_updated_date TEXT NOT NULL,
  reviewed_at INTEGER NOT NULL,
  document_set_sha256 TEXT,
  lookup_status TEXT NOT NULL CHECK (lookup_status IN ('retrieved','unavailable','changed_since_review')),
  public_statement_codes TEXT NOT NULL,
  verified_local_control_codes TEXT NOT NULL,
  controls_not_independently_verified TEXT NOT NULL,
  provider_policy_assurance TEXT NOT NULL CHECK (provider_policy_assurance = 'LIMITED_AND_UNVERIFIED'),
  local_data_controls TEXT NOT NULL CHECK (local_data_controls = 'VERIFIED'),
  provider_side_deletion TEXT NOT NULL CHECK (provider_side_deletion = 'NOT_VERIFIED'),
  provider_side_no_training TEXT NOT NULL CHECK (provider_side_no_training = 'NOT_VERIFIED'),
  production_privacy_approval TEXT NOT NULL CHECK (production_privacy_approval = 'NOT_GRANTED'),
  created_at INTEGER NOT NULL,
  CHECK (
    (lookup_status IN ('retrieved','changed_since_review') AND document_set_sha256 IS NOT NULL)
    OR (lookup_status = 'unavailable' AND document_set_sha256 IS NULL)
  ),
  UNIQUE (provider, reviewed_at)
);
CREATE INDEX idx_policy_snapshots_provider_lookup ON provider_policy_snapshots (provider, lookup_status, reviewed_at DESC);

CREATE TABLE provider_runtime_bindings (
  id TEXT PRIMARY KEY,
  provider_role TEXT NOT NULL CHECK (provider_role IN ('deepseek_builder','deepseek_verifier','fish_tts')),
  public_api_surface_id TEXT NOT NULL CHECK (public_api_surface_id IN ('deepseek.post.chat-completions','fish.post.v1.tts')),
  audit_key_id TEXT NOT NULL CHECK (audit_key_id = 'provider-audit-hmac-v1'),
  endpoint_origin_hmac TEXT NOT NULL,
  model_selector_hmac TEXT NOT NULL,
  reasoning_selector_hmac TEXT,
  reference_selector_hmac TEXT,
  config_version_hash TEXT NOT NULL,
  credential_present INTEGER NOT NULL CHECK (credential_present IN (0,1)),
  verified_at INTEGER NOT NULL,
  CHECK (
    (provider_role = 'deepseek_builder' AND reasoning_selector_hmac IS NULL AND reference_selector_hmac IS NULL)
    OR (provider_role = 'deepseek_verifier' AND reasoning_selector_hmac IS NOT NULL AND reference_selector_hmac IS NULL)
    OR (provider_role = 'fish_tts' AND reference_selector_hmac IS NOT NULL AND reasoning_selector_hmac IS NULL)
  ),
  UNIQUE (provider_role, config_version_hash)
);
CREATE INDEX idx_runtime_bindings_verified ON provider_runtime_bindings (verified_at);

-- ---------------------------------------------------------------------------
-- processing jobs
-- ---------------------------------------------------------------------------
CREATE TABLE processing_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  source_video_id TEXT NOT NULL REFERENCES source_videos (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  scope_approval_id TEXT NOT NULL REFERENCES provider_scope_approvals (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  origin_kind TEXT NOT NULL CHECK (origin_kind IN ('manual','channel')),
  manual_batch_item_id TEXT REFERENCES manual_batch_items (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  channel_discovery_id TEXT REFERENCES channel_discoveries (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  approval_version INTEGER NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('queued','captioning','building','verifying','tts_queued','synthesizing','audio_ready','deferred','human_review_required','failed','canceled','deleted')),
  stage TEXT CHECK (stage IN ('caption','builder','verifier','tts')),
  eligible_at INTEGER NOT NULL,
  defer_reason TEXT CHECK (defer_reason IN ('daily_tts_cap','channel_poll_cap','approval_revoked','lease_recovery','retry_backoff','worker_unavailable','active_content_correction')),
  verifier_attempts INTEGER NOT NULL DEFAULT 0 CHECK (verifier_attempts BETWEEN 0 AND 2),
  correction_version INTEGER NOT NULL DEFAULT 0,
  lease_owner TEXT,
  lease_expires_at INTEGER,
  lease_heartbeat_at INTEGER,
  idempotency_key TEXT NOT NULL UNIQUE,
  error_code TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  CHECK (
    (origin_kind = 'manual' AND manual_batch_item_id IS NOT NULL AND channel_discovery_id IS NULL)
    OR (origin_kind = 'channel' AND channel_discovery_id IS NOT NULL AND manual_batch_item_id IS NULL)
  )
);
CREATE UNIQUE INDEX uq_jobs_manual_item ON processing_jobs (manual_batch_item_id) WHERE manual_batch_item_id IS NOT NULL;
CREATE UNIQUE INDEX uq_jobs_channel_discovery ON processing_jobs (channel_discovery_id) WHERE channel_discovery_id IS NOT NULL;
CREATE INDEX idx_jobs_state_eligible ON processing_jobs (state, eligible_at, created_at);
CREATE INDEX idx_jobs_lease ON processing_jobs (lease_expires_at);

-- ---------------------------------------------------------------------------
-- provider attempts / payload audits
-- ---------------------------------------------------------------------------
CREATE TABLE provider_attempts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES processing_jobs (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  stage TEXT NOT NULL CHECK (stage IN ('caption','builder','verifier','tts')),
  substage TEXT NOT NULL CHECK (substage IN ('caption','builder_chunk','builder_aggregate','verifier','tts')),
  ordinal INTEGER NOT NULL,
  logical_attempt INTEGER NOT NULL CHECK (logical_attempt BETWEEN 1 AND 2),
  prompt_version_hash TEXT,
  schema_version_hash TEXT,
  config_version_hash TEXT,
  request_hash TEXT,
  output_hash TEXT,
  scope_approval_id TEXT NOT NULL REFERENCES provider_scope_approvals (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  policy_snapshot_id TEXT REFERENCES provider_policy_snapshots (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  runtime_binding_id TEXT REFERENCES provider_runtime_bindings (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('started','succeeded','failed','timed_out')),
  error_code TEXT,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  CHECK (
    (substage = 'builder_chunk' AND ordinal BETWEEN 1 AND 20)
    OR (substage <> 'builder_chunk' AND ordinal = 0)
  ),
  CHECK (
    (substage = 'caption' AND policy_snapshot_id IS NULL AND runtime_binding_id IS NULL)
    OR (substage <> 'caption' AND policy_snapshot_id IS NOT NULL AND runtime_binding_id IS NOT NULL)
  ),
  UNIQUE (job_id, substage, ordinal, logical_attempt)
);
CREATE INDEX idx_attempts_scope ON provider_attempts (scope_approval_id);
CREATE INDEX idx_attempts_policy ON provider_attempts (policy_snapshot_id);
CREATE INDEX idx_attempts_binding ON provider_attempts (runtime_binding_id);

CREATE TABLE provider_payload_audits (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES processing_jobs (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  provider_role TEXT NOT NULL CHECK (provider_role IN ('deepseek_builder','deepseek_verifier','fish_tts')),
  provider_attempt_id TEXT REFERENCES provider_attempts (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  guard_version TEXT NOT NULL,
  scope_attestation_version TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('allowed','scope_review_required','payload_rejected','runtime_binding_rejected')),
  field_names_json TEXT NOT NULL,
  semantic_payload_bytes INTEGER,
  semantic_payload_sha256 TEXT,
  forbidden_field_count INTEGER NOT NULL DEFAULT 0,
  expanded_scope_reason TEXT CHECK (expanded_scope_reason IN ('private_or_user_uploaded_document','internal_company_data','personal_conversation_or_memory','personal_data_health_finance_legal_or_election','children_or_biometric_data','multi_user_production','public_commercial_launch','third_party_customer_content','confidential_or_regulated_information','scope_ambiguous')),
  check_ordinal INTEGER NOT NULL,
  checked_at INTEGER NOT NULL,
  CHECK (
    (outcome = 'allowed' AND provider_attempt_id IS NOT NULL AND semantic_payload_bytes IS NOT NULL AND semantic_payload_sha256 IS NOT NULL AND forbidden_field_count = 0 AND expanded_scope_reason IS NULL)
    OR (outcome = 'scope_review_required' AND provider_attempt_id IS NULL AND semantic_payload_bytes IS NULL AND semantic_payload_sha256 IS NULL AND expanded_scope_reason IS NOT NULL)
    OR (outcome IN ('payload_rejected','runtime_binding_rejected') AND provider_attempt_id IS NULL AND semantic_payload_bytes IS NULL AND semantic_payload_sha256 IS NULL)
  ),
  UNIQUE (job_id, provider_role, check_ordinal)
);
CREATE UNIQUE INDEX uq_payload_audit_attempt ON provider_payload_audits (provider_attempt_id) WHERE provider_attempt_id IS NOT NULL;
CREATE INDEX idx_payload_audit_outcome ON provider_payload_audits (outcome, checked_at);

CREATE TABLE temporary_caption_artifacts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES processing_jobs (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  relative_temp_key TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  byte_count INTEGER NOT NULL,
  languages TEXT NOT NULL,
  kinds TEXT NOT NULL,
  delete_status TEXT NOT NULL CHECK (delete_status IN ('pending','deleted','overdue','failed')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  deleted_at INTEGER,
  CHECK (expires_at <= created_at + 86400000)
);
CREATE INDEX idx_temp_caption_delete ON temporary_caption_artifacts (deleted_at, expires_at);

-- ---------------------------------------------------------------------------
-- taxonomy
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','disabled')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (category_id, slug),
  UNIQUE (id, category_id)
);
CREATE TABLE topic_clusters (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  normalized_name TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  normalized_name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('person','company','product','tool','repo')),
  created_at INTEGER NOT NULL,
  UNIQUE (normalized_name, kind)
);

-- ---------------------------------------------------------------------------
-- content items + joins
-- ---------------------------------------------------------------------------
CREATE TABLE content_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  source_video_id TEXT NOT NULL REFERENCES source_videos (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  content_kind TEXT NOT NULL CHECK (content_kind IN ('news','analysis','tutorial','product_update','document')),
  category_id TEXT NOT NULL REFERENCES categories (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  subcategory_id TEXT NOT NULL,
  builder_output_json TEXT NOT NULL,
  builder_output_hash TEXT NOT NULL,
  builder_schema_version TEXT NOT NULL,
  builder_prompt_version TEXT NOT NULL,
  verifier_output_json TEXT NOT NULL,
  verifier_score REAL NOT NULL CHECK (verifier_score >= 0 AND verifier_score <= 10),
  verifier_schema_version TEXT NOT NULL,
  verifier_prompt_version TEXT NOT NULL,
  title TEXT NOT NULL,
  one_line_summary TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('built','verified','human_review_required','audio_pending','audio_ready','failed','deleted')),
  audio_ready_at INTEGER,
  correction_version INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (user_id, source_video_id),
  FOREIGN KEY (subcategory_id, category_id) REFERENCES subcategories (id, category_id) ON UPDATE RESTRICT ON DELETE RESTRICT
);
CREATE INDEX idx_content_items_user_audioready ON content_items (user_id, audio_ready_at, id);

CREATE TABLE content_item_topic_clusters (
  content_item_id TEXT NOT NULL REFERENCES content_items (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  topic_cluster_id TEXT NOT NULL REFERENCES topic_clusters (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  PRIMARY KEY (content_item_id, topic_cluster_id)
);
CREATE INDEX idx_citc_cluster ON content_item_topic_clusters (topic_cluster_id);
CREATE TABLE content_item_tags (
  content_item_id TEXT NOT NULL REFERENCES content_items (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  tag_id TEXT NOT NULL REFERENCES tags (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  PRIMARY KEY (content_item_id, tag_id)
);
CREATE INDEX idx_cit_tag ON content_item_tags (tag_id);
CREATE TABLE content_item_entities (
  content_item_id TEXT NOT NULL REFERENCES content_items (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  entity_id TEXT NOT NULL REFERENCES entities (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  PRIMARY KEY (content_item_id, entity_id)
);
CREATE INDEX idx_cie_entity ON content_item_entities (entity_id);

-- ---------------------------------------------------------------------------
-- audio + tts usage/receipts
-- ---------------------------------------------------------------------------
CREATE TABLE audio_assets (
  id TEXT PRIMARY KEY,
  content_item_id TEXT NOT NULL UNIQUE REFERENCES content_items (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('pending','generating','ready','failed','deleted')),
  storage_key TEXT,
  mime_type TEXT,
  byte_count INTEGER,
  duration_ms INTEGER,
  sha256 TEXT,
  generated_at INTEGER,
  deleted_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_audio_assets_status_generated ON audio_assets (status, generated_at);

CREATE TABLE daily_tts_usage (
  user_id TEXT NOT NULL REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  local_date TEXT NOT NULL,
  reserved_count INTEGER NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
  successful_count INTEGER NOT NULL DEFAULT 0 CHECK (successful_count >= 0),
  revision INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, local_date),
  CHECK (reserved_count + successful_count <= 10)
);

CREATE TABLE tts_generation_receipts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_id TEXT NOT NULL UNIQUE REFERENCES processing_jobs (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  content_item_id TEXT NOT NULL REFERENCES content_items (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  provider_idempotency_key TEXT NOT NULL UNIQUE,
  local_date TEXT NOT NULL,
  artifact_sha256 TEXT,
  artifact_bytes INTEGER,
  artifact_duration_ms INTEGER,
  staging_key TEXT,
  status TEXT NOT NULL CHECK (status IN ('requested','outcome_unknown','provider_failed','generated','staged','finalized','storage_failed','reconciled')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id, local_date) REFERENCES daily_tts_usage (user_id, local_date) ON UPDATE RESTRICT ON DELETE RESTRICT
);
CREATE INDEX idx_tts_receipts_user_date_status ON tts_generation_receipts (user_id, local_date, status);

-- ---------------------------------------------------------------------------
-- playback (server canonical)
-- ---------------------------------------------------------------------------
CREATE TABLE playback_items (
  user_id TEXT NOT NULL REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  content_item_id TEXT NOT NULL REFERENCES content_items (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('unheard','in_progress','completed','skipped')),
  last_position_ms INTEGER NOT NULL DEFAULT 0 CHECK (last_position_ms >= 0),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  play_count INTEGER NOT NULL DEFAULT 0,
  manual_replay_count INTEGER NOT NULL DEFAULT 0,
  last_played_at INTEGER,
  completed_at INTEGER,
  skipped_at INTEGER,
  revision INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, content_item_id),
  UNIQUE (user_id, content_item_id)
);
CREATE INDEX idx_playback_items_user_status ON playback_items (user_id, status);
CREATE INDEX idx_playback_items_user_updated ON playback_items (user_id, updated_at);
CREATE UNIQUE INDEX uq_playback_items_single_inprogress ON playback_items (user_id) WHERE status = 'in_progress';

CREATE TABLE briefing_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  entry_point TEXT NOT NULL CHECK (entry_point IN ('today_briefing','listen_global','category','tag','today_flow')),
  entry_context_id TEXT,
  device_run_id TEXT NOT NULL,
  snapshot_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','interrupted','completed')),
  revision INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_sessions_user_status_created ON briefing_sessions (user_id, status, created_at);

CREATE TABLE briefing_session_items (
  user_id TEXT NOT NULL REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  session_id TEXT NOT NULL REFERENCES briefing_sessions (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  content_item_id TEXT NOT NULL REFERENCES content_items (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  ordinal INTEGER NOT NULL,
  snapshot_status TEXT NOT NULL CHECK (snapshot_status IN ('unheard','in_progress','completed','skipped')),
  audio_ready_at INTEGER,
  PRIMARY KEY (session_id, ordinal),
  UNIQUE (session_id, content_item_id)
);
CREATE INDEX idx_session_items_content ON briefing_session_items (content_item_id);

CREATE TABLE global_playback_state (
  user_id TEXT PRIMARY KEY REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  active_content_id TEXT,
  active_session_id TEXT REFERENCES briefing_sessions (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  last_position_ms INTEGER NOT NULL DEFAULT 0 CHECK (last_position_ms >= 0),
  revision INTEGER NOT NULL DEFAULT 0,
  last_device_run_id TEXT,
  last_device_sequence INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id, active_content_id) REFERENCES playback_items (user_id, content_item_id) ON UPDATE RESTRICT ON DELETE RESTRICT
);

CREATE TABLE playback_mutations (
  client_mutation_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  device_run_id TEXT NOT NULL,
  device_sequence INTEGER NOT NULL CHECK (device_sequence >= 1),
  base_revision INTEGER NOT NULL,
  applied_revision INTEGER,
  action TEXT NOT NULL CHECK (action IN ('START','CHECKPOINT','SEEK','PAUSE','COMPLETE','SKIP')),
  content_item_id TEXT NOT NULL REFERENCES content_items (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  session_id TEXT NOT NULL REFERENCES briefing_sessions (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  position_ms INTEGER NOT NULL CHECK (position_ms >= 0),
  created_at INTEGER NOT NULL,
  applied_at INTEGER,
  UNIQUE (user_id, device_run_id, device_sequence)
);
CREATE INDEX idx_mutations_user_applied ON playback_mutations (user_id, applied_at);

-- ---------------------------------------------------------------------------
-- worker singleton + audit events
-- ---------------------------------------------------------------------------
CREATE TABLE worker_singleton (
  id TEXT PRIMARY KEY CHECK (id = 'worker'),
  lease_owner TEXT,
  lease_expires_at INTEGER,
  lease_heartbeat_at INTEGER
);
CREATE INDEX idx_worker_singleton_expiry ON worker_singleton (lease_expires_at);

CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user','manual_batch','manual_batch_item','channel','channel_discovery','source_video','processing_job','provider_attempt','provider_payload_audit','provider_policy_snapshot','provider_runtime_binding','temporary_caption_artifact','content_item','audio_asset','tts_generation_receipt','playback_item','briefing_session','playback_mutation','daily_tts_usage','backup')),
  entity_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_audit_events_type_created ON audit_events (event_type, created_at);
