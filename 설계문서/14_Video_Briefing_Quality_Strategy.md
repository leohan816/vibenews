# 14. Video Briefing Quality Strategy (긴 영상 브리핑 품질 전략)

> **긴 영상은 "짧게 줄이는 것"이 아니라 "들을 가치가 있는 브리핑으로 재구성"해야 한다.**

## 목적

- 긴 YouTube 영상(20~60분), 인터뷰, 강의, 기술/건강/투자/비즈니스 영상을 **성의 없이 짧게 압축하지
  않고**, 들을 가치가 있는 오디오 브리핑으로 재구성하는 기준을 정의한다.
- VibeNews의 **긴 영상 처리 표준**을 만든다.
- Qwen 8B · DeepSeek · Fish Audio 같은 모델/도구를 **구현하기 전에** "좋은 영상 브리핑이 무엇인가"를
  먼저 고정한다.
- 이 문서는 설계·기준이며, 실제 모델/수집/TTS 구현은 아직 하지 않는다(future).

30분짜리 영상을 단순히 1~2분으로 압축하면 알맹이가 빠진다. 그래서 긴 영상 전용 **품질 기준 · 처리
파이프라인 · 샘플 라이브러리 · 검수 구조**가 필요하다.

---

## 1. BriefingMode

| Mode       | 길이    | 쓰임                                              |
| ---------- | ------- | ------------------------------------------------- |
| `quick`    | 1~2분   | 뉴스 카드/RSS, 반복·잡담 많은 영상                |
| `standard` | 5~8분   | 20~40분 정보 밀도 있는 영상 (기본값)              |
| `deep`     | 10~15분 | 1시간+ 고밀도(창업/기술/시장 구조) 또는 chapter형 |

**기본 기준**

- 뉴스/RSS 기사 → quick(1~2분)
- 짧은 영상 5~10분 → 2~4분
- 중간 영상 20~40분 → standard(5~8분)
- 긴 영상 1시간+ → deep(8~15분) 또는 chapter형
- 반복/잡담 많은 영상 → quick
- 정보 밀도 높은 기술/사업/건강/투자 영상 → standard 또는 deep

**중요**

- 모든 콘텐츠를 무조건 1~2분으로 만들지 않는다.
- 1~2분은 뉴스 카드엔 좋지만 30분짜리 좋은 영상엔 너무 짧다.
- **30분짜리 좋은 영상의 기본값은 standard(5~8분)** 이다. 단, 모든 30분 영상이 7분이 될 필요는 없다.
- 정보 밀도에 따라 quick/standard/deep를 결정한다.

**InformationDensity**: `low` / `medium` / `high`

- 반복·잡담 많음 → quick(2~3분)
- 실용 정보 많음 → standard(5~8분)
- 창업/기술/시장 구조 설명 많음 → deep(10~15분)

---

## 2. LongVideoBriefingPipeline (긴 영상 처리 표준)

단순 예시가 아니라 **핵심 설계**다.

1. transcript 수집 또는 입력
2. 3~5분 단위 chunk 분리
3. chunk별 핵심 주장/근거/예시/숫자/인물/도구 추출
4. 중복 제거
5. 영상 전체의 논리 구조 재구성
6. 정보 밀도 평가
7. Quick / Standard / Deep 브리핑 모드 결정
8. 사용자에게 중요한 흐름 선택
9. 오디오 브리핑 스크립트 작성
10. 검수 모델이 누락/왜곡/과장 체크
11. 검수 통과 후 TTS 생성

**나쁜 방식**

```
transcript → 짧은 summary → TTS
```

**좋은 방식**

```
transcript → chunk extraction → VideoContentMap → logic reconstruction
          → personalized audio script → verifier review → TTS
```

**핵심 원칙**

- 긴 영상을 바로 summary로 만들지 않는다. chunk summary에서 끝내지도 않는다.
- chunk별 추출 결과를 모아 **VideoContentMap**을 만든다.
- VideoContentMap을 기반으로 영상 전체의 논리 구조를 재구성한다.
- 원문 시간 순서를 그대로 따라가지 않고 **듣기 좋은 브리핑 구조로 다시 편집**한다. 단, 원문 의미를
  왜곡하지 않는다.
- 숫자·인물·제품명·도구명·핵심 예시는 가능한 한 보존한다.
- 모든 내용을 균등하게 압축하지 않는다. **사용자에게 중요한 흐름만 선택**한다.
- 최종 스크립트는 verifier/editor 모델이 누락·왜곡·과장을 검수한다. **검수 통과 후에만** TTS로
  넘긴다.

---

## 3. Standard Brief 표준 구조 (30분 영상 기준)

**구성 8블록**

1. 왜 이 영상이 중요한가
2. 영상의 핵심 주장 한 문장
3. 전체 논리 구조 3~5개
4. 가장 중요한 디테일/예시/숫자
5. 과장되었거나 조심해야 할 부분
6. Leo님 프로젝트와 연결되는 점
7. 지금 할 수 있는 행동
8. 나중에 더 깊게 볼 질문

**오디오 스크립트 구조**

