# 12. Implementation Roadmap

## 목적

현재 Expo frontend skeleton에서 실제 private YouTube -> generated audio -> user-global resume vertical slice로
이동하는 순서와 gate를 정의한다. 한 단계의 실패를 다음 단계가 mock/sample/alternate provider로 숨기지
않는다.

## 현재 기준선

- Expo SDK 57 / Expo Router / React Native / TypeScript frontend
- Listen, Briefing, Recap, Saved, Settings 탭과 push screen skeleton
- `expo-audio` 기반 screen-local partial playback
- hard-coded mock content와 remote sample audio
- backend, DB, auth, ingestion worker, persistence, automated tests 없음

과거 skeleton/quality/source-pool 문서는 방향과 UI를 검증했지만 이 MVP의 completion evidence가 아니다.
실제 구현의 정본은 [18_YouTube_Add_Global_Resume_MVP](18_YouTube_Add_Global_Resume_MVP.md)다.

## 구현 블록과 순서

### Gate 0 — frozen design과 environment preflight

1. Worker가 Advisor가 준 exact `FROZEN_DESIGN_HEAD`, subject paths, write allowlist를 확인한다.
2. local/origin base와 clean worktree를 확인하고 `.env.server.local`을 열거나 값을 출력하지 않는다.
3. Node >=22.13, npm, yt-dlp executable, private state directory, systemd 권한의 존재/버전만 safe하게 확인한다.
4. Operator가 준비한 Tailscale Serve/grant/Funnel-disabled state와 implementation-defined runtime config
   presence는 redacted check로만 확인하고 login/access-policy/config value를 읽거나 바꾸지 않는다.
5. D-009-A public policy seeds와 official lookup status를 확인하되 lookup failure/provider-side control
   미검증만으로 current public low-risk technology slice를 block하지 않는다.
6. repo/server 사실이 설계와 다르면 `DESIGN_DEFECT`로 멈춘다.

### Block 1 — package와 contract skeleton

- Expo packages: `expo-sqlite`, `expo-secure-store`를 `npx expo install`로 추가한다.
- Server packages: Fastify 5, Zod, better-sqlite3, fast-xml-parser, tsx/type support를 lock한다.
- `src/api/contracts.ts`와 `server/src/domain/contracts.ts`가 같은 versioned DTO/schema를 사용하게 한다.
- package scripts: lint, typecheck, unit, integration, config check, migration, three server processes,
  private acceptance를 추가한다.

Gate: `npm ci`, `npx expo install --check`, `npx expo-doctor`, typecheck가 통과하고 client bundle에서 server
module/env import가 0이어야 한다.

### Block 2 — server DB/migration/config

- raw migration 001로 User/Batch/Channel/Discovery/Source/Job/ProviderScopeApproval/ProviderPolicySnapshot/
  ProviderRuntimeBinding/Attempt/ProviderPayloadAudit/TempArtifact/Taxonomy/Content/Audio/Playback/Session/
  DailyUsage/Lease/Audit tables를 만든다.
- WAL, foreign keys, unique/check/index, schema checksum을 시작 시 검증한다.
- `/var/lib/vibenews-dev` permission/path가 repository/static root 밖인지 검증한다.
- Binding row가 없을 때만 private audit HMAC key를 exact mode/path로 create-exclusive하고, existing row 뒤
  missing/mis-owned key는 교체하지 않고 readiness failure로 처리한다.
- server config는 required key 존재/non-placeholder만 확인하고 실제 값을 log하지 않는다.
- Prepared provider names의 exact allowlist는 `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`,
  `DEEPSEEK_BUILDER_MODEL`, `DEEPSEEK_VERIFIER_MODEL`, `DEEPSEEK_VERIFIER_REASONING_EFFORT`, `FISH_API_KEY`,
  `FISH_TTS_MODEL`, `FISH_REFERENCE_ID`뿐이다. Actual endpoint/model/reference values는 role-tagged private HMAC
  binding으로만 audit한다.

Gate: empty DB migration, repeat/no-op, checksum mismatch, FK/unique/cap transaction, online backup/restore test.

### Block 3 — private API/auth/audio

- fixed user `leo`와 opaque bearer token hash verification을 구현한다.
- Settings의 `서버 연결 코드`를 SecureStore에 수동 provision한다.
- health, manual batch, channel, library, session, playback, content deletion/correction routes를 구현한다.
- audio는 opaque ID + authorized single Range stream만 제공한다.
- Fastify는 `127.0.0.1`만 listen하고 app은 operator-provided tailnet-only Tailscale Serve HTTPS URL만 쓴다.

Gate: request/response/error schemas, missing/wrong token, redaction, 200/206/416, traversal/deleted asset tests.

### Block 4 — constrained public caption source

- exact HTTPS YouTube URL/channel canonicalization과 stable ID dedup을 구현한다.
- shell false `yt-dlp --skip-download` allowlist, no login/cookie/media, process/file/time/duration/byte bounds를
  구현한다.
