# 10. Data Model · 데이터 구조

## 목적

전 화면이 공유하는 TypeScript 타입을 한곳에 정의한다. 실제 구현은 `src/data/types.ts` 이며, 이
문서와 항상 동기화한다.

## 현재 상태

**mock** — 타입은 확정, 데이터는 `src/data/mockData.ts` 의 하드코딩 값이다.

## 타입 정의

> 아래 코드블록은 그대로 복사해 `src/data/types.ts` 로 옮길 수 있는 형태다. 각 타입은 한 섹션에
> 하나씩 둔다.

### 공통 타입 (유니온 / 별칭)

```ts
export type KnowledgeType = 'Fact' | 'Trend' | 'Insight' | 'Action' | 'Question';

export type FoundationStatus =
  'local_only' | 'candidate' | 'approved_for_foundation' | 'synced_to_foundation' | 'rejected';

export type RepeatMode = 'none' | 'one' | 'all';

export type ContentStatus = 'mock' | 'partial' | 'working' | 'future';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'completed' | 'error';
```

### Category

카테고리 단위의 오늘 준비 상태(개수·시간·키워드).

```ts
export interface Category {
  id: string;
  name: string;
  preparedItemCount: number;
  estimatedDurationMin: number;
  topKeywords: string[];
  lastUpdatedAt: string;
  hasNewItems: boolean;
}
```

### NewsItem

수집된 개별 뉴스의 논리 단위(요약 + 출처 메타).

```ts
export interface NewsItem {
  id: string;
  title: string;
  categoryId: string;
  shortSummary: string;
  sourceMetaIds: string[];
  createdAt: string;
}
```

### NewsAudioItem

재생 playlist 의 한 chapter(오디오 아이템).

```ts
export interface NewsAudioItem {
  id: string;
  newsItemId: string;
  briefingSessionId: string;
  title: string;
  categoryId: string;
  durationSec: number;
  audioUrl: string | null; // mock: null
  transcript: string | null; // 재생 화면엔 노출 안 함
  shortSummary: string;
  chapterIndex: number;
  isCompleted: boolean;
  isSaved: boolean;
  listenedAt: string | null;
}
```

### BriefingSession

여러 NewsAudioItem 을 묶은 하나의 브리핑 세션(playlist).

```ts
export interface BriefingSession {
  id: string;
  title: string;
  date: string;
  categoryIds: string[];
  totalDurationSec: number;
  currentChapterIndex: number;
  newsAudioItemIds: string[];
  createdAt: string;
}
```

### PlaybackState

현재 재생 상태(어느 챕터·위치·재생 여부·길이·완료). 블록 2에서 오디오 엔진용으로 확장.

```ts
export interface PlaybackState {
  sessionId: string;
  currentNewsAudioItemId: string;
  currentChapterIndex: number;
  currentPositionSec: number;
  durationSec: number; // 현재 chapter 길이
  isPlaying: boolean;
  status: PlaybackStatus; // idle/loading/playing/paused/completed/error
  repeatMode: RepeatMode;
  sessionCompleted: boolean; // 마지막 chapter까지 재생 완료
  usingFallbackAudio: boolean; // audioUrl 없어 샘플 사용 중
  updatedAt: string;
}
```

### ScheduledBriefing

예약 브리핑 설정(시간·요일·길이).

```ts
export interface ScheduledBriefing {
  id: string;
  categoryIds: string[];
  timeOfDay: string; // "07:00"
  daysOfWeek: number[]; // 0-6
  lengthMin: number; // 기본 10
  enabled: boolean;
}
```

### ListeningHistory

청취 기록(무엇을 언제 들었고 끝냈는지).

```ts
export interface ListeningHistory {
  id: string;
  newsAudioItemId: string;
  listenedAt: string;
  completed: boolean;
}
```

### DailyRecap

오늘 들은 내용의 요약(음성+텍스트+카드의 원본 데이터).

