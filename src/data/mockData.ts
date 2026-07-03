// VibeNews mock 데이터 (skeleton 단계)
// 실제 수집/AI/TTS 없이 화면을 채우기 위한 하드코딩 값.
import type {
  BriefingSession,
  Category,
  DailyRecap,
  ExploreMore,
  KnowledgeCandidate,
  NewsAudioItem,
  ProductRecommendation,
  SavedCard,
  ScheduledBriefing,
  SourceMeta,
  VoiceCommand,
} from './types';

export const USER_NAME = 'Leo';

export const categories: Category[] = [
  { id: 'ai', name: 'AI', preparedItemCount: 7, estimatedDurationMin: 10, topKeywords: ['Agent', 'Browser', 'Claude'], lastUpdatedAt: '2026-07-03T06:00:00+09:00', hasNewItems: true },
  { id: 'health', name: '건강', preparedItemCount: 4, estimatedDurationMin: 6, topKeywords: ['수면', '단백질', '혈당'], lastUpdatedAt: '2026-07-03T06:00:00+09:00', hasNewItems: true },
  { id: 'invest', name: '투자', preparedItemCount: 3, estimatedDurationMin: 5, topKeywords: ['금리', 'AI반도체', 'ETF'], lastUpdatedAt: '2026-07-03T06:00:00+09:00', hasNewItems: false },
  { id: 'kbeauty', name: 'K-Beauty', preparedItemCount: 4, estimatedDurationMin: 6, topKeywords: ['선케어', '더마', '수출'], lastUpdatedAt: '2026-07-03T06:00:00+09:00', hasNewItems: true },
  { id: 'beauty', name: '뷰티', preparedItemCount: 2, estimatedDurationMin: 3, topKeywords: ['성분', '루틴'], lastUpdatedAt: '2026-07-03T06:00:00+09:00', hasNewItems: false },
  { id: 'biz', name: '비즈니스', preparedItemCount: 2, estimatedDurationMin: 4, topKeywords: ['스타트업', 'M&A'], lastUpdatedAt: '2026-07-03T06:00:00+09:00', hasNewItems: false },
];

export const TODAY_TOTAL_ITEMS = categories.reduce((s, c) => s + c.preparedItemCount, 0);
export const TODAY_TOTAL_MINUTES = categories.reduce((s, c) => s + c.estimatedDurationMin, 0);

export const sourceMetas: SourceMeta[] = [
  { id: 'sm1', type: 'x', title: 'Loop Engineering 반응 스레드', url: 'https://x.com/example/status/1', publishedAt: '2026-07-02T12:00:00+09:00' },
  { id: 'sm2', type: 'youtube', title: 'Anthropic 다큐 요약', url: 'https://youtube.com/watch?v=example', publishedAt: '2026-07-01T09:00:00+09:00' },
  { id: 'sm3', type: 'github', title: 'agent-reach repo', url: 'https://github.com/Panniantong/agent-reach', publishedAt: '2026-06-30T00:00:00+09:00' },
  { id: 'sm4', type: 'web', title: '건강 기사', url: 'https://example.com/health', publishedAt: '2026-07-02T08:00:00+09:00' },
];

export const todaySession: BriefingSession = {
  id: 'bs-today',
  title: '오늘의 브리핑',
  date: '2026-07-03',
  categoryIds: ['ai', 'health', 'invest', 'kbeauty'],
  totalDurationSec: TODAY_TOTAL_MINUTES * 60,
  currentChapterIndex: 0,
  newsAudioItemIds: ['na1', 'na2', 'na3', 'na4', 'na5', 'na6', 'na7'],
  createdAt: '2026-07-03T06:00:00+09:00',
};

