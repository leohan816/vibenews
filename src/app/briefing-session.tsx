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
import { EVENTS, logEvent } from '@/lib/eventLog';
import { useTheme } from '@/hooks/use-theme';

const items = audioItemsForSession(todaySession.id);

export default function BriefingSessionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const item = items[index];
  const total = items.length;
  const category = categoryById(item.categoryId);
  const isSaved = savedIds.includes(item.id);
  // mock 진행률: 챕터 위치 기반 표시값
  const progress = total > 1 ? index / (total - 1) : 0;

  const goPrev = () => {
    if (index === 0) return;
    logEvent(EVENTS.previousChapterClicked, { from: item.id });
    setIndex(index - 1);
    setIsPlaying(true);
  };
  const goNext = () => {
    if (index >= total - 1) return;
    logEvent(EVENTS.nextChapterClicked, { from: item.id });
    setIndex(index + 1);
    setIsPlaying(true);
  };
  const togglePlay = () => {
    logEvent(isPlaying ? EVENTS.newsSkipped : EVENTS.newsPlayed, { id: item.id });
    setIsPlaying((p) => !p);
  };
  const toggleSave = () => {
    setSavedIds((prev) => (isSaved ? prev.filter((x) => x !== item.id) : [...prev, item.id]));
  };
  const openExplore = () => {
    logEvent(EVENTS.exploreMoreOpened, { id: item.id });
    router.push('/explore-more');
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.metaRow}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {category?.name} · Chapter {index + 1} / {total}
          </ThemedText>
          <StatusBadge status="mock" />
        </View>

        <AmbientVisual active={isPlaying} />

        <ThemedText type="subtitle" style={styles.title}>
          {item.title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.summary}>
          {item.shortSummary}
        </ThemedText>

        <ProgressBar progress={progress} />

        <ChapterControls
          isPlaying={isPlaying}
          canPrev={index > 0}
          canNext={index < total - 1}
          onPrev={goPrev}
          onTogglePlay={togglePlay}
          onNext={goNext}
        />

        {/* 저장 / 더 알아보기 */}
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
            재생 중에는 본문 전체를 보여주지 않습니다. 실제 오디오·TTS는 나중에 연결됩니다.
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
