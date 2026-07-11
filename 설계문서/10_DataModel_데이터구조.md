# 10. Data Model · 데이터 구조

## 목적

전 화면이 공유하는 TypeScript 타입을 한곳에 정의한다. 실제 구현은 `src/data/types.ts` 이며, 이
문서와 항상 동기화한다.

## 현재 상태와 정본 범위

기존 화면 skeleton 타입과 `src/data/mockData.ts`는 현재 입력 head의 사실이다. 아래의 기존 client 타입은
아직 연결되지 않은 product 영역의 참고 계약이다. YouTube Add, processing, AudioAsset, automatic queue,
snapshot, playback persistence는 이 문서 마지막의 `YouTube Add · Global Resume MVP 정본`과
[18번 문서](18_YouTube_Add_Global_Resume_MVP.md)가 우선한다. 실제 MVP data를 mock 배열로 표현하거나 raw
caption을 client type에 넣지 않는다.

D-009-A current provider scope는 `public_low_risk_youtube_technology` 하나다. 이 문서의 future
`UserInterestProfile`, `DailyRecap`, personal connection/history field는 현재 DeepSeek/Fish pipeline input이
아니며 연결 edge도 만들지 않는다. Provider policy uncertainty는 아래 exact assurance record로 남기고, local
scope/payload failure와 expanded scope는 provider call 전에 막는다.

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
  audioAssetId: string | null; // opaque private AudioAsset ID; ready 전 null
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
  automaticStatus: 'unheard' | 'in_progress' | 'completed' | 'skipped';
  revision: number;
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
  | 'Skin Care'
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

> `VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001`의 source/derived output은 항상 `internal_only`다. 나머지 값은
> 기존 장기 source policy vocabulary이며 이 MVP의 public/production/fallback 권한이 아니다.

### Entity · TopicCluster · SourceLocator · Caption evidence metadata

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