```ts
export interface DailyRecap {
  id: string;
  userId: string;
  date: string;
  timezone: string;
  summary: string;
  keyTrends: string[];
  repeatedKeywords: string[];
  categoryHighlights: { categoryId: string; text: string }[];
  personalConnections: string[];
  sourcesToReview: string[];
  actionIdeas: string[];
  mustNotMissItems: string[];
  followUpQuestions: string[];
  generatedAt: string;
}
```

### RecapCard

Recap 에서 저장 카드로 떼어낸 지식 조각.

```ts
export interface RecapCard {
  id: string;
  recapId: string;
  knowledgeType: KnowledgeType;
  text: string;
}
```

### SavedCard

저장된 "뉴스 지식" 카드(원문 전체가 아니라 지식 문장/요약).

```ts
export interface SavedCard {
  id: string;
  title: string;
  categoryId: string;
  knowledgeType: KnowledgeType;
  knowledgeText: string; // 지식 문장(원문 전체 아님)
  summary: string;
  sourceMetaIds: string[];
  savedAt: string;
  foundationStatus?: FoundationStatus; // Saved 카드에 Foundation 후보 상태 요약 표시용
  relatedProjectIds: string[]; // 내부 메타데이터. 기본 UI 미사용
}
```

### ExploreMore

"더 알아보기"의 내부 심층 분석 결과(링크 목록 아님).

```ts
export interface ExploreMore {
  id: string;
  newsItemId: string;
  keyConclusion: string;
  recurringThemes: string[];
  perspectives: { label: string; text: string }[];
  certainFacts: string[];
  uncertainClaims: string[];
  communityReactions: string[];
  personalConnections: string[];
  actionIdeas: string[];
  followUpQuestions: string[];
  sourceMetaIds: string[]; // 링크 클릭 의존 X
}
```

### KnowledgeCandidate

Foundation 전송 후보인 뉴스 지식.

```ts
export interface KnowledgeCandidate {
  id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  knowledgeType: KnowledgeType;
  content: string;
  summary: string;
  relatedCategoryIds: string[];
  relatedProjectIds: string[];
  relatedProductIds: string[];
  sourceMetaIds: string[];
  confidenceLevel: 'low' | 'medium' | 'high';
  longTermValueScore: number;
  userSaved: boolean;
  foundationStatus: FoundationStatus;
  knowledgeClass: 'news_knowledge';
  createdAt: string;
  reviewedAt: string | null;
  syncedAt: string | null;
}
```

### ProductRecommendation

관심사와 연결된 개인화 상품(안전 표현만).

```ts
export interface ProductRecommendation {
  id: string;
  name: string;
  imageUrl: string | null;
  reasonKeywords: string[];
  reasonText: string; // 안전 표현만
  relatedCategoryId: string;
}
```

### VoiceCommand

음성 명령 정의(대부분 아직 future).

```ts
export interface VoiceCommand {
  id: string;
  phrase: string;
  intent: string;
  status: ContentStatus; // 대부분 future
}
```

### SourceMeta

출처 메타데이터(내부 저장, UX는 클릭 비의존).

```ts
export interface SourceMeta {
  id: string;
  type: 'web' | 'youtube' | 'x' | 'reddit' | 'github' | 'paper' | 'other';
  title: string;
  url: string; // 내부 메타. UX는 클릭 비의존
  publishedAt: string | null;
}
```

### EventLog

사용 행동 mock 기록(→ [11_EventLog](11_EventLog_사용행동기록.md)).

```ts
export interface EventLog {
  id: string;
  event: string; // 11_EventLog 목록 참조
  payload: Record<string, unknown>;
  createdAt: string;
}
```

## 개인화 브리핑 조립 (future)

공통 뉴스 풀을 한 번 만들고(비용 공통), 사용자별로 그 풀에서 일부를 골라 정렬·연결해 브리핑을
조립한다. 자세한 흐름은 [03_Briefing](03_Briefing_예약_카테고리_브리핑.md) 참조.

### PersonalizationMode