export const newsAudioItems: NewsAudioItem[] = [
  { id: 'na1', newsItemId: 'ni1', briefingSessionId: 'bs-today', title: 'AI 에이전트가 브라우저를 직접 조작하기 시작했다', categoryId: 'ai', durationSec: 95, audioUrl: null, transcript: null, shortSummary: '에이전트가 API 없이 웹을 직접 읽고 조작하는 흐름이 커진다.', chapterIndex: 0, isCompleted: false, isSaved: false, listenedAt: null },
  { id: 'na2', newsItemId: 'ni2', briefingSessionId: 'bs-today', title: 'Loop Engineering이 프롬프트 엔지니어링의 다음 단계로', categoryId: 'ai', durationSec: 88, audioUrl: null, transcript: null, shortSummary: '검증(verification)이 오케스트레이션보다 뜨거운 주제로 떠올랐다.', chapterIndex: 1, isCompleted: false, isSaved: false, listenedAt: null },
  { id: 'na3', newsItemId: 'ni3', briefingSessionId: 'bs-today', title: 'Claude 계열 모델 활용 사례 확산', categoryId: 'ai', durationSec: 76, audioUrl: null, transcript: null, shortSummary: '개발 워크플로에 에이전트를 붙이는 사례가 늘고 있다.', chapterIndex: 2, isCompleted: false, isSaved: false, listenedAt: null },
  { id: 'na4', newsItemId: 'ni4', briefingSessionId: 'bs-today', title: '수면과 혈당 관리의 연결고리', categoryId: 'health', durationSec: 70, audioUrl: null, transcript: null, shortSummary: '수면 부족이 다음 날 혈당 반응에 영향을 준다는 연구.', chapterIndex: 3, isCompleted: false, isSaved: false, listenedAt: null },
  { id: 'na5', newsItemId: 'ni5', briefingSessionId: 'bs-today', title: '단백질 섭취 타이밍 논의', categoryId: 'health', durationSec: 65, audioUrl: null, transcript: null, shortSummary: '총량이 타이밍보다 중요하다는 관점이 우세.', chapterIndex: 4, isCompleted: false, isSaved: false, listenedAt: null },
  { id: 'na6', newsItemId: 'ni6', briefingSessionId: 'bs-today', title: 'AI 반도체 수요와 금리 전망', categoryId: 'invest', durationSec: 82, audioUrl: null, transcript: null, shortSummary: 'AI 투자 사이클이 반도체 수요를 끌어올리는 중.', chapterIndex: 5, isCompleted: false, isSaved: false, listenedAt: null },
  { id: 'na7', newsItemId: 'ni7', briefingSessionId: 'bs-today', title: 'K-Beauty 선케어 수출 증가', categoryId: 'kbeauty', durationSec: 60, audioUrl: null, transcript: null, shortSummary: '더마·선케어 카테고리 수출이 두 자릿수 성장.', chapterIndex: 6, isCompleted: false, isSaved: false, listenedAt: null },
];

export const scheduledBriefings: ScheduledBriefing[] = [
  { id: 'sched1', categoryIds: ['ai', 'health', 'invest'], timeOfDay: '07:00', daysOfWeek: [1, 2, 3, 4, 5], lengthMin: 10, enabled: true },
];

export const todayRecap: DailyRecap = {
  id: 'recap-today',
  userId: 'leo',
  date: '2026-07-03',
  timezone: 'Asia/Seoul',
  summary: '오늘은 AI 에이전트의 실제 인터넷 접근과 Loop Engineering 논의가 중심이었고, 건강·투자·K-Beauty 흐름이 함께 잡혔다.',
  keyTrends: [
    'AI 에이전트가 API 없이 웹을 직접 읽는 방향',
    '검증(verification)이 오케스트레이션보다 뜨거운 주제',
    'AI 투자 사이클이 반도체 수요를 견인',
    'K-Beauty 선케어 수출 성장',
    '수면-혈당 연결 등 생활 밀착 건강 정보',
  ],
  repeatedKeywords: ['Agent', 'Verification', 'Claude', '혈당', '수출'],
  categoryHighlights: [
    { categoryId: 'ai', text: '에이전트의 실제 웹 접근이 핵심 화두.' },
    { categoryId: 'health', text: '수면과 혈당의 연결이 반복 언급.' },
  ],
  personalConnections: ['VibeNews의 본문 추출 백엔드 설계와 직접 연결되는 흐름.'],
  sourcesToReview: ['agent-reach repo', 'Loop Engineering X 스레드'],
  actionIdeas: ['본문 추출 후보로 agent-reach 소규모 검증 진행'],
  mustNotMissItems: ['에이전트 웹 접근 흐름'],
  followUpQuestions: ['자동화가 어려운 채널(X/인스타)은 어떻게 우회할까?'],
  generatedAt: '2026-07-03T23:00:00+09:00',
};

// 화면의 "오늘" 기준(mock). 시간 필터가 결정적으로 동작하도록 고정값 사용.
export const TODAY = '2026-07-03';

export const savedCards: SavedCard[] = [
  { id: 'sc1', title: '에이전트의 실제 웹 접근', categoryId: 'ai', knowledgeType: 'Trend', knowledgeText: '에이전트가 API 키 없이 웹/유튜브/커뮤니티를 직접 읽는 방향으로 이동 중.', summary: '접근 경로가 막히면 다른 경로로 우회하는 라우팅이 관건.', sourceMetaIds: ['sm3', 'sm1'], savedAt: '2026-07-03T07:10:00+09:00', foundationStatus: 'candidate', relatedProjectIds: ['vibenews'] },
  { id: 'sc2', title: 'Loop Engineering 핵심', categoryId: 'ai', knowledgeType: 'Insight', knowledgeText: '검증이 병목이자 차별점. 오케스트레이션보다 검증 설계가 중요해진다.', summary: '반응은 열광과 회의가 공존.', sourceMetaIds: ['sm1'], savedAt: '2026-07-03T07:12:00+09:00', foundationStatus: 'local_only', relatedProjectIds: [] },
  { id: 'sc3', title: '수면-혈당 연결', categoryId: 'health', knowledgeType: 'Fact', knowledgeText: '수면 부족이 다음 날 혈당 반응을 악화시킬 수 있다.', summary: '생활 습관 관점에서 반복 언급.', sourceMetaIds: ['sm4'], savedAt: '2026-07-01T07:15:00+09:00', foundationStatus: 'synced_to_foundation', relatedProjectIds: [] },
  { id: 'sc4', title: 'K-Beauty 선케어 수출', categoryId: 'kbeauty', knowledgeType: 'Trend', knowledgeText: '더마·선케어 카테고리 수출이 두 자릿수 성장세.', summary: '개인화 상품 추천과 연결 여지.', sourceMetaIds: [], savedAt: '2026-06-20T07:20:00+09:00', foundationStatus: 'local_only', relatedProjectIds: [] },
];

