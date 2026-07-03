# 2026-07-03 · Video Briefing 샘플 검증 & 스크립트 구조 정리

> e510d51 설계 유지. 기능 추가/실제 모델·수집·TTS 구현 없음. src·package.json 미변경. 문서/샘플
> 포맷·JSON 유효성·기준성만 정리 + 설계 보강.

## 1. markdown 포맷 정리

- Prettier(`--prose-wrap always --print-width 100 --single-quote`)로 정리: `설계문서/14`,
  `samples/video_briefing/README.md`, `quick_brief_2min.example.md`,
  `standard_brief_7min.example.md`, `quality_notes.md`,
  `docs/구현로그/2026-07-03_video_briefing_quality_strategy.md`, 그리고 내용 추가된 `10`·`13`.
- 진단: **로컬 파일은 원래 정상**이었다(14=228줄, README=37줄, standard_brief=36줄 등, 뭉침 없음).
  "몇 줄로 뭉쳐 보임"은 뷰어 렌더링 착시. Prettier로 긴 프로즈 줄바꿈 + 표 정렬을 추가 정리.

## 2. JSON 유효성

- `python -m json.tool samples/.../content_map.example.json` → **파싱 성공(원래 유효)**. 문자열 안
  리터럴 줄바꿈 없음, trailing comma/주석 없음.
- Prettier로 2-space 정규화. `_note` 유지(valid JSON), synthetic 표기 유지, 실제 transcript 없음.

## 3. AnalyticSummary / SpokenAudioScript 분리 반영

- 원칙: **"요약문을 TTS로 읽는 앱"이 아니다.** `AnalyticSummary ≠ SpokenAudioScript`.
- 파이프라인:
  `transcript → VideoContentMap → AnalyticSummary → BriefingPlan → SpokenAudioScript → Verifier Review → TTS`.
- 나쁜 방식(summary 그대로 TTS) vs 좋은 방식(분석 요약→음성용 rewrite→검수→TTS) 명시.
- 타입 추가(설계문서 10): `AnalyticSummary` · `BriefingPlan` · `SpokenAudioScript`.
  `VideoBriefingReview`에
  `analyticSummaryCoverage`/`spokenNaturalness`/`summaryToScriptFaithfulness`/`missingFromAudioScript`/`overCompressedPoints`/`roboticPhrasing`/`needsRewrite`
  추가.

## 4. 분류/연결/JSON 기능성 보강 (14 + 10)

- **분류**: sourceType 규칙 기반, contentKind/topicCategory enum, tags/entities는 Tag Registry
  정규화.
  `NormalizedTaxonomy`(rawGeneratedTags/normalizedTags/taxonomyConfidence/classificationReason/needsHumanReview).
- **연결**: `ContentItem`을 그래프 노드로. `ContentConnectionEdge` +
  `ConnectionRelationType`(same_topic/same_entity/supports_claim/contradicts_claim/contrasts_with/relevant_to_project/follow_up_to/duplicate_or_near_duplicate).
- **JSON = schema contract**:
  `JsonContractMeta`(schemaVersion/pipelineVersion/validationResult/raw↔normalized/errors), 검증
  실패 시 retry/failed, audioScript↔audioAsset은 scriptVersion 연결.
- **품질 목표**: GPT 요약은 최소 기준. 목표 = 요약 + 구조 재구성 + 개인화 연결 + 음성용 rewrite +
  verifier review.

## 5. 샘플 보강

- `standard_brief_7min.example.md`: AnalyticSummary(딱딱) vs SpokenAudioScript(자연 낭독) 대비 추가.
- `quality_notes.md`: 요약 낭독 금지 이유, 좋은 음성 스크립트 특징, robotic vs human-read phrasing
  표 추가.

## 6. 안전/검증

- 코드 변경 없음: src·package.json·package-lock.json 미변경.
- `.env`/API key/raw transcript/실제 YouTube transcript/실사용자 데이터/full copyrighted transcript
  **없음**. 샘플은 synthetic/example.
- `npx tsc --noEmit` → 0 에러(코드 미변경). `python -m json.tool` 통과.