```ts
export type PersonalizationMode = 'metadata_only' | 'light_llm_bridge' | 'deep_personalized';
```

### GlobalNewsPool

하루치 공통 뉴스 풀(수집·본문추출·요약·스크립트·TTS를 공통으로 1회 처리한 결과). 예: 오늘 100개.

```ts
export interface GlobalNewsPool {
  id: string;
  date: string;
  contentItemIds: string[]; // 오늘 공통으로 준비된 ContentItem(예: 100개)
  generatedAt: string;
}
```

### UserInterestProfile

개인화의 입력. 관심사·키워드·톤·부정 키워드·행동 이력.

```ts
export interface UserInterestProfile {
  userId: string;
  categories: { name: string; weight: number }[];
  tags: { name: string; weight: number }[];
  negativeTags: string[];
  preferredTone: string;
  preferredDepth: 'short' | 'standard' | 'deep';
  preferredDurationMin: number;
  languages: string[];
  projects: string[];
  savedContentIds: string[];
  skippedContentIds: string[];
  recentlyHeardContentIds: string[];
}
```

### PersonalizedBriefingPlan

같은 GlobalNewsPool에서 사용자별로 만든 브리핑 계획(선택·정렬·재생 큐). 오디오는 공통 것을
재사용한다.

```ts
export interface PersonalizedBriefingPlan {
  id: string;
  userId: string;
  sourcePoolId: string; // GlobalNewsPool.id
  selectedContentIds: string[]; // Global News Pool의 ContentItem 선택
  orderedContentIds: string[]; // 재생 순서(= BriefingSession chapter 큐)
  reasonSummary: string;
  estimatedDurationSec: number;
  personalizationMode: PersonalizationMode; // metadata_only | light_llm_bridge | deep_personalized
  createdAt: string;
}
```

### NewsConnectionEdge

뉴스 사이의 관계(연결 멘트/이어 듣기 근거). 관련 뉴스끼리 묶어 흐름을 만든다.

```ts
export interface NewsConnectionEdge {
  id: string;
  fromNewsItemId: string;
  toNewsItemId: string;
  relationType: string; // 예: same_topic | cause_effect | contrast | follow_up
  strength: number; // 0~1
  explanation: string;
}
```

> 참고: 개인화를 가볍게 하려면 `NewsItem`이 나중에 `tags`/`embedding` 메타데이터를 갖는다(이
> 블록에서 인터페이스 변경은 아직 안 함).

## 외부 소스 수집 (Source Adapter, future)

외부 수집 도구를 **교체 가능하게** 감싸는 인터페이스. Agent Reach 등은 이 인터페이스의 **후보
구현**일 뿐이며, VibeNews core 의존성이 아니다(설계·정책은
[06_ExploreMore](06_ExploreMore_더알아보기.md), 평가는
`docs/구현로그/2026-07-03_agent_reach_evaluation.md`).

```ts
export type SourceKind = 'web' | 'youtube' | 'x' | 'reddit' | 'github' | 'rss' | 'paper' | 'other';

// core는 이 인터페이스에만 의존하고, 실제 수집 도구(어댑터)는 갈아끼운다.
export interface SourceAdapter {
  id: string; // 예: 'native-rss' | 'agent-reach' | ...
  supportedKinds: SourceKind[];
  canHandle(url: string): boolean;
  read(url: string): Promise<NewsItem>;
  search(query: string): Promise<NewsItem[]>;
}
```

> 정책: 특정 수집 도구에 종속 금지. 어댑터는 격리 환경(venv/container)에서만 평가하고, 시스템 변경형
> 자동설치·브라우저 쿠키 접근은 금지.

### Source Ingestion Toolkit 타입 (future)

각 수집 "도구(Tool Adapter)"에 **언제 써도 되는지 정책**을 붙인다. 참고자료:
`docs/구현로그/2026-07-03_source_ingestion_toolkit_reference.md`.

