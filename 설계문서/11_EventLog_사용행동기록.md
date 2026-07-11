# 11. Event Log · 사용 행동 기록

## 목적
결제/유료화는 구현하지 않는다. 제품 가치 측정과 private pipeline/playback 운영을 위해 safe event와
audit 구조를 정의한다. raw caption, script, provider body, URL query, token/secret은 event payload가 아니다.
Current D-009-A provider audit는 policy uncertainty와 local scope/payload failure를 구분한다. 전자는 exact
limited/unverified evidence이고, 후자만 provider call 전 block/escalation event다.

## 사용자 경험
사용자에게는 보이지 않는다. 기존 영역은 콘솔/메모리 skeleton이지만 18번 MVP event는 server
`audit_events`와 device outbox에 durable하게 기록한다.

## 추적할 이벤트
- `news_played`
- `news_completed`
- `news_skipped`
- `news_replayed`
- `next_chapter_clicked`
- `previous_chapter_clicked`
- `explore_more_opened`
- `daily_recap_generated`
- `daily_recap_replayed`
- `recap_card_saved`
- `scheduled_briefing_created`
- `scheduled_briefing_completed`
- `saved_card_opened`
- `product_card_viewed`
- `product_card_saved`
- `voice_command_used`
- `foundation_candidate_created`
- `provider_policy_reviewed`
- `provider_runtime_binding_verified`
- `provider_payload_scope_checked`
- `provider_scope_escalation_required`
- `provider_assurance_recorded`

### 블록 2 · 오디오 플레이어 (추가)
- `audio_play_started`
- `audio_paused`
- `audio_completed`
- `chapter_next_clicked`
- `chapter_previous_clicked`
- `audio_seeked`

## 데이터 모델
`EventLog { id, event, payload, createdAt }` (→ [10_DataModel](10_DataModel_데이터구조.md))

## 현재 상태

입력 head의 `src/lib/eventLog.ts`는 메모리/console skeleton이다. 18번 MVP 구현에서는 safe allowlisted
event만 device/server에 저장하며 console에 payload 전체를 출력하지 않는다.

## 구현할 컴포넌트
- `logEvent()` 함수 (컴포넌트 아님)
- 각 화면 액션에서 호출

## 구현 전 확인사항
- 이벤트 이름 상수화(오타 방지) — `EVENTS` 객체로.

## 나중에 연결될 기능
실제 분석 백엔드 전송, 기능별 가치 대시보드, 유료화 후보 선정.

## 구현 체크리스트
- [ ] `logEvent` mock 구현
- [ ] 최소 재생/스킵/저장/더알아보기/recap 생성에서 호출
- [ ] 이벤트 이름 상수화
- [ ] D-009-A policy/runtime/payload/scope/assurance event가 exact safe schema를 사용하고 raw value/body를
      serializer와 DB CHECK/test가 거부

### 수집/파이프라인 이벤트

아래 이벤트는 18번 private MVP에서 실제 safe audit 대상이다. 다른 source의 장기 확장은 future다.

파이프라인 대응: `YouTube URL → metadata → transcript(temporary cache) → Content Intelligence JSON → audioScript → Fish Audio TTS → audioAsset(mp3) → Global News Pool 등록 → Personal Briefing Plan 조립 → 재생`

| 이벤트 | 파이프라인 단계 | 언제 기록 | safe payload |
|---|---|---|---|
| `content_ingested` | 소스 수집 | validated public metadata 확보 | `{ contentId, sourceType, videoId, channelId }` |
| `caption_artifact_created` | temporary caption | isolated artifact 생성 | `{ jobId, artifactId, bytes, languages, expiresAt }` |
| `caption_artifact_deleted` | hard cleanup | 즉시/backup sweeper 삭제 | `{ jobId, artifactId, deletedAt, deletionReason }` |
| `content_intelligence_built` | Content Intelligence JSON | ContentItem의 analysis/taxonomy(sourceType·contentKind·topicCategory) 등 조립 완료 | `{ contentId, contentKind, topicCategory }` |
| `builder_completed` | DeepSeek Builder | strict schema parse/hash 완료 | `{ jobId, attempt, promptVersion, schemaVersion, outputHash }` |
| `verifier_completed` | separate DeepSeek Verifier | score/gate 완료 | `{ jobId, attempt, score, criticalCount, verdict, outputHash }` |
| `tts_generated` | audioScript → TTS → AudioAsset | private AudioAsset atomic finalize | `{ contentId, audioAssetId, durationSec, sha256, localDateCount }` |
| `content_pooled` | Global News Pool 등록 | 준비 완료된 ContentItem을 공통 풀에 등록(조립 후보로 노출) | `{ contentId, topicCategory }` |
| `briefing_assembled` | Personal Briefing Plan 조립 | 사용자별 브리핑을 조립(사용자마다 다른 묶음, TopicCluster/"오늘의 흐름" 구성) | `{ userId, planId, itemCount }` |
| `source_fetch_failed` | 수집 실패 | public caption unavailable/timeout/bound failure | `{ sourceType, videoId, safeErrorCode, retryable }` |
| `job_deferred` | limit/approval | cap 또는 revoke로 보존 | `{ jobId, deferReason, eligibleAt }` |
| `channel_polled` | hourly discovery | channel poll commit | `{ channelId, discoveredCount, promotedCount, deferredCount, nextPollAt }` |

