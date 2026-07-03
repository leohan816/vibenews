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

- 뉴스 생성 비용은 **공통 처리**(1회). 개인화는 metadata · tag · embedding · `UserInterestProfile`
  기반으로 **가볍게**.
- **깊은 개인화 연결 멘트만 선택적으로 LLM** 사용(`personalizationMode`: `metadata_only` →
  `light_llm_bridge` → `deep_personalized`).
- 모든 사용자를 위해 뉴스를 매번 새로 요약/TTS 하지 않는다.

### 4) 예시

| 사용자 | 관심사             | 풀 100개 중   | Briefing Plan                 |
| ------ | ------------------ | ------------- | ----------------------------- |
| A      | AI · 개발 · 창업   | 8개 선택·연결 | `PersonalizedBriefingPlan(A)` |
| B      | 건강 · 뷰티 · 소비 | 7개 선택·연결 | `PersonalizedBriefingPlan(B)` |

→ 같은 `GlobalNewsPool`을 쓰지만 `PersonalizedBriefingPlan`은 사용자마다 다르다.

### 현재 상태

**future** — 이번엔 설계만. 실제 선택/정렬/연결/추천 알고리즘은 구현하지 않는다.
화면(Briefing/Listen)은 지금의 mock 세션을 계속 사용한다.

## 나중에 연결될 기능

백그라운드 야간 수집 잡, 푸시 알림, 실제 예약 스케줄러, 개인화 조립 파이프라인(풀 → 프로필 → 플랜).

## 구현 체크리스트

- [ ] 카테고리 큰 카드에 개수/시간/키워드 3종 표시
- [ ] 예약 요약 배너 → ScheduleBriefing 이동
- [ ] ScheduleBriefing 폼 렌더(시간/길이/카테고리, mock 저장)
- [ ] 기본 길이 10분 표기

## Taxonomy 3축 · 오늘의 흐름 · 개인화 조립

핵심 문장: **"뉴스/콘텐츠는 공통으로 준비하고, 브리핑은 사용자마다 다르게 조립한다."** 아래는 이
문서의 카테고리/예약 UX가 실제로 무엇을 근거로 조립되는지를 설계 레벨에서 정리한 것(타입 정본은
[10_DataModel](10_DataModel_데이터구조.md)).

### 1) Taxonomy 3축

모든 ContentItem은 서로 독립적인 3축으로 분류한다(한 축이 다른 축을 결정하지 않음).

