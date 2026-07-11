# 16. Candidate Review & TTS Approval Pipeline

> 승인되지 않은 source, 검수에 통과하지 않은 script, `human_review_required` item은 TTS나 automatic queue에
> 들어가지 않는다.

## 목적과 MVP 적용 범위

이 문서는 일반 editorial candidate gate와 `VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001`의 두 승인 경로를
일관되게 만든다. 이 MVP는 실제 private server/provider pipeline을 요구하며 design/mock/sample-only로
완료하지 않는다. exact interfaces/schema/state/security는
[18번 문서](18_YouTube_Add_Global_Resume_MVP.md)가 정본이다.

D-009-A에 따라 live provider 범위는 Leo가 승인한 public YouTube low-risk technology content뿐이다.
Provider policy/control uncertainty는 exact limited/unverified record이고 current slice의 approval gate를
막지 않는다. Local scope/payload guard 실패 또는 expanded scope는 별도의 hard gate다.

## 승인 authority mapping

### Manual batch

- 사용자가 Add에서 1~10개 URL을 입력하고 D-009-A exclusion copy를 확인한 뒤 `분석·음성 생성`을 누르는
  것이 해당 batch의 explicit processing approval이자 versioned
  `public_low_risk_youtube_technology` attestation이다.
- CTA 전에는 URL syntax/canonical-form client preview만 한다. Caption, Builder, Verifier, TTS call은 없다.
- server는 item별 canonicalization/dedup/failure를 독립 처리한다. 한 항목 실패로 sibling approval을
  취소하지 않는다.

### Channel

- channel 등록 후 auto-processing ON은 그 stable public technology channel ID의 새 public-caption video에
  대한 취소 가능한 standing approval이자 fresh D-009-A scope attestation이다.
- OFF/delete는 approval version을 올린다. claim 전 job은 `approval_revoked`로 defer하고 재활성화 시
  idempotently 재개한다.
- 이미 시작한 provider call은 중간에 unsafe하게 자르지 않고 결과를 automatic queue에 publish하지 않은
  채 cleanup한다. Worker는 매 stage/TTS/publish 직전 approval version을 재확인하고 mismatch면
  `approval_revoked`로 defer한다.
- channel은 최대 5, poll은 hourly, poll당 unseen 승격은 최대 3이다.

### General editorial candidate

Manual URL/channel standing approval 이외의 long-term Source Pool 후보는 기존 MD/Leo human approval을
유지한다. 이 MVP가 Hot Topic이나 다른 source를 자동 승인하는 권한은 없다.

## pipeline

```text
approved source
  -> constrained public CaptionProvider
  -> local current-scope + exact payload guard (pre-provider; ambiguous/expanded stops)
  -> DeepSeek Builder
  -> separately prompted/contextualized/schema-bound DeepSeek Verifier attempt 1
     -> PASS gate: overallScore >= 9.0 AND criticalFailures=[]
     -> REVISE: DeepSeek Builder revision
        -> separate DeepSeek Verifier attempt 2
           -> PASS gate or human_review_required
  -> passed only: Fish TtsProvider
  -> atomic private AudioAsset ready
  -> automatic playback eligible as unheard
```

No login/cookie/video/audio acquisition, alternate/local LLM, provider fallback, attempt 3, or automatic human-review
bypass exists.

## provider role separation

| Role | Provider | Input context | Output/gate |
| --- | --- | --- | --- |
| Caption | constrained `yt-dlp` adapter | validated video ID only | isolated public VTT artifact metadata; raw text temporary |
| Local guard | server-only deterministic code | active scope approval/version + canonical public provenance + locally inspected ephemeral content + provider-role DTO | allowed value-free audit or pre-network `SCOPE_ESCALATION_REQUIRED`/payload/runtime rejection |
| Builder | DeepSeek | public source metadata + one required bounded public caption chunk/evidence refs; aggregate/revision gets strict generated outputs/public metadata/allowlisted finding refs only | strict `builder-chunk-output.v1` chunks then `builder-output.v1` Content Intelligence + audioScript |
| Verifier | DeepSeek | separate senior-editor rubric + public normalized evidence pack + parsed candidate; separate prompt/schema/model selector | strict `verifier-output.v1`, score/critical/findings |
| TTS | Fish Audio | final approved SpokenAudioScript + configured reference identifier + minimum synthesis parameters | verified private audio temp artifact |
| Human | Leo/Admin later | safe derived review view | this MVP has no action that directly promotes human-review item to TTS |