- `EVENTS` 상수 객체에 위 키도 함께 정의(오타 방지).
- `source_fetch_failed`는 bounded retry/defer 판단에 쓰며 cookie/login/original media fallback을 시작하지 않는다.
- 타입 정본은 [10_DataModel](10_DataModel_데이터구조.md), 파이프라인/수집 정책 상세는 관련 파이프라인·SourceAdapter 문서를 따른다.

### D-009-A provider policy/scope audit events

| 이벤트 | 언제 기록 | exact safe payload |
| --- | --- | --- |
| `provider_policy_reviewed` | local-control preflight 통과 뒤 DeepSeek/Fish official lookup과 exact snapshot commit | `{ policySnapshotId, provider, policyUrlSetHash, policyEffectiveOrUpdatedDate, reviewedAt, documentSetSha256, lookupStatus, publicStatementCodes, verifiedLocalControlCodes, controlsNotIndependentlyVerified }` |
| `provider_runtime_binding_verified` | configured role가 public API surface와 맞음을 local HMAC으로 확인 | `{ runtimeBindingId, providerRole, publicApiSurfaceId, auditKeyId:'provider-audit-hmac-v1', configVersionHash, endpointOriginHmac, modelSelectorHmac, reasoningSelectorPresent, referenceSelectorPresent, credentialPresent, verifiedAt }` |
| `provider_payload_scope_checked` | 모든 DeepSeek/Fish semantic request의 pre-network guard 완료 | `{ jobId, payloadAuditId, providerRole, scopeApprovalId, guardVersion, scopeAttestationVersion, outcome, recursiveFieldNames, semanticPayloadBytes|null, semanticPayloadSha256|null, forbiddenFieldCount, expandedScopeReason, checkedAt }` |
| `provider_scope_escalation_required` | private/internal/personal/sensitive/children/production/commercial/customer/confidential/regulated 또는 ambiguous scope 감지 | `{ jobId, scopeApprovalId, sourceScope, expandedScopeReason, safeErrorCode:'SCOPE_ESCALATION_REQUIRED', checkedAt }` |
| `provider_assurance_recorded` | acceptance가 provider record 두 개와 local control test를 집계 | `{ providerPolicyAssurance:'LIMITED_AND_UNVERIFIED', localDataControls:'VERIFIED', providerSideDeletion:'NOT_VERIFIED', providerSideNoTraining:'NOT_VERIFIED', productionPrivacyApproval:'NOT_GRANTED', policySnapshotIds, runtimeBindingIds, recordedAt }` |

`recursiveFieldNames`는 sorted field-name set일 뿐 값이나 prompt/body가 아니다. Policy URL/date/statement의 정본은
public `ProviderPolicySnapshot`이고 event는 그 ID/hash/code만 복제한다. Runtime HMAC/config hash는 private audit
evidence이며 endpoint/model/reference 원값과 audit key는 event에 없다. `provider_payload_scope_checked`의
`providerAttemptId`는 event payload에 넣지 않고 DB FK로 resolve한다; pre-network block이면 attempt 자체가 없다.

Policy lookup `unavailable`/`changed_since_review`, no-training/deletion 미검증은
`provider_policy_reviewed`/`provider_assurance_recorded`로 남지만 그 사실만으로 `job_blocked` 또는
`provider_scope_escalation_required`를 만들지 않는다. 반대로 scope/payload/runtime binding failure는 network
attempt와 `builder_completed`/`verifier_completed`/`tts_generated`가 없는 것이 acceptance evidence다.

금지 payload는 raw/public caption text, SpokenAudioScript text, VideoContentMap/AnalyticSummary values, title,
user preference/history/notes/conversation, private document or personal data, submitted URL/query, provider request/
response, endpoint/model/reference/credential actual value, authorization header, audio bytes/path다. Local deletion
event를 provider copy deletion으로, assurance event를 no-retention/no-training/production approval로 표현하지 않는다.

### 전역 playback event

| 이벤트 | 조건 | safe payload |
| --- | --- | --- |
| `automatic_session_started` | immutable snapshot commit | session ID, entry point, item count, snapshot time |
| `automatic_resume_started` | active incomplete seek/play | content/session ID, rounded position/duration |
| `audio_play_started` | native `playing=true` | content/session ID, mode, revision |
| `audio_paused` / `audio_seeked` | control + checkpoint | IDs, rounded position, revision |
| `audio_completed` / `audio_skipped` | exact state mutation | IDs, prior/new state, revision |
| `manual_replay_started/completed` | isolated replay | content ID, manual play count; automatic fields 없음 |
| `playback_checkpoint_deferred` | offline/server failure | client mutation ID, safe error code |
| `playback_conflict_reconciled` | 409 reconcile | client/applied revision, outcome code |

Position은 운영에 필요한 integer seconds만 기록한다. title, source URL, script, audio URL/header는 event에 없다.
상세 redaction/retention은 [18번 §12](18_YouTube_Add_Global_Resume_MVP.md#12-security-privacy-copyright-retention)를 따른다.
