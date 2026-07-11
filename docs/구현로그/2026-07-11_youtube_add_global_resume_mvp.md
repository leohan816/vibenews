# 2026-07-11 · YouTube Add + 전역 이어듣기 MVP 구현 로그

- Job: `VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001`
- Frozen design: `설계문서/18_YouTube_Add_Global_Resume_MVP.md` (WORKER_INPUT_HEAD `60b6983`)
- 라이브 호출/런타임 변경 없음. synthetic fake로만 파이프라인 전체를 실행·검증.

## 범위
단일 사용자(`leo`) private MVP. 수동 YouTube 배치(≤10)와 승인 채널(≤5)의 **공개 자막**을
DeepSeek Builder → 별도 DeepSeek Verifier → Fish TTS 브리핑으로 만들고, 모든 진입점에서 하나의
durable 전역 자동재생/이어듣기 상태를 제공한다.

## 구현 블록 (A~E)
- **A. 기반**: `package.json`/락/`app.json`(expo-sqlite·expo-secure-store 플러그인)/`server/tsconfig.json`,
  ~30테이블 SQLite 스키마와 마이그레이션, `config.ts`(D-003 키 allowlist, 비허용 provider 접두사 거부,
  loopback/timezone/state-dir 검사, 값 미출력).
- **B. 파이프라인 코어**: strict Zod 계약(`builder-output.v1`/`verifier-output.v1`), 교체 가능한 provider
  어댑터(Transport 주입), D-009-A scope + `ProviderPayloadGuard`(role별 필드 allowlist, forbidden/unknown 거부,
  scope escalation·runtime-binding 거부), role-specific HMAC runtime binding, 5개 리터럴 assurance 라벨,
  품질 게이트(score≥9.0·no critical·≤2 attempt), copyright 재현 탐지.
- **C. 재생/세션**: 4상태 전역 재생, immutable active-first 스냅샷, 디바이스 SQLite 저널/아웃박스(monotonic
  sequence·checkpoint coalescing·backward-seek 보존), 순수 재생 머신, 오프라인/리비전 재조정, 완료/스킵 제외,
  수동 재생 격리.
- **D. API/앱 표면**: private Fastify API(loopback·64KiB·bearer onRequest·에러 envelope), 8개 라우트,
  idempotency, 단일 Range 오디오(200/206/416/404), Add 탭/컴포넌트, Briefing push-route 전환,
  Settings SecureStore 토큰, root provider wiring.
- **E. 운영/마감**: 워커/폴러/스케줄러/리텐션/TTS 영수증/백업·복구, acceptance 러너, systemd 유닛(작성만),
  스모크 스크립트, nonsecret `.env.example`, 문서/로그. 로컬 플레이어 훅 삭제·샘플/fallback 제거.

## 오디오 저장 (실제 바이트) · TTS 카운트 의미
- **generation 카운트**: 유효한 Fish 오디오 응답을 받은 순간이 successful TTS generation이다(설계 §7.4).
  이때 reservation을 release하고 `successful_count`를 증가시키며 영수증을 `generated`로 남긴다(byte/SHA-256 기록).
- **asset-ready(별도)**: Fish 어댑터가 수신 본문을 fsync 스테이징 파일에 쓰고 경로/byte/SHA-256을 반환하면,
  finalization은 스테이징 바이트를 읽어 검증하고 그 **정확한 바이트**를 `audioDir`에 atomically
  (open/write/fsync/rename) 기록한 뒤 저장본을 재검증한다. **durable 저장이 검증된 뒤에만** asset을 ready로
  표시한다(영수증 `staged`→`finalized`). 즉 generation 카운트와 asset-ready는 분리되어 있다.
- **저장 실패**: 영수증 `storage_failed` + `deferred`(lease_recovery)로 남기고 성공 카운트는 유지하며
  자동 재호출은 하지 않는다. 플레이스홀더 바이트는 절대 만들지 않는다.

## Lint (공식 Expo SDK 57 flat config · frozen 구현 범위)
- `npm run lint`은 `expo lint`가 리포 루트에 `eslint.config.js`(비-allowlist 경로)를 자동 생성하는 것을 피하려고
  ESLint 9를 **직접** `--config node_modules/eslint-config-expo/flat.js`(공식 Expo flat config)로 호출한다.
  새 config 파일 경로 없이 allowlist인 `package.json` lint 스크립트만 바꿨다.
- lint 대상은 **frozen 구현 TS/TSX 표면**(§16.1 allowlist의 src/server 파일)으로 한정한다. 범위 내 실제
  finding은 제거했다(예: `add.tsx`의 effect 내 setState를 await 이후로 이동해 `react-hooks/set-state-in-effect`
  해소). 범위 내 finding을 억제(suppress)하지 않는다. `npm run lint` → exit 0 (errors 0, warnings 45 노출).
- **범위 밖 pre-existing finding(변경 안 함)**: `src/hooks/use-color-scheme.web.ts:11`의
  `react-hooks/set-state-in-effect`는 이 job의 §16.1 allowlist/구현 범위 밖 stock Expo 스캐폴드라 **수정하지
  않았다**(scope-in 억제가 아니라 scope 밖). 후속 job에서 다룰 항목으로 기록만 남긴다.

