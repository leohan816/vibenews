# 02. Listen · 오디오 플레이어

## 목적
VibeNews의 첫 화면이자 심장. 뉴스를 "읽는" 앱이 아니라 "듣는" 앱임을 첫 화면에서 각인시킨다.

## 사용자 경험
- 첫 화면은 뉴스 리스트가 아니라 **큰 중앙 오디오 재생 버튼** 중심.
- 문구: **"Leo님을 위한 뉴스가 준비되어 있어요."**
- 재생 버튼 아래 요약:
  - `오늘 18개 뉴스 · 약 32분 준비됨`
  - `AI 7개 · 건강 4개 · 투자 3개 · 피부관리 4개`
- 재생을 누르면 재생 화면(BriefingSession)으로 이동.

### 재생 화면 (BriefingSession)
- 상단: 카테고리 + Chapter 표시 → 예: `AI · Chapter 2 / 7`
- 중앙: **음악 앱 스타일 앨범 커버 아트**(카테고리별 그라데이션, 재생 시 살짝 확대). 일반 음악 서비스의 "재생 중" 화면 느낌. (뇌/ambient 비주얼 아님)
- 뉴스 **제목** + **한 줄 핵심 요약**만 표시 (본문 전체 표시 금지)
- 진행바
- 컨트롤: **이전 / 재생·정지 / 다음** (뉴스 단위 이동)
- 액션: **저장 / 더 알아보기**
- 브리핑은 하나의 긴 오디오가 아니라 **NewsAudioItem 여러 개로 구성된 playlist/chapter** 구조.
- 같은 뉴스 다시 듣기 / 이전·다음 이동 가능.

## 화면 구성
- Listen: `헤더 문구` → `큰 원형 재생 버튼` → `준비 요약(개수·시간)` → `카테고리 칩 목록` → `음성 명령 진입 버튼`
- BriefingSession: `카테고리·챕터` → `CoverArt(앨범 커버)` → `제목` → `한 줄 요약` → `ProgressBar` → `Prev/Play/Next` → `저장/더 알아보기`

## 데이터 모델
`BriefingSession`, `NewsAudioItem`, `PlaybackState`, `Category` (→ [10_DataModel](10_DataModel_데이터구조.md))

## 현재 상태
- Listen 화면 · ambient visual: **mock**.
- BriefingSession 재생 엔진: **partial** — 재생/일시정지/이전/다음/seek이 **expo-audio로 실제 동작**한다. 단 오디오는 mock/샘플이고, 뉴스 수집·TTS·AI 요약은 아직 없다. 저장/더 알아보기는 mock 유지.

## 실제 오디오 재생 (블록 2 · expo-audio · mock audio)
BriefingSession의 재생/일시정지/이전/다음/seek을 실제로 동작시킨다. 뉴스 수집·TTS·AI 요약은 아직 하지 않고, mock/샘플 오디오로 **재생 구조만** 만든다.

### 라이브러리
- **expo-audio** (Expo SDK 57 표준. `expo-av`는 deprecated). hook 기반: `useAudioPlayer(source)`, `useAudioPlayerStatus(player)`, `setAudioModeAsync`.
- iOS 무음 스위치 대응: `setAudioModeAsync({ playsInSilentMode: true })`.

### AudioPlayerController (역할)
- `useAudioPlayerController(items)` 훅으로 캡슐화. expo-audio 플레이어 1개로 현재 chapter를 재생한다.
- 노출 API: `play() / pause() / togglePlay() / next() / previous() / seek(sec)` + 상태(`index, isPlaying, positionSec, durationSec, status, sessionCompleted, usingFallbackAudio`).
- chapter가 바뀌면 `player.replace(source)`로 오디오를 교체하고, 재생 의도(wantPlaying)가 있으면 이어서 재생한다.
- 재생 완료(`didJustFinish`) 시 다음 chapter로 자동 이동. 마지막이면 `sessionCompleted`.

### ChapterQueue 구조
- `BriefingSession.newsAudioItemIds` → `NewsAudioItem[]`(chapterIndex 순)이 재생 큐다.
- 현재 위치 = `index`(0-based). 각 chapter의 source = `audioUrl ?? fallbackSample(index)`.

### PlaybackState 확장
- 설계문서 10 `PlaybackState`에 `durationSec`, `status`(PlaybackStatus), `sessionCompleted`, `usingFallbackAudio`를 추가한다. 런타임 상태는 controller가 관리.

