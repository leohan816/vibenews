# 15. Source Pool & Editorial Curation

> VibeNews는 아무 콘텐츠나 가져오지 않는다. **어디서 가져올지(Source Pool)**, **MD가 정한 소스와 Hot
> Topic을 어떻게 구분할지**, **큰 카테고리 안에서 서브카테고리를 어떻게 관리할지**, 그리고 이 소스풀에서
> **좋은 콘텐츠를 어떻게 브리핑 후보로 올릴지**를 정의한다.

## 핵심 원칙 — 품질은 두 단계로 결정된다

1. **요약 품질** — 원본의 핵심 주장·근거·예시·숫자·맥락을 잘 보존해야 한다. 일반 GPT에 스크립트/뉴스를
   넣고 요약하는 수준은 **최소 기준**이다. VibeNews는 더 구조화된 `AnalyticSummary`/`VideoContentMap`을
   만든다.
2. **음성용 마사지 품질** — 요약문을 그대로 TTS에 넣지 않는다. `AnalyticSummary`를 바탕으로 사람이 읽는
   듯한 `SpokenAudioScript`로 다시 쓴다. **사용자가 계속 들을지는 이 후처리 품질이 결정한다.**

> 이번 작업은 설계·mock 수준만. 실제 외부 수집/Hot Topic 감지/모델 요약/TTS는 아직 구현하지 않는다.

---

## 1. Source Pool 개념

Source Pool은 VibeNews가 콘텐츠 후보를 가져오는 **전체 원천 목록**이다. 소스 4유형:

| 유형 | 뜻 | 예시 |
| --- | --- | --- |
| **Editorial Source** | MD/운영자가 직접 지정(가장 신뢰) | 특정 YouTube 채널, 뉴스 RSS, GitHub repo, 건강/K-Beauty 사이트, 전문가 블로그 |
| **Hot Topic Source** | 시스템이 감지한 트렌드/급상승 주제 | AI 에이전트 이슈, 건강 연구, 투자/금리, GitHub trending, K-Beauty 시장 변화 |
| **User Requested Source** | 사용자가 넣은 URL/주제 | YouTube URL, 기사 URL, GitHub repo, 특정 주제 요청 |
| **Internal Project Source** | 사용자 내부 프로젝트 연결 참고 소스(future) | VibeNews · Cosmile · Foundation · SIASIU |

**목적**

- 아무 콘텐츠나 가져오지 않는다.
- MD가 신뢰하는 소스와 Hot Topic을 **분리**한다.
- 콘텐츠 후보를 `SourceCandidate`로 만들고, 이후 Content Intelligence Pipeline으로 넘긴다.

---

## 2. Editorial Curation (MD/운영자가 정한 소스)

MD가 정한 소스는 **Editorial Source**로 관리한다. VibeNews 품질의 **기본 원천**이며, Hot Topic보다 더
안정적·신뢰 가능한 소스로 본다.

**필드**: id · name · sourceType · url · category · subcategories · defaultTags · language · trustLevel ·
updateFrequency · priority · enabled · notes

- `trustLevel`: high / medium / low
- `updateFrequency`: hourly / daily / weekly / manual
- `priority`: core / normal / watchlist

**예시(mock)**: AI Agent 관련 YouTube 채널 · GitHub release feed · 건강/보충제 연구 사이트 · K-Beauty 글로벌
유통 뉴스 · 뷰티 성분 트렌드 사이트.

> 초기에는 **mock source list만** 둔다. 실제 fetch 구현은 하지 않는다.

---

## 3. Hot Topic (시스템이 감지한 급상승 주제)

**후보**: 뉴스 반복 주제 · YouTube/커뮤니티 급증 주제 · GitHub trending repo · AI 모델/도구 릴리즈 · 건강 새
연구/논쟁 · K-Beauty 시장/브랜드/성분 트렌드 · 투자/금리/ETF/환율 이슈.

**필드**: id · title · category · subcategory · tags · entities · trendScore · sourceCount · firstSeenAt ·
lastSeenAt · candidateSources · whyHot · riskLevel · shouldBrief

**trendScore 계산 기준**: sourceCount · recency · sourceDiversity · userInterestMatch · editorialPriority ·
novelty.

**주의**

- Hot Topic은 유행성 때문에 **과장될 수 있다.**
- 검수 전에는 확정 사실처럼 말하지 않는다.
- 건강/투자/법률성 Hot Topic은 `requiresHumanReview` 또는 verifier review 필요로 표시한다.

---

## 4. 계층: Category → Subcategory → TopicCluster → Tag → Entity

| 계층 | 정의 | 규모 | 예 |
| --- | --- | --- | --- |
| **Category** | 큰 분야 | 고정 8-10 | AI, Health, Finance, Skin Care, Beauty, Business, Developer, Science, Lifestyle, News |
| **Subcategory** | Category 안의 중간 분류 | 카테고리별 | Health 안의 수면/혈당/장건강/보충제/운동·회복 |
| **TopicCluster** | 오늘의 흐름(브리핑 단위) | 매일 가변 | "AI 에이전트 운영에서 검증 루프가 중요해지는 흐름" |
| **Tag** | 세부 주제(여럿) | 콘텐츠당 3-8 | AI Agent, Verification Loop, Claude Code, 혈당관리, 수면회복 |
| **Entity** | 등장한 이름 | 무제한 | OpenAI, Claude Code, DeepSeek, Fish Audio, GitHub |

