# 02. Listen · 오디오 플레이어

## 목적
VibeNews의 첫 화면이자 심장. 뉴스를 "읽는" 앱이 아니라 "듣는" 앱임을 첫 화면에서 각인시킨다.

## 사용자 경험
- 첫 화면은 뉴스 리스트가 아니라 **큰 중앙 오디오 재생 버튼** 중심.
- 문구: **"Leo님을 위한 뉴스가 준비되어 있어요."**
- 재생 버튼 아래 요약:
  - `오늘 18개 뉴스 · 약 32분 준비됨`
  - `AI 7개 · 건강 4개 · 투자 3개 · K-Beauty 4개`
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