```ts
export type SourceIngestionTool =
  | 'yt-dlp'
  | 'curl'
  | 'vision-ocr'
  | 'tesseract'
  | 'ffmpeg'
  | 'chrome-headless'
  | 'insane-search'
  | 'api'
  | 'manual';

export type SourceRiskLevel = 'low' | 'medium' | 'high';

export type SourceAuthMode = 'none' | 'api_key' | 'oauth' | 'browser_cookie' | 'manual_login';

// 어디까지 써도 되는가
export type SourceAllowedUse = 'production' | 'internal_only' | 'research_only' | 'fallback_only';

// 원문 저장 정책 (원문 전체 저장은 피한다)
export type RawContentStoragePolicy =
  'none' | 'temporary_cache_only' | 'private_internal' | 'allowed_persistent';

export interface SourceAdapterConfig {
  id: string;
  name: string;
  sourceType: 'youtube' | 'web' | 'image' | 'gif' | 'html' | 'rss' | 'github' | 'reddit' | 'x';
  tool: SourceIngestionTool;
  riskLevel: SourceRiskLevel;
  authMode: SourceAuthMode;
  allowedUse: SourceAllowedUse;
  storesRawContent: boolean;
  rawContentPolicy: RawContentStoragePolicy;
}

// OCR 결과 — 숫자/소수점/퍼센트 오류 위험 때문에 human verification 필드를 둔다.
export interface OcrExtractionResult {
  text: string;
  ocrConfidence: number; // 0~1
  needsHumanCheck: boolean;
  numericRisk: SourceRiskLevel; // 숫자 오독 위험 (예: 91.146→91146, 0.05%→005%)
  numbers?: string[]; // 검증 대상 숫자 후보
}

export interface SourceIngestionResult {
  adapterId: string;
  sourceType: SourceAdapterConfig['sourceType'];
  url: string;
  ok: boolean;
  newsItemId?: string;
  ocr?: OcrExtractionResult;
  rawContentPolicy: RawContentStoragePolicy;
  fetchedAt: string;
  error?: string;
}
```

## Content Intelligence 아키텍처 (future)

콘텐츠 하나(`ContentItem`)를 여러 소스에서 만들어 Global News Pool에 넣고, Personal Briefing
Plan으로 조립한다. 참고: `docs/구현로그/2026-07-03_source_taxonomy_and_ingestion_design.md`.

### taxonomy 3축 · 출처/사용 정책

```ts
export type SourceType =
  'youtube' | 'rss' | 'web' | 'github' | 'reddit' | 'x' | 'image' | 'gif' | 'html' | 'manual'; // (초기 SourceKind를 대체하는 정본)

export type ContentKind =
  | 'news'
  | 'analysis'
  | 'tutorial'
  | 'opinion'
  | 'research'
  | 'community_signal'
  | 'github_update'
  | 'product_update'
  | 'product_detail'
  | 'document'
  | 'internal_note';

export type TopicCategory =
  | 'News'
  | 'AI'
  | 'Health'
  | 'Finance'
  | 'K-Beauty'
  | 'Beauty'
  | 'Business'
  | 'Developer'
  | 'Science'
  | 'Lifestyle'
  | 'Internal';

// 출처 노출 정책 (특히 YouTube 채널명 비노출)
export type SourceDisclosurePolicy =
  'internal_only' | 'source_type_only' | 'underlying_sources_only' | 'full_source_visible';

// 어디까지 써도 되는가 (SourceAllowedUse 대체 정본 — 'forbidden' 추가)
export type AllowedUse =
  'production' | 'internal_only' | 'research_only' | 'fallback_only' | 'forbidden';
```

### Entity · TopicCluster · SourceLocator · TranscriptSegment

