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
- 중앙: **ambient visual / thinking brain visual** (음악이 흐르는 듯 / 뇌가 생각하는 듯)
- 뉴스 **제목** + **한 줄 핵심 요약**만 표시 (본문 전체 표시 금지)
- 진행바
- 컨트롤: **이전 / 재생·정지 / 다음** (뉴스 단위 이동)
- 액션: **저장 / 더 알아보기**
- 브리핑은 하나의 긴 오디오가 아니라 **NewsAudioItem 여러 개로 구성된 playlist/chapter** 구조.
- 같은 뉴스 다시 듣기 / 이전·다음 이동 가능.

## 화면 구성
- Listen: `헤더 문구` → `큰 원형 재생 버튼` → `준비 요약(개수·시간)` → `카테고리 칩 목록` → `음성 명령 진입 버튼`
- BriefingSession: `카테고리·챕터` → `AmbientVisual` → `제목` → `한 줄 요약` → `ProgressBar` → `Prev/Play/Next` → `저장/더 알아보기`

## 데이터 모델
`BriefingSession`, `NewsAudioItem`, `PlaybackState`, `Category` (→ [10_DataModel](10_DataModel_데이터구조.md))

## 현재 상태
**mock** — 재생 버튼/컨트롤은 로컬 상태만 바꾼다. 실제 오디오·TTS 없음. ambient visual은 단순 애니메이션 placeholder.

## 구현할 컴포넌트
- `AudioPlayButton` (큰 중앙 버튼)
- `AmbientVisual` (placeholder pulse 애니메이션)
- `ChapterControls` (이전/재생·정지/다음)
- `ProgressBar` (mock 진행)
- `CategoryChips`

## 구현 전 확인사항
- ambient visual 스타일 방향(파동 vs 뇌) — 초기엔 파동 pulse로.
- 기본 브리핑 카테고리 순서.

## 나중에 연결될 기능
`expo-audio`/TTS 재생, 배경 재생(잠금화면 컨트롤), 실제 chapter 오디오 스트리밍, 청취 이벤트 기록([11_EventLog](11_EventLog_사용행동기록.md)).

## 구현 체크리스트
- [ ] Listen 첫 화면 중앙 재생 버튼 + 개인화 문구
- [ ] 준비 개수/시간/카테고리 요약 표시
- [ ] 재생 → BriefingSession 이동
- [ ] BriefingSession에 제목+한 줄 요약만 노출(본문 X)
- [ ] 이전/재생·정지/다음 버튼 동작(mock)
- [ ] 저장/더 알아보기 버튼 → 해당 화면 이동
