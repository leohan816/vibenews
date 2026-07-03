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

## 개인화 브리핑 조립 (future)
브리핑은 사용자마다 새로 만드는 게 아니라, **공통 뉴스 풀에서 개인별로 조립**한다.

### 1) Global News Pool
- 하루에 한 번, 모두를 위한 **공통 뉴스 풀**을 만든다(예: 오늘 100개).
- 수집 · 본문 추출 · 요약 · 스크립트 · **TTS까지 공통으로 1회 처리**해 재사용한다.
- 타입: `GlobalNewsPool`, `NewsItem`, `NewsAudioItem`.

### 2) Personal Briefing Assembly
같은 풀에서 사용자별로:
- **선택** — 관심사/키워드/embedding으로 풀에서 일부만 고름.
- **정렬** — 사용자에게 맞는 순서로 배치.
- **연결** — 관련 뉴스끼리 `NewsConnectionEdge`로 이어 흐름을 만듦.
- **오디오 재사용** — 이미 만든 공통 오디오를 그대로 사용.
- **연결 멘트** — 필요할 때만 짧은 브릿지 멘트를 생성.
- 결과물: `PersonalizedBriefingPlan`(선택/정렬된 재생 큐 = BriefingSession의 chapter 큐).

### 3) 비용 원칙
- 뉴스 생성 비용은 **공통 처리**(1회). 개인화는 metadata · tag · embedding · `UserInterestProfile` 기반으로 **가볍게**.
- **깊은 개인화 연결 멘트만 선택적으로 LLM** 사용(`personalizationMode`: `metadata_only` → `light_llm_bridge` → `deep_personalized`).
- 모든 사용자를 위해 뉴스를 매번 새로 요약/TTS 하지 않는다.

### 4) 예시
| 사용자 | 관심사 | 풀 100개 중 | Briefing Plan |
| --- | --- | --- | --- |
| A | AI · 개발 · 창업 | 8개 선택·연결 | `PersonalizedBriefingPlan(A)` |
| B | 건강 · 뷰티 · 소비 | 7개 선택·연결 | `PersonalizedBriefingPlan(B)` |

→ 같은 `GlobalNewsPool`을 쓰지만 `PersonalizedBriefingPlan`은 사용자마다 다르다.

### 현재 상태
**future** — 이번엔 설계만. 실제 선택/정렬/연결/추천 알고리즘은 구현하지 않는다. 화면(Briefing/Listen)은 지금의 mock 세션을 계속 사용한다.

## 나중에 연결될 기능
백그라운드 야간 수집 잡, 푸시 알림, 실제 예약 스케줄러, 개인화 조립 파이프라인(풀 → 프로필 → 플랜).

## 구현 체크리스트
- [ ] 카테고리 큰 카드에 개수/시간/키워드 3종 표시
- [ ] 예약 요약 배너 → ScheduleBriefing 이동
- [ ] ScheduleBriefing 폼 렌더(시간/길이/카테고리, mock 저장)
- [ ] 기본 길이 10분 표기