| 축              | 질문               | 값(예)                                                                                                                                          |
| --------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceType`    | 어디서 왔나        | youtube · rss · web · github · reddit · x · image · gif · html · manual                                                                         |
| `contentKind`   | 성격이 무엇인가    | news · analysis · tutorial · opinion · research · community_signal · github_update · product_update · product_detail · document · internal_note |
| `topicCategory` | 큰 주제가 무엇인가 | News · AI · Health · Finance · K-Beauty · Beauty · Business · Developer · Science · Lifestyle · Internal                                        |

예시 (하나의 ContentItem taxonomy):

```
sourceType:       youtube
contentKind:      news
primaryCategory:  AI
secondaryCategories: [Developer]
tags:             [AI Agent, Browser Agent, Claude]
entities:         [Anthropic, Claude, OpenAI]
```

### 2) Category vs TopicCluster vs Tag vs Entity

네 개념은 서로 다르며 섞어 쓰지 않는다.

| 개념             | 정의                                 | 규모         | UI 위치                              |
| ---------------- | ------------------------------------ | ------------ | ------------------------------------ |
| **Category**     | 큰 방(고정 대분류)                   | 8~10개       | 상단 가로 탭(CategoryFilter)         |
| **TopicCluster** | "오늘의 흐름"(오늘 묶인 브리핑 단위) | 매일 가변    | 하단 카드(TopicClusterCard=FlowCard) |
| **Tag**          | 세부 주제 라벨                       | 콘텐츠당 3~8 | 카드/상세 보조 표기                  |
| **Entity**       | 회사·제품·사람·도구·repo 이름        | 무제한       | 상세, 검색·연결 근거                 |

- Tag 좋은 예: `AI Agent` · `수면회복` · `금리전망` → 주제를 가리킴.
- Tag 나쁜 예: `좋음` · `중요` · `영상` → 감상/형식일 뿐 주제가 아님(금지).
- Entity는 개별 고유명(예: `Claude`, `Anthropic`, `openai/agents-sdk`). **반복적으로 주제화될 때만**
  tag로 승격한다(예: `Claude`가 계속 흐름의 중심이면 `Claude` tag 검토).
- 정리: Category(큰 방) ≠ TopicCluster(오늘의 흐름) ≠ Tag(세부 주제) ≠ Entity(고유명).

### 3) 콘텐츠당 분류 제한

| 필드                  | 제한                          |
| --------------------- | ----------------------------- |
| `primaryCategory`     | 정확히 1                      |
| `secondaryCategories` | ≤ 2                           |
| `contentKind`         | 정확히 1                      |
| `topicCluster`        | 1 (그날 어느 흐름에 속하는지) |
| `tags`                | 3 ~ 8                         |
| `entities`            | 무제한 (각 `importance` 부여) |

### 4) 하단 카드 = FlowCard / TopicClusterCard ("오늘의 흐름")

UI 문구는 "카테고리"가 아니라 **"오늘의 흐름"**. 각 카드는 오늘 묶인 TopicCluster 하나를 나타내며
개수·예상 시간·핵심 태그를 보여준다.

| 흐름(TopicCluster) | 개수 | 예상 시간 | 핵심 태그               |
| ------------------ | ---- | --------- | ----------------------- |
| AI 에이전트 흐름   | 7개  | 약 10분   | #Agent #Browser #Claude |
| 수면·대사 건강     | 4개  | 약 6분    | #수면 #단백질 #혈당     |
| 금리와 ETF         | 3개  | 약 5분    | #금리 #AI반도체 #ETF    |

→ 같은 Global News Pool에서 나온 콘텐츠라도, 각 사용자의 "오늘의 흐름" 카드 구성은 개인화 조립
결과에 따라 달라진다.

### 5) Personal Briefing Assembly (단계 요약)

공통 풀은 그대로 두고, 사용자별로 **선택/정렬/연결**만 가볍게 수행한다.

| 단계                  | 내용                                                               |
| --------------------- | ------------------------------------------------------------------ |
| 1. InterestProfile    | 사용자의 관심 Category·Tag·Entity·청취 이력을 프로필로 유지        |
| 2. 후보 수집          | 오늘 Global News Pool에서 프로필과 맞는 ContentItem을 후보로 모음  |
| 3. 점수화             | 관심 일치·신선도·중요도(entity importance)로 후보에 점수 부여      |
| 4. 제외               | 이미 **들음** · 과거 **스킵** · **중복**(같은 주제 반복) 후보 제거 |
| 5. selected / ordered | 길이 예산(기본 10분) 안에서 selected 확정 후 흐름 순서로 ordered   |
| 6. 연결 멘트          | 필요할 때만 짧은 브릿지 멘트 생성(항상 X)                          |
| 7. BriefingSession    | ordered 큐 + 재사용 audioAsset을 묶어 재생 세션 생성               |

`personalizationMode` (비용/깊이 단계):

| 모드                | 방식                                          | 상태             |
| ------------------- | --------------------------------------------- | ---------------- |
| `metadata_only`     | metadata·tag·entity 매칭만으로 조립(LLM 없음) | 초기 기본        |
| `light_llm_bridge`  | 연결 멘트 등 최소 부분만 LLM                  | future           |
| `deep_personalized` | 깊은 개인화·재구성                            | future / premium |

### 현재 상태

**future / 설계 전용** — 3축 분류·흐름 묶기·조립 알고리즘은 대부분 mock. 초기엔 `metadata_only`만
상정하고, 실제 점수화/제외/연결 로직은 구현하지 않는다.

## VideoContentMap과 개인화 조립

Personal Briefing Assembly는 짧은 뉴스뿐 아니라 **긴 영상**도 후보로 다룬다. 긴 영상은
"짧게 줄이는 것"이 아니라 "들을 가치가 있는 브리핑으로 재구성"해야 하므로, 조립 입력으로
짧은 summary 대신 **VideoContentMap**(영상의 논리 구조·섹션·중요 포인트)을 쓸 수 있다.

### 1) VideoContentMap을 조립 입력으로

- 긴 영상은 `transcript → chunk extraction → VideoContentMap → logic reconstruction →
  personalized audio script → verifier review → TTS` 표준으로 처리된다(상세:
  [14_Video_Briefing_Quality_Strategy](14_Video_Briefing_Quality_Strategy.md)).
- 이때 만들어진 VideoContentMap은 영상의 `coreThesis`·`sections`·섹션별 keyClaims/evidence/
  numbers/entities를 담으므로, Personal Briefing Assembly는 이를 **조립의 1차 입력**으로 사용한다.
- 사용자 관심사와 맞는 **section만 골라** "오늘의 흐름"(TopicCluster)에 넣는다. 영상 전체가
  아니라, 관심 있는 섹션 흐름만 브리핑에 편입할 수 있다.

### 2) ContentTaxonomy는 VideoContentMap에서 도출

- Taxonomy 3축·TopicCluster·Tag·Entity는 별도로 붙이는 라벨이 아니라, VideoContentMap의
  `sections` · `entities` · `coreThesis`에서 **도출**된다.
- `topicCategory` / `topicCluster`는 coreThesis와 sections의 주제에서, `tags`·`entities`는
  섹션별 entities/keyClaims에서 뽑아 승격 여부를 판단한다.
- 즉 "영상을 어떤 흐름에 넣을지"와 "어떤 태그·엔티티로 연결할지"는 모두 같은 VideoContentMap을
  근거로 한다(라벨과 내용이 어긋나지 않게).

### 3) 억지 연결 금지

- 관심사와 실제로 맞는 section만 넣고, 연관이 약한 섹션을 흐름에 끼워 넣지 않는다.
- 억지 개인화 연결 멘트도 만들지 않는다(verifier review 단계에서 억지 개인화 제거).
- 상세 처리 표준·검수 원칙: [14_Video_Briefing_Quality_Strategy](14_Video_Briefing_Quality_Strategy.md).
- 타입 정본(`VideoContentMap` / `VideoSection` 등): [10_DataModel](10_DataModel_데이터구조.md).

### 현재 상태

**future / 설계 전용** — 이번 작업은 설계·문서만. VideoContentMap 생성, section 선택,
Taxonomy 도출, 실제 Qwen 8B/DeepSeek/Fish Audio/YouTube 수집은 구현하지 않는다.
