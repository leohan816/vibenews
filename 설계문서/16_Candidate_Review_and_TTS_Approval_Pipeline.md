# 16. Candidate Review & TTS Approval Pipeline

> **AI가 자동으로 모든 콘텐츠를 음성화하지 않는다.** MD/Leo가 후보를 보고 **승인**한 것만 비싼 분석과
> 스크립트 생성으로 넘어가고, DeepSeek 검수를 통과(9/10 이상)한 것만 TTS-ready가 된다.

이번 작업은 **설계**다. 실제 외부 수집·모델 호출·TTS 생성은 하지 않는다. 타입 정본은
[10_DataModel](10_DataModel_데이터구조.md).

## 목적

- AI가 각 사이트/소스를 돌며 후보를 찾고, 각 후보의 기본 정보를 정리해 보여준다.
- **사람이 승인한 후보만** TTS 직전까지 처리한다.
- 승인 전에는 **full fetch/download를 하지 않는다.** preview 수준 정보만 만든다.
- 비용이 큰 분석/TTS는 **승인 후** 실행한다.

## 핵심 흐름 (16단계)

1. Source Pool scan
2. SourceCandidate 생성
3. Candidate Preview 생성
4. Admin/Backend에서 사람 승인
5. 승인된 후보만 fetch/extract
6. Content Intelligence JSON 생성
7. VideoContentMap / AnalyticSummary 생성
8. BriefingPlan 생성
9. SpokenAudioScript 생성
10. DeepSeek verifier 검수
11. 점수 9/10 이상이면 TTS-ready 승인
12. 점수 미달이면 AI(Builder)가 한 번 수정
13. 다시 DeepSeek 검수
14. 2회 이상 반복 금지
15. 다시 실패하면 human review로 보냄
16. 통과한 것만 TTS 생성

> approval 전 full fetch/download·TTS 금지. retry는 최대 2회. DeepSeek 검수 실패가 반복되면 사람이 판단.

## Candidate Preview

SourceCandidate가 Admin에 표시될 때 필요한 정보(승인 결정용 **미리보기 요약**, 최종 요약 아님).

- 식별/출처: id · sourceCandidateId · title · sourceName · sourceType · url · publishedAt
- 분류: category · subcategory · tags · entities
- 추천 근거: recommendationReason · shortSummary · whyItMatters
- 품질 예측: likelyInformationDensity · likelyBriefingMode · estimatedBriefingDurationSec
- 신뢰/점수: sourceTrustLevel · editorialPriority · hotTopicScore · userInterestScore · duplicateRisk ·
  freshnessScore · candidateScore
- 위험: riskLevel · requiresVerifier · requiresHumanReview
- 승인: approvalStatus · rejectionReason · approvedBy · approvedAt

**recommendationReason 예**: MD 지정 신뢰 소스의 새 콘텐츠 / 오늘 여러 소스에서 반복된 hot topic / Leo의
관심 프로젝트와 관련 / 건강·피부·투자 등 high-value 주제 / 최근 저장한 콘텐츠와 연결.

**shortSummary**: Qwen 8B(worker)가 생성 가능. 단 **최종 요약이 아니라 승인용 미리보기 요약**이다.

## 모델 역할 분리

| 역할 | 담당 | 하는 일 |
| --- | --- | --- |
| **Worker LLM (Qwen 8B)** | 후보 미리보기 | CandidatePreview 생성, title 정리, shortSummary, category/subcategory 분류, tags/entities 추출, recommendationReason, likelyInformationDensity·riskLevel 예측, duplicate 감지 보조 |
| **Builder LLM (더 큰 오픈소스)** | 승인분 본 분석 | Content Intelligence JSON, VideoContentMap, AnalyticSummary, BriefingPlan, SpokenAudioScript 초안 |
| **Verifier LLM (DeepSeek)** | 최종 검수 | rubric + 문장 독해로 검수, pass/fail + 10점 점수, 수정 지시. 원본 전체를 매번 읽지 않고 구조화 결과·핵심 evidence를 보는 senior editor |
| **Human Editor** | 최종 판단 | 반복 실패/고위험 콘텐츠 승인·수정·폐기 |

Builder 후보: Qwen 14B · Qwen 32B · DeepSeek distill · Gemma 12B 등 성능 좋은 open-source model.

## DeepSeek 검수 정책 (10점 만점 rubric)

DeepSeek는 "괜찮다/나쁘다"가 아니라 정해진 rubric으로 **10점 만점** 평가한다.

**DeepSeekReviewRubric**: coverage(핵심 보존) · faithfulness(원문 의미) · specificity(예시/숫자/인물/도구) ·
structure(논리) · spokenNaturalness(자연스러움) · cautionBalance(과장/확정 방지) · userRelevance(연결
자연스러움) · ttsReadiness(최종 문장 상태). 각 항목 0-10 또는 weight로 평가 → overallScore.

**통과 기준**: overallScore ≥ 9.0 · criticalError 없음 · unsupportedClaims 없음/허용 범위 · roboticPhrasing
심각하지 않음 · summaryToScriptFaithfulness 충족 · TTS-ready 기준 충족.

**실패 기준**: overallScore < 9.0 · 핵심 주장 누락 · 원문 왜곡 · 근거 없는 강한 주장 · creator opinion을
fact처럼 · prediction을 확정처럼 · 음성 스크립트가 너무 로봇 같음 · 과압축으로 핵심 예시/숫자 소실 · 위험
주제인데 caution 없음.

## Retry / Human Review 정책 (무한 루프 방지)

**Review Loop** (`maxReviewAttempts = 2`):

1. Builder LLM이 SpokenAudioScript 생성
2. DeepSeek 검수 → 9점 이상이면 pass → `tts_ready`
3. 9점 미만이면 verifier의 recommendedEdits를 Builder에 전달
4. Builder가 수정본 생성
5. DeepSeek가 **두 번째** 검수
6. 두 번째도 실패하면 `human_review_required`
7. 사람이 승인/수정/폐기 결정

> DeepSeek가 직접 계속 고치게 하지 않는다. verifier/editor로서 수정 방향·revised suggestion만 준다.
> **두 번 이상 자동 루프 금지.** 실패 콘텐츠는 사람이 판단한다.

**ReviewLoopState 상태**: draft_script_created · review_pending · review_passed · review_failed ·
revision_requested · revision_created · second_review_pending · human_review_required · tts_ready ·
tts_generated · discarded.

## 전체 처리 상태 (CandidateProcessingState)

approval **전**과 **후**를 분리한다. TTS는 review 통과 후에만.

```
discovered → preview_generated → awaiting_approval
   → approved / rejected
approved → fetch_pending → fetched → content_map_created → analytic_summary_created
   → briefing_plan_created → spoken_script_created → review_pending
   → (revision_requested → revised_script_created → second_review_pending)
   → tts_ready / human_review_required
tts_ready → tts_generated
(any) → failed / discarded
```

- `tts_ready` = 음성 제작 가능 상태 ≠ `tts_generated`(실제 음성 파일 생성 완료).

## 관련

- 타입: [10_DataModel](10_DataModel_데이터구조.md) (CandidatePreview / DeepSeekReviewResult / ReviewLoopState
  / CandidateProcessingState …)
- 소스풀·후보: [15_Source_Pool](15_Source_Pool_and_Editorial_Curation.md) · 영상 품질:
  [14_Video_Briefing_Quality_Strategy](14_Video_Briefing_Quality_Strategy.md)
- 로드맵: [12_Roadmap](12_Implementation_Roadmap.md) · 구현 기록:
  `docs/구현로그/2026-07-03_candidate_review_tts_approval.md`