### 동작 정의
- **play**: 재생 시작 → `audio_play_started`.
- **pause**: 일시정지 → `audio_paused`.
- **next**: `index+1`(마지막이면 무시), 새 chapter load 후 재생 의도 유지 → `chapter_next_clicked`.
- **previous**: 재생 위치>3초면 현재 chapter 처음으로 seek, 아니면 `index-1` → `chapter_previous_clicked`.
- **seek(sec)**: `player.seekTo(sec)`. progress bar 탭으로 위치 이동 → `audio_seeked`.
- **completed**: 현재 chapter 끝 → 다음으로. 마지막 chapter 끝 → `sessionCompleted` → `audio_completed`.

### 오디오 파일 fallback 정책
- `NewsAudioItem.audioUrl`이 있으면 그것을 재생. 없으면(현재 mock: 전부 null) chapter index에 매핑된 **원격 샘플 오디오**(fallback)를 사용한다(`usingFallbackAudio=true`).
- 샘플 로드 실패 시 `status='error'`로 두되 UI 조작(다음/이전)은 계속 가능하고 **앱은 깨지지 않는다.**

### 추후 TTS audioUrl 연결 방식
- TTS 파이프라인이 각 NewsAudioItem에 실제 `audioUrl`을 채우면, controller는 fallback 대신 그 URL을 그대로 재생 — **코드 변경 없이 데이터만으로 전환**된다.

### 백그라운드 재생 (future · 이번엔 설계만)
- 잠금화면/백그라운드 재생은 `setAudioModeAsync({ shouldPlayInBackground: true })` + iOS `UIBackgroundModes: audio`(config plugin)가 필요. **이번 블록에서는 구현하지 않는다(future).**

### EventLog (추가)
`audio_play_started` · `audio_paused` · `audio_completed` · `chapter_next_clicked` · `chapter_previous_clicked` · `audio_seeked` (→ [11_EventLog](11_EventLog_사용행동기록.md))

## 구현할 컴포넌트
- `AudioPlayButton` (큰 중앙 버튼)
- `CoverArt` (음악 앱 스타일 앨범 커버 — 카테고리 그라데이션 + 재생 시 확대)
- `ChapterControls` (이전/재생·정지/다음)
- `ProgressBar` (탭하여 seek 가능, 현재/총 시간 반영)
- `CategoryChips`
- `useAudioPlayerController` (expo-audio 래핑 훅 — 재생 로직/큐/상태)
- `src/lib/audio.ts` (fallback 샘플 오디오 목록·헬퍼)

## 구현 전 확인사항
- 커버 아트 스타일 — 음악 서비스처럼 카테고리별 그라데이션 앨범 커버.
- 기본 브리핑 카테고리 순서.

## 나중에 연결될 기능
`expo-audio`/TTS 재생, 배경 재생(잠금화면 컨트롤), 실제 chapter 오디오 스트리밍, 청취 이벤트 기록([11_EventLog](11_EventLog_사용행동기록.md)).

## 구현 체크리스트
- [ ] Listen 첫 화면 중앙 재생 버튼 + 개인화 문구
- [ ] 준비 개수/시간/카테고리 요약 표시
- [ ] 재생 → BriefingSession 이동
- [ ] BriefingSession에 제목+한 줄 요약만 노출(본문 X)
- [ ] 재생/일시정지/이전/다음 **실제 동작**(expo-audio)
- [ ] chapter 변경 시 해당 오디오 load, 진행바에 재생 시간 반영
- [ ] progress bar 탭으로 seek
- [ ] 재생 완료 시 다음 chapter 자동 이동, 마지막이면 session completed
- [ ] audioUrl 없으면 fallback 샘플 사용, 실패해도 앱 안 깨짐
- [ ] 저장/더 알아보기 버튼 → 해당 화면 이동(mock 유지)

## YouTube → Content Intelligence → Fish Audio 파이프라인 (재생 소스)
핵심 원칙: **"뉴스/콘텐츠는 공통으로 준비하고, 브리핑은 사용자마다 다르게 조립한다."**
BriefingSession에서 실제로 재생되는 오디오는 임의의 mock 샘플이 아니라, **ContentItem.audioScript를 Fish Audio TTS로 생성한 audioAsset(mp3)** 이다. `NewsAudioItem`은 이 audioAsset을 참조한다(future).

### 재생 소스의 출처
- 파이프라인: `YouTube URL → metadata → transcript(temporary cache) → Content Intelligence JSON(ContentItem) → audioScript → Fish Audio TTS → audioAsset(mp3) → Global News Pool 등록 → Personal Briefing Plan 조립 → 재생`.
- 뉴스/콘텐츠(ContentItem·audioAsset)는 **Global News Pool에 공통으로 1번** 준비되고, 사용자별 **Personal Briefing Plan**이 이를 골라 `BriefingSession`의 chapter 순서로 조립한다.
- 따라서 `NewsAudioItem.audioUrl`은 원칙적으로 audioAsset.audioUrl을 가리킨다. audioAsset이 아직 없으면(생성 전/실패) 기존 **fallback 샘플 오디오** 정책(위 "오디오 파일 fallback 정책")으로 재생 구조를 유지한다.

