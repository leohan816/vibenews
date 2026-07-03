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

### 수집/파이프라인 이벤트 (future)
기존 이벤트가 **사용자 행동**(재생/스킵/저장)을 기록한다면, 아래 이벤트는 **콘텐츠 준비 파이프라인**의 각 단계를 기록한다. "뉴스/콘텐츠는 공통으로 준비하고, 브리핑은 사용자마다 다르게 조립한다"에서 앞쪽(공통 준비) 흐름의 관측용이다. 전부 **future / mock** 표기, VibeNews core는 특정 수집 도구에 의존하지 않고 SourceAdapter를 거친다.

파이프라인 대응: `YouTube URL → metadata → transcript(temporary cache) → Content Intelligence JSON → audioScript → Fish Audio TTS → audioAsset(mp3) → Global News Pool 등록 → Personal Briefing Plan 조립 → 재생`

| 이벤트 | 파이프라인 단계 | 언제 기록 | payload(예시, mock) |
|---|---|---|---|
| `content_ingested` | 소스 수집 | SourceAdapter가 원문 위치·metadata 확보(ContentItem의 source/sourceLocators 채움) | `{ contentId, sourceType, sourceLocator }` |
| `transcript_cached` | transcript(temporary cache) | 자막/본문을 임시 캐시에 저장(원문 전체 저장 회피, 처리 후 폐기 대상) | `{ contentId, sourceType, chars }` |
| `content_intelligence_built` | Content Intelligence JSON | ContentItem의 analysis/taxonomy(sourceType·contentKind·topicCategory) 등 조립 완료 | `{ contentId, contentKind, topicCategory }` |
| `tts_generated` | audioScript → TTS → audioAsset | audioScript로 Fish Audio TTS 실행, audioAsset(mp3) 생성 | `{ contentId, durationSec, voice }` |
| `content_pooled` | Global News Pool 등록 | 준비 완료된 ContentItem을 공통 풀에 등록(조립 후보로 노출) | `{ contentId, topicCategory }` |
| `briefing_assembled` | Personal Briefing Plan 조립 | 사용자별 브리핑을 조립(사용자마다 다른 묶음, TopicCluster/"오늘의 흐름" 구성) | `{ userId, planId, itemCount }` |
| `source_fetch_failed` | 수집 실패(전 단계 공통) | SourceAdapter fetch 실패·차단·타임아웃 등 (민감기능은 기본 비활성이라 발생 시 스킵 사유 포함) | `{ sourceType, sourceLocator, reason }` |

- `EVENTS` 상수 객체에 위 키도 함께 정의(오타 방지).
- `source_fetch_failed`는 재시도/스킵 판단과 운영 관측에 쓰되, 실패했다고 원문을 강제 수집·자동 재시도(운영 자동화)하지 않는다(정책 준수).
- 타입 정본은 [10_DataModel](10_DataModel_데이터구조.md), 파이프라인/수집 정책 상세는 관련 파이프라인·SourceAdapter 문서를 따른다.
