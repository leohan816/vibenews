// "재생 중" 화면 (설계문서/18 §10). 로컬 플레이어를 소유하지 않는다 — 재생/이어듣기 상태는 root의
// 전역 플레이어(GlobalPlaybackProvider) 하나가 소유하고, 이 화면은 그 상태를 보여주고 조작만 한다.
// 표시용 메타데이터는 mock이며 실제 오디오는 승인된 브리핑에만 전역 플레이어로 연결된다.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ChapterControls } from '@/components/chapter-controls';
import { CoverArt } from '@/components/cover-art';
import { ProgressBar } from '@/components/progress-bar';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useGlobalPlayback } from '@/audio/global-playback-context';
import { audioItemsForSession, categoryById, todaySession } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';
import { formatTime } from '@/lib/audio';
import { EVENTS, logEvent } from '@/lib/eventLog';

const items = audioItemsForSession(todaySession.id);

export default function BriefingSessionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { view, resumeCopy, startOrResumeAutomatic, pause, seek, skip } = useGlobalPlayback();
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // 표시용 메타데이터(현재 mock). 실제 오디오는 전역 플레이어가 승인된 asset에만 연결한다.
  const item = items[0];
  const category = categoryById(item.categoryId);
  const isSaved = savedIds.includes(item.id);
  const progress = view.durationSec > 0 ? view.positionSec / view.durationSec : 0;

  const toggleSave = () =>
    setSavedIds((prev) => (isSaved ? prev.filter((x) => x !== item.id) : [...prev, item.id]));

  const openExplore = () => {
    logEvent(EVENTS.exploreMoreOpened, { id: item.id });
    router.push('/explore-more');
  };

  const onTogglePlay = async () => {
    if (isPlaying) {
      await pause();
      setIsPlaying(false);
      logEvent(EVENTS.audioPaused, { id: item.id });
      return;
    }
    try {
      await startOrResumeAutomatic('today_briefing');
      setIsPlaying(true);
      logEvent(EVENTS.audioPlayStarted, { id: item.id });
    } catch {
      // 서버/네트워크 미준비 시 조용히 무시(스켈레톤). 전역 플레이어가 상태를 소유한다.
    }
  };

  const onSkip = async () => {
    await skip();
    setIsPlaying(false);
    logEvent(EVENTS.chapterNextClicked, { from: item.id });
  };

  const statusLabel =
    view.status === 'completed'
      ? '브리핑 완료 · 재생 버튼으로 다시 듣기'
      : resumeCopy
        ? resumeCopy
        : view.activeContentItemId
          ? '전역 플레이어에서 재생 중'
          : '재생 버튼을 누르면 준비된 브리핑을 자동 재생합니다';

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.metaRow}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {category?.name} · 자동 재생
          </ThemedText>
          <StatusBadge status="mock" />
        </View>

        <CoverArt
          categoryId={item.categoryId}
          categoryName={category?.name}
          playing={isPlaying}
        />

        <ThemedText type="subtitle" style={styles.title}>
          {item.title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.summary}>
          {item.shortSummary}
        </ThemedText>

        <ProgressBar
          progress={progress}
          onSeekFraction={(f) => {
            if (view.durationSec > 0) void seek(f * view.durationSec);
          }}
        />
        <View style={styles.timeRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {formatTime(view.positionSec)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatTime(view.durationSec)}
          </ThemedText>
        </View>

        <ChapterControls
          isPlaying={isPlaying}
          canPrev={view.positionSec > 3}
          canNext={!!view.activeContentItemId}
          onPrev={() => void seek(0)}
          onTogglePlay={() => void onTogglePlay()}
          onNext={() => void onSkip()}
        />

        {statusLabel ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.statusLabel}>
            {statusLabel}
          </ThemedText>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={toggleSave}
            style={({ pressed }) => [
              styles.actionBtn,
              { borderColor: theme.backgroundSelected },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="small">{isSaved ? '✓ 저장됨' : '＋ 저장'}</ThemedText>
          </Pressable>
          <Pressable
            onPress={openExplore}
            style={({ pressed }) => [
              styles.actionBtn,
              { borderColor: theme.backgroundSelected },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="small">🔎 더 알아보기</ThemedText>
          </Pressable>
        </View>

        <ThemedView type="backgroundElement" style={styles.note}>
          <ThemedText type="small" themeColor="textSecondary">
            재생 중에는 본문 전체를 보여주지 않습니다. 재생/이어듣기는 전역 플레이어 하나가 관리합니다.
          </ThemedText>
        </ThemedView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth, alignItems: 'center', gap: Spacing.three },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { textAlign: 'center', fontSize: 24, lineHeight: 32 },
  summary: { textAlign: 'center' },
  timeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -Spacing.two,
  },
  statusLabel: { textAlign: 'center' },
  actions: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.two },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  pressed: { opacity: 0.7 },
  note: {
    width: '100%',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
});
