// VibeNews 데이터 타입 정의
// 설계문서: 설계문서/10_DataModel_데이터구조.md 와 동기화한다.

export type KnowledgeType = 'Fact' | 'Trend' | 'Insight' | 'Action' | 'Question';

export type FoundationStatus =
  'local_only' | 'candidate' | 'approved_for_foundation' | 'synced_to_foundation' | 'rejected';

export type RepeatMode = 'none' | 'one' | 'all';

export type ContentStatus = 'mock' | 'partial' | 'working' | 'future';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'completed' | 'error';

export interface Category {
  id: string;
  name: string;
  preparedItemCount: number;
  estimatedDurationMin: number;
  topKeywords: string[];
  lastUpdatedAt: string;
  hasNewItems: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  categoryId: string;
  shortSummary: string;
  sourceMetaIds: string[];
  createdAt: string;
}

export interface NewsAudioItem {
  id: string;
  newsItemId: string;
  briefingSessionId: string;
  title: string;
  categoryId: string;
  durationSec: number;
  audioUrl: string | null;
  transcript: string | null; // 재생 화면엔 노출하지 않음
  shortSummary: string;
  chapterIndex: number;
  isCompleted: boolean;
  isSaved: boolean;
  listenedAt: string | null;
}

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

export interface PlaybackState {
  sessionId: string;
  currentNewsAudioItemId: string;
  currentChapterIndex: number;
  currentPositionSec: number;
  durationSec: number;
  isPlaying: boolean;
  status: PlaybackStatus;
  repeatMode: RepeatMode;
  sessionCompleted: boolean;
  usingFallbackAudio: boolean;
  updatedAt: string;
}

export interface ScheduledBriefing {
  id: string;
  categoryIds: string[];
  timeOfDay: string; // "07:00"
  daysOfWeek: number[]; // 0-6
  lengthMin: number; // 기본 10
  enabled: boolean;
}

export interface ListeningHistory {
  id: string;
  newsAudioItemId: string;
  listenedAt: string;
  completed: boolean;
}

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

export interface RecapCard {
  id: string;
  recapId: string;
  knowledgeType: KnowledgeType;
  text: string;
}

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

export interface ProductRecommendation {
  id: string;
  name: string;
  imageUrl: string | null;
  reasonKeywords: string[];
  reasonText: string; // 안전 표현만 (치료/예방/복용 단정 금지)
  relatedCategoryId: string;
}

export interface VoiceCommand {
  id: string;
  phrase: string;
  intent: string;
  status: ContentStatus;
}

export interface SourceMeta {
  id: string;
  type: 'web' | 'youtube' | 'x' | 'reddit' | 'github' | 'paper' | 'other';
  title: string;
  url: string; // 내부 메타. UX는 클릭 비의존
  publishedAt: string | null;
}

export interface EventLog {
  id: string;
  event: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
