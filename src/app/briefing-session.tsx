import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AmbientVisual } from '@/components/ambient-visual';
import { ChapterControls } from '@/components/chapter-controls';
import { ProgressBar } from '@/components/progress-bar';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { audioItemsForSession, categoryById, todaySession } from '@/data/mockData';
import { useAudioPlayerController } from '@/hooks/use-audio-player-controller';
import { useTheme } from '@/hooks/use-theme';
import { formatTime } from '@/lib/audio';
import { EVENTS, logEvent } from '@/lib/eventLog';

const items = audioItemsForSession(todaySession.id);

export default function BriefingSessionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const audio = useAudioPlayerController(items);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const item = audio.current;
  const category = categoryById(item.categoryId);
  const isSaved = savedIds.includes(item.id);
  const progress = audio.durationSec > 0 ? audio.positionSec / audio.durationSec : 0;

  const toggleSave = () =>
    setSavedIds((prev) => (isSaved ? prev.filter((x) => x !== item.id) : [...prev, item.id]));

  const openExplore = () => {
    logEvent(EVENTS.exploreMoreOpened, { id: item.id });
    router.push('/explore-more');
  };

  const statusLabel =
    audio.status === 'loading'
      ? '오디오 불러오는 중…'
      : audio.status === 'error'
        ? '오디오 재생 실패 (샘플 접근 불가) — 이전/다음은 계속 가능'
        : audio.status === 'completed'
          ? '브리핑 완료 · 재생 버튼으로 다시 듣기'
          : audio.usingFallbackAudio
            ? '샘플 오디오 재생 중 (실제 음성 TTS는 나중에 연결)'
            : '';

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.metaRow}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {category?.name} · Chapter {audio.index + 1} / {audio.total}
          </ThemedText>
          <StatusBadge status="partial" />
        </View>

        <AmbientVisual active={audio.isPlaying} />

        <ThemedText type="subtitle" style={styles.title}>
          {item.title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.summary}>
          {item.shortSummary}
        </ThemedText>

        <ProgressBar progress={progress} onSeekFraction={audio.seekToFraction} />
        <View style={styles.timeRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {formatTime(audio.positionSec)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatTime(audio.durationSec)}
          </ThemedText>
        </View>

        <ChapterControls
          isPlaying={audio.isPlaying}
          canPrev={audio.canPrev}
          canNext={audio.canNext}
          onPrev={audio.previous}
          onTogglePlay={audio.togglePlay}
          onNext={audio.next}
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
            재생 중에는 본문 전체를 보여주지 않습니다. 실제 음성(TTS)은 나중에 연결됩니다.
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
  note: { width: '100%', borderRadius: Spacing.three, padding: Spacing.three, marginTop: Spacing.two },
});
