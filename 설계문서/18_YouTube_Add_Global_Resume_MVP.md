# 18. YouTube Add · Global Resume MVP

## 0. 문서 상태와 권위

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 1
DESIGN_DEPTH: FULL_DESIGN
STATUS: READY_FOR_DESIGN_REVIEW
AUDIENCE: private/internal MVP only
FIXED_USER_ID: leo
```

이 문서는 이 MVP의 제품·UX·서버·데이터·재생 계약 정본이다. 기존 문서의 일반적인 장기 제품 구상은
유지하되, YouTube 입력·채널 자동 처리·품질 게이트·생성 오디오·자동 재생 큐에 관해서 충돌하면 이
문서가 우선한다. 구현자는 이 문서와 Advisor가 동결한 정확한 design content head만 구현한다.

확정된 D-001~D-008을 다시 결정하지 않는다. 특히 이전의 five-second exclusion rule은 삭제되었다.
청취 시간 임계값으로 자동 큐에서 제외하는 규칙은 없다. 상태는 오직 `unheard`, `in_progress`,
`completed`, `skipped` 네 가지다.

## 1. 원래 의도와 성공 정의

사용자는 Add 탭에서 최대 10개 YouTube 링크를 한 번에 승인하거나 최대 5개 공식 채널에 취소 가능한
상시 승인을 부여한다. 서버는 공개 캡션만 임시로 취득하고, 모든 LLM 단계를 DeepSeek Builder와 별도
DeepSeek Verifier로 처리한다. 검수 점수가 9.0 이상이고 critical failure가 없어야 Fish Audio가
개인용 브리핑 오디오를 만든다. 준비된 오디오는 Listen, 오늘의 브리핑, Category, Tag, 오늘의 흐름
어디서 시작해도 하나의 사용자 전역 자동 재생 상태와 불변 세션 snapshot을 공유한다.

성공은 다음 전체 세로 절편이 실제 private server와 실제 device에서 통과하는 것이다.

```text
YouTube public video
  -> public captions only
  -> DeepSeek Builder
  -> independently prompted DeepSeek Verifier
  -> score >= 9.0 and no critical failure
  -> Fish Audio
  -> private AudioAsset(audio_ready)
  -> authorized device playback
  -> global resume/exclusion persistence
```

mock 데이터, 원격 sample audio, provider 일부만 연결한 결과, 문서만 있는 결과는 성공이 아니다.

### 1.1 비목표

- production 또는 public service, public feed, 외부 재배포
- 다중 사용자·다중 기기 인증/동기화
- YouTube 이외 source ingestion
- 로그인, 브라우저 cookie, 계정 소유자 전용 caption API
- 원본 video/audio 다운로드 또는 보관
- 원문 transcript 영구 보관·검색·노출·export
- Anthropic, OpenAI, Kimi, local runtime LLM 또는 자동 provider fallback
- verifier를 Builder와 같은 prompt/context/schema로 호출하는 단축 경로
- 사람 검토 대상의 TTS 또는 자동 큐 진입
- mock/sample audio를 live acceptance 증거로 사용하는 것
- 예약 브리핑, Recap, Saved, Foundation의 전체 backend화

## 2. 확인된 현재 상태

- 입력 head `e03644239eb46d056ebfa0a19959a8eca3344d9b`에서 앱은 Expo SDK 57,
  Expo Router, React Native, TypeScript frontend다.
- 현재 하단 탭은 Listen / Briefing / Recap / Saved / Settings다.
- 현재 재생기는 `useAudioPlayer`를 화면 훅에서 소유하며 process/root 전역 상태나 영속 저장소가 없다.
- 현재 콘텐츠는 `src/data/mockData.ts`, 오디오는 원격 sample fallback이며 backend, database, auth,
  ingestion worker, automated tests가 없다.
- `expo-audio`는 이미 설치되어 있다. `expo-sqlite`, `expo-secure-store`, server framework,
  server SQLite driver, test runner는 직접 dependency가 아니다.
- `.env.server.local`의 값은 설계 입력이 아니며, 앱·Git·로그·보고서에 들어가면 안 된다.

## 3. 대안 비교와 선택

| 결정 | 검토한 대안 | 선택 | 이유와 경계 |
| --- | --- | --- | --- |
| Node 배치 | Expo Router server route / 별도 저장소 / 같은 저장소의 독립 Node process | 같은 저장소 `server/` 아래 Fastify API, worker, poller 3 process | 기존 Expo static web 출력과 server secret 경계를 섞지 않고 SINGLE_REPO를 지킨다. |
| server DB | JSON 파일 / Postgres / SQLite | `better-sqlite3` + raw versioned SQL migration + WAL | 한 private server·concurrency 1에 충분하고 transaction/unique/index/backup이 명확하다. Postgres 운영은 과하다. |
| API 검증 | 수동 guard / JSON Schema 전용 / Zod | Fastify boundary + Zod schema | request, provider JSON, DB mapping에 같은 명시적 parser를 쓴다. |
| audio 제공 | public object storage / static directory mount / authorized stream route | Fastify의 ID 기반 `GET /v1/audio-assets/:id/file` | path를 노출하지 않고 bearer authorization, Range, tombstone을 한 경계에서 강제한다. |
| private transport | public listener / Tailscale Funnel / ad-hoc tunnel / Tailscale Serve | loopback Fastify 뒤의 preconfigured tailnet-only Tailscale Serve와 최소 권한 grant | app traffic은 승인된 Leo device의 tailnet identity로만 server에 도달한다. public hostname·Funnel·직접 공개 port는 금지한다. |
| device 영속화 | 메모리 / AsyncStorage / Expo SQLite | Expo SDK 57 `expo-sqlite` | DB가 app restart를 넘어 지속되고 exclusive transaction, WAL, migration을 제공한다. |
| device credential | source/env에 포함 / 일반 DB / SecureStore | Expo SDK 57 `expo-secure-store` | 사용자가 수동 provision한 opaque device token만 암호화 key-value에 둔다. 재생 상태의 정본으로 쓰지 않는다. |
| player 수명 | 화면별 hook / OS playlist / root singleton | `createAudioPlayer`로 만든 root-lifetime controller 1개 | 화면 unmount와 무관한 전역 resume가 필요하다. root provider가 listener와 `release()`를 소유한다. |
| job 실행 | 요청 안에서 동기 처리 / 외부 queue / SQLite lease worker | 별도 worker + DB lease/idempotency | 요청 timeout을 피하고 추가 인프라 없이 restart recovery를 제공한다. |
| polling | WebSub / OS cron만 / poller process | DB due-time을 읽는 poller process, hourly | public callback 없이 private server에서 동작하며 cursor/defer를 transaction으로 보존한다. |
| test | Jest 전체 도입 / shell smoke만 / Node test | `node:test` + `tsx`로 pure app machine와 server를 함께 테스트 | 기존 test stack이 없으므로 최소 dependency로 unit/integration/failure tests를 만든다. |

### 3.1 정확한 기술 집합

- Runtime: Node `>=22.13.x`; Expo SDK 57 공식 최소 Node와 맞춘다.
- API: `fastify` major 5.
- Validation: direct dependency `zod`; lockfile이 확정한 한 버전만 server/app contract에서 공유한다.
- Server DB: `better-sqlite3`, raw SQL migration, `PRAGMA journal_mode=WAL`,
  `PRAGMA foreign_keys=ON`, `busy_timeout=5000`.
- Feed parse: `fast-xml-parser`; native Node `fetch`, `crypto`, `fs`, `child_process.spawn`을 사용한다.
- TypeScript execution/tests: `tsx`, `node:test`; production process는 `tsc` 산출 JS를 실행한다.
- Device: `expo-audio` `~57.0.0`, `expo-sqlite` `~57.0.0`, `expo-secure-store` `~57.0.0`,
  Expo Router `~57.0.4` 호환 버전. Expo package는 반드시 `npx expo install`로 설치한다.
- Source binary: server에 고정 버전 `yt-dlp`; version은 deployment manifest/health에 기록하되 caption 내용이나
  provider 구성값은 기록하지 않는다.

Worker는 설치 시 정확한 resolved versions를 `package-lock.json`에 고정하고 `npm ci`로 재현한다.
minor/major를 임의로 바꾸거나 Expo canary/beta를 쓰지 않는다.

## 4. repository와 process 배치

```text
server/
├─ src/bin/api.ts                 # private HTTP API
├─ src/bin/worker.ts              # concurrency-1 pipeline worker
├─ src/bin/poller.ts              # due channel discovery
├─ src/bin/migrate.ts             # forward migration/status/rollback guard
├─ src/bin/backup.ts              # generation backup/restore verification
├─ src/bin/accept-private.ts      # redacted real private acceptance runner
├─ src/config.ts                  # server-only env validation
├─ src/db/{connection,migrate}.ts
├─ src/domain/{contracts,enums,state-machines}.ts
├─ src/http/{auth,errors,schemas}.ts
├─ src/http/routes/{health,batches,channels,library,sessions,playback,audio,content}.ts
├─ src/providers/{caption,deepseek-builder,deepseek-verifier,fish-tts}.ts
├─ src/services/{source,processing,scheduler,retention,playback,backup}.ts
├─ migrations/001_youtube_add_global_resume.sql
└─ test/{unit,integration,runtime}/