## 인큐 + 파이프라인 무결성 하드닝 (Advisor read-only 교차점검 반영)
- **인큐 전이**: 수동 아이템·승격된 채널 discovery가 실제 claimable ProcessingJob이 된다. SourceVideo
  provenance를 dedupe하고, 정확히 하나의 job(origin/scope/user/state/eligibility/idempotency)을 만들고,
  아이템/discovery 상태를 같은 트랜잭션에서 갱신한다. 중복 영상은 SourceVideo 하나를 공유하고 재실행은 추가
  job을 만들지 않는다. OFF/취소된 승인은 인큐/실행되지 않는다. 채널은 매 poll 최대 3개(deferred 우선)만 승격.
- **scope 재확인**: `runProcessingJob`은 `scopeActive`를 하드코딩하지 않고 claim 시점과 매 outbound 직전에
  scope 승인 + 채널 standing(status/auto/version)을 다시 읽어 OFF/삭제/취소 시 안전하게 defer한다.
- **attempt 라이프사이클**: 모든 실제 요청(Builder 청크·aggregate·revision, 각 Verifier, Fish)마다
  guard/audit + provider_attempt를 `started`로 먼저 기록하고 호출 후 `succeeded`/`failed`/`timed_out`로 닫는다
  (호출 전 succeeded 금지, sanitized 실패 코드 기록).
- **Verifier 영속화**: 통과한 Verifier JSON/점수/findings/schema·prompt 버전을 그대로 저장(하드코딩 9.0/{} 제거).
- **시간/리스**: 긴 호출 중 실시간 heartbeat, defer/terminal 시 job 리스 해제, daily-cap defer는 즉시 재클레임이
  아니라 다음 Asia/Seoul 자정 + jitter로 eligible.
- **공유 outbound 런타임**: 모든 Builder 청크/aggregate/revision·Verifier·Fish 호출을 하나의 `runAttempt`로
  감싼다 — (a) 전송 직전 scope 재확인, (b) stage deadline로 abort되는 live AbortController를 provider에 전달,
  (c) 대기 중 heartbeatInterval마다 singleton+job heartbeat, (d) finally에서 timer/interval 정리, (e) fresh
  clock으로 attempt 완료 기록. hung 호출은 deadline에 abort되어 `timed_out`으로 남고, provider는 더 이상
  never-aborted signal을 받지 않는다.
- **TTS 예외안전/재시작 멱등**: provider 실패 시 예약 해제 + 영수증 갱신(timeout은 outcome_unknown로 예약 유지),
  `storage_failed`는 두 번째 Fish 호출을 유발하지 않고, 재시작은 ContentItem/AudioAsset/playback를 중복 생성하지
  않는다(기존 content 재사용, 스테이징에서 저장 재개).
- **메타 갱신**: SourceVideo·Builder 메타를 취득한 캡션 provenance로 갱신한 뒤에만 provider에 전달한다.

## 검증 결과 (이번 pass · 모두 exit 0)
- `npm ci` · `npm run typecheck`(앱+서버) · `npm run lint` · `npx expo install --check` · `npx expo-doctor`(20/20)
  · `npm run server:config-check`(합성 nonsecret env) · `npm run server:migrate -- --dry-run`(격리 state dir, DB 미기록)
- `test:unit` → 46 pass / 0 fail · `test:integration` → 51 pass / 0 fail · `test:runtime-local` → 2 pass / 0 fail
- integration에는 파이프라인 실제 저장, worker/poller/caption/feed 배선, 인큐(수동 API claimable·중복·OFF/취소·
  ≤3 승격), 무결성(scope revoke·timeout attempt·실제 Verifier 영속·cap 타이밍·재시작 멱등·storage 실패 무-재호출·
  provenance 메타 갱신·hung-call abort/timeout·mid-flight heartbeat) 테스트 포함. 전부 합성 fake, 라이브 호출 없음.
- 피드 크기 상한은 Content-Length 사전거부 + 스트리밍 누적/즉시 취소(no-Content-Length 청크도 전체 버퍼링 없이 중단).
- `npx expo install --fix`로 SDK 57 기대 패치(@expo/ui·expo·expo-linking·expo-router·expo-splash-screen)에 정렬,
  누락 peer `expo-asset` 추가(expo-doctor 요구). 변경 파일은 모두 allowlist(package.json/lock/app.json).
- 스테일/보안 스윕: `sample|fallback`, `five.second|5초` clean. `anthropic|openai|kimi|qwen`,
  `cookie` 히트는 모두 **거부용 denylist**(config 키 패턴·payload guard forbidden 필드)로 확인.
- 비밀 검사: `.env.server.local`은 열람/커밋하지 않았고 `.gitignore`가 차단(`git ls-files` 추적 0).
  provider 실제 값·raw caption·오디오·스크립트를 Git/로그/픽스처/리포트에 남기지 않음.

## NOT_RUN (독립 리뷰 이후)
- 라이브 YouTube 자막/피드, DeepSeek Builder/Verifier, Fish TTS 실제 호출
- 디바이스 A/B/C/D, 실제 오디오 재생, SecureStore/SQLite 재시작, 백그라운드/잠금화면
- systemd 설치·기동, Tailscale/상태 디렉터리 런타임 변경
- `npm run accept:private` → `LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_REVIEW`