- isolated `0700` temp와 immediate `finally` cleanup, 15분 sweeper, 24시간 hard deadline을 구현한다.
- channel Atom feed poller와 cursor/ETag/deferred discovery를 구현한다.
- Manual CTA/channel ON이 만든 exact `public_low_risk_youtube_technology` approval/version을 source provenance에
  묶고, public metadata/caption을 provider 전에 local denied-scope/ambiguity 검사한다.

Gate: captionless/login challenge/timeout/oversize/symlink/path escape/kill cleanup, selected public metadata,
hourly due behavior, poll당 unseen 최대 3과 no-discard test.

### Block 5 — provider pipeline

```text
CaptionProvider
  -> DeepSeek Builder chunks (builder.chunk.youtube-mvp.v1 / builder-chunk-output.v1)
  -> DeepSeek Builder aggregate (builder.aggregate.youtube-mvp.v1 / builder-output.v1)
  -> separate DeepSeek Verifier (verifier.youtube-mvp.v1 / verifier-output.v1)
  -> server gate score >=9.0 and criticalFailures=0
  -> Fish TtsProvider
  -> atomic private AudioAsset ready
```

- 모든 LLM stage는 DeepSeek다. Builder/Verifier prompt, context, schema, model selector가 분리된다. 두 adapter만
  prepared DeepSeek API/base names를 쓰고 Verifier만 prepared reasoning-effort name을 request에 적용한다.
- Verifier는 총 2회다. 두 번째 non-pass는 `human_review_required`; TTS/automatic queue가 없다.
- Fish adapter만 prepared Fish API/TTS-model/reference names를 쓰며 실제 값은 runtime-only다.
- job lease, stage idempotency, safe hashes, retry taxonomy, daily successful TTS max 10을 구현한다.
- `ProviderPayloadGuard`는 network 전에 active scope approval, exact role/runtime binding, recursive field allowlist를
  검사하고 field names/bytes/hash/outcome만 audit한다. DeepSeek aggregate에는 user preference/history/private
  context가 없고 Fish에는 final approved SpokenAudioScript, configured reference identifier, minimum synthesis
  params만 있다. Adapter는 guard 뒤 authorization을 붙인다.
- DeepSeek/Fish official policy URL/date/review/API surface/statement/local/unverified codes와 exact five labels를
  versioned snapshot으로 기록한다. Lookup unavailable/changed 또는 provider no-training/deletion 미검증은
  limited/unverified로 남고 그 사실만으로 current slice를 막지 않는다.

Gate: schema invalid, score 8.9/9.0, critical failure, no attempt 3, no provider fallback, TTS reservation/
outcome-unknown/crash/partial/duplicate, day-boundary defer, role payload-capture/forbidden-field absence, all expanded
scope pre-network stops, runtime-binding mismatch, policy-unavailable nonblocking, exact-label/prohibited-claim tests.

### Block 6 — Add tab과 기존 Briefing 보존

- 하단 Briefing tab을 Add로 교체하고 기존 Briefing UI는 root push route로 옮긴다.
- 최대 10 URL, item별 validation/progress/failure isolation, CTA explicit approval + exact D-009-A scope
  attestation/copy를 구현한다.
- 최대 5 channel, ON이면 fresh scope attestation, OFF이면 approval revoke, delete/tombstone, poll/defer status를
  구현한다.
- Listen/Add에서 기존 Briefing/Schedule flow에 계속 도달한다.
- loading/empty/error/recovery, Dynamic Type, screen reader, focus, reduce motion을 검증한다.

Gate: 11th URL/6th channel, duplicate, sibling isolation, approval revoke/re-enable, route reachability,
accessibility tests.

### Block 7 — device DB와 global player

- root `SQLiteProvider`, migration, playback journal/outbox를 구현한다.
- screen-local player를 root-lifetime `createAudioPlayer` singleton으로 교체한다.
- server canonical revision + local immediate checkpoint/reconcile을 구현한다.
- Today/Listen/Category/Tag/Flow를 같은 automatic session command로 연결한다.
- active-first, immutable snapshot, `audioReadyAt,id`, completed/skipped exclusion, manual replay isolation을
  구현한다.

Gate: state-machine unit tests, process restart/offline/409 conflict, one player/listener, background playback,
A/B/C/D·2:14 device acceptance.

### Block 8 — operations, retention, rollback

- API/worker/poller systemd units, loopback-only bind, hardening, readiness를 구현한다. Tailscale Serve/grant는
  operator-owned prerequisite로 redacted validation만 하고 Worker가 login/enable/grant/Funnel state를 바꾸지 않는다.
- temp/orphan cleanup, user deletion/correction, daily DB/audio backup/restore drill을 구현한다.
- safe deployment/rollback and data compatibility instructions를 docs에 기록한다.

Gate: kill/restart/lease reclaim, overdue cleanup blocks claims, backup generation restore, previous commit rollback,
origin/clean evidence, loopback listener, Funnel disabled, authorized tailnet device success, public/non-tailnet denial.

### Block 9 — real private acceptance

다음 stable public identifiers만 입력으로 사용한다.

```text
VIDEO_ID: 5JqK9JLD140
CHANNEL_ID: UCx_YiR733cfqVPRsQ1n8Fag
```