src/
├─ api/{client,contracts}.ts
├─ audio/{global-audio-controller,global-playback-context,global-playback-machine}.tsx|ts
├─ storage/{device-db,playback-journal}.ts
├─ app/(tabs)/add.tsx
├─ app/briefing.tsx               # 기존 Briefing 보조 flow의 push route
└─ components/add/*
```

Process는 systemd의 `vibenews-api`, `vibenews-worker`, `vibenews-poller`로 각각 감독하고 backup은
`vibenews-backup.timer`가 실행한다. API는 항상 `127.0.0.1`에 bind하고 operator가 미리 구성한
[Tailscale Serve](https://tailscale.com/docs/features/tailscale-serve)가 그 local port를 tailnet-only HTTPS로
proxy한다. [Tailscale grants](https://tailscale.com/docs/features/access-control/grants)는 승인된 Leo device에서
이 service로 가는 연결만 허용한다. Tailnet 가입, HTTPS, Serve, grant는 외부 operator-owned prerequisite다.
Worker는 secret·node inventory를 출력하지 않는 redacted status/접속 검증만 하며 login, grant 변경, Serve
활성화 또는 Funnel 활성화를 자동 실행하지 않는다. 준비되지 않았으면 `RUNTIME_ACCESS_REQUIRED`로
Advisor에 반환하고 public/direct-bind/ad-hoc fallback을 만들지 않는다. 모든 process는 같은 DB를 쓰지만
worker singleton lease가 provider pipeline concurrency를 1로 제한한다.

### 4.1 server/client config key contract

Only key names/placeholders are documented. Actual values remain in the ignored mode-600 server runtime file or
device SecureStore.

```text
Implementation-defined server runtime names (required before start; not claimed currently prepared):
VIBENEWS_ENV
VIBENEWS_BIND_HOST
VIBENEWS_PORT
VIBENEWS_STATE_DIR
VIBENEWS_USER_TIMEZONE
VIBENEWS_DEVICE_TOKEN_SHA256
YTDLP_BINARY

Advisor-confirmed prepared D-003 provider names (names only; values undisclosed):
DEEPSEEK_API_KEY
DEEPSEEK_BASE_URL
DEEPSEEK_BUILDER_MODEL
DEEPSEEK_VERIFIER_MODEL
DEEPSEEK_VERIFIER_REASONING_EFFORT
FISH_API_KEY
FISH_TTS_MODEL
FISH_REFERENCE_ID

Client nonsecret:
EXPO_PUBLIC_VIBENEWS_API_BASE_URL

Device secret (manual SecureStore provision, never env/Git):
vibenews.device-token.v1
```

Server start validates every required name for presence/non-placeholder, fixed timezone `Asia/Seoul`, absolute state
path outside Git/static, exact loopback bind, integer port, executable owned yt-dlp path, prepared DeepSeek base URL,
distinct Builder/Verifier selector variables, Verifier reasoning-effort setting, and Fish model/reference selector
variables without printing values. The eight prepared provider key names above are the exact D-003 allowlist; any unlisted provider alias or
alternate-provider key fails config review. `.env.example` contains empty descriptive placeholders only. The client
base URL is the operator-provided tailnet-only Serve HTTPS URL; the app may read only that one nonsecret URL. A static
import scan forbids server key names in `src/**` except a test denylist. Missing implementation-defined runtime
values are an operator provisioning prerequisite reported as `RUNTIME_CONFIG_REQUIRED`; their current presence is
not inferred from the eight prepared D-003 names.

### 4.2 Git 밖의 runtime 위치

```text
/var/lib/vibenews-dev/db/vibenews.sqlite3
/var/lib/vibenews-dev/audio/<audioAssetId>.mp3
/var/lib/vibenews-dev/tmp/<jobId>-<nonce>/
/var/lib/vibenews-dev/backups/
```

상위 directory는 service user 소유 `0700`, DB·audio·temporary file은 `0600`이다. DB에는 상대 storage
key만 넣고 절대 경로나 user URL에서 만든 filename을 넣지 않는다. 이 directory들은 Git repository
안이나 static public root에 있으면 readiness가 실패한다.

## 5. Add UX와 navigation

### 5.1 route 변경

하단 다섯 탭은 다음으로 바뀐다.

```text
Listen · Add · Recap · Saved · Settings
```

- `(tabs)/briefing.tsx`는 삭제하고 `(tabs)/add.tsx`를 만든다.
- 기존 카테고리/예약 Briefing UI는 `src/app/briefing.tsx` push route로 이동한다.
- Listen의 준비 요약/오늘의 흐름에서 `브리핑 관리`로, Add의 secondary action에서 `예약 브리핑`으로
  기존 flow에 들어갈 수 있다.
- `briefing-session.tsx`, `schedule-briefing.tsx`, push/deep-link route는 유지한다.
- tab 교체는 Briefing product capability 삭제가 아니다.

### 5.2 Add 화면 정보 구조

상단부터 다음 순서다.

1. `YouTube 링크 추가` manual batch card
2. 최근 batch와 item별 진행 상태
3. `자동 처리 채널` 등록/목록/standing approval controls
4. private server/worker/poller health와 제한 안내
5. 기존 `예약 브리핑` push link

#### Manual batch

- multiline 입력 한 줄당 URL 하나, 앞뒤 공백과 빈 줄 제거 후 최대 10개다.
- client는 입력 중 각 줄에 `valid`, `duplicate_in_input`, `unsupported_host`, `invalid_video_url`을
  표시한다. server가 같은 검증을 다시 수행한다.
- 11번째 줄은 제출되지 않으며 `한 번에 최대 10개예요`를 input error와 screen-reader alert로 표시한다.
- CTA `분석·음성 생성`을 누르는 것이 해당 batch의 명시적 승인이다. 확인 문구는
  `공개 자막을 분석하고 개인용 음성을 만들어요. 원본 영상·음성은 내려받지 않아요.`다.
- CTA 전에는 caption, Builder, Verifier, TTS job이 없다. URL syntax preview 외 server fetch도 없다.
- server는 batch 전체를 `202`로 만들고 각 item을 독립 처리한다. invalid/duplicate/captionless 한 항목이
  sibling을 취소하지 않는다.
- item status는 `검사 중`, `공개 자막 확인`, `분석 중`, `검수 중 (1/2 또는 2/2)`, `음성 생성 대기`,
  `준비됨`, `다음 한도로 연기`, `사람 검토 필요`, `실패`를 표시한다.
- retry는 retryable failure에만 보이고 같은 idempotency key/job을 재개한다. 새 provider attempt를 무한히
  만들지 않는다.

#### Channel controls

- URL 입력은 `youtube.com/channel/UC…` 또는 `youtube.com/@handle`만 받는다. server가 stable channel ID로
  resolve하고 canonical `/channel/UC…` URL을 저장한다.
- 등록 가능한 non-deleted channel은 최대 5개다. 6번째는 `채널은 최대 5개까지 등록할 수 있어요`로
  거부하고 기존 channel을 바꾸지 않는다.
- toggle ON copy: `새 공개 자막 영상을 매시간 확인해 자동 분석·음성 생성을 승인합니다.`
- toggle OFF는 standing approval을 즉시 철회한다. 이미 시작한 provider call은 안전 cleanup까지 끝내지만
  아직 시작하지 않은 channel job은 `approval_revoked`로 defer한다. 재활성화 시 다시 eligible이다.
- 삭제는 확인 dialog 후 tombstone 처리하며 slot을 비운다. 기존 파생 콘텐츠는 유지되고 별도 콘텐츠
  삭제 action으로만 지워진다.
- 매 poll 최대 3개, 하루 TTS 최대 10개 등의 cap에 걸린 항목은 `버리지 않고 다음 실행으로 연기됨`을
  보여준다.

### 5.3 상태·복구·접근성

- loading에는 skeleton과 textual label, empty에는 입력 예시 형식만 보이고 실제 sample URL은 넣지 않는다.
- API unavailable은 입력 draft를 지우지 않고 `서버에 연결할 수 없어요 · 다시 시도`를 제공한다.
- stale batch는 polling backoff와 `마지막 확인 시각`을 보여주며 사용자가 중복 제출하지 않게 한다.
- 각 control은 최소 44x44pt, 명시적 label/hint/state를 갖고 색만으로 상태를 표현하지 않는다.
- progress 변경은 polite live region, 실패와 cap은 assertive alert로 전달한다.
- reduce motion이면 radio glow/progress animation을 정지한다. Dynamic Type, keyboard focus order, contrast를
  기존 Neo-Retro palette에서 검증한다.

## 6. Source와 caption 계약

### 6.1 video canonicalization과 deduplication

허용 입력은 HTTPS의 다음 public form뿐이다.

- `https://www.youtube.com/watch?v=<videoId>`
- `https://youtu.be/<videoId>`
- `https://www.youtube.com/shorts/<videoId>`

query의 playlist/start/share parameter는 버리고 11자 `[A-Za-z0-9_-]{11}` video ID만 꺼낸다. 다른 host,
port, userinfo, IP literal, fragment 기반 ID, playlist-only URL, embed URL은 거부한다. canonical URL은 항상
`https://www.youtube.com/watch?v=<videoId>`다. `source_videos.youtube_video_id` unique와
`manual_batch_items(batch_id, ordinal)` unique가 server dedup의 정본이다. 같은 video가 다시 오면 기존
콘텐츠 상태를 반환하고 pipeline을 복제하지 않는다.

### 6.2 channel canonicalization

- `/channel/UC…`는 24자 `UC[A-Za-z0-9_-]{22}`를 직접 검증한다.
- `@handle`은 허용 host의 channel videos page만 constrained metadata profile로 resolve한다.
- 최종 DB key와 polling URL은 stable channel ID다. redirect는 HTTPS YouTube host 안에서 3회까지만
  허용한다.
- channel feed는
  `https://www.youtube.com/feeds/videos.xml?channel_id=<channelId>`만 사용한다. response 1 MiB,
  15초 timeout, XML entity/DOCTYPE 금지, entry 50개 상한이다.
- feed parser는 channel/video ID, canonical watch URL, title, published/updated timestamp만 allowlist로
  추출하고 description/media body는 저장·log·event에 넣지 않은 채 response buffer를 폐기한다.

### 6.3 caption subprocess allowlist

Node는 shell string을 만들지 않고 `spawn(binary, args, { shell: false, cwd: isolatedJobDir })`만 쓴다.
CAPTION profile의 허용 argument는 다음 의미 집합으로 고정한다.

```text
--ignore-config
--no-cache-dir
--skip-download
--no-playlist
--no-write-thumbnail
--no-write-comments
--socket-timeout 15
--retries 1
--fragment-retries 1
--write-subs
--write-auto-subs
--sub-langs en.*,ko.*
--sub-format vtt
--paths home:<isolatedJobDir>
--paths temp:<isolatedJobDir>
--output %(id)s.%(language)s.%(ext)s
--print %(id)j\t%(title)j\t%(channel_id)j\t%(channel_url)j\t%(duration)j\t%(upload_date)j\t%(webpage_url)j
https://www.youtube.com/watch?v=<validatedVideoId>
```

LOGIN/cookie/netrc/browser-profile, format selection, media output, thumbnail, comments, playlist expansion,
postprocessor, arbitrary extractor args, arbitrary output path는 allowlist에 없고 전달되면 process를 시작하지
않는다. stdout은 8 KiB, stderr는 16 KiB로 제한하고 URL/token-like text를 redaction한 error code만 남긴다.

### 6.4 bounded execution과 fail-closed

- wall timeout 120초, child process group 전체 종료 grace 3초다.
- source duration은 최대 2시간이다. duration 누락/0/초과는 `SOURCE_DURATION_REJECTED`다.
- metadata stdout 8 KiB, caption file 합계 10 MiB, file 하나 8 MiB, 파일 수 8개다.
- output은 validated video ID prefix와 `.vtt`만 허용한다. symlink, hardlink, directory, device file,
  path escape가 하나라도 있으면 전부 폐기한다.
- 최소 하나의 public caption VTT가 있어야 한다. captionless/login/consent/cookie challenge는 provider
  fallback 없이 `PUBLIC_CAPTION_UNAVAILABLE`로 끝난다.
- caption language, 자동/수동 여부, byte count, SHA-256, source video/channel ID, command profile version,
  acquisition timestamps만 provenance로 보존한다. raw text는 DB/log/event/result에 넣지 않는다.
- Builder가 필요한 동안만 `0600` temp file을 읽는다. 정상·실패·timeout·signal의 `finally`에서 즉시
  unlink하고 directory를 제거한다.
- retention sweeper가 15분마다 `expires_at <= now` 또는 orphan temp를 지운다. 어떠한 경우도
  `created_at + 24h`를 넘지 않는다. 삭제 실패는 readiness를 unhealthy로 만들고 provider claim을
  중단한다.

## 7. Provider pipeline

### 7.1 공통 interface와 error taxonomy

```ts
type ProviderStage = 'caption' | 'builder' | 'verifier' | 'tts';
type ProviderErrorCode =
  | 'INVALID_INPUT'
  | 'AUTH_MISSING'
  | 'AUTH_REJECTED'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'SOURCE_UNAVAILABLE'
  | 'PUBLIC_CAPTION_UNAVAILABLE'
  | 'OUTPUT_TOO_LARGE'
  | 'INVALID_SCHEMA'
  | 'POLICY_REJECTED'
  | 'UPSTREAM_5XX'
  | 'STORAGE_FAILURE'
  | 'INTERNAL';

interface ProviderError {
  stage: ProviderStage;
  code: ProviderErrorCode;
  retryable: boolean;
  safeMessage: string;
  upstreamStatus?: number;
}

interface ProviderContext {
  jobId: string;
  idempotencyKey: string;
  deadlineMs: number;
  abortSignal: AbortSignal;
}

interface SourceProvenance {
  sourceType: 'youtube';
  videoId: string;
  canonicalUrl: string;
  channelId: string;
  channelUrl: string;
  publicTitle: string;
  publishedAt: string | null;
  durationSec: number;
  captionLanguages: string[];
  captionKinds: Array<'manual' | 'automatic'>;
  captionSha256: string;
  extractor: 'yt-dlp-public-caption';
  extractorProfileVersion: 'youtube-public-caption.v1';
  acquiredAt: string;
}

interface CaptionRequest {
  canonicalVideoId: string;
  canonicalUrl: string;
}

interface CaptionArtifact {
  artifactId: string;
  relativeTempKey: string;
  languages: string[];
  captionKinds: Array<'manual' | 'automatic'>;
  byteCount: number;
  sha256: string;
  acquiredAt: string;
  expiresAt: string;
  provenance: SourceProvenance;
}

interface CaptionProvider {
  acquire(input: CaptionRequest, context: ProviderContext): Promise<CaptionArtifact>;
  destroy(artifact: CaptionArtifact): Promise<void>;
}

interface BuilderProvider {
  build(input: BuilderInput, context: ProviderContext): Promise<BuilderOutput>;
}

interface VerifierProvider {
  verify(input: VerifierInput, context: ProviderContext): Promise<VerifierOutput>;
}

interface TtsProvider {
  synthesize(input: TtsInput, context: ProviderContext): Promise<TtsArtifact>;
}
```

Provider adapter는 typed result 또는 `ProviderError`만 낸다. raw request/response, caption, audio bytes,
authorization header는 log하지 않는다. timeout은 Caption 120초, Builder 180초, Verifier 120초,
TTS 180초다. Caption subprocess launch와 각 Builder chunk/aggregate/TTS submission은 retryable failure에
같은 idempotency key와 1초 jittered backoff를 쓰되 **initial을 포함한 총합이 stage/substage당 2**다. UI retry도
남은 budget만 쓰고 새 job으로 reset하지 않는다. Outcome-unknown TTS는 재submit하지 않는다.
**Verifier는 HTTP submission 하나가 곧 attempt 하나**이며 숨은 transport retry가 없다. 실제 submission
총합이 2를 넘지 않는다. 다른 provider로 fallback하지 않는다.

### 7.2 Builder와 Verifier 분리

```text
BUILDER_CHUNK_PROMPT_VERSION: builder.chunk.youtube-mvp.v1
BUILDER_CHUNK_SCHEMA_VERSION: builder-chunk-output.v1
BUILDER_AGGREGATE_PROMPT_VERSION: builder.aggregate.youtube-mvp.v1
BUILDER_AGGREGATE_SCHEMA_VERSION: builder-output.v1
VERIFIER_PROMPT_VERSION: verifier.youtube-mvp.v1
VERIFIER_SCHEMA_VERSION: verifier-output.v1
```

- 두 DeepSeek adapter만 server-only `DEEPSEEK_API_KEY`와 sole endpoint base인 `DEEPSEEK_BASE_URL`을
  읽는다. Startup은 이를 HTTPS base URL로 parse하고 credential/query/fragment를 거부하며, outbound request는
  configured origin/base path 아래 adapter의 fixed API path만 허용하고 redirect/fallback하지 않는다.
- Builder adapter만 `DEEPSEEK_BUILDER_MODEL`을 읽고 Verifier adapter만
  `DEEPSEEK_VERIFIER_MODEL`과 `DEEPSEEK_VERIFIER_REASONING_EFFORT`를 읽는다. Verifier request만 validated
  configured reasoning-effort selector를 provider request의 `reasoning_effort` field로 전달하고 Builder
  request에는 그 field가 없어야 한다. 실제 endpoint/model/effort 값은 server runtime 밖으로 나오지 않는다.
- VTT parser는 cue 순서를 보존하며 control/markup을 제거하고 stable time-based evidence ref를 만든다.
  normalized text는 최대 240,000 Unicode characters, chunk는 cue boundary 기준 최대 12,000 characters 또는
  8분, source당 최대 20개다. 초과하면 truncate하지 않고 `OUTPUT_TOO_LARGE`다.
- Builder chunk context는 source metadata와 **한 ephemeral caption chunk/evidence refs**다. Aggregate context는
  source metadata, user `leo` preference의 허용 subset, strict-parsed chunk outputs만이며 raw caption 전체를
  다시 넣지 않는다.
- Verifier context는 별도 system prompt/rubric, normalized source evidence index, parsed Builder output,
  candidate가 참조한 cue를 resolve한 ephemeral evidence pack, attempt number다. Evidence pack은 최대
  120,000 characters이고 material ref를 truncate하지 않는다; 초과 시 fail closed한다. Builder system
  prompt나 hidden chain/context를 재사용하지 않는다.
- 두 output은 서로 다른 strict Zod schema로 `safeParse`하고 unknown key를 거부한다. markdown fence,
  trailing prose, partial JSON repair는 허용하지 않는다.

`BuilderProvider.build`는 이 chunk -> aggregate 내부 단계를 소유하지만 모두 같은 configured Builder
selector를 사용한다. `provider_attempts`는 `builder_chunk` substage/ordinal과 `builder_aggregate`를 각각
hash/version/status로 기록한다. Verifier attempt와 섞지 않는다.
Verifier가 REVISE를 내면 caption/chunk provider call은 다시 하지 않는다. Strict-parsed prior candidate,
기존 strict chunk outputs, allowlisted finding code/evidence refs만 aggregate revision context로 쓰며 Verifier의
자유형 instruction/hidden context는 전달하지 않는다. 이 revision submission도 `builder_aggregate`의 initial
포함 총 2-submission budget을 소비하므로 앞선 definite retry가 budget을 소진했다면 자동 revision 대신
`human_review_required`로 fail closed한다.

```ts
interface EvidenceRef {
  ref: string;          // e.g. cap:000042-000057; raw text를 포함하지 않음
  startMs: number;
  endMs: number;
}

interface BuilderEvidenceChunk {
  chunkId: string;
  evidenceRefs: EvidenceRef[];
  text: string; // request-lifetime only; DB/log/provider-attempt에 저장하지 않음
}

interface BuilderChunkOutput {
  schemaVersion: 'builder-chunk-output.v1';
  chunkId: string;
  sectionSummary: string;
  claims: Array<{ claim: string; evidenceRefs: string[] }>;
  numbers: Array<{ value: string; context: string; evidenceRefs: string[] }>;
  entities: Array<{ name: string; kind: 'person' | 'company' | 'product' | 'tool' | 'repo' }>;
}

type TopicCategory =
  | 'news'
  | 'ai'
  | 'health'
  | 'finance'
  | 'skin_care'
  | 'beauty'
  | 'business'
  | 'developer'
  | 'science'
  | 'lifestyle'
  | 'internal';

interface BuilderInput {
  schemaVersion: 'builder-input.v1';
  source: SourceProvenance;
  evidenceIndex: EvidenceRef[];
  evidenceChunks: BuilderEvidenceChunk[];
  requestedLanguage: 'ko';
  revision?: {
    priorCandidate: BuilderOutput; // strict-parsed derived output only
    findings: Array<{ code: string; evidenceRefs: string[] }>;
    priorOutputHash: string;
  };
}

interface BuilderOutput {
  schemaVersion: 'builder-output.v1';
  title: string;
  oneLineSummary: string;
  contentKind: 'news' | 'analysis' | 'tutorial' | 'product_update' | 'document';
  category: TopicCategory;
  subcategory: { slug: string; displayName: string };
  topicClusters: string[];
  tags: string[];
  entities: Array<{ name: string; kind: 'person' | 'company' | 'product' | 'tool' | 'repo' }>;
  claims: Array<{ claim: string; evidenceRefs: string[] }>;
  numbers: Array<{ value: string; context: string; evidenceRefs: string[] }>;
  audioScript: {
    language: 'ko';
    mode: 'quick' | 'standard' | 'deep';
    segments: Array<{ order: number; text: string; evidenceRefs: string[] }>;
  };
}

type CriticalFailure =
  | 'UNSUPPORTED_CLAIM'
  | 'MATERIAL_OMISSION'
  | 'NUMBER_OR_NAME_MISMATCH'
  | 'MISLEADING_CAUSALITY'
  | 'UNSAFE_OR_OUT_OF_SCOPE'
  | 'COPYRIGHT_REPRODUCTION'
  | 'INVALID_PROVENANCE';

interface VerifierInput {
  schemaVersion: 'verifier-input.v1';
  source: SourceProvenance;
  evidenceIndex: EvidenceRef[];
  evidencePack: BuilderEvidenceChunk[]; // candidate refs만, request-lifetime only
  candidate: BuilderOutput;
  attempt: 1 | 2;
}

interface VerifierOutput {
  schemaVersion: 'verifier-output.v1';
  verdict: 'PASS' | 'REVISE' | 'HUMAN_REVIEW';
  overallScore: number; // 0..10, one decimal max
  dimensionScores: {
    fidelity: number;
    coverage: number;
    clarity: number;
    audioFitness: number;
    provenance: number;
  };
  criticalFailures: CriticalFailure[];
  findings: Array<{
    code: string;
    severity: 'critical' | 'major' | 'minor';
    evidenceRefs: string[];
    instruction: string;
  }>;
}
```

Strict bounds는 Builder request 512 KiB/response 256 KiB, Verifier request 512 KiB/response 64 KiB다.
Title 200자, one-line summary 500자, tags 3~8, entities 50, claims 100, numbers 100, script segments 60,
segment 1,000자, total script 40,000자, verifier findings 100/instruction 1,000자다. Evidence ref는 input
index에 존재해야 하고, duplicate/unknown refs, control characters, excessive source-like contiguous text는
schema/policy failure다. Builder chunk output은 claims 50/numbers 50/entities 50/summary 2,000자 상한이다.
Category는 위 fixed enum만, subcategory slug는 `^[a-z0-9]+(?:_[a-z0-9]+)*$`/64자, display name 80자,
topic clusters 최대 5/각 100자, tag는 Unicode normalize+trim 후 3~8개/각 50자다. Registry upsert는 normalized
slug/name unique transaction을 쓰며 schema 밖 category를 임의 `other`로 매핑하지 않는다.

Copyright reproduction detector는 Unicode normalization/whitespace collapse 후 caption과 derived summary/script의
contiguous match를 비교한다. 한 segment에서 **160 Unicode characters 또는 whitespace-delimited 30 tokens
초과 중 먼저 도달한 연속 match**가 있으면 `COPYRIGHT_REPRODUCTION` critical failure다. Title, product/repo
name, number 같은 짧은 factual strings는 match 누적에 포함하되 threshold 이하만 허용한다. Detector PASS가
Verifier PASS를 대체하지 않으며 둘 다 통과해야 한다.

PASS는 `verdict='PASS'`, `overallScore >= 9.0`, `criticalFailures.length === 0`을 모두 만족해야 한다.
모델이 PASS라고 말해도 server gate가 독립 계산한다.

### 7.3 최대 두 번의 verifier 흐름

```text
Builder draft -> Verifier attempt 1
  PASS -> TTS eligible
  REVISE -> 같은 Builder adapter가 finding code/evidence ref만 받아 revision
          -> Verifier attempt 2
             PASS -> TTS eligible
             otherwise -> human_review_required
  critical/policy/schema failure -> human_review_required 또는 failed (분류표 기준)
```

Verifier 호출은 총 2회를 넘지 않는다. attempt 2 후 자동 Builder 재호출, TTS, queue entry는 없다.
`human_review_required`는 사용자에게 보이지만 승인 toggle이나 retry로 우회할 수 없다.

### 7.4 Fish Audio

```ts
interface TtsInput {
  schemaVersion: 'tts-input.v1';
  contentItemId: string;
  language: 'ko';
  scriptSegments: BuilderOutput['audioScript']['segments'];
  scriptHash: string;
}

interface TtsArtifact {
  mimeType: 'audio/mpeg';
  tempKey: string;
  byteCount: number;
  durationMs: number;
  sha256: string;
}
```

Fish adapter만 `FISH_API_KEY`, `FISH_TTS_MODEL`, `FISH_REFERENCE_ID`를 읽는다. 값은 client, DB provenance,
log, report에 쓰지 않고 selector/config version hash만 남긴다. TTS call 직전 transaction은 unique receipt/intention을
`requested`로 만들고 daily `reserved_count`를 1 올린다. `reserved_count + successful_count <= 10`이므로
crash/timeout도 실제 successful generation 상한을 넘길 수 없다.

- Explicit provider failure/invalid audio: receipt `provider_failed`, reservation을 같은 transaction에서
  release하며 successful count는 늘지 않는다.
- Timeout/connection-loss처럼 provider outcome이 불확실: receipt `outcome_unknown`, reservation 유지,
  automatic 재호출 금지. Provider idempotency로 같은 outcome을 조회/회수할 수 있을 때만 reconcile하고,
  그렇지 않으면 operator-visible human reconciliation 전까지 job을 중단한다.
- Valid audio response: **이 순간이 successful TTS generation**이다. Reservation을 release하고
  `successful_count`를 1 올리며 receipt `generated`와 artifact hash/bytes/duration을 같은 transaction에 쓴다.
  Storage publish 성공 여부와 무관하게 그 daily success를 유지한다.

Worker는 valid artifact를 deterministic durable staging key로 fsync/move한다. Staging move가 실패하면
receipt를 `storage_failed`로 기록하고 같은 provider call을 자동 반복하지 않는다. Receipt transaction이나
DB가 실패하면 신규 TTS/readiness를 중단하고 deterministic intent/staging evidence를 reconcile할 때까지
재호출하지 않는다.

`daily_tts_usage.successful_count`와 `reserved_count`는 receipt statuses의 materialized counts다.
Start/readiness가 불일치를 발견하면 신규 TTS를 멈추고 receipt를 정본으로 immediate-transaction
reconciliation을 수행해 합계 10을 초과시키지 않는다.

Receipt `staged` 이후 final audio key로 atomic rename하고 별도 DB transaction에서
`audio_assets.status='ready'`, `content_items.audio_ready_at`, receipt `finalized`를 함께 기록한다. Crash는
receipt/staging/final deterministic keys로 provider 재호출 없이 resume한다. Partial/orphan file은 receipt
state에 맞춰 cleanup한다. `UNIQUE(content_item_id)`, receipt/idempotency unique가 중복 generation/asset을
막는다.

## 8. server domain/data model

모든 timestamp는 UTC ISO instant/SQLite integer milliseconds로 저장한다. 사용자 day quota 계산만
`users.timezone='Asia/Seoul'`을 쓴다. ID는 UUID다. JSON column은 versioned schema를 parse한 뒤에만 쓴다.

### 8.1 enum 정본

```text
AutomaticPlaybackStatus = unheard | in_progress | completed | skipped
BatchStatus = accepted | processing | complete | partial_failure | failed | deleted
BatchItemStatus = invalid | duplicate | queued | processing | deferred |
                  human_review_required | audio_ready | failed | deleted
ChannelStatus = active | disabled | deleted
DiscoveryStatus = discovered | deferred | queued | duplicate | revoked | deleted
JobState = queued | captioning | building | verifying | tts_queued | synthesizing |
           audio_ready | deferred | human_review_required | failed | canceled | deleted
JobStage = caption | builder | verifier | tts
DeferReason = daily_tts_cap | channel_poll_cap | approval_revoked | lease_recovery |
              retry_backoff | worker_unavailable | active_content_correction
SessionStatus = active | interrupted | completed
AudioStatus = pending | generating | ready | failed | deleted
TtsGenerationReceiptStatus = requested | outcome_unknown | provider_failed | generated |
                             staged | finalized | storage_failed | reconciled
ContentItemState = built | verified | human_review_required | audio_pending |
                   audio_ready | failed | deleted
ProviderAttemptStatus = started | succeeded | failed | timed_out
ProviderAttemptSubstage = caption | builder_chunk | builder_aggregate | verifier | tts
CaptionArtifactDeleteStatus = pending | deleted | overdue | failed
PlaybackMode = automatic | manual_replay
```

### 8.2 tables, constraints, indexes

| Table | 필수 field/constraint | 주요 index |
| --- | --- | --- |
| `users` | `id PK CHECK(id='leo')`, `timezone NOT NULL`, timestamps | PK |
| `manual_batches` | `id`, `user_id FK`, `status`, `approved_at`, `idempotency_key`, timestamps; unique `(user_id,idempotency_key)` | `(user_id,created_at DESC)` |
| `manual_batch_items` | `id`, `batch_id FK`, `ordinal CHECK 1..10`, input SHA-256, nullable safe canonical URL/`youtube_video_id`, status/safe error; never raw submitted URL | unique `(batch_id,ordinal)`; `(batch_id,status)` |
| `channels` | `id`, `user_id`, stable `youtube_channel_id`, canonical URL/title, status, `auto_processing_enabled`, `approval_version`, ETag/Last-Modified/cursor/last/next poll, `deleted_at`; status active iff ON, disabled iff OFF, deleted iff tombstoned; partial unique non-deleted `(user_id,youtube_channel_id)` | `(status,next_poll_at)` |
| `channel_discoveries` | `id`, `channel_id`, `youtube_video_id`, published time, status, `first_seen_poll_id`, `eligible_at`; unique `(channel_id,youtube_video_id)` | `(channel_id,status,eligible_at)` |
| `source_videos` | `id`, unique YouTube video ID, channel ID, canonical URL, public metadata, duration, published time, caption kind/languages, provenance JSON, timestamps, tombstone | `(channel_id,published_at)`, `(created_at)` |
| `processing_jobs` | `id`, user/source FKs, origin kind plus nullable manual-item/channel-discovery FKs with exactly-one CHECK, approval version, state/stage, `eligible_at`, defer reason, verifier attempts `0..2`, lease owner/expiry/heartbeat, idempotency key, safe error, timestamps | unique idempotency and each non-null origin FK; `(state,eligible_at,created_at)`; `(lease_expires_at)` |
| `provider_attempts` | `id`, job/macro stage, exact substage, `ordinal NOT NULL` (`builder_chunk` 1..20, all others 0), logical submission `1..2`, prompt/schema/config version hashes, request/output hashes, status/error, started/finished; no raw body | unique `(job_id,substage,ordinal,logical_attempt)` |
| `temporary_caption_artifacts` | `id`, job, relative temp key, sha256/bytes/languages/kinds, created/expires/deleted timestamps, delete status; `expires <= created+24h` | `(deleted_at,expires_at)` |
| `categories` | `id`, unique slug, display name, status/timestamps | slug |
| `subcategories` | `id`, category FK, slug/name; unique `(category_id,slug)` | category |
| `topic_clusters` | `id`, slug/name; unique slug | slug |
| `tags` | `id`, normalized unique name | name |
| `entities` | `id`, normalized name, kind; unique `(normalized_name,kind)` | kind/name |
| `content_items` | `id`, user/source unique, content kind, category/subcategory FK, strict-parsed normalized Builder output/hash/schema/prompt version, normalized Verifier output/score/schema/prompt version, state, `audio_ready_at`, correction version, `deleted_at`, timestamps; raw transport response 없음 | unique `(user_id,source_video_id)`; `(user_id,audio_ready_at,id)` |
| join tables | `content_item_topic_clusters`, `_tags`, `_entities`; composite PK/FKs cascade | reverse FK index |
| `audio_assets` | `id`, `content_item_id UNIQUE FK`, status, opaque storage key, mime, bytes/duration/hash, generated/deleted timestamps | unique content; `(status,generated_at)` |
| `tts_generation_receipts` | `id`, user/job/content FKs, provider idempotency key, Asia/Seoul local date, nullable artifact hash/bytes/duration, nullable opaque staging key, receipt status, timestamps; no provider body | unique `(job_id)`, unique provider idempotency key; `(user_id,local_date,status)` |
| `playback_items` | `(user_id,content_item_id) PK`, exact status, `last_position_ms`, duration, play/manual replay counts, last played, completed/skipped timestamps, revision, timestamps | `(user_id,status)`, `(user_id,updated_at)`, unique partial `(user_id) WHERE status='in_progress'` |
| `global_playback_state` | `user_id PK`, nullable active content/session, `last_position_ms`, `revision`, `last_device_run_id`, `last_device_sequence`, `updated_at`; composite FK `(user_id,active_content_id)` references the same user's playback row and service/trigger requires it be `in_progress` | PK |
| `briefing_sessions` | `id`, user, entry point/context, device run ID, snapshot time, status, timestamps | `(user_id,status,created_at)` |
| `briefing_session_items` | user/session/content FKs, `ordinal`, snapshot state/audio ready time; PK `(session_id,ordinal)`, unique `(session_id,content_item_id)` | content/session |
| `playback_mutations` | `client_mutation_id PK`, user/device run/strictly increasing device sequence, base/applied revision, action, content/session, position, created/applied timestamps; unique `(user_id,device_run_id,device_sequence)` | `(user_id,applied_at)` |
| `daily_tts_usage` | user, local date, `reserved_count >=0`, successful provider-generation count `>=0`, CHECK reserved+successful `<=10`, revision; PK `(user_id,local_date)` | PK |
| `worker_singleton` | fixed key PK, lease owner/expiry/heartbeat | expiry |
| `schema_migrations` | version PK, checksum, applied time | PK |
| `audit_events` | id, safe event type, entity type/id, safe metadata JSON, created; no source/provider body | `(event_type,created_at)` |

FK는 모두 immediate, `ON UPDATE RESTRICT`, 기본 `ON DELETE RESTRICT`다. 이 MVP의 삭제는 physical cascade가
아니라 tombstone/file cleanup이므로 application path에서 parent row를 지우지 않는다. Exact FK map은 다음과
같다.

- 모든 `user_id`는 `users.id`를 참조한다. `manual_batch_items.batch_id -> manual_batches.id`,
  `channel_discoveries.channel_id -> channels.id`다.
- `processing_jobs.source_video_id -> source_videos.id`; `origin_kind='manual'`이면
  `manual_batch_item_id`만 non-null이고 해당 item을, `origin_kind='channel'`이면 `channel_discovery_id`만
  non-null이고 해당 discovery를 참조한다. 각 origin FK는 partial unique라 승인 source당 job은 하나다.
- `provider_attempts.job_id`, `temporary_caption_artifacts.job_id`는 `processing_jobs.id`를 참조한다.
- `subcategories.category_id -> categories.id`; `content_items`는 user/source/category를 참조하고
  `(subcategory_id,category_id)` composite FK로 category 불일치를 막는다. 모든 taxonomy join은
  ContentItem과 해당 taxonomy row를 참조하는 composite-PK table이다.
- `audio_assets.content_item_id -> content_items.id`; `tts_generation_receipts`는 job/content/user와
  `(user_id,local_date) -> daily_tts_usage(user_id,local_date)`를 참조한다.
- `playback_items`는 user/content를 참조한다. `global_playback_state`의 active content와 active session,
  `briefing_session_items`의 session/content, `playback_mutations`의 content/session은 same-user composite
  unique/FK로 다른 user의 row를 가리킬 수 없다.
- `briefing_sessions.user_id`, `daily_tts_usage.user_id`는 user를 참조한다. `audit_events`의 entity pointer만
  intentional polymorphic safe ID라 FK가 없고, 허용 entity type을 CHECK한다.

`ContentItem` 하나가 생기면 같은 transaction에서 `audio_assets(status='pending')` 한 행과
`playback_items(status='unheard', last_position_ms=0)` 한 행을 만든다. 따라서 삭제 전에는 ContentItem당
AudioAsset이 정확히 하나다. `audio_assets.ready`와 `content_items.audio_ready_at NOT NULL`은 함께만
transition한다.

### 8.2.1 device Expo SQLite schema

Device DB `vibenews-device.db`, `PRAGMA user_version=1`, WAL/foreign keys를 사용한다.

| Table | Field/constraint |
| --- | --- |
| `device_playback_cache` | `user_id PK CHECK(user_id='leo')`, active content/session nullable, status/position/duration, server revision, device run ID/next sequence, updated time |
| `device_session_items` | session ID, ordinal, content/audio ID, derived display metadata, snapshot ready time; PK `(session_id,ordinal)`, unique session/content |
| `device_playback_outbox` | `client_mutation_id PK`, device run ID, monotonic device sequence, base revision, action, content/session IDs, position, created/last-attempt/attempt-count/safe-error; unique `(device_run_id,device_sequence)`; payload has no token/header/script |
| `device_migrations` | version PK, checksum, applied time |

`SQLiteProvider(databaseName='vibenews-device.db', onInit=migrate)`가 root를 감싸고 모든 cache+outbox write는
`withExclusiveTransactionAsync(txn => ...)`와 bound parameters를 사용한다. SecureStore token은 이 DB에
복사하지 않는다. Session cache는 offline UI/현재 audio lookup용이며 server snapshot을 재정렬하거나 새
item을 삽입할 수 없다.

### 8.3 transition 규칙

- job은 위 순서로만 전진하며 retry는 같은 row/attempt를 재개한다. terminal에서 queued로 직접 돌아가지
  않는다. retryable terminal은 명시적 `eligible_at`과 defer transition을 쓴다.
- ContentItem은 Builder parse 뒤 `built`, gate PASS 뒤 `verified -> audio_pending`, atomic TTS finalize에서만
  `audio_ready`다. non-pass는 `human_review_required`다.
- `human_review_required`에서 TTS state로 가는 transition은 없다.
- channel toggle OFF는 approval version을 증가시킨다. job claim 시 저장된 version과 현재 ON/version이
  다르면 `approval_revoked` defer다.
- Worker는 **각 stage call 직전과 TTS/audio publish 직전** approval version을 다시 확인한다. call 도중
  OFF가 되면 이미 받은 normalized stage output/hash까지만 같은 job에 보존하고 temp caption을 삭제한 뒤
  `approval_revoked`로 defer한다. 다음 provider/TTS/automatic publish를 시작하지 않는다.
- correction은 같은 unique ContentItem에 `correction_version + 1`의 새 pipeline job을 만든다. 기존
  normalized output/audio는 새 output/audio가 staging에서 모두 ready가 될 때까지 serve한다. 한 transaction과
  atomic file swap으로 새 version을 활성화하고 이전 output hash/provenance를 audit한 뒤 이전 audio file을
  tombstone/삭제한다. 중간 상태가 기존 ready version을 덮어쓰지 않는다.
- Correction 대상이 global active면 provider/TTS를 시작하지 않고 `active_content_correction`으로 defer한다.
  completed/skipped/deleted로 active가 해제된 뒤 처리하므로 재생 중 audio/position을 교체하지 않는다.
- user deletion은 content, audio, playback, session membership을 tombstone하고 file deletion을 queue한다.
  삭제된 항목은 모든 API/queue에서 즉시 제외된다.
- 삭제 대상이 global active면 같은 transaction에서 active content/position을 clear하고 playback revision을
  증가시킨다. Client는 revision/update를 받으면 singleton player를 정지하며 다음 automatic play가 남은
  snapshot eligible item을 선택한다.

## 9. Limits, scheduling, lease, recovery

### 9.1 authoritative transaction boundary

| 제한 | 강제 위치 |
| --- | --- |
| batch 10 links | batch 생성 transaction 전에 normalized non-empty line count; item insert는 한 transaction |
| channel 5 | `BEGIN IMMEDIATE` 안에서 user의 non-deleted channel count 후 insert |
| hourly poll | channel claim transaction이 `next_poll_at <= now`인 row만 lease |
| unseen 3/channel/poll | discovery transaction에서 기존 deferred를 먼저 포함해 최대 3개만 queued로 승격 |
| successful TTS 10/day | call 전 receipt intention+daily reservation transaction; valid response converts reservation to success; reserved+successful <=10 |
| pipeline concurrency 1 | `worker_singleton` lease와 systemd single instance 둘 다 |
| verifier total 2 | provider attempt insert 전에 `verifier_attempts < 2` CHECK/update |

제한에 걸린 source/job은 삭제하지 않는다. `deferred`와 다음 `eligible_at`을 기록한다.

### 9.2 ordering과 fairness

- worker claim order: `eligible_at ASC`, `approved_at/discovered_at ASC`, manual origin이 같은 timestamp일 때만
  먼저, 마지막 tie-break `job_id ASC`다. 오래된 channel job은 새 manual job 때문에 굶지 않는다.
- channel poll은 기존 deferred discovery를 published time ASC/video ID ASC로 먼저 승격한 뒤 새 unseen을
  넣는다. feed cursor는 발견 row가 DB commit되기 전에는 전진하지 않는다.
- 새 channel은 `next_poll_at=now`; 성공/실패 poll 모두 다음 due는 claim time + 1시간이다. overlapping poll은
  channel lease로 막는다.
- daily cap deferred TTS/job은 다음 Asia/Seoul 자정 + deterministic 0~5분 jitter에 eligible이다. Explicit
  provider failure는 reservation을 release하고 count하지 않지만 outcome-unknown은 conservative reservation을
  유지하며, valid audio 뒤 storage/publish 실패는 successful count를 유지한다.

### 9.3 crash recovery와 idempotency

- worker lease 5분, 30초 heartbeat다. process restart 시 expired lease를 `lease_recovery`로 reclaim한다.
- stage output hash와 unique provider attempt가 완료 stage 재호출을 막는다. 불확실한 TTS timeout은 같은
  idempotency key로 provider status를 조회·회수할 수 있을 때만 reconcile한다. `synthesize` HTTP submission을
  자동 반복하지 않으며 조회 API가 없으면 `outcome_unknown` reservation을 유지하고 human reconciliation을
  요구한다.
- caption temp와 TTS partial은 claim 전/후 cleanup sweep 대상이다.
- API idempotency key는 batch/channel mutation/playback mutation에 필수다. 같은 key+같은 body는 같은
  response, 같은 key+다른 body는 `409 IDEMPOTENCY_CONFLICT`다.
- DB corrupt, migration checksum mismatch, temp deletion overdue, storage non-writable, missing provider config면
  readiness가 실패하고 신규 job claim을 중단한다. 이미 재생 가능한 audio read는 DB 안전성 범위에서만
  유지한다.

## 10. 사용자 전역 자동 재생과 resume

### 10.1 한 큐 원칙

다음 진입점은 filter별 큐를 만들지 않고 모두 같은 `startOrResumeAutomatic` command를 호출한다.

```text
today_briefing | listen_global | category | tag | today_flow
```

`entryPoint`와 `entryContextId`는 분석/화면 복귀 metadata일 뿐 queue eligibility를 바꾸지 않는다.
Category/Tag/Flow에서 완료·skip된 항목이 다시 자동 재생되는 별도 history는 없다.

Server DB가 queue membership/status/revision의 정본이고 device Expo SQLite는 즉시 durable journal/outbox다.
네트워크가 복구되면 `clientMutationId`로 server에 idempotent 적용한다. 이 MVP는 한 device만 허용하므로
multi-device conflict resolution은 없다.

### 10.2 상태 전이

| 현재 | action/조건 | 다음 | 자동 큐 효과 |
| --- | --- | --- | --- |
| unheard | player가 load 후 실제 `playing=true` 보고 | in_progress | user의 유일 active item이 됨 |
| in_progress | pause/seek/background/process exit | in_progress | active 유지, last position 갱신 |
| in_progress | Expo `didJustFinish=true` | completed | 모든 자동 진입점에서 제외, active 해제 |
| unheard/in_progress | 사용자가 명시적 `건너뛰기` | skipped | 모든 자동 진입점에서 제외, active 해제 |
| completed/skipped | manual replay 시작/종료 | 동일 | automatic state/pointer/snapshot을 바꾸지 않음 |

tap, load, buffer만으로 in_progress가 되지 않는다. 실제 재생 시작이 기준이다. `completed`는
`didJustFinish`를 받은 idempotent mutation으로만 된다. duration 비율이나 경과 시간으로 completion 또는
exclusion을 추정하지 않는다.

Automatic player의 Next는 label/hint가 `다음으로 건너뛰기`인 명시적 skip action이다. 현재
unheard/in_progress를 atomic하게 skipped로 바꾸고 active를 해제한 뒤 다음 snapshot eligible item을
시작한다. Previous는 current position이 3초보다 크면 0초 seek만 하고, 그 이하면 이전 automatic item이
completed/skipped 상태이므로 비활성화한다. 이전 item 다시 듣기는 manual replay만 사용한다.

### 10.3 session snapshot 생성

`POST /v1/automatic-sessions`는 `BEGIN IMMEDIATE`에서 다음을 수행한다.

1. 같은 device process run 안에서 active session이 있으면 그 session을 그대로 반환한다.
2. cold app start 또는 명시적 새 session이면 이전 active session을 `interrupted`로 표시한다.
3. `global_playback_state.active_content_id`가 있고 그 row가 `in_progress`면 snapshot ordinal 0에 둔다.
4. snapshot time 이하에 `audio_ready`이고 `unheard`인 모든 item을
   `audio_ready_at ASC, content_item_id ASC`로 고정한다.
5. membership/order를 `briefing_session_items`에 commit한다. 이후 ready가 된 item은 이 snapshot에
   추가하지 않는다.

membership/order는 불변이다. 다만 snapshot 생성 뒤 다른 action으로 completed/skipped/deleted된 member는
traversal 때 건너뛴다. 세션이 끝나거나 cold start 후 새 session을 만들 때만 새 ready item이 들어간다.

### 10.4 이어듣기와 저장 cadence

- 자동 진입 시 active incomplete가 있으면 항상 첫 번째이며 `lastPositionSec`로 `seekTo` 후 재생한다.
- UI copy: `이어듣기 · 2:14 / 6:40`처럼 현재/전체 시간을 함께 표시한다.
- root controller는 `createAudioPlayer` 한 개와 `playbackStatusUpdate` listener 한 개를 소유한다.
- status UI update interval은 500ms다. device DB checkpoint는 재생 중 2초마다, 그리고 play/pause/seek/
  previous/next/skip/completion/AppState background마다 exclusive transaction으로 쓴다.
- server checkpoint는 15초마다 coalesce하고 위 control/lifecycle event에서는 즉시 전송한다.
- device write가 성공하고 server가 실패하면 outbox를 남긴다. 다음 launch는 local position으로 즉시 보여준
  뒤 server revision을 받아 mutation을 replay한다.
- root controller는 device run마다 monotonic `deviceSequence`를 발급하고 cache update와 outbox insert를 한
  exclusive transaction에 쓴다. Server는 `(user,deviceRunId,deviceSequence)`를 unique/idempotent하게 적용한다.
- Cold start는 새 run ID를 만들되 이전 run의 unsent outbox를 `created_at, device_run_id, device_sequence`
  순으로 먼저 drain한다. 같은 active item에서 두 explicit action 사이의 CHECKPOINT만 마지막 값으로
  coalesce할 수 있고 START/SEEK/PAUSE/COMPLETE/SKIP은 coalesce하거나 순서를 바꾸지 않는다.
- optimistic revision mismatch는 `409 PLAYBACK_REVISION_CONFLICT`다. Client가 latest state를 읽고 outbox를
  sequence 순으로 rebase한다. 같은 active item이면 `SEEK`는 뒤로 seek를 포함한 **명시적 exact position**,
  PAUSE/COMPLETE/SKIP은 action 의미를 보존하고, 단순 CHECKPOINT만 더 나중 explicit action을 덮지 않는다.
  Active item/session이 바뀌었으면 이전 item mutation을 safe stale outcome으로 폐기한다. Position의 max값만
  택하는 규칙은 deliberate rewind를 망가뜨리므로 사용하지 않는다.

### 10.5 manual replay

Saved/Recap/history의 `다시 듣기`는 `mode='manual_replay'`다. 별도 session/mutation으로 play count와
last played만 갱신한다. 자동 active item, 자동 last position, 자동 session ID, `completed/skipped` 상태를
절대 바꾸지 않는다. 시작 시 재생 중 automatic item을 pause/checkpoint하고 같은 singleton player를
manual source로 교체한다. manual 종료/stop 뒤 automatic audio를 자동으로 재개하지 않으며 이전 active
resume prompt를 복원한다. 사용자가 automatic play를 누르면 그 위치에서 이어진다.

### 10.6 A/B/C/D 정본 시나리오

1. A, B, C가 순서대로 ready인 상태에서 S1을 시작하면 snapshot은 A/B/C다.
2. A를 2:14에서 멈춘 뒤 D가 ready가 되어도 S1에는 D가 없다.
3. Listen/Category/Tag/오늘의 흐름을 오가도 A 2:14를 공유하고 새 큐를 만들지 않는다.
4. process를 종료하고 앱을 cold start해 새 S2를 만들면 active A가 먼저, 그 다음 unheard B/C/D가
   `audioReadyAt,id` 순서로 snapshot된다.
5. A를 끝내면 completed가 되어 모든 자동 surface에서 제외되고 B로 간다. C를 skip하면 모든 자동
   surface에서 제외된다.
6. completed B를 manual replay해도 B는 자동 큐에 돌아오지 않고 자동 resume pointer를 바꾸지 않는다.

## 11. private API 계약

모든 `/v1` route는 health live를 제외하고 `Authorization: Bearer <opaque-device-token>`, fixed user `leo`,
`application/json`, 64 KiB request body limit를 요구한다. Token은 사용자가 Settings의 `서버 연결 코드`
field에 수동 입력하고 SecureStore에 저장한다. 앱 bundle, `EXPO_PUBLIC_*`, Git, URL query에는 넣지 않는다.
Server는 token hash만 runtime config에서 읽고 constant-time 비교한다.

Provisioning은 trusted interactive console에서 cryptographically random 32-byte token을 한 번 생성해 Leo에게
한 번만 표시하고 server에는 SHA-256만, device에는 SecureStore raw token만 저장한다. Settings field는
`secureTextEntry`, autofill off, save 후 React state를 clear하고 token을 event/clipboard/URL/log에 남기지
않는다. Rotation은 server hash 교체 -> device 재입력 순서이며 이전 token은 즉시 401이 된다.

### 11.1 공통 envelope

```ts
interface ApiSuccess<T> { data: T; requestId: string; }
interface ApiError {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    fieldErrors?: Array<{ path: string; code: string }>;
  };
  requestId: string;
}
```

Error status는 validation 400/422, auth 401/403, not found 404, conflict 409, rate/cap defer response 202,
upstream mapped 502/503, internal 500이다. raw upstream message는 반환하지 않는다.
Core error code는 `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `IDEMPOTENCY_CONFLICT`,
`PLAYBACK_REVISION_CONFLICT`, `BATCH_LIMIT_EXCEEDED`, `CHANNEL_LIMIT_EXCEEDED`, `UNSUPPORTED_YOUTUBE_URL`,
`PUBLIC_CAPTION_UNAVAILABLE`, `SOURCE_DURATION_REJECTED`, `OUTPUT_TOO_LARGE`, `APPROVAL_REVOKED`,
`DAILY_TTS_CAP_DEFERRED`, `HUMAN_REVIEW_REQUIRED`, `PROVIDER_UNAVAILABLE`, `STORAGE_UNAVAILABLE`,
`MIGRATION_MISMATCH`, `INTERNAL_ERROR`로 allowlist한다.

```ts
type Id = string;       // UUID validated by Zod
type IsoInstant = string;

interface CreateManualBatchRequest { urls: string[] } // min 1, max 10
interface ManualBatchItemView {
  id: Id;
  ordinal: number;
  videoId: string | null;
  publicTitle: string | null;
  status: 'invalid' | 'duplicate' | 'queued' | 'processing' | 'deferred' |
          'human_review_required' | 'audio_ready' | 'failed' | 'deleted';
  stage: 'caption' | 'builder' | 'verifier' | 'tts' | null;
  verifierAttempt: 0 | 1 | 2;
  deferReason: DeferReason | null;
  nextEligibleAt: IsoInstant | null;
  error: { code: string; retryable: boolean; message: string } | null;
  contentItemId: Id | null;
  audioAssetId: Id | null;
  updatedAt: IsoInstant;
}
interface ManualBatchView {
  id: Id;
  status: 'accepted' | 'processing' | 'complete' | 'partial_failure' | 'failed' | 'deleted';
  approvedAt: IsoInstant;
  items: ManualBatchItemView[];
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

interface CreateChannelRequest { url: string; autoProcessingEnabled: boolean }
interface PatchChannelRequest { autoProcessingEnabled: boolean }
interface ChannelView {
  id: Id;
  youtubeChannelId: string;
  canonicalUrl: string;
  publicTitle: string;
  status: 'active' | 'disabled' | 'deleted';
  autoProcessingEnabled: boolean;
  approvalVersion: number;
  deferredCount: number;
  lastPolledAt: IsoInstant | null;
  nextPollAt: IsoInstant | null;
  lastPollErrorCode: string | null;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

interface LibraryItemView {
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
interface CursorPage<T> { items: T[]; nextCursor: string | null }

type AutomaticEntryPoint = 'today_briefing' | 'listen_global' | 'category' | 'tag' | 'today_flow';
interface CreateAutomaticSessionRequest {
  entryPoint: AutomaticEntryPoint;
  entryContextId?: string;
  deviceRunId: Id;
  existingSessionId?: Id;
}
interface AutomaticSessionItemView {
  ordinal: number;
  contentItemId: Id;
  audioAssetId: Id;
  title: string;
  oneLineSummary: string;
  automaticStatus: AutomaticPlaybackStatus;
  audioReadyAt: IsoInstant;
  durationSec: number;
}
interface AutomaticSessionView {
  id: Id;
  status: SessionStatus;
  entryPoint: AutomaticEntryPoint;
  entryContextId: string | null;
  snapshotAt: IsoInstant;
  activeContentItemId: Id | null;
  resumePositionSec: number;
  revision: number;
  items: AutomaticSessionItemView[];
}

interface GlobalPlaybackView {
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
interface PlaybackMutationBase {
  clientMutationId: Id;
  deviceRunId: Id;
  deviceSequence: number; // positive safe integer, strictly increasing in a run
  baseRevision: number;
  sessionId: Id;
  contentItemId: Id;
  positionSec: number;
  durationSec: number;
}
type PlaybackMutationRequest = PlaybackMutationBase & {
  type: 'START' | 'CHECKPOINT' | 'SEEK' | 'PAUSE' | 'COMPLETE' | 'SKIP';
};
interface PlaybackMutationResponse {
  playback: GlobalPlaybackView;
  appliedRevision: number;
  outcome: 'applied' | 'idempotent_replay' | 'stale_discarded';
}

interface CreateManualReplayRequest { contentItemId: Id; clientMutationId: Id }
type CorrectionReasonCode = 'factual_error' | 'pronunciation' | 'outdated' | 'audio_quality' | 'other_safe';
interface CreateCorrectionRequest { reasonCode: CorrectionReasonCode }
interface ManualReplayGrant {
  replayId: Id;
  contentItemId: Id;
  audioAssetId: Id;
  durationSec: number;
  automaticPlaybackRevision: number; // unchanged assertion
}
interface AcceptedDeletion { contentItemId: Id; status: 'deleted'; cleanupQueued: true }
interface AcceptedCorrection { contentItemId: Id; correctionVersion: number; jobId: Id; status: 'queued' }
interface ReadyView {
  ready: boolean;
  checks: Array<{ name: 'database' | 'migration' | 'storage' | 'config' | 'cleanup' | 'worker' | 'poller'; ok: boolean; code: string }>;
}
```

`AutomaticPlaybackStatus` in API contracts is the exact four-state enum. Cursor fields are opaque base64url
server tokens with maximum length 512 and cannot contain SQL/order input. Public title/summary are normalized derived
metadata only; raw captions/provider output are never returned.
Every URL input is 1..2,048 Unicode characters after trim and rejects NUL/control characters before parsing.
`Idempotency-Key`, every `Id`, `clientMutationId`, and `deviceRunId` is a canonical UUID; `entryContextId` is at most
128 safe characters. `deviceSequence`/revision are nonnegative safe integers (`deviceSequence >=1`), duration is
finite `1..7,200`, and position is finite `0..duration`. Query `limit` is integer `1..50`. Safe API error messages are
allowlisted templates at most 200 characters, never reflected input/upstream text. Unknown fields are rejected.

### 11.2 routes

| Method/path | Request | Response/ownership |
| --- | --- | --- |
| `GET /v1/health/live` | 없음 | process alive만, secret/version detail 없음 |
| `GET /v1/health/ready` | auth | DB/migration/storage/provider-config/cleanup/worker/poller safe status |
| `POST /v1/manual-batches` | `{urls:string[1..10]}`, Idempotency-Key | `202 {batchId,items[]}`; CTA approval과 item isolation |
| `GET /v1/manual-batches/:id` | cursor 없음 | batch/item safe progress/error/defer state |
| `POST /v1/manual-batch-items/:id/retry` | retryable terminal only + Idempotency-Key | same job 재개; verifier cap 우회 불가 |
| `GET /v1/channels` | 없음 | channel/approval/poll/deferred counts |
| `POST /v1/channels` | `{url,autoProcessingEnabled}` + Idempotency-Key | canonical channel; max-5 transaction |
| `PATCH /v1/channels/:id` | `{autoProcessingEnabled}` + Idempotency-Key | approval version 증가/철회 |
| `DELETE /v1/channels/:id` | Idempotency-Key | tombstone + queued approval revoke |
| `GET /v1/library` | cursor, limit<=50 | ready ContentItem public-derived metadata only |
| `DELETE /v1/content-items/:id` | Idempotency-Key | derived/audio deletion tombstone `202` |
| `POST /v1/content-items/:id/corrections` | `{reasonCode:CorrectionReasonCode}` + Idempotency-Key | new correction job, no raw source text |
| `POST /v1/automatic-sessions` | `{entryPoint,entryContextId?,deviceRunId,existingSessionId?}` + Idempotency-Key | immutable ordered snapshot, active resume first |
| `GET /v1/automatic-sessions/:id` | 없음 | membership + current global statuses |
| `GET /v1/playback/global` | 없음 | active item/position/revision/session |
| `POST /v1/playback/mutations` | mutation union + client/base revision | idempotent updated global state 또는 409 |
| `POST /v1/manual-replays` | `{contentItemId,clientMutationId}` | isolated replay grant; no auto mutation |
| `GET /v1/audio-assets/:id/file` | Range optional | authorized `audio/mpeg`, `Accept-Ranges`, 200/206 |

Audio route는 DB의 opaque ID -> ready/non-deleted storage key로만 resolve한다. 하나의 valid `bytes=start-end`
Range만 허용하고 suffix/multi-range/overflow는 416이다. `Content-Disposition: inline`, `nosniff`,
`Cache-Control: private, no-store`를 사용한다. redirect/signed public URL은 없다.

### 11.3 ownership split

- Server: source, pipeline, ContentItem/AudioAsset, queue eligibility, snapshot, canonical playback revision.
- Device SQLite: current render/cache, immediate checkpoint, unsent outbox, device run ID migration state.
- SecureStore: private bearer token 하나만.
- `expo-audio`: 현재 process의 single native player, duration/currentTime/didJustFinish.
- Client는 provider key/model/reference, DB path, storage path, transcript를 보거나 보낼 수 없다.

## 12. security, privacy, copyright, retention

### 12.1 hard boundaries

- private/internal 사용만 허용한다. public hostname/feed/share/export가 생기면 design defect로 중단한다.
- Fastify는 loopback-only이고 Tailscale Serve는 tailnet-only다. Funnel은 disabled 상태여야 하며 Worker는
  Tailscale login/Serve/grant/Funnel state를 변경할 권한이 없다. operator가 승인된 device grant를 준비하지
  못하면 private acceptance는 `RUNTIME_ACCESS_REQUIRED`이고 공개 fallback은 없다.
- YouTube 원본 video/audio는 요청·다운로드·cache·retention하지 않는다.
- raw caption은 provider 처리용 temp file일 뿐 UI/API/DB/event/backup/test fixture/Git에 없다.
- derived analysis, script, provenance, generated audio는 user 삭제까지 유지한다.
- transcript의 긴 인용이나 원문 대체물이 되는 script를 금지한다. Verifier critical failure
  `COPYRIGHT_REPRODUCTION`이 이를 막는다.

### 12.2 SSRF와 subprocess

- URL parser는 exact HTTPS host/form과 ID regex를 통과한 뒤 ID로 canonical URL을 재구성한다.
- DNS/IP/userinfo/custom port/arbitrary redirect URL을 child process에 전달하지 않는다.
- feed fetch는 exact YouTube feed host/path만, redirect 재검증, byte/time bound, private/link-local IP 거부다.
- `spawn`은 shell false, minimal PATH/HOME, cleared proxy/cookie env, service user, `cwd` isolated, umask 077이다.
- container/systemd hardening은 `NoNewPrivileges`, `PrivateTmp`, `ProtectSystem=strict`, writable state paths만,
  memory/process/file limits를 사용한다. network egress는 YouTube, DeepSeek, Fish endpoints만 운영 firewall로
  제한한다.

### 12.3 logs와 secrets

- URL은 video/channel ID만, token은 hash prefix조차 남기지 않는다. Authorization/provider headers와 raw
  bodies를 logger serializer에서 drop한다.
- provider model/reference의 실제 값, provider response, caption/script/audio bytes는 log하지 않는다.
- safe metric은 stage/status/error code/duration/byte count/hash/config version뿐이다.
- server config validation은 process start에서 required selector/credential 존재와 non-placeholder만 검사하고
  값을 출력하지 않는다. client build에는 server env import가 있으면 type/build test가 실패한다.
- DeepSeek에는 processing에 필요한 ephemeral caption chunk/evidence pack만, Fish에는 passed derived script만
  보낸다. Worker는 live call 전 configured API account의 no-training/data-control requirement와 current public
  provider policy/version/date를 확인하고 safe boolean/version evidence만 남긴다. Provider가 request storage
  opt-out을 지원하면 adapter가 이를 명시하며, 이 private boundary를 검증할 수 없으면 live acceptance는
  BLOCKED다. 이는 VibeNews의 24시간 local deletion audit를 provider retention 주장으로 오인하지 않게 한다.

### 12.4 deletion, correction, backup

- temp caption은 사용 직후 삭제, 24시간 hard deadline과 overdue audit를 모두 갖는다.
- failed TTS partial과 orphan audio는 매 15분 sweep한다. DB에 ready가 아닌 file과 file이 없는 ready row는
  readiness/fix queue 대상이다.
- user delete는 API에서 즉시 tombstone하고 worker가 audio file/derived JSON을 지운 뒤 deletion audit를
  남긴다. 원 source identifier 최소 tombstone은 duplicate 방지용으로만 유지한다.
- daily same-host private backup은 `better-sqlite3` online backup + ready audio manifest/file을 새 `0700`
  generation directory에 만들고 hash 검증 뒤 `.complete` marker로 atomic publish한다. temp caption과 secrets는
  제외하고 7 daily generations만 유지한다. Off-host copy/encryption은 이 MVP 범위 밖이며 residual risk다.
- restore drill은 별도 directory에 복원해 migration checksum/audio hash/FK를 검증한 뒤에만 swap한다.
- correction은 provenance와 이전 version audit를 보존하지만 사용자 surface는 latest non-deleted version만
  쓴다.

## 13. migration, deployment, rollback

### 13.1 forward migration

1. clean/frozen design head 확인 후 package/lock을 갱신하고 Expo dependencies는 `npx expo install`로 맞춘다.
2. server config/example/docs를 만들되 실제 값을 읽거나 복사하지 않는다.
3. `/var/lib/vibenews-dev` backup과 permission preflight 후 `server:migrate -- --dry-run`, 실제 migration을
   실행한다.
4. API -> worker -> poller 순으로 systemd를 시작하고 readiness를 확인한다.
5. app root에 SQLiteProvider/global audio provider를 설치하고 device DB `user_version=1` migration을 한다.
6. 기존 hook-local controller는 global controller facade로 교체한다. 기존 sample URL/fallback은 dev visual
   reference로도 자동 play path에서 사용하지 않는다.
7. Briefing tab을 Add로 교체하고 기존 Briefing UI는 push route로 옮긴다.
8. live private source를 manual batch로 통과시킨 후 device playback/global resume를 검증한다.
9. 선택 channel을 등록하고 initial due poll + next hourly due evidence를 검증한다.

기존 mock ContentItem은 server DB로 seed하지 않는다. device migration은 active row 없음, revision 0,
outbox empty로 시작한다. 이전 hook state/sample position은 실제 콘텐츠로 오인하지 않고 폐기한다.

### 13.2 rollback

- deployment 전 DB/audio generation backup과 이전 app commit을 기록한다.
- API/worker/poller stop -> 이전 app/server commit -> 이전 migration 호환성 확인 순서다.
- migration 001은 additive다. rollback code가 새 table을 읽지 않을 수 있지만 data를 자동 drop하지 않는다.
- rollback 후 생성된 private audio가 더 이상 참조되지 않으면 manifest로 식별해 명시적 cleanup한다.
- source/provider call은 되돌릴 수 없으므로 중복 호출하지 않고 audit만 보존한다.
- repo/server/package/Node/Expo 사실이 이 설계와 다르면 Worker는 workaround를 만들지 않고
  `DESIGN_DEFECT`로 Advisor에 반환한다.

## 14. test와 acceptance

### 14.1 exact commands

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

`test:runtime-local`은 synthetic metadata/caption hashes와 generated tiny audio fixture만 사용해 failure path,
HTTP Range, restart, quota를 검사한다. 실제/저작권 transcript를 fixture로 넣지 않는다.
`accept:private`만 server runtime config와 실제 public source/provider를 사용하며 raw text/response/secret을
stdout/file에 남기지 않고 safe stage status, IDs, hashes, timestamps만 보고한다.

### 14.2 unit

- URL/channel canonicalization, 11th link/max-5 rejection, IDN/port/userinfo/redirect/SSRF cases
- Builder/Verifier strict schema and independent prompt/schema/config selection
- gate boundary 8.9/9.0, critical failure, attempt 1/2 and no attempt 3
- every job/playback state transition including forbidden transition
- snapshot ordering by `audioReadyAt,id`, post-start exclusion, dynamic completed/skipped exclusion
- manual replay reducer does not mutate automatic fields
- monotonic device sequence/outbox rebase preserves explicit backward seek and drops old-active mutations
- Asia/Seoul day boundary, cap defer time, oldest-first/fair ordering
- Range parser/path resolution/log redaction

### 14.3 integration/failure injection

- SQLite migration from empty/restart/checksum mismatch/FK/WAL and concurrent batch/channel transactions
- worker kill during caption/Builder/Verifier/TTS/finalize, expired lease reclaim, no duplicate provider attempt/audio
- captionless, timeout, oversized output, symlink, bad VTT, login/cookie challenge all fail closed
- Builder invalid JSON, Verifier invalid JSON/429/5xx, TTS timeout/partial file/storage full
- temp cleanup on every exit plus simulated overdue artifact blocks new claims
- daily 9->10 provider success then defer; explicit failure releases reservation; outcome-unknown keeps reservation
  and is not auto-retried; valid audio followed by storage/publish failure stays successful and is not auto-called
  again; ordinary cap-deferred job requeues next day
- channel feed 5 unseen promotes only oldest 3 and retains 2 deferred for next poll
- OFF approval revokes unstarted jobs and a mid-stage OFF prevents the next stage/TTS/publish; re-enable resumes
  without duplicate
- auth absent/wrong, token redaction, audio 200/206/416, deleted audio 404
- API/worker/poller restart and DB backup/restore hash validation

### 14.4 real private vertical slice

PASS evidence must show, without source text or secret:

1. selected video canonical ID and official channel match
2. public caption artifact metadata and deletion timestamp within deadline
3. one Builder attempt/output hash and separately versioned Verifier attempt/output hash
4. verifier score >=9.0 and no critical failure
5. Fish generation success, exactly one TTS receipt/`successful_count` increment and exactly one ready AudioAsset
6. authorized app Range fetch and real device playback
7. selected channel feed discovery, poll timestamps, three-item bound, `next_poll_at` exactly hourly
8. no original video/audio file and no raw transcript in repo/DB/log/backup/result
9. Fastify listens only on loopback, Funnel is disabled, the authorized Leo tailnet device reaches Serve HTTPS, and
   an unauthorized/non-tailnet/public path cannot reach the API

Transient provider/YouTube failure is a truthful FAIL/BLOCKED runtime result, not permission to use sample audio or
claim PASS.

### 14.5 device/global playback acceptance

- Execute the A/B/C/D scenario in section 10.6.
- Persist A at 2:14, force-stop/cold-start app, and assert resume `134s ± 2s` plus current/total copy.
- Verify A completion and C skip exclude them from Today/Listen/Category/Tag/Flow.
- Verify D is absent from S1 and present after A in new S2.
- Verify manual replay of completed B changes only manual replay count/last played.
- Switch screens and background/foreground while playing; assert one native player, one active content, monotonic
  revision, no duplicate sound.
- Remove network after local checkpoint, advance, restore network, and assert idempotent outbox reconciliation.

## 15. 선택된 official private acceptance source

2026-07-11에 transcript 내용을 요청하거나 저장하지 않고 public metadata만 확인했다.

```text
VIDEO_TITLE: Introducing "Observe": Performance monitoring for React Native apps
VIDEO_ID: 5JqK9JLD140
VIDEO_URL: https://www.youtube.com/watch?v=5JqK9JLD140
OFFICIAL_CHANNEL_NAME: Expo
CHANNEL_ID: UCx_YiR733cfqVPRsQ1n8Fag
CHANNEL_URL: https://www.youtube.com/channel/UCx_YiR733cfqVPRsQ1n8Fag
CHANNEL_FEED_URL: https://www.youtube.com/feeds/videos.xml?channel_id=UCx_YiR733cfqVPRsQ1n8Fag
PUBLIC_CAPTION_EVIDENCE: public watch metadata exposed a searchable transcript endpoint; text was not fetched
CHANNEL_POLL_EVIDENCE: public feed returned 15 entries; entry bodies were not retained
DESIGN_WORKSPACE_EXTRACTION_CHECK: metadata-only no-cookie yt-dlp was challenged by YouTube anti-bot controls; no caption/media was downloaded
USE: private acceptance only
```

이 영상은 공식 Expo의 React Native performance tooling 소개로 health/finance/legal/election에 해당하지
않는다. acceptance 시 caption이 사라졌거나 public no-login acquisition이 실패하면 D-008 범위 안의 다른
공식 저위험 기술 영상으로 교체하고 stable ID/URL과 caption metadata evidence만 Worker result에 기록한다.
cookie/login으로 우회하지 않는다. channel은 위 stable channel ID를 유지하되 feed가 unavailable이면
truthful failure로 보고한다.

Public transcript metadata는 caption availability evidence지만 현재 host에서의 extraction 성공을
증명하지 않는다. Worker는 실제 service environment에서 constrained command를 다시 실행해야 하며 같은
anti-bot challenge가 지속되면 source/provider PASS를 주장하지 않는다.

## 16. Worker 구현 경계

### 16.1 exact write allowlist

Worker brief는 아래 path만 구현 대상으로 허용해야 한다.

```text
package.json
package-lock.json
app.json
tsconfig.json
.env.example
docs/환경변수.md
docs/실행방법.md
docs/테스트방법.md
docs/변경기록.md
docs/구현로그/2026-07-11_youtube_add_global_resume_mvp.md
src/app/_layout.tsx
src/app/(tabs)/_layout.tsx
src/app/(tabs)/index.tsx
src/app/(tabs)/briefing.tsx                 # delete/move source only
src/app/(tabs)/add.tsx
src/app/(tabs)/settings.tsx
src/app/briefing.tsx
src/app/briefing-session.tsx
src/api/client.ts
src/api/contracts.ts
src/audio/global-audio-controller.ts
src/audio/global-playback-context.tsx
src/audio/global-playback-machine.ts
src/storage/device-db.ts
src/storage/playback-journal.ts
src/hooks/use-audio-player-controller.ts      # delete or compatibility facade; no player ownership
src/components/add/manual-batch-form.tsx
src/components/add/manual-batch-status-list.tsx
src/components/add/channel-registration-panel.tsx
src/components/add/pipeline-status-pill.tsx
src/components/progress-bar.tsx
src/components/chapter-controls.tsx
src/data/types.ts
src/lib/audio.ts
src/lib/eventLog.ts
server/src/bin/api.ts
server/src/bin/worker.ts
server/src/bin/poller.ts
server/src/bin/migrate.ts
server/src/bin/backup.ts
server/src/bin/accept-private.ts
server/tsconfig.json
server/src/config.ts
server/src/db/connection.ts
server/src/db/migrate.ts
server/src/domain/contracts.ts
server/src/domain/enums.ts
server/src/domain/state-machines.ts
server/src/http/auth.ts
server/src/http/errors.ts
server/src/http/schemas.ts
server/src/http/routes/health.ts
server/src/http/routes/batches.ts
server/src/http/routes/channels.ts
server/src/http/routes/library.ts
server/src/http/routes/sessions.ts
server/src/http/routes/playback.ts
server/src/http/routes/audio.ts
server/src/http/routes/content.ts
server/src/providers/caption.ts
server/src/providers/deepseek-builder.ts
server/src/providers/deepseek-verifier.ts
server/src/providers/fish-tts.ts
server/src/services/source.ts
server/src/services/processing.ts
server/src/services/scheduler.ts
server/src/services/retention.ts
server/src/services/playback.ts
server/src/services/backup.ts
server/migrations/001_youtube_add_global_resume.sql
server/test/unit/*.test.ts
server/test/integration/*.test.ts
server/test/runtime/*.test.ts
ops/systemd/vibenews-api.service
ops/systemd/vibenews-worker.service
ops/systemd/vibenews-poller.service
ops/systemd/vibenews-backup.service
ops/systemd/vibenews-backup.timer
scripts/server-smoke.mjs
runs/worker/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/WORKER_RESULT.md
runs/worker/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/WORKER_RESULT_POINTER.md
```

Glob은 위 test directory의 새 `.test.ts`에만 적용한다. 구현 중 다른 source file이 반드시 필요하면
Worker가 임의 추가하지 않고 `DESIGN_DEFECT`로 정확한 path/reason을 Advisor에 반환한다.

### 16.2 forbidden

- 이 문서를 포함한 frozen design subjects, `docs/agent/**`, `advisor/**`, 다른 actor result
- `.env.server.local` 열기/출력/commit, secret/model/reference 실제 값 검사 또는 복사
- cookie/login/browser profile, video/audio download, public deployment/feed
- alternate/local LLM, provider fallback, attempt/cap/approval 우회
- raw caption/provider body/script/audio를 fixture/log/report/chat/Git에 저장
- design을 고치거나 Reviewer를 직접 호출하거나 self-approve/freeze
- history rewrite, amend, force push, destructive DB migration/data deletion

### 16.3 외부 access가 필요한 검증

- Server: systemd, state directory permission, yt-dlp version/public acquisition, DB backup/restore, loopback bind,
  preconfigured Tailscale Serve HTTPS, authorized-device grant, and Funnel-disabled/public-unreachable evidence.
- Provider: configured DeepSeek Builder/Verifier와 Fish credentials/model/reference availability plus no-training/
  data-control policy validation. 실제 값은 출력 금지.
- Device: SecureStore provision, Expo SQLite restart, background/lock-screen, actual audio, A/B/C/D.
- YouTube: selected video public captions와 selected channel public feed.

이 access가 없으면 해당 acceptance를 `NOT_RUN`/`BLOCKED`로 정확히 보고하고 sample로 대체하지 않는다.
특히 tailnet/operator 준비가 없으면 `RUNTIME_ACCESS_REQUIRED`를 보고하며 Worker가 외부 identity나 access
policy를 생성·수정하지 않는다.

## 17. 독립 review 기준

Design Reviewer는 다음을 모두 직접 확인한다.

1. D-001~D-008과 intake의 모든 요구가 문서/관련 product subjects에 보존됨
2. Add tab과 기존 Briefing/session 접근이 충돌 없이 정의됨
3. source command allowlist, no-login/no-cookie/no-media, bounds, immediate/24h cleanup이 실행 가능함
4. Builder/Verifier interface·prompt·context·schema가 분리되고 gate/attempt가 server 계산임
5. DB entity/enum/FK/unique/index/state가 API와 같은 이름/semantics를 가짐
6. 모든 cap이 transaction/lease/requeue와 연결되고 discard path가 없음
7. 한 global queue, active-first, immutable snapshot, D exclusion/new-session inclusion, manual replay isolation이
   서로 모순 없음
8. Expo SDK 57 API/버전 citation이 정확하고 current code의 hook-local limitation을 실제로 교체함
9. secrets, raw captions, original media, provider values, public exposure가 설계 artifact에 없음
10. Worker allowlist가 구현에 충분하면서 frozen/canonical/Advisor/Reviewer path를 열지 않음
11. exact commands/failure tests/real private acceptance와 A/B/C/D device acceptance가 independently checkable함
12. content commit/pointer commit lineage, origin/master 일치, clean worktree가 증명됨

Implementation Reviewer는 실제 diff와 runtime evidence에서 추가로 다음 검색/검사를 한다.

```text
rg -n -i 'anthropic|openai|kimi|qwen|local[ _-]?llm' server src package.json .env.example
rg -n -i 'cookie|cookies-from-browser|netrc|write-thumbnail|download.*(video|audio)' server ops scripts
rg -n -i 'sample|fallback' src server
rg -n -i 'five.second|5초|5 seconds' src server
git ls-files | rg '(^|/)\.env($|\.)|transcript|caption.*\.(vtt|srt|txt)$|audio/.*\.(mp3|wav|opus)$'
```

허용되는 검색 hit는 금지 assertion/test 이름 또는 nonsecret placeholder 설명뿐이며 runtime alternate path는
0이어야 한다. Reviewer는 migration/schema dump, API schema, player transition tests, cleanup audit,
provider attempt IDs/hashes, original-media absence, `git diff <frozen-head>..<worker-head>`, origin/clean state를
직접 대조한다.

## 18. Expo SDK 57 공식 계약

- SDK/Node baseline: <https://docs.expo.dev/versions/v57.0.0/>
- Audio: <https://docs.expo.dev/versions/v57.0.0/sdk/audio/>
  - `createAudioPlayer`는 component lifecycle 밖에서 지속되는 player를 만들며 owner가 `release()`한다.
- `playbackStatusUpdate`/`AudioStatus`는 `currentTime`, `duration`, `didJustFinish`, loading/error state를 준다.
- remote `AudioSource`는 header를 지원하고, background playback은 config plugin/audio mode/Android lock-screen
    activation 계약을 따른다.
- Playback-only app config는 `enableBackgroundPlayback: true`, `enableBackgroundRecording: false`,
  `recordAudioAndroid: false`, `microphonePermission: false`로 녹음 권한/서비스를 추가하지 않는다.
- SQLite: <https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/>
  - database는 app restart를 넘어 지속되며 `SQLiteProvider`, migration, WAL/foreign keys,
    `withExclusiveTransactionAsync`를 사용한다.
- SecureStore: <https://docs.expo.dev/versions/v57.0.0/sdk/securestore/>
  - private token key-value만 `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, `requireAuthentication: false`로 저장한다.
    App foreground에서 한 번 읽은 in-memory token으로 background stream을 유지하되 process restart/잠긴
    상태에서 새로 읽기를 우회하지 않는다. Config plugin은 Android backup exclusion을 구성한다. Critical
    playback data의 단일 정본으로 쓰지 않으며 uninstall/loss 시 manual reprovision한다.
- Router: <https://docs.expo.dev/versions/v57.0.0/sdk/router/>
  - `(tabs)`의 `Tabs`와 root `Stack`을 유지하며 Add는 tab, Briefing/BriefingSession은 push route다.

## 19. residual risk와 safe stop

- Public YouTube extraction은 anti-bot/platform 변화로 실패할 수 있다. login/cookie로 우회하지 않고
  `PUBLIC_CAPTION_UNAVAILABLE` 또는 runtime blocked를 보고한다.
- Provider의 가격/availability가 변할 수 있다. 명시된 cap은 비용 상한 행동을 고정하지만 금액을 보장하지
  않는다.
- 한 private device token이 노출되면 private API 접근 위험이 있다. 즉시 rotate/revoke하고 SecureStore를
  갱신한다. production auth로 확대하지 않는다.
- Tailscale Serve/grant는 operator-owned external state다. 잘못된 grant 또는 Funnel 활성화는 private 경계를
  깨뜨리므로 readiness/acceptance를 fail closed하고 operator가 교정할 때까지 `RUNTIME_ACCESS_REQUIRED`다.
- SQLite single-host는 host loss 위험이 있어 backup/restore drill이 필수다.
- OS 강제 종료 직전 최대 local 2초, server 15초의 position 차이가 있을 수 있다. resume acceptance
  tolerance와 device journal이 이를 제한한다.
- source 저작권/플랫폼 정책은 private derived use 경계 안에서만 승인되었다. public/non-private 사용은 새
  external review와 설계가 필요하다.

새로운 material decision, 실제 server 사실과의 충돌, 외부 공개 필요, schema/API를 바꾸는 누락이
발견되면 안전하게 중단하고 Advisor에만 반환한다.
