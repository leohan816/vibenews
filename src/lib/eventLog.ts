// 사용 행동 mock 기록 (설계문서/11_EventLog_사용행동기록.md)
// 지금은 결제/유료화가 없으므로, 나중에 어떤 기능이 가치 있는지 알기 위해
// 행동을 메모리 배열 + console 에만 기록한다. 실제 백엔드 전송 없음.
import type { EventLog } from '@/data/types';

export const EVENTS = {
  newsPlayed: 'news_played',
  newsCompleted: 'news_completed',
  newsSkipped: 'news_skipped',
  newsReplayed: 'news_replayed',
  nextChapterClicked: 'next_chapter_clicked',
  previousChapterClicked: 'previous_chapter_clicked',
  exploreMoreOpened: 'explore_more_opened',
  dailyRecapGenerated: 'daily_recap_generated',
  dailyRecapReplayed: 'daily_recap_replayed',
  recapCardSaved: 'recap_card_saved',
  scheduledBriefingCreated: 'scheduled_briefing_created',
  scheduledBriefingCompleted: 'scheduled_briefing_completed',
  savedCardOpened: 'saved_card_opened',
  productCardViewed: 'product_card_viewed',
  productCardSaved: 'product_card_saved',
  voiceCommandUsed: 'voice_command_used',
  foundationCandidateCreated: 'foundation_candidate_created',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

const memoryLog: EventLog[] = [];
let seq = 0;

export function logEvent(event: EventName, payload: Record<string, unknown> = {}): void {
  const entry: EventLog = {
    id: `evt-${++seq}`,
    event,
    payload,
    createdAt: new Date().toISOString(),
  };
  memoryLog.push(entry);
  // skeleton 단계: 콘솔에만 남긴다.
  console.log('[VibeNews event]', event, payload);
}

export function getEventLog(): readonly EventLog[] {
  return memoryLog;
}
