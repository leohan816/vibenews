# 12. Implementation Roadmap

구현 순서. 각 Phase는 이전 Phase가 화면에서 확인될 때 다음으로 넘어간다.

- **Phase 1: 설계문서 생성** ✅ (이 폴더)
- **Phase 2: 전체 라우팅/탭 구조** — 루트 Stack + `(tabs)` 5탭 + 8 push 화면
- **Phase 3: mock data/type 정의** — `src/data/types.ts`, `src/data/mockData.ts`, `src/lib/eventLog.ts`
- **Phase 4: Listen 화면** — 큰 중앙 재생 버튼 + 준비 요약
- **Phase 5: 재생 화면** — BriefingSession: ambient visual + chapter controls
- **Phase 6: Briefing 화면** — 카테고리 큰 카드 + 예약 진입
- **Phase 7: Recap 화면**
- **Phase 8: Saved 화면**
- **Phase 9: Settings 화면**
- **Phase 10: Explore More 화면**
- **Phase 11: Schedule Briefing 화면**
- **Phase 12: Product Recommendation 화면**
- **Phase 13: Foundation Candidate 화면**
- **Phase 14: Voice Command 화면**
- **Phase 15: FEATURE_INDEX 업데이트**
- **Phase 16: GitHub commit/push 전 보안 검사**

## 현재 진행
- Phase 1~16 스켈레톤 일괄 구현 완료(모두 mock).
- **블록 2 · 실제 오디오 플레이어 (진행 중/완료)** — Phase 5(재생 화면)를 mock에서 **partial**로 승격. expo-audio로 재생/일시정지/이전/다음/seek·chapter 큐·이어재생·완료 처리를 실제 동작시킨다. 오디오는 mock/샘플, 백그라운드 재생은 future. 설계: [02_Listen](02_Listen_오디오_플레이어.md).

## 실제 기능 연결(스켈레톤 이후) 권장 순서
1. 본문 추출(웹/유튜브/RSS) 백엔드 — `SourceAdapter` 인터페이스로 추상화. **Agent Reach는 core 의존성 아님, Source Adapter 후보**(1차 정적 점검 기준). 채택 전 격리 sandbox/container 테스트 필수. `install --env=auto`·브라우저 쿠키 접근 금지. 평가: `docs/구현로그/2026-07-03_agent_reach_evaluation.md`
   - **Source Ingestion Toolkit 우선순위:** ① RSS/GitHub/공개웹/수동 YouTube → ② yt-dlp 자막 → ③ OCR/이미지 → ④ insane-search fallback → ⑤ 쿠키 기반. 운영 자동화 금지: 쿠키 YouTube·WAF fallback·로그인 수집. 참고: `docs/구현로그/2026-07-03_source_ingestion_toolkit_reference.md`
2. **Global News Pool** — 공통 뉴스 풀 1회 생성(수집·요약·스크립트·TTS 공통 처리)
3. AI 요약/분석
4. **오디오 재생 구조 (블록 2, 진행 중)** → 이후 TTS audioUrl 연결 + 배경 재생(future)
5. **개인화 브리핑 조립** — 공통 풀 → `UserInterestProfile` → `PersonalizedBriefingPlan`(선택·정렬·연결, 오디오 재사용, 연결 멘트만 선택적 LLM). 설계: [03_Briefing](03_Briefing_예약_카테고리_브리핑.md)
6. Daily Recap 자동화
7. Foundation 동기화
8. 개인화 상품 추천 / 음성 명령 / 결제(후보)

## Content Intelligence 파이프라인 (future)

핵심 문장: **"뉴스/콘텐츠는 공통으로 준비하고, 브리핑은 사용자마다 다르게 조립한다."**
아래 15단계는 하나의 소스(대표 예: YouTube URL)를 재생 가능한 브리핑 조각으로 만드는 전체 흐름이다. 모든 단계는 설계 레벨 서술(future/mock)이며, 타입 정본은 [10_DataModel](10_DataModel.md), 소스 추상화 정책은 위 "실제 기능 연결" 1번을 따른다.

