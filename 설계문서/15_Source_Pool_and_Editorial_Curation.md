# 15. Source Pool & Editorial Curation

> VibeNews는 아무 콘텐츠나 가져오지 않는다. **어디서 가져올지(Source Pool)**, **MD가 정한 소스와 Hot
> Topic을 어떻게 구분할지**, **큰 카테고리 안에서 서브카테고리를 어떻게 관리할지**, 그리고 이 소스풀에서
> **좋은 콘텐츠를 어떻게 브리핑 후보로 올릴지**를 정의한다.

## 핵심 원칙 — 품질은 두 단계로 결정된다

1. **요약 품질** — 원본의 핵심 주장·근거·예시·숫자·맥락을 잘 보존해야 한다. 일반 단문 요약은
   **최소 기준**이다. VibeNews는 더 구조화된 `AnalyticSummary`/`VideoContentMap`을
   만든다.
2. **음성용 마사지 품질** — 요약문을 그대로 TTS에 넣지 않는다. `AnalyticSummary`를 바탕으로 사람이 읽는
   듯한 `SpokenAudioScript`로 다시 쓴다. **사용자가 계속 들을지는 이 후처리 품질이 결정한다.**

> 일반 Source Pool/Hot Topic/다중 source 확장은 future다. 단 18번 private MVP의 manual YouTube URL과
> 승인 channel은 실제 public-caption/DeepSeek/Fish Audio vertical slice이며 mock으로 대체하지 않는다.

## D-009-A current provider scope

이 MVP에서 provider로 보낼 수 있는 source scope는
`public_low_risk_youtube_technology` 하나다. 아래의 Health/Finance/Beauty/Business/Internal, Hot Topic,
UserInterestProfile, internal project relevance 예시는 long-term taxonomy/future이지 current live-provider
allowlist가 아니다. Current source는 Leo가 manual CTA 또는 channel ON에서 public YouTube low-risk technology라고
versioned attestation한 canonical video/channel이어야 한다. `user_requested`라는 이유만으로 승인되지 않는다.

Caption을 public 방식으로 ephemeral local 취득한 뒤 `ProviderPayloadGuard`가 active scope approval/version,
canonical public provenance, denied/private/personal/sensitive markers, ambiguity, exact provider-role payload fields,
runtime binding을 **provider call 전에** 검사한다. Scope 판단을 Builder/Verifier에 맡기지 않는다. Builder가
current allowed technology category와 다른 결과를 내면 후속 provider/TTS도 중단한다. Aggregate context에는
user preference, history, project, notes, conversation 또는 private context가 없다.

다음은 모두 `SCOPE_ESCALATION_REQUIRED`이고 Leo/GPT의 새 explicit decision 전에는 fetch한 text를 provider로
보내거나 retry/toggle/operator override할 수 없다.

- private 또는 user-uploaded document
- internal company data
- personal conversation 또는 memory
- personal-data health/finance/legal/election use
- children 또는 biometric data
- multi-user production
- public commercial launch
- third-party customer content
- confidential 또는 regulated information
- 위 범위인지 local에서 명확히 결정할 수 없는 source

Provider public-policy lookup 실패나 provider-side retention/training/deletion control 미검증은 이 current scope
gate의 실패가 아니다. D-009-A exact limited/unverified record로 남고, local scope/payload control이 통과하면
현재 slice만 계속한다. Production privacy approval은 없다.

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

장기 예시는 AI Agent 관련 YouTube 채널 · GitHub release feed · 연구/산업 사이트다. 이 MVP에서는
사용자가 등록한 YouTube channel만 Editorial Source의 제한된 형태로 활성화한다.

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
| **Tag** | 세부 주제(여럿) | 콘텐츠당 3-8 | React Native, Verification Loop, Performance, 혈당관리, 수면회복 |
| **Entity** | 등장한 이름 | 무제한 | Expo, React Native, DeepSeek, Fish Audio, GitHub |

- **Subcategory**는 UI와 개인화에 모두 사용 가능해야 한다.
- **TopicCluster**는 하루/브리핑 단위로 생성될 수 있다.
- **Tag**는 너무 작게 쪼개지지 않게 **Tag Registry로 정규화**한다.
- **Entity**는 Tag와 구분한다(고유명).

---

## 5. 초기 Category / Subcategory 예시 (legacy taxonomy)

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

> 18번 MVP에서는 Builder strict output을 parse해 Category/Subcategory/Tag/Entity tables에 저장한다.
> 일반 taxonomy 편집/자동 확장은 future다.

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

> **모든 후보를 다 처리하지 않는다.** 일반 editorial flow는 사람 review를 유지한다. 이 MVP의 manual
> batch는 `분석·음성 생성` CTA가 명시적 처리 승인과 D-009-A scope attestation이며, channel
> auto-processing ON은 해당 public technology channel의 취소 가능한 standing/scope approval다.
> OFF/human-review-required/cap hit은 TTS나 자동 큐를 우회하지 않는다.
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
- 위 Health/투자/법률/의료 예시는 future risk-taxonomy 설명이다. D-009-A current provider run에는 해당 source나
  personal data를 넣지 않으며 verifier requirement만 추가해 허용 범위로 바꾸지 않는다.

---

## 8. YouTube channel standing approval MVP

- User `leo`는 최대 5개 channel을 stable channel ID로 등록한다.
- ON 문구는 이 public technology channel의 새 public-caption video를 매시간 처리하는 standing approval과
  D-009-A scope attestation임을 명시하며 exact attestation version을 저장한다.
- OFF/delete는 approval version을 올려 아직 시작하지 않은 job을 `approval_revoked`로 defer한다. 이미 만든
  derived content는 별도 user delete까지 유지한다.
- poller는 YouTube public Atom feed를 exact channel ID로 매시간 읽고 existing deferred를 먼저 포함해
  최대 3개만 queue로 승격한다. 나머지 discovery row는 버리지 않는다.
- D-008 private acceptance channel은 Expo official
  `UCx_YiR733cfqVPRsQ1n8Fag` / `https://www.youtube.com/channel/UCx_YiR733cfqVPRsQ1n8Fag`다.
- 선택 채널은 health/finance/legal/election source가 아닌 official technology source다. 실제 caption이나
  feed entry body는 design/evidence에 보존하지 않는다.

URL canonicalization, feed bounds, cursor/lease, hourly due, selected video/channel evidence의 정본은
[18번 §6·§9·§15](18_YouTube_Add_Global_Resume_MVP.md#6-source와-caption-계약)다.

## 관련

- 타입 정본: [10_DataModel](10_DataModel_데이터구조.md) (SourcePool / EditorialSource / HotTopic /
  CategoryNode / SubcategoryNode / SourceCandidate / QualityPrediction)
- 영상 품질: [14_Video_Briefing_Quality_Strategy](14_Video_Briefing_Quality_Strategy.md) · 조립:
  [03_Briefing](03_Briefing_예약_카테고리_브리핑.md) · 수집 어댑터:
  [06_ExploreMore](06_ExploreMore_더알아보기.md)
- 로드맵: [12_Roadmap](12_Implementation_Roadmap.md) · 구현 기록:
  `docs/구현로그/2026-07-03_source_pool_editorial_curation.md`
