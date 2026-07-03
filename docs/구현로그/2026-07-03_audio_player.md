# 2026-07-03 · 실제 오디오 플레이어 (블록 2)

BriefingSession에서 재생/일시정지/이전/다음/seek을 **실제로 동작**시켰다. 뉴스 수집·TTS·AI 요약은 아직 없고, mock/샘플 오디오로 재생 구조만 만들었다. 설계: [설계문서/02_Listen_오디오_플레이어.md](../../설계문서/02_Listen_오디오_플레이어.md).

## 라이브러리
- **expo-audio ~57.0.0** (Expo SDK 57 표준; `expo-av`는 deprecated). `useAudioPlayer` / `useAudioPlayerStatus` / `setAudioModeAsync` / `player.play|pause|replace|seekTo`.
- 웹 훅이 source(uri) 변경 시 player를 값 기준으로 재생성 → chapter 변경 = source 변경으로 처리.

## 구현한 파일
- `src/hooks/use-audio-player-controller.ts` — AudioPlayerController. chapter 큐/재생 상태/컨트롤(play/pause/togglePlay/next/previous/seekToFraction) 노출. 완료 시 자동 이어재생, 마지막이면 sessionCompleted.
- `src/lib/audio.ts` — fallback 원격 샘플 목록 + `fallbackSampleFor(index)` + `formatTime`.
- `src/components/progress-bar.tsx` — 탭하여 seek 가능하도록 확장(`onSeekFraction`).
- `src/app/briefing-session.tsx` — 컨트롤러 연결, 진행바+시간 표기, 상태/샘플/완료 안내.
- `src/data/types.ts` — `PlaybackState` 확장 + `PlaybackStatus` 타입.
- `src/lib/eventLog.ts` — 오디오 이벤트 6개 추가.
- `package.json` / `app.json` — expo-audio 의존성 + config plugin.

## 실제 동작 범위
- ▶/❚❚ 재생·일시정지, ⏮ 이전(3초 이상 재생 시 현재 chapter 처음으로), ⏭ 다음 — 실제 오디오 제어.
- chapter 변경 시 해당 오디오 load, 진행바에 재생 위치·총 길이(m:ss) 반영.
- 진행바 탭으로 seek.
- chapter 재생 완료 → 자동으로 다음 chapter, 마지막 완료 → session completed(재생 버튼으로 다시 듣기).
- 오디오 이벤트 로깅(audio_play_started/paused/completed, chapter_next/previous_clicked, audio_seeked).

## fallback 정책
- `NewsAudioItem.audioUrl`이 있으면 그것을, 없으면(현재 전부 null) chapter별 원격 샘플을 재생.
- 샘플 로드 실패 시 status='error'로 두고 UI(이전/다음)는 계속 동작 — **앱은 깨지지 않음.**

## 아직 mock / future
- 뉴스 본문 수집, TTS 음성 생성, AI 요약 — 없음. 오디오는 샘플.
- **백그라운드 재생(잠금화면)** — 설계만, 이번 구현 안 함(future). `setAudioModeAsync({ shouldPlayInBackground })` + iOS UIBackgroundModes 필요.
- 저장 / 더 알아보기 — 기존 mock 유지.
- TTS audioUrl이 데이터에 채워지면 코드 변경 없이 자동 전환됨.

## 검증 결과
- `npx tsc --noEmit` → **0 에러**
- `npx expo export -p web` → 번들 성공(expo-audio 웹 포함)
- 외부 서버 http://157.180.118.72:8090 재배포, 전 라우트 200
- 주의: 실제 **오디오 소리 재생**은 헤드리스 환경에서 검증 불가 — 브라우저/기기에서 확인 필요(웹 autoplay 정책상 첫 재생은 사용자 탭이 필요할 수 있음).

## 다음 단계
1. 본문 추출 백엔드(웹/유튜브/RSS) → 2. AI 요약 → 3. TTS로 audioUrl 채우기 → 4. 배경 재생(future) 구현.