- **Subcategory**는 UI와 개인화에 모두 사용 가능해야 한다.
- **TopicCluster**는 하루/브리핑 단위로 생성될 수 있다.
- **Tag**는 너무 작게 쪼개지지 않게 **Tag Registry로 정규화**한다.
- **Entity**는 Tag와 구분한다(고유명).

---

## 5. 초기 Category / Subcategory 예시 (mock taxonomy)

- **AI**: AI Agent · Claude Code / Codex · Open-source LLM · Voice/TTS/Audio AI · AI Coding Workflow · AI
  Business · AI Safety/Policy
- **Health**: Sleep · Glucose/Metabolism · Gut Health · Exercise/Recovery · Supplements · Skin/Inflammation ·
  Hormone · Longevity · Functional Medicine
- **Skin Care**: Skin Barrier / 피부장벽 · Acne / 여드름 · Sensitive Skin / 민감성 피부 · Sunscreen / 자외선
  차단 · Anti-aging / 안티에이징 · Ingredients / 성분 · Routine Tips / 루틴 팁 · Dermatology / 피부과·피부과학 ·
  Seasonal Skin Care / 계절별 피부관리 · Product Usage Tips / 제품 사용법 · Scalp / 두피관리
- **Finance**: Macro · Interest Rate · ETF · AI Semiconductor · Currency/FX · Crypto · Personal Investing
- **Developer**: GitHub Trends · Dev Tools · Frameworks · Cloud/Infra · Security · Databases · Testing/QA
- **Business**: Startup · E-commerce · Marketing · Global Expansion · Operations · Productivity · Beauty Export ·
  Global Beauty Market

> 초기에는 세부 구현하지 말고 **설계문서 + mock taxonomy로만** 둔다.

### K-Beauty는 top-level Category가 아니다

일반 사용자가 매일 듣는 정보 카테고리로는 **Skin Care / 피부관리**가 적절하고, K-Beauty는
Cosmile/비즈니스/브랜드/시장 맥락에 가깝다. K-Beauty는 다음으로만 남긴다.

- **tag**: K-Beauty, Korean Sunscreen, Korean Skin Care Routine
- **entity**: 특정 한국 브랜드/제품/성분/제조사
- **Business context**: Beauty Export, Global Beauty Market
- **source context**: 한국 뷰티 시장 소스에서 온 자료

구분: **Skin Care** = 피부관리 팁·성분·루틴·피부과학·제품 사용법·피부 문제 / **Beauty** = 메이크업·뷰티
트렌드·소비 트렌드·산업 흐름.

---

## 6. SourceCandidate → ContentItem 흐름

Source Pool에서 **바로** ContentItem이 되는 게 아니다.

```
1. Source Pool
2. SourceCandidate 생성
3. SourceCandidate scoring
4. selected candidate만 fetch/analyze
5. Content Intelligence JSON 생성
6. Global News Pool 등록
7. Personal Briefing Assembly에서 사용자별 선택
```

**SourceCandidate 필드**: id · sourcePoolId · sourceType · url · title · category · subcategory · tags ·
entities · candidateReason · editorialPriority · hotTopicScore · userInterestScore · riskLevel · fetchStatus ·
selectedForProcessing

**candidateReason**: editorial_source / hot_topic / user_requested / internal_project_relevance /
recurring_watch

> **모든 후보를 다 처리하지 않는다.** 비용·품질 관리를 위해 score가 높은 후보만 ContentItem으로 승격한다.
> 승격 전에 **사람(MD/Leo) 승인 게이트**를 거친다 — SourceCandidate → CandidatePreview → 승인 → 승인분만 처리.
> 상세: [16_Candidate_Review_and_TTS_Approval_Pipeline](16_Candidate_Review_and_TTS_Approval_Pipeline.md).

---

## 7. Quality Prediction (Source 단계 품질 예측)

Source Pool 단계에서부터 콘텐츠 품질을 예측해 처리 여부·방식을 정한다.

**필드**: likelyInformationDensity · likelyBriefingMode · likelyUserValue · likelyRisk · requiresVerifier ·
requiresHumanReview

**예**

- 건강 관련 새 연구 → `requiresVerifier: true`
- 투자/법률/의료성 주장 → `requiresVerifier: true`
- 반복 많은 유튜브 영상 → `likelyBriefingMode: quick`
- 고밀도 기술/사업 영상 → `likelyBriefingMode: standard 또는 deep`

**중요**

- 좋은 소스라고 항상 deep briefing을 만들지 않는다. **정보 밀도와 사용자 가치로 brief 길이를 결정**한다.
- 요약 품질은 `VideoContentMap`에서 확인하고, 청취 지속성은 `SpokenAudioScript` 품질에서 확인한다.

---

## 관련

- 타입 정본: [10_DataModel](10_DataModel_데이터구조.md) (SourcePool / EditorialSource / HotTopic /
  CategoryNode / SubcategoryNode / SourceCandidate / QualityPrediction)
- 영상 품질: [14_Video_Briefing_Quality_Strategy](14_Video_Briefing_Quality_Strategy.md) · 조립:
  [03_Briefing](03_Briefing_예약_카테고리_브리핑.md) · 수집 어댑터:
  [06_ExploreMore](06_ExploreMore_더알아보기.md)
- 로드맵: [12_Roadmap](12_Implementation_Roadmap.md) · 구현 기록:
  `docs/구현로그/2026-07-03_source_pool_editorial_curation.md`