export const exploreMores: ExploreMore[] = [
  {
    id: 'em1',
    newsItemId: 'ni1',
    keyConclusion: '에이전트가 세상을 재료로 쓰기 시작했다. 핵심은 접근이 아니라 "막혔을 때 우회"다.',
    recurringThemes: ['API 없는 접근', '셀프 힐링 라우팅', '브라우저 자동화'],
    perspectives: [
      { label: '열광', text: '추상화의 다음 단계, 진짜 격차.' },
      { label: '회의', text: '비용·토큰 폭탄, 리브랜딩에 불과.' },
    ],
    certainFacts: ['yt-dlp, Jina Reader 등 검증된 도구를 묶는 접근'],
    uncertainClaims: ['모든 채널에서 안정적으로 동작하는지'],
    communityReactions: ['설치는 쉽지만 X 검색은 인증/확장 이슈가 있었다는 후기'],
    personalConnections: ['VibeNews 본문 추출 백엔드 후보로 직접 연결'],
    actionIdeas: ['유튜브/RSS부터 자동화 검증 → X는 별도 전략'],
    followUpQuestions: ['24시간 무인 서버에서 어떤 채널이 안정적인가?'],
    sourceMetaIds: ['sm3', 'sm1', 'sm2'],
  },
];

export const knowledgeCandidates: KnowledgeCandidate[] = [
  { id: 'kc1', sourceType: 'x', sourceId: 'sm1', title: '검증이 병목', knowledgeType: 'Insight', content: '검증 설계가 에이전트 품질의 핵심 병목.', summary: '오케스트레이션보다 검증.', relatedCategoryIds: ['ai'], relatedProjectIds: ['vibenews'], relatedProductIds: [], sourceMetaIds: ['sm1'], confidenceLevel: 'medium', longTermValueScore: 0.8, userSaved: true, foundationStatus: 'candidate', knowledgeClass: 'news_knowledge', createdAt: '2026-07-03T07:12:00+09:00', reviewedAt: null, syncedAt: null },
  { id: 'kc2', sourceType: 'github', sourceId: 'sm3', title: '셀프 힐링 라우팅', knowledgeType: 'Trend', content: '접근 경로가 막히면 자동으로 다음 경로로 전환하는 패턴.', summary: '수집 안정성의 핵심.', relatedCategoryIds: ['ai'], relatedProjectIds: ['vibenews'], relatedProductIds: [], sourceMetaIds: ['sm3'], confidenceLevel: 'high', longTermValueScore: 0.9, userSaved: false, foundationStatus: 'local_only', knowledgeClass: 'news_knowledge', createdAt: '2026-07-03T07:14:00+09:00', reviewedAt: null, syncedAt: null },
];

export const productRecommendations: ProductRecommendation[] = [
  { id: 'pr1', name: '수면 보조 마그네슘(예시)', imageUrl: null, reasonKeywords: ['수면', '혈당'], reasonText: '오늘 들은 "수면-혈당" 주제와 연결된 관심사 기반 제품 예시입니다.', relatedCategoryId: 'health' },
  { id: 'pr2', name: '데일리 선케어(예시)', imageUrl: null, reasonKeywords: ['선케어', 'K-Beauty'], reasonText: '오늘 들은 K-Beauty 선케어 주제와 연결된 관심사 기반 제품 예시입니다.', relatedCategoryId: 'kbeauty' },
];

// 지원 예정 음성 명령. 재생 화면의 컨트롤/액션에 대응한다(전부 future).
export const voiceCommands: VoiceCommand[] = [
  { id: 'vc-next', phrase: '다음', intent: 'next_chapter', status: 'future' },
  { id: 'vc-prev', phrase: '이전', intent: 'previous_chapter', status: 'future' },
  { id: 'vc-replay', phrase: '다시', intent: 'replay_current', status: 'future' },
  { id: 'vc-save', phrase: '저장', intent: 'save_current', status: 'future' },
  { id: 'vc-explore', phrase: '더 알아보기', intent: 'open_explore_more', status: 'future' },
];

// 편의 조회 헬퍼
export const categoryById = (id: string) => categories.find((c) => c.id === id);
export const audioItemsForSession = (sessionId: string) =>
  newsAudioItems.filter((n) => n.briefingSessionId === sessionId).sort((a, b) => a.chapterIndex - b.chapterIndex);
export const sourceMetaById = (id: string) => sourceMetas.find((s) => s.id === id);
