# 10. Data Model · 데이터 구조

## 목적
전 화면이 공유하는 TypeScript 타입을 한곳에 정의한다.
실제 구현은 `src/data/types.ts` 이며, 이 문서와 항상 동기화한다.

## 현재 상태
**mock** — 타입은 확정, 데이터는 `src/data/mockData.ts` 의 하드코딩 값이다.

## 타입 정의
> 아래 코드블록은 그대로 복사해 `src/data/types.ts` 로 옮길 수 있는 형태다.
> 각 타입은 한 섹션에 하나씩 둔다.

### 공통 타입 (유니온 / 별칭)

```ts
export type KnowledgeType = 'Fact' | 'Trend' | 'Insight' | 'Action' | 'Question';

export type FoundationStatus =
  | 'local_only'
  | 'candidate'
  | 'approved_for_foundation'
  | 'synced_to_foundation'
  | 'rejected';

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

## 구현 체크리스트
- [ ] `src/data/types.ts` 가 위 정의와 일치
- [ ] `src/data/mockData.ts` 가 위 타입을 사용