Builder와 Verifier는 같은 provider 계열이어도 adapter instance, system prompt, context constructor, schema,
configured model selector가 분리된다. Builder chunk/aggregate prompt는 각각
`builder.chunk.youtube-mvp.v1`/`builder.aggregate.youtube-mvp.v1`이고 Verifier prompt는
`verifier.youtube-mvp.v1`이다. Verifier만 prepared reasoning-effort config를 사용한다. 실제
endpoint/selector/effort/model/reference 값은 server runtime에만 있고 Git, DB, log, report, chat에 없다.
DeepSeek의 어느 role에도 user preference/history, notes/conversation, private project context, credential 또는
unrelated data가 없다. Fish에는 raw transcript, VideoContentMap, AnalyticSummary, verifier evidence,
playback/user data, app ID, credential/secret가 없고 authorization header는 semantic guard 뒤 adapter가 붙인다.

## D-009-A scope escalation gate

Manual/channel approval version과 `ProviderScopeApproval`이 일치하지 않으면 caption/provider claim을 하지
않는다. Public caption은 local ephemeral acquisition까지 가능하지만 DeepSeek request를 만들기 전에
`ProviderPayloadGuard`가 provenance, denial signals/ambiguity, recursive exact field allowlist, runtime binding을
검사한다. Provider output으로 scope를 승인하지 않는다. Current technology taxonomy와 충돌하는 Builder
output도 후속 provider/TTS를 멈춘다.

다음 exact reasons는 value-free `provider_payload_scope_checked`와
`provider_scope_escalation_required` event를 남기고 network attempt 없이 `human_review_required` /
`SCOPE_ESCALATION_REQUIRED`로 끝난다: private/user-uploaded document, internal company data, personal
conversation/memory, personal-data health/finance/legal/election, children/biometric data, multi-user production,
public commercial launch, third-party customer content, confidential/regulated information, ambiguous scope.
Retry, channel re-toggle, operator action, verifier는 이 gate를 해제할 수 없고 새 Leo/GPT decision이 필요하다.

## Provider policy record와 current-scope acceptance

DeepSeek와 Fish Audio 각각 `ProviderPolicySnapshot`에 provider, official policy/API URLs, policy effective/
last-updated date, review date, public document-set hash/lookup status, retention/training/deletion/data-control statement
codes, locally verified codes, independently unverified codes를 보존한다. Review date는 2026-07-11이며 DeepSeek
Privacy Policy last update는 2026-02-10, Fish Privacy Policy effective date는 2024-08-28이다. Public API surfaces는
DeepSeek `POST /chat/completions`, Fish `POST /v1/tts`다. Actual configured endpoint/model/reasoning/reference는
role-specific private HMAC binding/config version으로만 evidence를 남기고 value/key를 노출하지 않는다.