```ts
export interface Entity {
  id: string;
  name: string;
  kind: 'company' | 'product' | 'person' | 'tool' | 'paper' | 'repo' | 'other';
  importance: number; // 0~1
}

export interface TopicCluster {
  id: string;
  title: string; // "AI 에이전트가 외부 웹을 읽는 흐름"
  date: string;
  contentItemIds: string[];
  topKeywords: string[];
  estimatedDurationMin: number;
}

// timestamp를 모든 소스에 강제하지 않는다. 소스별 위치를 표현.
export interface SourceLocator {
  url: string;
  fetchedAt: string;
  contentHash?: string;
  startSec?: number; // YouTube/영상/오디오 (내부용 — 사용자 노출 X)
  endSec?: number;
  repo?: string; // GitHub
  commitSha?: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  issueNumber?: number;
  pullRequestNumber?: number;
  paragraphIndex?: number; // RSS/Web
  sectionTitle?: string;
  postId?: string; // Reddit/X
  commentId?: string;
}

export interface TranscriptSegment {
  startSec?: number;
  endSec?: number;
  text: string;
}
```

### ContentItem 및 하위 블록 (Content Intelligence JSON)

```ts
export interface ContentItemSource {
  sourceType: SourceType;
  sourceUrl: string;
  sourceVisibility: SourceDisclosurePolicy; // YouTube 기본 source_type_only/underlying_sources_only
  title: string;
  authorOrChannel?: string; // 내부 저장. YouTube 채널명은 기본 비노출
  publishedAt: string | null;
  fetchedAt: string;
  language: string;
  contentHash?: string;
}

export interface ContentTranscript {
  status: 'none' | 'available' | 'generated' | 'failed';
  source: 'caption' | 'auto_sub' | 'whisper' | 'none';
  language: string;
  segments: TranscriptSegment[];
  rawTextStoragePolicy: RawContentStoragePolicy; // 기본 temporary_cache_only
  rawTextExpiresAt: string | null;
}

export interface ContentClaim {
  claim: string;
  evidenceType: 'fact' | 'creator_opinion' | 'prediction' | 'rumor' | 'official_announcement';
  confidence: 'low' | 'medium' | 'high';
}

export interface ContentAnalysis {
  oneLineSummary: string;
  shortSummary: string;
  longSummary: string;
  keyPoints: string[];
  mainClaims: ContentClaim[];
  actionIdeas: string[];
  risksOrCautions: string[];
}

export interface ContentTaxonomy {
  sourceType: SourceType;
  contentKind: ContentKind;
  primaryCategory: TopicCategory; // 1
  secondaryCategories: TopicCategory[]; // ≤2
  topicCluster: string; // TopicCluster.id (1)
  tags: string[]; // 3~8
  entities: Entity[]; // 무제한(+importance)
  audienceFit: string[];
}

export interface AudioScript {
  scriptVersion: number;
  targetDurationSec: number;
  tone: string;
  language: string;
  titleForAudio: string;
  opening: string;
  body: string;
  closing: string;
  fullText: string;
}

export interface AudioAsset {
  provider: 'fish_audio';
  status: 'not_started' | 'generating' | 'generated' | 'failed';
  voiceId: string;
  model: string;
  format: 'mp3' | 'wav' | 'opus';
  audioUrl: string | null;
  storageKey: string | null;
  durationSec: number;
  generatedAt: string | null;
  scriptVersion: number;
}

export interface ContentPersonalizationMeta {
  globalImportanceScore: number;
  recencyScore: number;
  noveltyScore: number;
  evergreenScore: number;
  suitableUserProfiles: string[];
  negativeMatchTags: string[];
}

export interface ContentProcessing {
  status: 'pending' | 'processing' | 'done' | 'failed';
  pipelineVersion: string;
  steps: { name: string; status: string; at: string }[];
  errors: string[];
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  source: ContentItemSource;
  sourceLocators: SourceLocator[];
  transcript: ContentTranscript | null;
  analysis: ContentAnalysis;
  taxonomy: ContentTaxonomy;
  audioScript: AudioScript | null;
  audioAsset: AudioAsset | null;
  personalization: ContentPersonalizationMeta;
  processing: ContentProcessing;
}
```

