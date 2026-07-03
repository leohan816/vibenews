# 2026-07-03 · Source Pool & Editorial Curation 설계

> 설계·mock taxonomy 수준. **실제 외부 수집·Hot Topic 감지·모델 요약·TTS 구현 없음.** src·package.json 미변경(docs 전용).

## 목적
VibeNews가 어디서 콘텐츠를 가져올지(Source Pool), MD 지정 소스와 Hot Topic을 어떻게 구분할지, Category 안 Subcategory를 어떻게 관리할지, 소스풀에서 좋은 콘텐츠를 어떻게 브리핑 후보로 올릴지 설계.

핵심 원칙(품질 2단계): (1) 요약 품질(AnalyticSummary/VideoContentMap) — 일반 GPT 요약은 최소 기준. (2) 음성 마사지 품질(SpokenAudioScript) — 청취 지속성을 결정.

## 추가/수정한 문서
- **신규**: `설계문서/15_Source_Pool_and_Editorial_Curation.md`.
- 수정: `00`(Source Pool 개요) · `03`(Subcategory·후보와 조립) · `06`(Source Pool↔SourceAdapter) · `09`(Editorial Source·Subcategory 운영/future) · `10`(타입) · `12`(수집 선행 단계) · `13`(기능 7행) · `14`(QualityPrediction).

## 추가한 데이터 모델 (설계문서 10, future)
`OwnerType` · `CandidateReason` · `SourcePool` · `EditorialSource` · `HotTopic` · `CategoryNode` · `SubcategoryNode` · `SourceCandidate` · `QualityPrediction` — 전부 설계 레벨, src 미반영.

## 반영 내용
- **Source Pool 4유형**: Editorial(MD 지정, 신뢰) / Hot Topic(시스템 트렌드) / User Requested / Internal Project(future).
- **Editorial Curation**: trustLevel(high/medium/low), updateFrequency(hourly/daily/weekly/manual), priority(core/normal/watchlist). mock source list만.
- **Hot Topic**: trendScore(sourceCount/recency/diversity/userInterestMatch/editorialPriority/novelty), 건강/투자/법률성은 requiresHumanReview.
- **계층**: Category → Subcategory → TopicCluster → Tag → Entity. Subcategory 신규(예: Health 안 수면/혈당/보충제). 초기 Category/Subcategory 예시(AI/Health/K-Beauty/Finance/Developer/Business) mock taxonomy.
- **SourceCandidate 흐름**: Source Pool → SourceCandidate → scoring → selected만 fetch/analyze → Content Intelligence → Global News Pool → Personal Briefing. 모든 후보 처리 X(비용·품질).
- **QualityPrediction**: likelyInformationDensity/likelyBriefingMode/likelyUserValue/likelyRisk/requiresVerifier/requiresHumanReview. 좋은 소스라고 항상 deep 아님.

## 코드 변경
- **없음.** src·package.json·package-lock.json 미변경. 타입은 설계문서 10에만(코드 mock은 후속 UI 작업에서).

## 보안/검증
- `.env`/API key/raw transcript/실제 YouTube transcript/실사용자 데이터/full copyrighted transcript **없음**.
- `npx tsc --noEmit` → 0 에러(코드 미변경).

## 요약
- 이번 작업은 **소스풀/카테고리/서브카테고리/후보 선별 구조를 설계**한 것.
- 실제 외부 수집·Hot Topic 감지·모델 요약·TTS는 아직 구현하지 않음.
- VibeNews는 MD 지정 소스와 Hot Topic을 모두 `SourceCandidate`로 만들고, 품질/위험/사용자 가치 기준으로 처리 후보를 고른다.
