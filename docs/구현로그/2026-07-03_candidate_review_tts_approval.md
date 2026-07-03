# 2026-07-03 · Candidate Review & TTS Approval Pipeline (+ K-Beauty→Skin Care)

> 설계 중심. 실제 외부 수집·모델(Qwen/DeepSeek)·Fish Audio TTS·백엔드 API 구현 없음. package.json/lock 미변경. K-Beauty 정리를 위한 최소 mock 코드 변경만 있음(design↔code 일관성).

## A. K-Beauty top-level category 제거 → Skin Care

- **제거**: K-Beauty를 top-level Category에서 삭제.
- **추가**: **Skin Care / 피부관리**를 top-level Category로. Subcategory 예시(피부장벽/여드름/민감성/자외선차단/안티에이징/성분/루틴/피부과학/계절/제품사용법/두피).
- **K-Beauty는 tag/entity/business/source context로만** 유지(tag: K-Beauty/Korean Sunscreen, Business: Beauty Export/Global Beauty Market, source: 한국 뷰티 시장 소스).
- 구분: Skin Care=실용 피부관리(성분/루틴/피부과학) / Beauty=메이크업·뷰티 트렌드·산업.
- **코드 변경(mock, 최소)**: `src/data/types.ts`(TopicCategory 'K-Beauty'→'Skin Care'), `src/data/mockData.ts`(category id kbeauty→skincare, name '피부관리', 관련 mock 콘텐츠를 피부관리로; K-Beauty는 상품추천 tag로만 남김), `src/components/{cover-art,topic-cluster-card}.tsx`(gradient/emoji 키 skincare), `src/app/(tabs)/settings.tsx`(라벨).
- 문서: 00/01/02/03/05/07/09/10/15에서 top-level K-Beauty → Skin Care(영어)/피부관리(한국어 UI). business/source context는 보존.

## B. Candidate Review & TTS Approval Pipeline (docs)

핵심: **AI가 자동으로 모든 콘텐츠를 음성화하지 않는다.** 사람 승인 후에만 비싼 분석/스크립트로.

- 신규 문서: `설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md`.
- 16단계 흐름: Source Pool scan → SourceCandidate → CandidatePreview → **Admin 승인** → 승인분만 fetch/분석 → Content Intelligence/VideoContentMap/AnalyticSummary → BriefingPlan → SpokenAudioScript → DeepSeek 검수 → 9/10↑ TTS-ready / 미달 1회 수정 → 재검수 → (2회 실패) human review → 통과분만 TTS.
- **모델 역할 분리**: Worker(Qwen 8B, CandidatePreview) / Builder(더 큰 open-source, 본 분석·스크립트) / Verifier(DeepSeek, rubric 10점 검수) / Human editor.
- **DeepSeek 9/10 게이트**: rubric(coverage/faithfulness/specificity/structure/spokenNaturalness/cautionBalance/userRelevance/ttsReadiness) overallScore ≥ 9.0.
- **retry 최대 2회**, 실패 시 human review. approval 전 full fetch/TTS 금지. tts_ready ≠ tts_generated.

## 추가한 데이터 모델 (설계문서 10)
`CandidatePreview` · `CandidateApprovalStatus` · `ModelRole` · `DeepSeekReviewRubric` · `DeepSeekReviewResult` · `ReviewLoopState` · `FinalDecision` · `CandidateProcessingState`. 전부 설계 레벨(src 미반영).

## 수정/추가 문서
- 신규: 16, 이 구현로그.
- 수정: 00/03/12/14/15(Candidate Review 반영) + 00/01/02/03/05/07/09/10/15(K-Beauty→Skin Care) + 13(기능 9행).

## 코드 변경 여부
- **있음(최소)** — K-Beauty→Skin Care 일관성용 mock/type 변경(types.ts/mockData.ts/2개 컴포넌트/settings). Candidate Review 파이프라인은 **docs 전용**. package.json/lock 미변경.

## 보안/검증
- `.env`/API key/raw transcript/실제 YouTube transcript/실사용자 데이터/full copyrighted transcript **없음**.
- `npx tsc --noEmit` → 0 에러. 웹 번들·route 13개 유지.

## 요약
- 이번 작업은 **후보 승인부터 TTS-ready까지의 품질 게이트 설계** + K-Beauty→Skin Care 정리.
- AI가 자동으로 모든 콘텐츠를 음성화하지 않는다. MD/Leo 승인 후에만 비싼 분석·스크립트로 넘어간다.
- DeepSeek는 rubric 10점 검수, **9점 이상만 TTS-ready**. 자동 수정 최대 2회, 실패 시 human review.