### audioAsset (재생 자산 · future)
`ContentItem.audioAsset`은 재생 가능한 오디오 파일 1개를 서술한다. 타입 정본은 [10_DataModel](10_DataModel_데이터구조.md)(`AudioScript`/`AudioAsset`).

| 필드 | 의미 | 값 |
|------|------|-----|
| `provider` | TTS 제공자 | `fish_audio` |
| `status` | 생성 상태 | `not_started` / `generating` / `generated` / `failed` |
| `voiceId` | Fish Audio 보이스 식별자 | (문자열) |
| `model` | 사용한 TTS 모델 | (문자열) |
| `format` | 오디오 포맷 | `mp3` / `wav` / `opus` (재생 기본: mp3) |
| `audioUrl` | 생성된 오디오 파일 URL | `status='generated'`일 때 채워짐 |
| `durationSec` | 재생 길이(초) | 진행바/준비 시간 요약에 사용 |

- `audioScript`(대본, 텍스트) → **Fish Audio TTS** → `audioAsset`(mp3)로 전환. audioScript는 [10_DataModel](10_DataModel_데이터구조.md)의 `AudioScript`.
- `status`가 `generated`가 되어 `audioUrl`이 채워지면, `useAudioPlayerController`는 코드 변경 없이 **데이터만으로** fallback 대신 이 URL을 재생한다(위 "추후 TTS audioUrl 연결 방식"과 동일).

### 보안 정책 (필수)
- **`FISH_AUDIO_API_KEY`는 서버(파이프라인) 환경변수 전용이다. 클라이언트(앱)에 절대 노출하지 않는다.**
- TTS 호출·audioAsset 생성은 서버 측 파이프라인에서만 수행하고, 앱은 완성된 `audioUrl`만 전달받아 재생한다.
- VibeNews core는 특정 수집/생성 도구에 직접 의존하지 않는다 — Fish Audio TTS도 SourceAdapter/파이프라인 단계 뒤에 감싸 교체 가능하게 둔다. 원문 전체 저장은 회피하고 audioScript/audioAsset(요약·대본·메타 중심)만 보관한다.

### 참조
- 15단계 파이프라인 전체 흐름·단계 정의: [12_Roadmap](12_Implementation_Roadmap.md).
- 타입 정본(`AudioScript`/`AudioAsset`, `ContentItem`): [10_DataModel](10_DataModel_데이터구조.md).

## BriefingMode와 오디오 길이 (긴 영상)
BriefingSession에서 실제로 재생되는 오디오의 **길이**는 고정이 아니라 `BriefingMode`에 따라 달라진다.

- **quick**: 1~2분
- **standard**: 5~8분
- **deep**: 10~15분

핵심 원칙: **"긴 영상은 '짧게 줄이는 것'이 아니라 '들을 가치가 있는 브리핑으로 재구성'해야 한다."** 재생 길이는 원본 길이를 기계적으로 축소한 값이 아니라, 콘텐츠의 `InformationDensity`(low/medium/high)에 따라 결정되는 재구성 결과다.

### 콘텐츠 유형별 기본값
- **뉴스/RSS**: 짧고 밀도가 낮으므로 보통 **quick(1~2분)**.
- **30분급 정보 밀도 높은 영상**: 1~2분으로 뭉개지 않고 **standard(5~8분)** 또는 **deep(10~15분)** 으로 재구성한다. 30분 좋은 영상의 기본값은 standard이며, 정보 밀도에 따라 quick/deep를 조정한다.

### 긴 영상의 재생 형태
- 긴 영상이라고 해서 **하나의 긴 오디오를 강제하지 않는다.**
- **chapter형**(여러 NewsAudioItem으로 쪼갠 playlist/chapter, 기존 ChapterQueue 구조 재사용) 또는 **standard/deep brief**(하나의 재구성된 브리핑) 형태로 재생할 수 있다.
- 어느 형태든 재생 엔진(`useAudioPlayerController`)과 진행바/이전·다음 컨트롤은 그대로 동작하며, 달라지는 것은 audioAsset의 `durationSec`과 chapter 구성뿐이다.

### 참조
- 브리핑 스크립트의 품질·구조·재구성 전략(transcript→chunk extraction→VideoContentMap→logic reconstruction→personalized audio script→verifier review→TTS): [14_Video_Briefing_Quality_Strategy](14_Video_Briefing_Quality_Strategy.md).
- `audioAsset`/`AudioScript` 타입 정본: [10_DataModel](10_DataModel_데이터구조.md).
