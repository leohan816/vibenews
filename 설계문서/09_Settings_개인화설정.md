# 09. Settings · 개인화 설정

## 목적
사용자의 관심사·브리핑·음성·분석·저장 정책 등 개인화 옵션을 모은다.

## 사용자 경험 / 화면 구성 (항목)
- 관심 카테고리
- 예약 브리핑 시간
- 기본 브리핑 길이
- 톤/목소리
- 분석 깊이
- Daily Recap 자동 시간
- 음성 명령 설정
- 개인화 상품 추천 설정
- Foundation 연동 상태
- 뉴스 지식 저장 정책
- (하단) 현재 **모든 기능 무료 · 결제/paywall 없음** 명시

## 데이터 모델
`UserSettings`(개념) — 초기엔 mock 객체. 관련: `Category`, `ScheduledBriefing`, `KnowledgeCandidate` 상태.

## 현재 상태
**mock** — 토글/선택은 로컬 상태만. 저장 영속화 없음.

## 구현할 컴포넌트
- `SettingsSection`, `SettingsRow` (토글/선택/이동)
- Foundation 연동 상태 표시 행 → FoundationCandidate 진입

## 구현 전 확인사항
- 각 설정 기본값(브리핑 길이 10분, Recap 밤 시간 등).

## 나중에 연결될 기능
설정 영속화(로컬/서버), 실제 목소리 선택(TTS), 예약 스케줄러 연동, 결제 섹션(후보).

## 구현 체크리스트
- [ ] 모든 설정 항목 행 표시
- [ ] 토글/선택 mock 동작
- [ ] "모든 기능 무료 · 결제 없음" 문구
- [ ] Foundation/음성 명령/상품 추천 화면으로 이동 가능

## UserInterestProfile (개인화 입력)

> 핵심 문장: **"뉴스/콘텐츠는 공통으로 준비하고, 브리핑은 사용자마다 다르게 조립한다."**
> Global News Pool은 공통, 개인화는 이 `UserInterestProfile`을 입력으로 **Personal Briefing Plan 조립** 단계에서 일어난다.
> 타입 정본은 [10_DataModel](./10_DataModel_데이터구조.md)(`UserInterestProfile`) 참조. 아래는 설계 레벨 서술(대부분 future/mock).

### 필드

| 필드 | 타입(개념) | 설명 |
|---|---|---|
| `interestedCategories` | `{ name, weight }[]` | 관심 **Category**(큰 방, topicCategory 축과 정렬: News/AI/Health/Finance/Skin Care/Beauty/Business/Developer/Science/Lifestyle/Internal). `weight`로 상단 CategoryFilter 노출·개인화 가중치 조절 |
| `interestedTags` | `{ name, weight }[]` | 관심 **Tag**(세부 주제). `weight`로 강도 조절 |
| `negativeTags` | `string[]` | 싫어하는 태그. 매칭 시 점수 **감점**(또는 제외) |
| `preferredTone` | `enum`(개념) | 선호 톤(예: neutral/casual/pro). audioScript 톤·목소리 힌트 |
| `preferredDepth` | `enum`(개념) | 선호 분석 깊이(예: headline/summary/deep). contentKind(news/analysis/research 등)와 매칭 |
| `preferredDurationMin` | `number` | 브리핑 목표 길이(분). 기본 10분. Personal Briefing Plan 총량 상한 |
| `languages` | `string[]` | 선호 언어(예: ko/en). 조립·TTS 언어 선택 힌트 |
| `projects` | `{ name, keywords, entities }[]`(개념) | 내가 진행 중인 프로젝트/관심 맥락. **Entity**(회사/제품/사람/도구/repo) 매칭으로 개인화 부스트 |
| `savedContentIds` | `ContentItemId[]` | 저장한 콘텐츠. 관심 신호(유사 항목 부스트) |
| `skippedContentIds` | `ContentItemId[]` | 건너뛴 콘텐츠. 유사 항목 **감점** |
| `recentlyHeardContentIds` | `ContentItemId[]` | 최근 들은 콘텐츠. **중복 회피**(이미 들음) 기준 |

### 개인화 점수 개념 (Personalization Score)

브리핑 조립 시 Global News Pool의 각 **ContentItem**에 대해 개인화 점수를 계산해 정렬·선별한다.

```
score(item, profile) =
    + w_cat  · categoryMatch(item.taxonomy.topicCategory, profile.interestedCategories)
    + w_tag  · tagMatch(item.tags, profile.interestedTags)
    + w_proj · projectMatch(item.entities, profile.projects)      // Entity/keyword 매칭
    + w_fresh· recency(item)                                       // 최신성
    + w_imp  · importance(item)                                    // 중요도(에디토리얼/신호 강도)
    − p_dup  · alreadyHeard(item, profile.recentlyHeardContentIds) // 중복(이미 들음)
    − p_neg  · negativeTagHit(item.tags, profile.negativeTags)     // 싫어하는 태그
    − p_rep  · similarRepeat(item, recent/skipped)                 // 유사 반복
```