export interface CaptionEvidenceRef {
  ref: string;
  startMs: number;
  endMs: number;
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

export interface ContentCaptionMetadata {
  status: 'none' | 'temporary_available' | 'deleted' | 'failed';
  source: 'caption' | 'auto_sub' | 'none';
  language: string;
  evidenceRefs: CaptionEvidenceRef[]; // 위치 reference만; text 없음
  artifactSha256: string | null;
  byteCount: number;
  expiresAt: string | null;
  deletedAt: string | null;
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
  status: 'pending' | 'generating' | 'ready' | 'failed' | 'deleted';
  ttsConfigVersion: string; // 실제 model/reference 값이 아닌 nonsecret config version
  format: 'mp3';
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
  captionMetadata: ContentCaptionMetadata | null; // raw caption text는 ContentItem에 없음
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
  modelRole: string; // 이 MVP: 'deepseek:builder' | 'deepseek:verifier'
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
  // 요약↔음성 스크립트 분리 검수 (작업 3/4)
  analyticSummaryCoverage: number; // 분석 요약이 원본 핵심을 얼마나 담았나
  spokenNaturalness: number; // 음성 스크립트가 사람이 읽는 듯 자연스러운가
  summaryToScriptFaithfulness: number; // 요약→스크립트 변환이 의미를 보존했나
  missingFromAudioScript: string[]; // 요약엔 있는데 음성 스크립트에서 빠진 것
  overCompressedPoints: string[]; // 과압축된 포인트
  roboticPhrasing: string[]; // 딱딱한 표현
  needsRewrite: boolean; // 음성용 rewrite 재수행 필요
}
```

## 요약 ↔ 음성 스크립트 분리 (future)

핵심 원칙: **VibeNews는 "요약문을 TTS로 읽는 앱"이 아니다.** 원본을 이해한 뒤(AnalyticSummary),
사람이 읽을 만한 오디오 브리핑(SpokenAudioScript)으로 **다시 써준다**.
`AnalyticSummary ≠ SpokenAudioScript`. 파이프라인:
`transcript → VideoContentMap → AnalyticSummary → BriefingPlan → SpokenAudioScript → Verifier Review → TTS`.
상세는 [14_Video_Briefing_Quality_Strategy](14_Video_Briefing_Quality_Strategy.md).

```ts
// 원본 이해용(딱딱해도 됨). 누락/왜곡 방지 중심.
export interface AnalyticSummary {
  oneLineSummary: string;
  coreThesis: string;
  keyPoints: string[];
  keyClaims: string[];
  evidence: string[];
  examples: string[];
  numbers: string[];
  entities: string[];
  factOpinionPredictionSplit: FactOpinionPredictionSplit;
  risksOrCautions: string[];
}

// 어떻게 들려줄지 계획(선택/순서/전환/연결/주의/마무리).
export interface BriefingPlan {
  targetBriefingMode: BriefingMode;
  targetDurationSec: number;
  openingAngle: string;
  narrativeArc: string;
  selectedSectionIds: string[];
  mustSayPoints: string[];
  skipPoints: string[];
  transitionPlan: string[];
  userConnectionPlan: string;
  cautionPlan: string;
  closingAction: string;
}

// 사람이 읽는 듯한 최종 낭독문(TTS 입력).
export interface SpokenAudioScript {
  scriptVersion: number;
  targetDurationSec: number;
  tone: string;
  language: string;
  titleForAudio: string;
  opening: string;
  body: string;
  transitions: string[];
  caution: string;
  userConnection: string;
  closing: string;
  fullText: string;
  sourceAnalyticSummaryId: string;
  sourceBriefingPlanId: string;
}
```

### 분류 정규화 (Tag Registry)

모델이 만든 태그를 **그대로 쓰지 않고** 정규화한다. `sourceType`은 규칙 기반,
`contentKind`/`topicCategory`는 enum 제한, `topicCluster`/`tags`/`entities`는 모델 생성 후 **Tag
Registry에 매칭**해 정규화한다.

```ts
export interface NormalizedTaxonomy {
  rawGeneratedTags: string[]; // 모델 원본 출력
  normalizedTags: string[]; // Tag Registry 매칭 결과
  taxonomyConfidence: number; // 0~1
  classificationReason: string;
  needsHumanReview: boolean;
}
```

### 콘텐츠 연결 그래프 (ContentConnectionEdge)

`ContentItem`은 나중에 **그래프 노드**로 볼 수 있어야 한다.
Claim·Entity·TopicCluster·Tag·UserProject·Source를 연결한다.

```ts
export type ConnectionRelationType =
  | 'same_topic'
  | 'same_entity'
  | 'supports_claim'
  | 'contradicts_claim'
  | 'contrasts_with'
  | 'relevant_to_project'
  | 'follow_up_to'
  | 'duplicate_or_near_duplicate';

export interface ContentConnectionEdge {
  id: string;
  fromContentId: string;
  toContentId: string;
  relationType: ConnectionRelationType;
  strength: number; // 0~1
  explanation: string;
}
```

### JSON = schema contract (모델 출력물 아님)

Content Intelligence JSON은 **자유 텍스트가 아니라 스키마 계약**이다. 검증 실패 시 retry 또는
failed로 기록하고, raw model output과 normalized output을 구분한다. `audioScript`↔`audioAsset`은
`scriptVersion`으로 연결한다.

```ts
export interface JsonContractMeta {
  schemaVersion: string;
  pipelineVersion: string;
  validationResult: 'valid' | 'invalid' | 'repaired';
  rawModelOutputRef: string | null; // 정규화 전 원본 출력 참조
  normalizedOutputRef: string | null;
  errors: string[]; // processing.errors 와 연동
}
```

## Source Pool & Editorial Curation 타입 (future)

콘텐츠를 어디서 가져오고(Source Pool), MD 지정 소스와 Hot Topic을 어떻게 구분하며, 후보를 어떻게 선별할지.
전략은 [15_Source_Pool_and_Editorial_Curation](15_Source_Pool_and_Editorial_Curation.md).

```ts
export type OwnerType = 'editorial' | 'system' | 'user' | 'internal_project';

export type CandidateReason =
  | 'editorial_source'
  | 'hot_topic'
  | 'user_requested'
  | 'internal_project_relevance'
  | 'recurring_watch';

export interface SourcePool {
  id: string;
  name: string;
  description: string;
  category: TopicCategory;
  subcategories: string[];
  sources: string[]; // EditorialSource.id 등
  enabled: boolean;
  ownerType: OwnerType;
  createdAt: string;
  updatedAt: string;
}

// MD/운영자가 정한 소스(가장 신뢰). 실제 fetch는 future.
export interface EditorialSource {
  id: string;
  name: string;
  sourceType: SourceType;
  url: string;
  category: TopicCategory;
  subcategories: string[];
  defaultTags: string[];
  language: string;
  trustLevel: 'high' | 'medium' | 'low';
  updateFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  priority: 'core' | 'normal' | 'watchlist';
  enabled: boolean;
  notes: string;
}

// 시스템이 감지한 급상승 주제(과장 위험 -> 검수 전 확정 금지).
export interface HotTopic {
  id: string;
  title: string;
  category: TopicCategory;
  subcategory: string;
  tags: string[];
  entities: string[];
  trendScore: number; // sourceCount/recency/diversity/userInterestMatch/editorialPriority/novelty
  sourceCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  candidateSources: string[];
  whyHot: string;
  riskLevel: SourceRiskLevel;
  shouldBrief: boolean;
}

export interface CategoryNode {
  id: string;
  name: string; // TopicCategory 문자열
  description: string;
  subcategories: string[]; // SubcategoryNode.id
  defaultTags: string[];
  riskPolicy: string;
  enabled: boolean;
}

export interface SubcategoryNode {
  id: string;
  parentCategoryId: string;
  name: string; // 예: 'Sleep' | '수면'
  description: string;
  defaultTags: string[];
  exampleTopicClusters: string[];
  enabled: boolean;
}

// Source Pool -> SourceCandidate -> (선별) -> ContentItem
export interface SourceCandidate {
  id: string;
  sourcePoolId: string;
  sourceType: SourceType;
  url: string;
  title: string;
  category: TopicCategory;
  subcategory: string;
  tags: string[];
  entities: string[];
  candidateReason: CandidateReason;
  editorialPriority: 'core' | 'normal' | 'watchlist';
  hotTopicScore: number;
  userInterestScore: number;
  riskLevel: SourceRiskLevel;
  fetchStatus: 'pending' | 'fetching' | 'fetched' | 'skipped' | 'failed';
  selectedForProcessing: boolean;
}

// Source 단계에서 미리 예측하는 품질/위험(처리 여부·방식 결정).
export interface QualityPrediction {
  likelyInformationDensity: InformationDensity;
  likelyBriefingMode: BriefingMode;
  likelyUserValue: number; // 0-1
  likelyRisk: SourceRiskLevel;
  requiresVerifier: boolean;
  requiresHumanReview: boolean;
}
```

## Candidate Review & TTS Approval 타입 (future)

후보 승인 → 처리 → DeepSeek 검수(9/10) → TTS-ready까지의 운영 게이트. 전략:
[16_Candidate_Review_and_TTS_Approval_Pipeline](16_Candidate_Review_and_TTS_Approval_Pipeline.md).

> 아래는 장기 editorial skeleton의 legacy 타입이다. 18번 MVP에서는 이 section의 `pass`/state shape를
> 구현하지 않고 §YouTube Add 정본의 strict Builder/Verifier schemas와 DB enums를 사용한다. 그 MVP의
> `maxAttempts=2`는 Verifier HTTP submission 총 2회이며 Builder revision은 그 사이 최대 1회다.

```ts
export type CandidateApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'needs_more_info'
  | 'auto_rejected'
  | 'processing'
  | 'failed'
  | 'tts_ready';

export type ModelRole =
  | 'deepseek_builder_content_intelligence'
  | 'deepseek_builder_spoken_script'
  | 'deepseek_verifier'
  | 'human_editor';

export type FinalDecision = 'tts_ready' | 'revise_manually' | 'reject' | 'defer';

// approval 전/후를 분리. TTS는 review 통과 후에만.
export type CandidateProcessingState =
  | 'discovered'
  | 'preview_generated'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'fetch_pending'
  | 'fetched'
  | 'content_map_created'
  | 'analytic_summary_created'
  | 'briefing_plan_created'
  | 'spoken_script_created'
  | 'review_pending'
  | 'revision_requested'
  | 'revised_script_created'
  | 'second_review_pending'
  | 'human_review_required'
  | 'tts_ready' // 음성 제작 가능 상태
  | 'tts_generated' // 실제 음성 파일 생성 완료
  | 'failed'
  | 'deleted';

// Admin에 표시되는 승인용 미리보기(최종 요약 아님).
export interface CandidatePreview {
  id: string;
  sourceCandidateId: string;
  title: string;
  sourceName: string;
  sourceType: SourceType;
  url: string;
  publishedAt: string | null;
  category: TopicCategory;
  subcategory: string;
  tags: string[];
  entities: string[];
  recommendationReason: string;
  shortSummary: string; // legacy preview field; MVP provider output은 strict Builder schema 사용
  whyItMatters: string;
  likelyInformationDensity: InformationDensity;
  likelyBriefingMode: BriefingMode;
  estimatedBriefingDurationSec: number;
  sourceTrustLevel: 'high' | 'medium' | 'low';
  editorialPriority: 'core' | 'normal' | 'watchlist';
  hotTopicScore: number;
  userInterestScore: number;
  duplicateRisk: number;
  freshnessScore: number;
  riskLevel: SourceRiskLevel;
  requiresVerifier: boolean;
  requiresHumanReview: boolean;
  candidateScore: number;
  approvalStatus: CandidateApprovalStatus;
  rejectionReason: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
}

// DeepSeek 검수 rubric (각 0-10 또는 weight). overallScore >= 9.0 이면 통과.
export interface DeepSeekReviewRubric {
  coverage: number;
  faithfulness: number;
  specificity: number;
  structure: number;
  spokenNaturalness: number;
  cautionBalance: number;
  userRelevance: number;
  ttsReadiness: number;
  overallScore: number;
}

export interface DeepSeekReviewResult {
  id: string;
  contentItemId: string;
  scriptVersion: number;
  attemptNumber: number; // 1 또는 2 (max 2)
  pass: boolean;
  overallScore: number;
  rubric: DeepSeekReviewRubric;
  criticalErrors: string[];
  missingPoints: string[];
  distortedClaims: string[];
  unsupportedClaims: string[];
  overCompressedPoints: string[];
  roboticPhrasing: string[];
  ttsReadinessIssues: string[];
  recommendedEdits: string[];
  revisedSuggestion: string | null;
  requiresHumanReview: boolean;
  reviewedAt: string;
}

// legacy future shape. MVP는 Verifier submission 총 2회, Builder revision 최대 1회.
export interface ReviewLoopState {
  id: string;
  contentItemId: string;
  currentAttempt: number;
  maxAttempts: number; // 2
  status:
    | 'draft_script_created'
    | 'review_pending'
    | 'review_passed'
    | 'review_failed'
    | 'revision_requested'
    | 'revision_created'
    | 'second_review_pending'
    | 'human_review_required'
    | 'tts_ready'
    | 'tts_generated'
    | 'deleted';
  reviewResults: DeepSeekReviewResult[];
  finalDecision: FinalDecision | null;
  humanReviewer: string | null;
  humanDecisionReason: string | null;
}
```

## YouTube Add · Global Resume MVP 정본

### 저장소와 소유권

- Server SQLite가 source, approval, pipeline, derived content/audio, queue eligibility, immutable session
  membership, canonical playback revision의 정본이다.
- Device Expo SQLite는 한 device의 immediate checkpoint/cache/outbox다. server와 충돌하면 versioned
  mutation 규칙으로 reconcile한다.
- SecureStore는 opaque device bearer token만 저장한다. playback data의 정본이 아니다.
- Raw caption은 server temp file에만 있고 DB/client/API/event/backup type이 없다.

### enum

```ts
export type AutomaticPlaybackStatus = 'unheard' | 'in_progress' | 'completed' | 'skipped';
export type JobState =
  | 'queued'
  | 'captioning'
  | 'building'
  | 'verifying'
  | 'tts_queued'
  | 'synthesizing'
  | 'audio_ready'
  | 'deferred'
  | 'human_review_required'
  | 'failed'
  | 'canceled'
  | 'deleted';
export type DeferReason =
  | 'daily_tts_cap'
  | 'channel_poll_cap'
  | 'approval_revoked'
  | 'lease_recovery'
  | 'retry_backoff'
  | 'worker_unavailable'
  | 'active_content_correction';
export type SessionStatus = 'active' | 'interrupted' | 'completed';
export type AudioAssetStatus = 'pending' | 'generating' | 'ready' | 'failed' | 'deleted';
export type TtsGenerationReceiptStatus =
  | 'requested'
  | 'outcome_unknown'
  | 'provider_failed'
  | 'generated'
  | 'staged'
  | 'finalized'
  | 'storage_failed'
  | 'reconciled';
export type ContentItemState =
  | 'built'
  | 'verified'
  | 'human_review_required'
  | 'audio_pending'
  | 'audio_ready'
  | 'failed'
  | 'deleted';
export type ProviderAttemptStatus = 'started' | 'succeeded' | 'failed' | 'timed_out';
export type ProviderAttemptSubstage =
  | 'caption'
  | 'builder_chunk'
  | 'builder_aggregate'
  | 'verifier'
  | 'tts';
export type ProviderName = 'deepseek' | 'fish_audio';
export type ProviderRole = 'deepseek_builder' | 'deepseek_verifier' | 'fish_tts';
export type SourceScope = 'public_low_risk_youtube_technology';
export type ScopeApprovalStatus = 'active' | 'revoked' | 'superseded';
export type ExpandedScopeReason =
  | 'private_or_user_uploaded_document'
  | 'internal_company_data'
  | 'personal_conversation_or_memory'
  | 'personal_data_health_finance_legal_or_election'
  | 'children_or_biometric_data'
  | 'multi_user_production'
  | 'public_commercial_launch'
  | 'third_party_customer_content'
  | 'confidential_or_regulated_information'
  | 'scope_ambiguous';
export type ProviderPayloadGuardOutcome =
  | 'allowed'
  | 'scope_review_required'
  | 'payload_rejected'
  | 'runtime_binding_rejected';
export type ProviderPolicyLookupStatus = 'retrieved' | 'unavailable' | 'changed_since_review';
export type ProviderPublicStatementCode =
  | 'INPUT_COLLECTED'
  | 'SERVICE_IMPROVEMENT_OR_TRAINING_STATED'
  | 'OPT_OUT_RIGHT_STATED'
  | 'DELETION_RIGHT_STATED'
  | 'PURPOSE_BUSINESS_LEGAL_RETENTION_STATED'
  | 'DOWNSTREAM_APP_PROCESSING_NOT_COVERED'
  | 'USER_CONTENT_COLLECTED'
  | 'RESEARCH_ANALYTICS_PRODUCT_DEVELOPMENT_STATED'
  | 'SYSTEM_NEED_RETENTION_STATED'
  | 'FREE_TIER_MODEL_IMPROVEMENT_STATED';
export type VerifiedLocalControlCode =
  | 'VERSIONED_SCOPE_ATTESTATION'
  | 'PRE_PROVIDER_PAYLOAD_ALLOWLIST'
  | 'NO_RAW_PROVIDER_BODY_LOG'
  | 'EPHEMERAL_CAPTION_LOCAL_DELETION';
export type UnverifiedProviderControlCode =
  | 'CONFIGURED_ACCOUNT_NO_TRAINING_EFFECT'
  | 'CONFIGURED_ACCOUNT_OPT_OUT_EFFECT'
  | 'PROVIDER_RETENTION_WINDOW'
  | 'PROVIDER_SIDE_DELETION'
  | 'CONFIGURED_TIER';
export type ProviderPolicyAssurance = 'LIMITED_AND_UNVERIFIED';
export type LocalDataControls = 'VERIFIED';
export type ProviderSideDeletion = 'NOT_VERIFIED';
export type ProviderSideNoTraining = 'NOT_VERIFIED';
export type ProductionPrivacyApproval = 'NOT_GRANTED';
export type CaptionArtifactDeleteStatus = 'pending' | 'deleted' | 'overdue' | 'failed';
export type PlaybackMode = 'automatic' | 'manual_replay';
```

### D-009-A provider evidence types

```ts
export interface ProviderScopeApproval {
  id: string;
  userId: 'leo';
  originKind: 'manual_batch' | 'channel';
  manualBatchId: string | null;
  channelId: string | null; // exactly one is non-null and matches originKind
  approvalVersion: number;
  sourceScope: SourceScope;
  attestationVersion: 'd009a.public-youtube-tech.v1';
  status: ScopeApprovalStatus;
  approvedAt: string;
  revokedAt: string | null;
}

export interface ProviderPolicySnapshot {
  id: string;
  provider: ProviderName;
  officialPolicyUrls: string[];
  officialApiUrl: string;
  publicApiSurfaceId: 'deepseek.post.chat-completions' | 'fish.post.v1.tts';
  policyEffectiveOrUpdatedDate: string;
  reviewedAt: string;
  documentSetSha256: string | null;
  lookupStatus: ProviderPolicyLookupStatus;
  publicStatementCodes: ProviderPublicStatementCode[];
  verifiedLocalControlCodes: VerifiedLocalControlCode[];
  controlsNotIndependentlyVerified: UnverifiedProviderControlCode[];
  providerPolicyAssurance: ProviderPolicyAssurance;
  localDataControls: LocalDataControls;
  providerSideDeletion: ProviderSideDeletion;
  providerSideNoTraining: ProviderSideNoTraining;
  productionPrivacyApproval: ProductionPrivacyApproval;
}

export interface ProviderRuntimeBinding {
  id: string;
  providerRole: ProviderRole;
  publicApiSurfaceId: 'deepseek.post.chat-completions' | 'fish.post.v1.tts';
  auditKeyId: 'provider-audit-hmac-v1';
  endpointOriginHmac: string;
  modelSelectorHmac: string;
  reasoningSelectorHmac: string | null;
  referenceSelectorHmac: string | null;
  configVersionHash: string;
  credentialPresent: true;
  verifiedAt: string;
}

export interface ProviderPayloadAudit {
  id: string;
  jobId: string;
  providerRole: ProviderRole;
  providerAttemptId: string | null; // pre-network block이면 null
  guardVersion: 'provider-payload-guard.v1';
  scopeAttestationVersion: 'd009a.public-youtube-tech.v1';
  outcome: ProviderPayloadGuardOutcome;
  recursiveFieldNames: string[]; // sorted names only; values/text/body 금지
  semanticPayloadBytes: number | null; // allowed only
  semanticPayloadSha256: string | null; // allowed only
  forbiddenFieldCount: number;
  expandedScopeReason: ExpandedScopeReason | null;
  checkOrdinal: number;
  checkedAt: string;
}
```

Policy snapshot의 exact labels는 바꿀 수 없다. `VERIFIED`는 local scope/allowlist/log/deletion test만 뜻하고
provider-side retention/training/deletion 또는 production compliance를 뜻하지 않는다. Public policy document-set
hash/URL/date/statement codes는 versioned public fields다. Runtime endpoint/model/reasoning/reference는 raw value가
아니라 server-only audit key로 만든 role-tagged HMAC만 DB에 두며 key/original은 Git·DB·log·result에 없다.
Key의 exact boundary는 `/var/lib/vibenews-dev/private/provider-audit-hmac-v1.key` (`0700` parent, `0600` file)고
DB에는 safe `auditKeyId`만 둔다. Existing binding 뒤 key missing/mode mismatch는 overwrite가 아니라 readiness
failure다.
Migration은 public seed constants와 schema만 포함한다. Runtime-local control preflight가 실제 통과하기 전에는
exact-label snapshot/assurance event를 insert하지 않으며 실패 시 `VERIFIED`를 기록하지 않고 call을 막는다.
Payload bytes/hash는 `allowed`에만 non-null이다. Scope/payload/runtime rejection은 attempt와 bytes/hash를 null로
두고 safe field names/count/reason만 남기므로 rejected private content의 hash도 보존하지 않는다.

### authoritative entity map

| Entity/table | 정본 field/constraint |
| --- | --- |
| User | fixed `id='leo'`, `timezone='Asia/Seoul'` |
| ManualBatch | user, status, explicit `approvedAt`, idempotency key; matching active ProviderScopeApproval references it; 1~10 item |
| ManualBatchItem | ordinal, raw input SHA-256, nullable safe canonical URL/video ID, independent status/safe error; raw submitted URL 미보존 |
| Channel | stable YouTube channel ID, canonical URL, ON/OFF standing approval + version, poll cursor/due, tombstone; matching active ProviderScopeApproval references it; user당 non-deleted 최대 5 |
| ProviderScopeApproval | exactly one manual-batch/channel FK, exact source scope + attestation/approval version, active/revoked/superseded status; source text 없음 |
| ChannelDiscovery | channel/video unique, published/seen, discovered/deferred/queued/revoked state; limit hit 보존 |
| SourceVideo | unique video ID, channel ID, public metadata, duration, caption metadata/provenance; original media 없음 |
| ProcessingJob | source/scope-approval FKs, exactly one manual-item/channel-discovery origin FK, approval version, stage/state, eligible/defer, verifier count 0..2, lease/idempotency/error |
| ProviderPolicySnapshot | provider + official URLs/public API surface/date/review/document-set hash/lookup status, statement/local/unverified codes, exact five labels; public facts only |
| ProviderRuntimeBinding | role + public API surface + endpoint/model/reasoning/reference HMACs/config hash/credential-presence/verified time; actual values 없음 |
| ProviderAttempt | macro stage + exact substage + ordinal (`builder_chunk` 1..20, 나머지 0) + logical submission 1..2, separate prompt/schema/config version hashes, request/output hash + scope FK; DeepSeek/Fish에는 policy/runtime FK mandatory, local caption에는 null; raw body 없음 |
| ProviderPayloadAudit | job/role, nullable attempt, guard/attestation versions, outcome, sorted field names/bytes/hash/forbidden count/reason; value/body/text 없음 |
| TemporaryCaptionArtifact | relative temp key, hash/bytes/language/kind, create/expire/delete; expire <= create+24h |
| ContentItem | user/source unique, parsed Builder/Verifier versions/hashes, taxonomy, correction/tombstone, `audioReadyAt` |
| Category/Subcategory | stable slug/name hierarchy and FKs |
| TopicCluster/Tag/Entity | normalized unique vocabularies plus ContentItem join tables |
| AudioAsset | ContentItem FK unique, pending->generating->ready/failed/deleted, opaque storage key/hash/duration; exactly one per non-deleted ContentItem |
| TtsGenerationReceipt | unique job/provider idempotency receipt, local day, reservation/outcome/hash/bytes/duration/staging status; uncertain outcome은 예약 유지, valid response만 success count |
| PlaybackItem | `(user,content)`, four-state status, position/duration/manual counts/revision/timestamps |
| GlobalPlaybackState | one row per user, nullable unique active content/session, position/revision |
| BriefingSession | entry metadata, device run, snapshot time/status |
| BriefingSessionItem | immutable `(session,ordinal,content)` membership/order, snapshot state/ready time |
| PlaybackMutation | globally unique client mutation ID, device run + monotonic sequence, base/applied revision, action/position |
| DailyTtsUsage | `(user,Asia/Seoul localDate)`, reserved + successful <=10; valid response만 successful, uncertain은 reserved |
| WorkerSingleton | fixed lease owner/expiry/heartbeat, concurrency 1 |
| AuditEvent | safe type/entity/status metadata only |

모든 row는 UTC `createdAt/updatedAt`을 가지며 terminal/tombstone entity는 해당 timestamp를 추가한다.
정확한 SQL field, FK, index, partial unique, migration은
[18번 §8](18_YouTube_Add_Global_Resume_MVP.md#8-server-domaindata-model)을 그대로 구현한다.

### Builder/Verifier schema ownership

Builder와 Verifier는 generic `modelRole` 문자열로 합치지 않는다.

- `builder.chunk.youtube-mvp.v1` + `builder-chunk-output.v1`
- `builder.aggregate.youtube-mvp.v1` + `builder-output.v1`
- `verifier.youtube-mvp.v1` + `verifier-output.v1`
- BuilderOutput: derived title/summary, taxonomy, evidence-ref claims/numbers, Korean audioScript segments
- VerifierOutput: verdict, overallScore, five dimension scores, criticalFailures, evidence-ref findings
- server PASS: score >=9.0 AND critical failure 0 AND model verdict PASS
- ProviderAttempt unique `(job,substage,ordinal,logicalAttempt)`; 각 Builder chunk가 충돌 없이 독립 기록되고
  Verifier logical attempt 총합은 최대 2
- Builder chunk는 required public caption text/evidence/public metadata만, aggregate/revision은 strict generated
  outputs/public metadata/allowlisted finding refs만, Verifier는 candidate/public evidence pack만 사용한다.
- Current MVP의 `UserInterestProfile`, ListeningHistory, DailyRecap, notes/conversation/private project context는
  provider graph와 FK가 없다. Fish wire payload는 final approved SpokenAudioScript, configured reference identifier,
  minimum synthesis parameters만이고 VideoContentMap/AnalyticSummary/raw transcript/app ID/secret는 없다.

Provider model/reference의 실제 값과 raw caption/provider body는 schema field가 아니다.

### automatic playback invariant

```text
one user -> at most one active in_progress ContentItem
completed/skipped -> automatic eligibility false everywhere
manual replay -> AutomaticPlaybackStatus unchanged
new session order -> active in_progress first, then unheard by audioReadyAt,id
session membership/order -> immutable
post-snapshot audio_ready -> excluded until a new session
```

- unheard -> in_progress: native player가 실제 `playing=true`일 때
- in_progress -> completed: native `didJustFinish` mutation일 때
- unheard/in_progress -> skipped: explicit user skip일 때
- pause/seek/exit은 in_progress를 유지하고 position만 update한다.
- 경과 시간 임계값은 상태 전이나 제외 조건이 아니다.

### transaction/index minimum

- batch/item, channel count+insert, poll claim+3 promotions, TTS reservation/provider-success receipt materialized
  counts/finalize, session snapshot,
  playback mutation은 모두 immediate write transaction이다.
- Manual batch submit과 channel ON은 matching scope approval을 같은 transaction에서 만들고, OFF/delete는
  revoke한다. Provider claim은 job approval version과 active scope row를 다시 확인한 뒤 guard/audit까지
  transactionally 예약하며 실패하면 network attempt row를 만들지 않는다.
- unique: video ID, active channel per user/channel ID, job/API idempotency, ContentItem user/source,
  AudioAsset content, session/content, client mutation; active scope origin/version; provider role/config version;
  provider payload `(job,role,checkOrdinal)`과 non-null attempt.
- claim index: job `(state,eligibleAt,createdAt)`, channel `(status,nextPollAt)`, lease expiry.
- evidence index: policy `(provider,lookupStatus,reviewedAt)`, runtime binding `verifiedAt`, payload audit
  `(outcome,checkedAt)`; every actual DeepSeek/Fish attempt has policy/runtime/scope FKs and one allowed payload audit.
- queue index: ContentItem `(user,audioReadyAt,id)`, PlaybackItem `(user,status)` and unique partial `(user)` where
  status is in_progress.
- limits는 CHECK + service transaction 둘 다 검증하고 hit는 `deferred`로 보존한다.

## 구현 체크리스트

- [ ] `src/data/types.ts` 가 위 정의와 일치
- [ ] `src/data/mockData.ts` 가 위 타입을 사용
- [ ] (future) 개인화 타입
      4종(GlobalNewsPool/UserInterestProfile/PersonalizedBriefingPlan/NewsConnectionEdge) 반영
- [ ] (future) `SourceAdapter` 인터페이스로 수집 도구 추상화(core는 어댑터에 비종속)
- [ ] (future) Content Intelligence
      타입(ContentItem/ContentAnalysis/ContentTaxonomy/AudioScript/AudioAsset/SourceLocator/Entity/TopicCluster)
      반영
- [ ] Server migration이 MVP entity/FK/unique/index/CHECK와 일치
- [ ] Device migration이 playback journal/outbox/revision을 app restart 뒤 보존
- [ ] Exactly-one TTS receipt/count per provider success, exactly-one AudioAsset, verifier max-2, daily max-10,
      single active invariant 검증
- [ ] Raw caption/original media/secret/provider actual value field가 schema에 없음
- [ ] DeepSeek/Fish policy snapshot이 official URL/date/review/API surface/public statement/local/unverified codes와
      exact five assurance labels를 보존하고 raw configured values는 role HMAC binding으로만 증명
- [ ] Active current-scope approval + pre-provider payload audit 없이는 network attempt가 없고, expanded/ambiguous
      scope는 null attempt audit 뒤 `SCOPE_ESCALATION_REQUIRED`
- [ ] DeepSeek aggregate에 user preference/history가 없고 Fish payload에 raw transcript, VideoContentMap,
      AnalyticSummary, private user data, credentials/secrets가 없음을 schema/test로 검증