- **[오프닝]** 오늘 볼 영상의 핵심을 한 문장으로.
- **[핵심 주장]** 영상이 실제로 말하는 중심 주장 정리.
- **[구조]** 내용을 3~5개 논리 블록으로.
- **[중요한 디테일]** 놓치면 안 되는 예시·숫자·도구·인물·제품명·시장 흐름을 살린다.
- **[주의점]** 사실/의견/예측을 구분, 과장·검증 필요 부분 언급.
- **[사용자와 연결]** VibeNews·Cosmile·Foundation·SIASIU·AI 개발·건강·투자 등 관심사와 연결. **단,
  억지 연결 금지.**
- **[마무리]** 오늘 가져갈 핵심과 다음 행동.

---

## 4. 품질 기준

**좋은 영상 브리핑**

1. 핵심 주장이 살아 있다.
2. 왜 중요한지 설명한다.
3. 근거/예시/숫자가 보존된다.
4. 원문 순서를 기계적으로 따라가지 않고 논리적으로 재구성한다.
5. 사실/의견/예측을 구분한다.
6. 사용자의 관심사와 연결한다.
7. "그래서 뭘 해야 하지?"를 알 수 있다.
8. 너무 일반적인 말로 흐려지지 않는다.
9. 오디오로 들었을 때 자연스럽다.
10. 과장·확정 표현을 피한다.

**나쁜 브리핑 징후**

- "중요합니다"만 반복
- 제목만 바꿔 말함
- 예시·숫자가 사라짐
- 모든 내용을 균등하게 압축
- 원문 흐름 이해 없이 문단별 요약만
- 마지막에 뻔한 결론만
- creator opinion을 fact처럼
- prediction을 확정처럼
- 관심사와 억지 연결

---

## 5. 단계별 Quality Gate

1. **chunk** — 너무 길거나 짧지 않은가 / timestamp·sourceLocator 유지되는가
2. **extraction** — keyClaims/evidence/examples/numbers/entities 비어 있지 않은가 /
   숫자·인명·제품명에 `needsHumanCheck` 표시했는가
3. **dedup** — 반복 주장 제거했는가 / 중요한 반복 강조는 완전 삭제하지 않았는가
4. **logic reconstruction** — coreThesis 선명한가 / section 구조 자연스러운가 / 원문 의미 왜곡 없나
5. **briefing mode** — informationDensity에 맞게 quick/standard/deep 선택했는가 / 무조건 짧게 만들지
   않았는가
6. **personalized selection** — 관심사 연결 포인트 있나 / 억지 연결 아닌가
7. **audio script** — 오디오로 자연스러운가 / 너무 글처럼 아닌가 / target duration에 맞는가
8. **verifier** — missingPoints / distortedClaims / overstatements / unsupportedClaims /
   fact·opinion·prediction 구분 / numeric·entity human check 필요 여부
9. **TTS** — review pass 후에만 실행 / scriptVersion ↔ audioAsset 연결

---

## 6. Qwen 8B / DeepSeek 역할 분리 (설계 레벨, 구현 없음)

**Qwen 8B 후보 역할**

- transcript chunk summary
- chunk별 keyClaims 추출
- evidence/examples/numbers/entities 추출
- oneLineSummary / shortSummary
- category / contentKind classification
- tag / entity extraction
- topicCluster generation
- VideoContentMap 초안 생성
- audioScript draft

**Qwen 8B에 맡기기 어려운 일**

- 긴 유튜브 전체를 한 번에 깊게 분석
- 여러 소스 간 사실관계 검증
- fact/opinion/prediction 정밀 구분
- 건강/투자/법률성 콘텐츠 최종 판단
- 방송용 스크립트 최종 품질 보장
- 사용자 사업/프로젝트와 연결되는 전략적 해석의 최종 판단

**DeepSeek(또는 더 좋은 verifier/editor model) 역할**

- VideoContentMap 검수 / draftAudioScript 검수
- 빠진 핵심 확인 / 왜곡된 주장 확인 / 과장 표현 제거
- fact/opinion/prediction 분리 확인
- 숫자·인명·제품명·회사명 human check 표시
- 억지 개인화 연결 제거 / `revisedAudioScript` 생성

DeepSeek verifier는 처음부터 전체 transcript를 다시 읽고 새로 쓰는 모델이 **아니다.** Qwen 8B가 만든
구조화 결과를 검사하는 **senior editor**로 쓴다.

**검수 비용 원칙**

- 검수 모델에 원본 transcript 전체를 매번 넣지 않는다.
- `VideoContentMap + chunk summaries + evidence snippets + draftAudioScript`를 넣는다 → 검수 토큰
  절감.
- 중요한 영상/건강/투자/법률성 콘텐츠만 second-pass 검수.

| 방식                              | 비용   |
| --------------------------------- | ------ |
| 원본 전체 재검수                  | 비쌈   |
| 구조화 결과 검수                  | 저렴   |
| 중요 구간 evidence snippet만 검수 | 현실적 |

---

## 7. DeepSeek verifier 출력 (VideoBriefingReview)

