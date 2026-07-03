# 2026-07-03 · Source Taxonomy & Ingestion Architecture 설계 보강

> 설계문서 전용 보강(구현 없음). 실제 수집·yt-dlp·Fish Audio·Agent Reach·insane-search·OCR·백엔드 API는 아직 만들지 않는다. core는 특정 수집 도구에 묶이지 않게 설계.

핵심 문장: **"뉴스/콘텐츠는 공통으로 준비하고, 브리핑은 사용자마다 다르게 조립한다."**

## 무엇을 보강했나
VibeNews를 단순 뉴스 앱이 아니라, 여러 소스(YouTube/RSS/웹/GitHub/Reddit/X/이미지/GIF/HTML)를 **Content Intelligence JSON**으로 구조화 → **Global News Pool** → **Personal Briefing Plan**으로 조립하는 개인화 오디오 인텔리전스 서비스로 설계 정리.

## 1. Taxonomy 3축
- `sourceType`(어디서) · `contentKind`(성격) · `topicCategory`(큰 주제) — 서로 독립.
- 뉴스도 하나의 필터; YouTube라도 뉴스성이면 `contentKind=news`.

## 2. Category / TopicCluster / Tag / Entity 분리 + UI
- Category(큰 방 8~10, 상단 탭) ≠ TopicCluster("오늘의 흐름", 하단 카드) ≠ Tag(세부, 3~8) ≠ Entity(고유명).
- **UI 문구 "카테고리" → "오늘의 흐름"**, CategoryCard → **FlowCard/TopicClusterCard**. (Phase 2에서 구현)

## 3. SourceLocator / YouTube 출처 정책
- timestamp 강제 X. `SourceLocator`로 소스별 위치(YouTube startSec/endSec 내부용, GitHub repo/sha/lines/pr, RSS/Web paragraph/section, Reddit/X post/comment, 공통 url/hash).
- YouTube 채널명 기본 비노출("영상 기반 분석"), 원 출처 우선. `SourceDisclosurePolicy`(internal_only/source_type_only/underlying_sources_only/full_source_visible), YouTube 기본 source_type_only. 저작권: 원문 재배포 회피.

## 4. SourceAdapter 구조
- core는 `SourceAdapter`/`ContentItem`만 다루고 yt-dlp/curl/insane-search/Agent Reach를 직접 알면 안 됨.
- 후보: RSS/WebArticle/YouTube/GitHub/Reddit/X/ImageOcr/GifOcr/HtmlDocument/BlockedPageFallback/AgentReach(future).

## 5. Content Intelligence JSON (`ContentItem`)
- source · sourceLocators · transcript · analysis(요약/keyPoints/mainClaims/actionIdeas) · taxonomy · audioScript · audioAsset · personalization · processing.
- 타입 정본: [10_DataModel](../../설계문서/10_DataModel_데이터구조.md).

## 6. 파이프라인 (YouTube → CI JSON → Fish Audio)
- 15단계: URL→metadata→transcript(temp cache)→CI JSON→audioScript→**Fish Audio TTS**→audioAsset(mp3)→Global Pool→Personal Plan→재생.
- **FISH_AUDIO_API_KEY 서버 전용, 클라이언트 노출 금지.**

## 7. Global News Pool + Personal Briefing Assembly
- 공통 풀 1회(수집/요약/TTS 공통), 사용자별 선택·정렬·연결만 가볍게. `personalizationMode`: metadata_only(초기)/light_llm_bridge/deep_personalized(future).

## 8. UserInterestProfile + 개인화 점수
- categories/tags(weight), negativeTags, tone/depth/duration, saved/skipped/recentlyHeard.
- personalScore = 카테고리+태그+프로젝트 매칭 + 최신성 + 중요도 − 중복 − 싫은 태그 − 유사 반복.

## 9. Raw content 저장 정책
- 원문 전체 저장 기본 금지. 저장 가능: 요약/핵심포인트/인사이트/action/메타/audioScript/taxonomy/claims.
- `RawContentStoragePolicy`: none/temporary_cache_only/private_internal/allowed_persistent. YouTube transcript=temporary_cache_only.

## 10. Source risk policy (초기)
| 도구 | riskLevel / allowedUse |
| --- | --- |
| RSSFetcher | low / production |
| GitHubFetcher | low~medium / production |
| WebArticleFetcher | medium / production or internal_only |
| YouTube(무쿠키) | medium / internal·prod(신중) |
| YouTube(브라우저 쿠키) | high / research_only |
| RedditFetcher | medium / API 정책 검토 후 production |
| XFetcher | high / future |
| insane-search | high / fallback_only |
| AgentReachFetcher | high / research_only |
| OCR | medium / internal_only or production(소스별) |
| HTML→PDF | low~medium / internal_only |

## 11. Agent Reach 정책 (재확인)
- core dependency 아님, package.json 미추가, core import 금지, 운영 자동설치 금지, `install --env=auto` 금지, sudo/apt/brew 금지, browser-cookie3 기본 금지, 격리 venv/container에서만. **"안전함" 아니라 "1차 정적 점검 기준 사용 후보".**

## 업데이트한 문서
설계문서 00·01·02·03·06·07·08·09·10·11·12·13 + docs/환경변수.md + .env.example(FISH_AUDIO_API_KEY).

## Phase 2 (다음, 구현)
- 섹션 제목 "카테고리" → "오늘의 흐름", CategoryCard → FlowCard/TopicClusterCard.
- mockData에서 category와 topicCluster/tags 분리, types.ts에 data model 일부 반영.
- Feature Index 상태는 mock/future. Settings에 source/risk policy 미노출.