### 15단계 (개념 흐름)

| # | 단계 | 산출/상태 | 비고 |
|---|------|-----------|------|
| ① | YouTube URL 입력 | source.url | SourceAdapter(sourceType=`youtube`)로 진입. core는 특정 도구 비의존 |
| ② | source metadata | source/sourceLocators | 제목·채널·길이·썸네일 등 메타만 확보 |
| ③ | transcript 가능여부 판정 | (분기) | 자막/캡션 유무·언어·권한 확인 → 불가 시 하위 fallback으로 |
| ④ | transcript temporary cache | transcript(임시) | **임시 캐시만**, 원문 전체 영구 저장 회피 |
| ⑤ | transcript 정리 | transcript(정리본) | 잡음/타임스탬프 정돈, 요약 입력용 텍스트화 |
| ⑥ | Content Intelligence JSON 생성 | ContentItem | source/sourceLocators/transcript/analysis/taxonomy/audioScript/audioAsset/personalization/processing 구조 |
| ⑦ | summary/keyPoints/claims/taxonomy/tags/entities | analysis + taxonomy | 3축 부여: sourceType·contentKind·topicCategory. Tag(세부)·Entity(회사/제품/사람/도구/repo) 분리 |
| ⑧ | audioScript 작성 | audioScript | 낭독용 스크립트(연결 멘트 포함 가능) |
| ⑨ | Fish Audio TTS 호출 | (합성 요청) | `FISH_AUDIO_API_KEY`(**서버 전용**), 클라이언트 노출 금지 |
| ⑩ | audioAsset 생성 | audioAsset(mp3) | TTS 결과 mp3 |
| ⑪ | audio 저장 | audioAsset(저장 위치) | 재사용 가능한 오디오 자산으로 보관 |
| ⑫ | Global News Pool 등록 | 공통 풀 | **공통 1회 요약/TTS** 완료본을 풀에 등록 |
| ⑬ | 취향 매칭 | personalization | UserInterestProfile ↔ taxonomy/tags/entities 매칭 스코어링 |
| ⑭ | Personal Briefing Plan 조립 | PersonalizedBriefingPlan | 사용자별 **선택·정렬·연결**, 오디오 재사용 |
| ⑮ | 앱 재생 | 재생 | Listen/재생 화면에서 chapter 큐로 재생 |

### 공통 준비 vs 개인별 조립 (경계)

| 구분 | Global News Pool | Personal Briefing Assembly |
|------|------------------|-----------------------------|
| 범위 | 모든 사용자 공통 | 사용자별 |
| 작업 | 수집·요약·audioScript·TTS를 **1회** 수행 | 풀에서 **선택·정렬**, 연결 멘트만 선택적 LLM |
| 비용 | 콘텐츠당 1회(중복 요약/TTS 회피) | 오디오/요약 **재사용**, 조립만 수행 |
| 산출 | ContentItem + audioAsset | PersonalizedBriefingPlan |
| 단계 매핑 | ①~⑫ | ⑬~⑮ |

### Source 우선순위 (③ 분기 정책)

민감기능(쿠키/로그인/insane-search)은 기본 비활성이며 운영 자동화 금지. 위에서 아래로 시도한다.

1. **RSS / GitHub / 공개웹 / 수동 YouTube** — 1차 기본 경로
2. **yt-dlp 자막** — SourceAdapter로 감쌈, core 비의존
3. **OCR / 이미지** — 이미지·gif 소스의 텍스트 추출
4. **insane-search fallback** — Agent Reach는 "안전함"이 아니라 **1차 정적 점검 기준 사용 후보**
5. **쿠키 기반** — 기본 비활성, 운영 자동화 금지(로그인/쿠키 수집 배제)

### 관련 문서
- 오디오 재생: [02_Listen](02_Listen_오디오_플레이어.md)
- 브리핑 조립·예약: [03_Briefing](03_Briefing_예약_카테고리_브리핑.md)
- 타입 정본: [10_DataModel](10_DataModel.md)
