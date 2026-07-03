# 2026-07-03 · Product Skeleton 구현

설계문서(00~13) 기준으로 full product skeleton을 구현했다. 실제 수집/TTS/AI/Foundation/음성인식/결제는 없고, 모든 기능이 화면·네비게이션에 mock으로 보인다.

## 구현한 화면 (13)
**하단 탭 (5)** — `src/app/(tabs)/`
- `index.tsx` — Listen (큰 중앙 재생 버튼, "Leo님을 위한 뉴스…", 오늘 개수/시간/카테고리별 개수 → BriefingSession)
- `briefing.tsx` — Briefing (카테고리 큰 카드, 예약 진입)
- `recap.tsx` — Recap (오늘 요약, 지금 요약하기, 반복 키워드 → 상세)
- `saved.tsx` — Saved (카테고리/시간/유형 필터, 뉴스 지식 라벨, Foundation 상태)
- `settings.tsx` — Settings (관심사/브리핑/음성/상품/Foundation/저장정책, 무료 문구)

**push 화면 (8)** — `src/app/`
- `briefing-session.tsx` — 재생 화면 (Chapter n/N, ambient visual, 제목+한줄요약, 진행바, 이전/재생·정지/다음, 저장/더 알아보기)
- `explore-more.tsx` — 더 알아보기 (9개 섹션 심층 분석, 링크목록 아님)
- `daily-recap-detail.tsx` — Daily Recap 상세 (음성바 placeholder + 7개 섹션 + 카드로 저장)
- `saved-card-detail.tsx` — 저장 카드 상세 (뉴스 지식/유형/출처메타/Foundation 상태/더 알아보기)
- `schedule-briefing.tsx` — 예약 브리핑 (시간/요일/길이/카테고리 mock)
- `foundation-candidate.tsx` — Foundation 후보 (상태 필터, 승인/거부 mock, 원문 저장금지 원칙)
- `product-recommendation.tsx` — 개인화 상품 (안전 표현만, 금지표현 없음)
- `voice-command.tsx` — 음성 명령 (다음/이전/다시/저장/더 알아보기, future)

## 구현한 컴포넌트
- `Screen` — 공용 스크롤 컨테이너(제목/부제/상태배지/안전영역)
- `Card` — 테마 카드
- `StatusBadge` — mock/partial/working/future 배지
- `AmbientVisual` — 재생 화면 맥동 placeholder(내장 Animated)
- `CategoryCard` — 카테고리 큰 카드
- `ChapterControls` — 이전/재생·정지/다음
- `ProgressBar` — mock 진행바

## 데이터 / 로직
- `src/data/types.ts` — 설계문서 10과 일치(+ `SavedCard.foundationStatus?` 추가)
- `src/data/mockData.ts` — 전 화면 공용 mock. `TODAY` 상수 추가, savedCards 날짜 다양화, voiceCommands 5개
- `src/lib/eventLog.ts` — mock logger(`logEvent` + `EVENTS`)

## mock 상태인 기능 (전부)
재생/음성, 챕터 이동, 저장, 더 알아보기, Daily Recap, 저장 카드, 카테고리/예약 브리핑, 음성 명령, 상품 추천, Foundation 후보, Event Log — 모두 로컬 state/console 기록.

## 설계와 다르게 구현한 부분
- **탭 시스템**: 템플릿의 `NativeTabs`(unstable, 네이티브 위주) 대신 표준 `Tabs`(`(tabs)` 그룹)로 구성 — 웹 호환·8개 push 라우트 안정성. 이로 인해 orphan이 된 `components/app-tabs.tsx`, `app-tabs.web.tsx` 삭제(내 변경으로 미사용+타입에러 유발).
- **탭 아이콘**: `@expo/vector-icons` 미설치라 이모지 아이콘 사용.
- **pushed 화면 제목**: Stack 헤더가 제목을 담당하므로 `Screen`에 title 미전달(subtitle+status만).
- **DailyRecapDetail**: `categoryHighlights`는 요구 7개 섹션 밖이라 미표시. 출력방식 안내를 subtitle+보조문구로.
- **SavedCardDetail / FoundationCandidate**: `StatusBadge`(ContentStatus 전용)와 별개로 Foundation 상태용 자체 배지 사용.
- **ScheduleBriefing**: 시각(07:00)은 placeholder 고정, 요일만 토글. 상단 예약 요약 배너 추가.
- **적대적 감사 후 수정**(자세히):
  - Saved 시간 필터가 죽어 있던 버그 수정(`savedAt` + `TODAY` 기반 실제 필터링). mock 날짜를 오늘/이번주/이전으로 다양화해 필터가 눈에 보이게.
  - 사용자 기준 반영: Saved 카드에 Foundation 후보 상태 칩 추가(`SavedCard.foundationStatus?`, 설계문서 05·10 동기화).
  - 사용자 기준 반영: VoiceCommand 명령을 다음/이전/다시/저장/더 알아보기 5개로 교체.

## 아직 실제 연결하지 않은 기능
실제 뉴스 수집(웹/유튜브/X/RSS), 본문 추출 백엔드, AI 요약/분석, TTS·배경 재생, Daily Recap 자동화, Foundation 동기화, 실제 음성 인식(STT), 개인화 커머스, 결제.

## 검증 결과
- `npx tsc --noEmit` → **0 에러**
- `npm run web` → HTTP 200, 번들 성공(에러 없음)
- 모든 `router.push` 대상(8개) ↔ route 파일 매칭 확인 → 라우트 없음 에러 불가
- `npm run lint` → eslint 미설치로 실행 불가(typecheck로 대체)
- 상품 화면 금지표현(치료/예방/이걸 먹어야/질병 개선) 스캔 → 없음

## 다음 구현 단계 (권장)
1. 본문 추출 백엔드(웹/유튜브/RSS 우선) — agent-reach 소규모 검증 후 결정
2. AI 요약/분석 연결
3. TTS + 배경/이어 재생 (앱의 심장)
4. Daily Recap 자동화 → Foundation 후보 자동 추출
5. 실제 음성 명령 / 개인화 상품 / (후보) 결제