출력 필드: `pass` · `missingPoints` · `distortedClaims` · `overstatements` · `unsupportedClaims` ·
`needsHumanCheck` · `numericRisks` · `entityRisks` · `recommendedEdits` · `revisedAudioScript` ·
`qualityScore` (타입 정본: [10_DataModel](10_DataModel_데이터구조.md)).

**검수 기준(질문)**

- coreThesis가 원본과 맞는가?
- 중요한 keyClaims가 빠졌는가?
- evidence 없이 강한 주장을 했는가?
- creator opinion을 fact처럼 말했는가?
- prediction을 확정처럼 말했는가?
- 숫자/제품명/사람명/회사명 오류가 있는가?
- 너무 일반론으로 흐려졌는가?
- 오디오로 들었을 때 자연스러운가?
- 관심사 연결이 억지스럽지 않은가?
- target duration에 맞는가?

---

## 8. AnalyticSummary ≠ SpokenAudioScript (요약 ≠ 낭독문)

**VibeNews는 "요약문을 TTS로 읽는 앱"이 아니다.** 원본을 이해한 뒤, **사람이 읽을 만한 오디오
브리핑으로 다시 써주는** 앱이다.

그래서 두 산출물을 분리한다.

|         | AnalyticSummary                                        | SpokenAudioScript                                                            |
| ------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 목적    | 원본 이해용                                            | 사람이 읽는 듯한 음성용                                                      |
| 담는 것 | 핵심 주장·근거·예시·숫자·인물/도구·사실/의견/예측 구분 | 자연스러운 오프닝·듣기 좋은 흐름·전환문·과장 없는 설명·관심사 연결·행동 제안 |
| 문체    | 딱딱해도 됨(누락/왜곡 방지 중심)                       | 자연스러운 낭독체(TTS 최종 입력)                                             |

**파이프라인 (명확히)**

```
transcript
→ VideoContentMap
→ AnalyticSummary
→ BriefingPlan
→ SpokenAudioScript
→ Verifier Review
→ TTS
```

- **나쁜 방식**: summary를 그대로 TTS에 넣음.
- **좋은 방식**: 분석 요약(AnalyticSummary)을 만든 뒤, 음성용 스크립트(SpokenAudioScript)로 **다시
  rewrite**하고 검수 후 TTS에 넣음.

타입: [10_DataModel](10_DataModel_데이터구조.md) (`AnalyticSummary` / `BriefingPlan` /
`SpokenAudioScript`).

---

## 9. 분류 · 연결 · JSON 기능성 · 품질 (설계 보강)

### 9-1. 내용 분류 가능성

- `sourceType`은 **규칙 기반**, `contentKind`/`topicCategory`는 **enum 제한**.
- `topicCluster`/`tags`/`entities`는 모델 생성 후 **정규화**한다 — 모델이 만든 태그를 그대로 쓰지
  않고 **Tag Registry에 매칭**.
- `rawGeneratedTags`(모델 원본) ↔ `normalizedTags`(정규화)를 분리하고,
  `taxonomyConfidence`·`classificationReason`·`needsHumanReview`를 둔다. (타입:
  `NormalizedTaxonomy`)

### 9-2. 내용 연결 가능성

- `ContentItem`은 나중에 **그래프 노드**로 볼 수 있어야 한다.
  Claim·Entity·TopicCluster·Tag·UserProject·Source를 연결.
- 관계는 `ContentConnectionEdge`(또는 `NewsConnectionEdge`)로 저장. `relationType` 예: `same_topic`
  · `same_entity` · `supports_claim` · `contradicts_claim` · `contrasts_with` ·
  `relevant_to_project` · `follow_up_to` · `duplicate_or_near_duplicate`.

### 9-3. JSON = schema contract

- Content Intelligence JSON은 **모델 출력물이 아니라 스키마 계약**이다.
- `schemaVersion` · `pipelineVersion` · `validationResult` · `processing.errors`가 있어야 한다.
- **JSON validation 실패 시 retry 또는 failed 상태로 기록.** raw model output과 normalized output을
  구분한다.
- `audioScript`↔`audioAsset`은 `scriptVersion`으로 연결. (타입: `JsonContractMeta`)

### 9-4. 영상 요약 품질 목표

- 일반 GPT 요약 수준은 **최소 기준**이다.
- 목표 = GPT 요약 **+ 구조 재구성 + 개인화 연결 + 음성용 rewrite + verifier review**.
- 요약문을 그대로 읽지 않는다. `SpokenAudioScript`는 사람이 읽는 것처럼 **마사지된 최종
  낭독문**이어야 한다.

---

## 관련

- 타입: [10_DataModel](10_DataModel_데이터구조.md) (VideoContentMap / VideoSection /
  VideoBriefingPipeline / VideoBriefingReview / BriefingMode …)
- 오디오 길이·재생: [02_Listen](02_Listen_오디오_플레이어.md) · 개인화 조립:
  [03_Briefing](03_Briefing_예약_카테고리_브리핑.md)
- 샘플 기준: `samples/video_briefing/` · 로드맵: [12_Roadmap](12_Implementation_Roadmap.md)
- 구현 기록: `docs/구현로그/2026-07-03_video_briefing_quality_strategy.md`
