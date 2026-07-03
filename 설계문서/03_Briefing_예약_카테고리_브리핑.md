# 03. Briefing · 예약 / 카테고리 브리핑

## 목적
카테고리별로 준비된 브리핑을 보여주고, 정해진 시간에 자동으로 브리핑이 준비되도록 예약한다.

## 사용자 경험
- 카테고리 브리핑 화면. 카테고리 카드는 **큰 카드형**.
- 각 카테고리 카드에 3가지 표시:
  1. 오늘 준비된 개수
  2. 예상 청취 시간
  3. 오늘의 핵심 키워드
- 예:
  ```
  AI
  오늘 7개 준비됨 · 약 10분
  키워드: Agent · Browser · Claude
  ```
- **예약 브리핑**은 시간 중심으로 시작. 예: `매일 아침 7시에 AI/건강/투자 브리핑`.
- 기본 브리핑 길이 **10분**. 나중에 3/5/10/15분 선택.
- 밤새 시스템이 뉴스를 찾아 다음날 제공하는 구조.

## 화면 구성
- Briefing: `상단 타이틀` → `예약 브리핑 요약 배너(+예약 화면 진입)` → `카테고리 큰 카드 목록`
- 카드 탭 → 해당 카테고리 재생(BriefingSession) 진입.
- ScheduleBriefing: 요일/시간 선택, 카테고리 선택, 길이 선택(기본 10분).

## 데이터 모델
`Category`, `ScheduledBriefing`, `BriefingSession` (→ [10_DataModel](10_DataModel_데이터구조.md))

## 현재 상태
**mock** — 카테고리/예약 데이터는 mock. 예약 저장은 로컬 상태만.

## 구현할 컴포넌트
- `CategoryBriefingCard` (개수·시간·키워드)
- `ScheduleSummaryBanner`
- ScheduleBriefing 폼: `TimePicker(placeholder)`, `LengthSelector`, `CategoryMultiSelect`

## 구현 전 확인사항
- 기본 카테고리 집합 확정(AI/건강/투자/K-Beauty/뷰티/비즈니스…).
- 길이 옵션 노출 시점(초기엔 10분 고정 표시, 나머지는 "준비 중").

## 나중에 연결될 기능
백그라운드 야간 수집 잡, 푸시 알림, 실제 예약 스케줄러.

## 구현 체크리스트
- [ ] 카테고리 큰 카드에 개수/시간/키워드 3종 표시
- [ ] 예약 요약 배너 → ScheduleBriefing 이동
- [ ] ScheduleBriefing 폼 렌더(시간/길이/카테고리, mock 저장)
- [ ] 기본 길이 10분 표기
