# 11. Event Log · 사용 행동 기록

## 목적
지금은 결제/유료화를 구현하지 않는다. 대신 나중에 **어떤 기능이 가치 있는지** 알 수 있도록 **mock event logging** 구조를 만든다.

## 사용자 경험
사용자에게는 보이지 않는다. 내부적으로 행동을 기록(현재는 콘솔/메모리 mock).

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
**mock** — `src/lib/eventLog.ts`의 `logEvent(event, payload)`가 메모리 배열에 push + `console.log`.

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