Official evidence/limits의 full table과 URLs는 [18번 §7.5](18_YouTube_Add_Global_Resume_MVP.md#75-d-009-a-provider-policy-evidence와-assurance)가
정본이다. Lookup unavailable/changed 또는 configured provider-side control 미검증은 아래 literal labels로
기록하고, 그것만으로 current public low-risk technology pipeline을 중단하지 않는다.

```text
PROVIDER_POLICY_ASSURANCE: LIMITED_AND_UNVERIFIED
LOCAL_DATA_CONTROLS: VERIFIED
PROVIDER_SIDE_DELETION: NOT_VERIFIED
PROVIDER_SIDE_NO_TRAINING: NOT_VERIFIED
PRODUCTION_PRIVACY_APPROVAL: NOT_GRANTED
```

`LOCAL_DATA_CONTROLS: VERIFIED`는 scope approval/guard, exact payload allowlist, no-body logging, ephemeral local
caption deletion test만 의미한다. Local deletion이 provider copy를 삭제한다, inputs are never retained/trained,
provider-side deletion is verified, private safeguards equal production compliance라는 주장은 금지한다.

## strict quality gate

Verifier rubric은 최소 다음을 별도 dimension/critical checks로 다룬다.

- fidelity/unsupported claim
- coverage/material omission
- number/name/entity correctness
- fact/opinion/prediction/causality
- spoken clarity/audio fitness
- provenance/evidence refs
- overstatement/safety/scope
- source를 대체할 정도의 재현/copyright risk

Server는 model verdict를 그대로 신뢰하지 않는다.

```text
PASS = verdict == PASS
   AND overallScore >= 9.0
   AND criticalFailures.length == 0
```

8.9는 fail이다. Score가 9.0이어도 critical failure 하나면 fail이다. JSON schema parse failure는 PASS로
repair하지 않고 typed failure/review path로 보낸다.

## two-attempt rule

`verifierAttempts`는 실제 Verifier HTTP submission 수다. Verifier에는 attempt 밖의 숨은 network retry가
없으며 timeout/429/5xx 후 다시 submit하려면 다음 attempt를 소비한다.

1. DeepSeek Builder draft 생성
2. DeepSeek Verifier logical attempt 1
3. PASS가 아니고 safe revision 가능하며 aggregate submission budget이 남으면 strict prior candidate와
   finding code/evidence ref만 Builder revision context에 전달
4. DeepSeek Builder revised output 생성; budget이 없으면 `human_review_required`
5. DeepSeek Verifier logical attempt 2
6. non-PASS면 `human_review_required`

Verifier가 script를 계속 직접 고치거나 Builder/Verifier를 세 번째 호출하지 않는다. `human_review_required`
row에는 TTS transition과 automatic queue eligibility가 없다. 사용자가 retry를 눌러 cap을 초기화할 수도 없다.

## state model

```text
queued
  -> captioning
  -> building
  -> verifying(attempt=1)
     -> building(revision)
     -> verifying(attempt=2)
  -> tts_queued
  -> synthesizing
  -> audio_ready

side states:
  deferred(daily_tts_cap | channel_poll_cap | approval_revoked |
           lease_recovery | retry_backoff | worker_unavailable)
  human_review_required
  failed
  canceled
  deleted
```

- Limit hit은 `deferred`이며 delete/discard가 아니다.
- TTS call 전 unique intent + daily reservation을 잡고, valid Fish audio response만 reservation을 daily
  success로 전환한다. Outcome-unknown은 reservation을 유지하고 자동 재호출하지 않는다. 그 뒤 deterministic
  staging/file recovery와 AudioAsset/ContentItem atomic publish가 성공해야 `audio_ready`다.
- ContentItem마다 non-deleted AudioAsset row는 정확히 하나다.
- Retryable crash는 같은 job/idempotency/provider attempt를 lease recovery한다. output이 확정되지 않은
  request를 새 job으로 복제하지 않는다.

## Candidate/Add presentation

Add item은 raw provider data 없이 다음만 표시한다.

- canonical source title/video ID/channel name의 public metadata
- approval origin: manual batch 또는 channel standing approval
- source scope `public_low_risk_youtube_technology`와 active approval version; expanded-scope 내용/원문은 표시하지
  않고 safe `범위 재승인 필요` 상태만 표시
- stage/status, Verifier attempt `1/2` 또는 `2/2`
- `준비됨`, `다음 한도로 연기`, `사람 검토 필요`, retryable safe error
- created/last updated/next eligible time

`human_review_required` copy는 `자동 음성 생성 기준을 통과하지 못해 사람 검토가 필요해요`다. TTS retry
button은 없다. Caption content, Builder/Verifier text, model/reference, provider response는 표시하지 않는다.

## limits and cost gate

| Gate | Value | Behavior |
| --- | --- | --- |
| manual batch | max 10 | 11th rejected before batch mutation |
| channels | max 5 | 6th insert transaction rejected |
| poll | hourly | DB `nextPollAt`, no overlapping lease |
| unseen/channel/poll | max 3 | oldest deferred first; remainder retained |
| successful TTS/user/day | max 10, Asia/Seoul | next day deferred; explicit failure releases reservation, outcome-unknown keeps it |
| pipeline | concurrency 1 | singleton DB lease + one service instance |
| verifier | max 2 total | human review stop |

Daily cap은 TTS call 전 intent/reservation transaction으로 강제한다. Explicit provider failure는 reservation을
release하고, timeout/unknown은 유지하며, valid response는 success로 전환한다. Reserved+successful이 10을
넘지 않는다. Storage/publish 실패도 이미 성공한 generation이면 success를 유지한다.
모든 cap/defer row는 UI와 audit에 safe reason/eligible time을 남긴다.

## caption/derived retention boundary

- Caption은 public no-login source에서 `--skip-download`로만 취득한다.
- Raw caption은 isolated `0600` temp, Builder/Verifier 처리 뒤 즉시 삭제, 어떤 경우도 24시간 초과 금지다.
- Original YouTube video/audio는 다운로드/보관하지 않는다.
- Derived analysis/script/provenance/generated audio는 user deletion까지 private storage에 유지한다.
- Provider/body/caption/script는 logs/events/test fixtures/backups/reports에 없다.

## failure behavior

| Failure | Result |
| --- | --- |
| invalid/duplicate URL | 해당 item만 invalid/duplicate; sibling 계속 |
| captionless/login challenge | `PUBLIC_CAPTION_UNAVAILABLE`, fail closed |
| missing/revoked scope approval, expanded/ambiguous scope | pre-network value-free audit + `SCOPE_ESCALATION_REQUIRED`; new Leo/GPT decision 전 retry 불가 |
| provider payload allowlist/runtime binding mismatch | pre-network `PAYLOAD_GUARD_REJECTED`/`RUNTIME_BINDING_REJECTED`; attempt 없음 |
| public policy lookup unavailable/changed or no-training/deletion unverified | exact LIMITED/NOT_VERIFIED record; alone does not block current scope |
| timeout/rate/5xx | bounded typed retry 또는 defer; alternate provider 없음 |
| invalid Builder/Verifier schema | typed invalid schema; no permissive repair |
| attempt 2 non-PASS | `human_review_required`, no TTS |
| TTS provider failure | intent를 provider_failed로 기록, reservation release, no success/audio_ready |
| TTS outcome unknown | reservation 유지, no automatic provider retry/audio_ready until reconciliation |
| TTS success then storage/publish failure | receipt/count 유지, no audio_ready, same provider call 자동 반복 금지 |
| approval revoked | unstarted channel job defer; re-enable resumes |
| daily cap | next Asia/Seoul day defer; never discard |
| process crash | expired lease reclaim and idempotent stage resume |

Caption, 각 Builder substage, TTS의 actual provider submission은 initial 포함 최대 2다. UI retry는 같은
job/version의 남은 budget만 사용하고 reset하지 않는다. Verifier는 별도의 총 2-attempt rule을 따른다.

## review/acceptance checklist

- [ ] Manual CTA/channel ON 외 approval bypass 0
- [ ] Exact scope attestation/version + every expanded-scope reason + ambiguity가 provider attempt 전에 stop
- [ ] DeepSeek chunk/aggregate/verifier와 Fish wire capture가 exact allowlist이고 user preference/history/private
      context, raw transcript/VideoContentMap/AnalyticSummary, credential/secret 금지 field 0
- [ ] Builder/Verifier separate prompt/context/schema/model-selector path 증명
- [ ] 8.9, 9.0, critical failure, invalid JSON, attempt 2, no attempt 3 tests
- [ ] `human_review_required` -> TTS/automatic transition impossible
- [ ] Fish configured model/reference 사용은 safe config version evidence로만 증명
- [ ] DeepSeek/Fish official policy records + private role runtime bindings + exact five labels; lookup/control
      uncertainty alone current slice blocker 0; prohibited provider control claim 0
- [ ] per-item isolation, limits/defer/requeue/restart/duplicate AudioAsset tests
- [ ] temp immediate deletion + 24h backstop and raw/original/secret absence
- [ ] real private selected source end-to-end; sample/mock provider evidence 0

## 관련

- [10_DataModel](10_DataModel_데이터구조.md)
- [14_Video_Briefing_Quality_Strategy](14_Video_Briefing_Quality_Strategy.md)
- [15_Source_Pool_and_Editorial_Curation](15_Source_Pool_and_Editorial_Curation.md)
- [18_YouTube_Add_Global_Resume_MVP](18_YouTube_Add_Global_Resume_MVP.md)
