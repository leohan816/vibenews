# 2026-07-03 · Video Briefing Quality Strategy (긴 영상 브리핑 품질 전략)

> 설계/샘플 기준 추가 **구현 아님.** 실제 Qwen/DeepSeek/Fish Audio/YouTube 수집·yt-dlp·백엔드 API 구현 없음. 코드/src/package.json 미변경.

핵심 문장: **긴 영상은 "짧게 줄이는 것"이 아니라 "들을 가치가 있는 브리핑으로 재구성"해야 한다.**

## 추가/수정한 설계문서
- **신규**: `설계문서/14_Video_Briefing_Quality_Strategy.md` (BriefingMode, LongVideoBriefingPipeline, Standard Brief 구조, 품질 기준, 단계별 Quality Gate, Qwen/DeepSeek 역할 분리, verifier 출력).
- 수정: `00`(제품 원칙) · `02`(BriefingMode와 오디오 길이) · `03`(VideoContentMap과 개인화 조립) · `10`(타입) · `12`(선행 단계) · `13`(기능 행 8개).

## 추가한 샘플 폴더 (synthetic/example)
```
samples/video_briefing/
├─ README.md
└─ 01_ai_agent_video/
   ├─ content_map.example.json
   ├─ quick_brief_2min.example.md
   ├─ standard_brief_7min.example.md
   └─ quality_notes.md
```
후보 폴더(02_health / 03_kbeauty / 04_investment / 05_dev_tool)는 README에만 기재.

## 추가한 데이터 모델 (설계문서 10)
`BriefingMode` · `InformationDensity` · `VideoSection` · `FactOpinionPredictionSplit` · `UserRelevance` · `BriefingQualityScore` · `VideoContentMap` · `VideoBriefingPipelineStep` · `VideoBriefingPipeline` · `VideoBriefingReview` — 전부 설계 레벨(future), src 코드 미반영.

## LongVideoBriefingPipeline 요약
`transcript → chunk 분리 → chunk별 추출(주장/근거/예시/숫자/인물/도구) → 중복 제거 → 논리 재구성 → 정보 밀도 평가 → 모드 결정 → 흐름 선택 → audio script → verifier 검수 → (통과 후) TTS`.
- 나쁜 방식: `transcript → 짧은 summary → TTS`.
- 좋은 방식: `transcript → chunk → VideoContentMap → logic reconstruction → audio script → verifier review → TTS`.

## Qwen 8B / DeepSeek 역할 분리 (설계만)
- **Qwen 8B**: chunk summary, keyClaims/evidence/numbers/entities 추출, 분류/태그, VideoContentMap 초안, audioScript draft.
- **DeepSeek(상위 verifier/editor)**: VideoContentMap·draftAudioScript 검수, 누락/왜곡/과장 확인, fact/opinion/prediction 구분, 숫자·인명 human check, 억지 개인화 제거, revisedAudioScript.
- 비용 원칙: 원본 transcript 전체 재검수 X → VideoContentMap + chunk summaries + evidence snippets + draftAudioScript만 검수. 중요/건강/투자/법률 콘텐츠만 second-pass.

## 안전/검증 확인
- **full transcript 미포함**: 실제 YouTube transcript·저작권 원문 없음. 샘플은 전부 synthetic/example(가상 영상).
- **코드 변경 없음**: src/·package.json/package-lock.json 미변경(문서·samples/·docs/만).
- `.env`/API key/raw transcript/실사용자 데이터 없음.
- `npx tsc --noEmit` → 0 에러(코드 미변경).

## 요약
이번 작업은 **구현이 아니라 설계/샘플 기준 추가**다. 긴 영상은 `transcript → summary`가 아니라 `transcript → VideoContentMap → audio briefing → verifier review → TTS` 구조로 처리한다. 실제 모델/TTS/수집 구현은 future.