- 가산: 카테고리 매칭 · 태그 매칭 · 프로젝트 매칭 · 최신성 · 중요도
- 감산: 중복(이미 들음) · 싫어하는 태그 · 유사 반복
- `savedContentIds`는 유사 항목 부스트, `skippedContentIds`는 유사 항목 감점 신호로 사용.
- 가중치(`w_*`, `p_*`)는 설계 레벨 개념값. 초기엔 mock/고정, 이후 튜닝 대상.

### 범위 / 정책 노트

- **source/risk policy는 내부 정책이며 아직 Settings UI에 노출하지 않는다.** SourceAdapter·민감기능(쿠키/로그인/insane-search) 기본 비활성, Agent Reach는 "1차 정적 점검 기준 사용 후보"로만 내부 취급 — 사용자 대면 설정 항목 아님.
- `UserInterestProfile`은 개인화 입력만 담고, 수집/저장 정책은 core 내부(정본: [10_DataModel](./10_DataModel_데이터구조.md))에서 관리.
- 원문 전체 저장 회피 원칙에 따라, 참조는 `ContentItemId` 등 식별자 중심으로 유지.

## Editorial Source·Subcategory 관리 (운영자/future)

> Source Pool(콘텐츠 후보 원천 전체 목록)의 관리와, 사용자가 고르는 관심 분류를 구분한다.
> 소스 관리는 **운영자(MD) 영역**, 사용자 Settings는 **관심 표현 영역**이다.
> 타입 정본은 [10_DataModel](./10_DataModel_데이터구조.md)(`EditorialSource`/`SubcategoryNode`), 소스 큐레이션 정본은 [15_Source_Pool_and_Editorial_Curation](./15_Source_Pool_and_Editorial_Curation.md) 참조. 아래는 설계 레벨 서술(future/mock).

### Editorial Source는 운영자(MD) 영역 — Settings 미노출

- **Editorial Source**는 MD(운영자)가 지정하는 신뢰 소스(채널/RSS/repo/사이트)로, Source Pool 4유형 중 가장 신뢰가 높다(Hot Topic/User Requested/Internal Project와 구분).
- 소스별 운영 속성(`trustLevel`/`priority`/`updateFrequency`)은 **운영자 전용**이며, 일반 사용자 Settings UI에는 **노출하지 않는다**. 별도 future 운영 화면(운영자 콘솔)에서만 편집.
- 사용자는 "어떤 소스를 넣고 뺄지"를 직접 만지지 않는다. source/risk policy(SourceAdapter·민감기능·Agent Reach 등)는 앞 절과 동일하게 **계속 미노출**.

| 항목 | 값(개념) | 노출 대상 |
|---|---|---|
| Editorial Source 목록 | 채널/RSS/repo/사이트 | 운영자(MD) 전용, future 운영 화면 |
| `trustLevel` | 신뢰 등급 | 운영자 전용 |
| `priority` | 편성 우선순위 | 운영자 전용 |
| `updateFrequency` | 갱신 주기 | 운영자 전용 |
| source/risk policy | 내부 정책 | 미노출(사용자·운영 UI 공통 비대상) |

### 사용자 Settings에는 '관심 Subcategory 선택'만 (mock/future)

- 사용자가 만질 수 있는 것은 **관심 표현**뿐이다. 향후 Settings에 **관심 Subcategory 선택**(Category 안의 중간 분류) 정도만 노출 가능(mock/future).
- 계층: Category → **Subcategory** → TopicCluster → Tag → Entity. 사용자는 Category(큰 방)와 Subcategory(중간 방)까지만 고르고, 하위 TopicCluster/Tag/Entity 매칭은 개인화 점수 로직이 자동 처리.
- 예) Health Category → Subcategory: 수면 / 혈당 / 장건강 / 보충제 / 운동회복.
- 이 선택은 `UserInterestProfile`의 관심 신호를 보강하는 입력이며, 소스 지정/편성과는 무관(사용자는 소스가 아니라 **관심 분류**를 고른다).

| 구분 | 사용자 Settings | 운영자(MD) 화면 |
|---|---|---|
| 다루는 대상 | 관심 Category/Subcategory 선택 | Editorial Source(소스 등록·편성) |
| 타입 | `SubcategoryNode`(선택 참조) | `EditorialSource` |
| 상태 | mock/future(노출 가능) | future 운영 화면 |
| source/risk policy | 미노출 | 미노출 |

### 타입 참조

- `EditorialSource` — MD 지정 소스(채널/RSS/repo/사이트) + `trustLevel`/`priority`/`updateFrequency`. 정본: [10_DataModel](./10_DataModel_데이터구조.md).
- `SubcategoryNode` — Category 하위 중간 분류 노드(예: Health→수면/혈당/장건강/보충제/운동회복). 정본: [10_DataModel](./10_DataModel_데이터구조.md).