Transcript 내용, provider response, secret/model/reference value를 evidence에 넣지 않는다. safe evidence는
stage/attempt/config version, IDs, hashes, score/critical count, timestamps, byte/duration, deletion audit,
AudioAsset ID, playback state/revision, public policy snapshot metadata, private runtime-binding HMAC IDs, scope
approval, value-free payload audits뿐이다. Output은 exact five D-009-A labels를 문자 그대로 포함한다.

실제 acceptance가 transient source/provider 문제로 실패하면 truthful failure를 반환한다. sample audio,
synthetic provider output, alternate LLM로 PASS를 만들지 않는다.

## pipeline 단계 정본

| 순서 | 입력 | 처리자 | output/gate |
| --- | --- | --- | --- |
| 1 | 승인된 manual URL 또는 ON channel discovery | API/poller | canonical stable ID, idempotent queued job |
| 2 | validated video ID | CaptionProvider | public VTT temp artifact; bounds/provenance |
| 3 | active approval + public provenance + local caption | ProviderPayloadGuard | current scope only; exact Builder fields; expanded/ambiguous stops before network |
| 4 | allowed public caption chunks + evidence refs + public metadata | DeepSeek Builder chunk/aggregate | strict `builder-chunk-output.v1` then `builder-output.v1`; no user data |
| 5 | independent public evidence + Builder output | DeepSeek Verifier | strict `verifier-output.v1`; no user/private context |
| 6 | score/gate | server | PASS only at >=9.0 and no critical; max 2 |
| 7 | final approved SpokenAudioScript + configured reference + minimum params | guarded Fish TtsProvider | verified temp mp3; no transcript/analysis/user data |
| 8 | valid TTS artifact + DB/files | worker receipts/staging/finalize | provider success receipt/count once, then exactly one private AudioAsset `ready` |
| 9 | ready item | automatic session service | active first + immutable unheard snapshot |
| 10 | authorized AudioAsset | Expo global player | persisted playback/mutation/event |

## limit/recovery 정본

| 제한 | 값 | hit |
| --- | --- | --- |
| links/batch | 10 | request/item validation; 기존 state 불변 |
| registered channels | 5 | insert transaction reject |
| channel poll | hourly | `nextPollAt`; overlapping lease 없음 |
| unseen/channel/poll | 3 | oldest deferred first; 나머지 보존 |
| successful TTS/user/day | 10, Asia/Seoul | next local day로 defer |
| pipeline concurrency | 1 | singleton DB lease + systemd |
| verifier attempts | 2 total | human review, no TTS |

Worker lease는 5분/30초 heartbeat이며 expired stage를 same idempotency key로 reclaim한다. provider/source
failure는 typed retryability와 bounded retry만 사용한다.

## exact verification commands

```bash
npm ci
npx expo install --check
npx expo-doctor
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run server:migrate -- --dry-run
npm run server:config-check
npm run test:runtime-local
npm run accept:private -- --video-id 5JqK9JLD140 --channel-id UCx_YiR733cfqVPRsQ1n8Fag
```

## stop conditions

- frozen design과 repo/server/Expo 사실 충돌
- new public/production/multi-device/non-YouTube 요구
- private/user-uploaded/internal/customer content, personal conversation/memory, personal-data health/finance/legal/
  election, children/biometric, multi-user production, commercial launch, confidential/regulated scope 또는 ambiguity
- active scope approval, payload allowlist, local deletion/log redaction, runtime binding을 검증할 수 없음
- cookie/login/original media 또는 alternate model 필요
- missing material schema/API/UX decision
- temp caption deadline/secret boundary/private storage를 지킬 수 없음
- operator-owned tailnet/runtime config 준비가 없음 (`RUNTIME_ACCESS_REQUIRED`/`RUNTIME_CONFIG_REQUIRED`; public
  fallback이나 외부 state mutation 금지)

Worker는 이 경우 workaround나 design edit를 하지 않고 Advisor에만 정확한 `DESIGN_DEFECT` 또는 blocker를
반환한다. Provider public-policy lookup 실패나 provider-side no-training/deletion control 미검증만은 위 stop
condition이 아니며 current slice에서 exact limited/unverified evidence로 계속한다.

## 완료 체크리스트

- [ ] Blocks 0~8의 gate와 exact commands PASS
- [ ] real private full pipeline PASS; raw/source/secret evidence 0
- [ ] initial + hourly channel discovery evidence
- [ ] A/B/C/D, 2:14, completion/skip cross-surface, manual replay isolation PASS
- [ ] cap/defer/restart/cleanup/backup/rollback PASS
- [ ] loopback-only + Tailscale Serve authorized device + Funnel-disabled/public denial PASS
- [ ] DeepSeek/Fish policy records + private runtime bindings + current-scope approvals + exact minimized payload
      audits PASS; expanded scope는 pre-network stop
- [ ] exact labels: LIMITED_AND_UNVERIFIED / VERIFIED / NOT_VERIFIED / NOT_VERIFIED / NOT_GRANTED, prohibited claims 0
- [ ] independent implementation review와 origin/clean lineage PASS