> 정리: `ContentItem`이 정본 콘텐츠 단위(뉴스/영상/문서/이미지 모두). `NewsItem`/`NewsAudioItem`은
> 스켈레톤 UI용이며, future에 `ContentItem`/`audioAsset`으로 수렴한다. `AllowedUse`는
> `SourceAllowedUse`를, `SourceType`은 `SourceKind`를 대체하는 정본이다.

## 긴 영상 브리핑 (Video Briefing) 타입 (future)

긴 영상을 요약이 아니라 **VideoContentMap → audio briefing → verifier review**로 재구성하기 위한
타입. 전략·기준은 [14_Video_Briefing_Quality_Strategy](14_Video_Briefing_Quality_Strategy.md).

```ts
export type BriefingMode = 'quick' | 'standard' | 'deep';
export type InformationDensity = 'low' | 'medium' | 'high';

export interface VideoSection {
  sectionTitle: string;
  startSec: number;
  endSec: number;
  summary: string;
  keyClaims: string[];
  evidence: string[];
  examples: string[];
  numbers: string[];
  entities: string[];
  importanceScore: number;
  noveltyScore: number;
  keepForBriefing: boolean;
  skipReason: string | null;
}

export interface FactOpinionPredictionSplit {
  facts: string[];
  opinions: string[];
  predictions: string[];
  uncertainClaims: string[];
}

export interface UserRelevance {
  relevantProjects: string[];
  whyItMatters: string;
  possibleActions: string[];
}

export interface BriefingQualityScore {
  thesisAccuracy: number;
  coverage: number;
  evidenceRetention: number;
  specificity: number;
  audioNaturalness: number;
  userRelevance: number;
  cautionBalance: number;
  overallScore: number;
}

export interface VideoContentMap {
  videoId: string;
  title: string;
  totalDurationSec: number;
  coreThesis: string;
  informationDensity: InformationDensity;
  recommendedBriefingMode: BriefingMode;
  recommendedDurationSec: number;
  sections: VideoSection[];
  mustKeepPoints: string[];
  skippablePoints: string[];
  factOpinionPredictionSplit: FactOpinionPredictionSplit;
  userRelevance: UserRelevance;
  qualityScore: BriefingQualityScore;
}

// 파이프라인 단계 정의 (input/output/모델 역할/품질 게이트/실패 모드)
export interface VideoBriefingPipelineStep {
  stepOrder: number;
  name: string;
  input: string;
  output: string;
  modelRole: string; // 예: 'qwen-8b:extraction' | 'deepseek:verify'
  qualityGate: string;
  failureMode: string;
}

export interface VideoBriefingPipeline {
  id: string;
  sourceContentId: string; // ContentItem.id
  transcriptStatus: string;
  chunkingStatus: string;
  contentMapStatus: string;
  audioScriptStatus: string;
  reviewStatus: string;
  ttsStatus: string;
  steps: VideoBriefingPipelineStep[];
  currentStatus: string;
  errors: string[];
}

// DeepSeek(또는 상위 verifier/editor)의 검수 출력
export interface VideoBriefingReview {
  pass: boolean;
  missingPoints: string[];
  distortedClaims: string[];
  overstatements: string[];
  unsupportedClaims: string[];
  needsHumanCheck: boolean;
  numericRisks: string[];
  entityRisks: string[];
  recommendedEdits: string[];
  revisedAudioScript: string | null;
  qualityScore: BriefingQualityScore;
}
```

## 구현 체크리스트

- [ ] `src/data/types.ts` 가 위 정의와 일치
- [ ] `src/data/mockData.ts` 가 위 타입을 사용
- [ ] (future) 개인화 타입
      4종(GlobalNewsPool/UserInterestProfile/PersonalizedBriefingPlan/NewsConnectionEdge) 반영
- [ ] (future) `SourceAdapter` 인터페이스로 수집 도구 추상화(core는 어댑터에 비종속)
- [ ] (future) Content Intelligence
      타입(ContentItem/ContentAnalysis/ContentTaxonomy/AudioScript/AudioAsset/SourceLocator/Entity/TopicCluster)
      반영
