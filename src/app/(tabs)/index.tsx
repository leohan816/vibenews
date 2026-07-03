import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  categories,
  TODAY_TOTAL_ITEMS,
  TODAY_TOTAL_MINUTES,
  todaySession,
  USER_NAME,
} from '@/data/mockData';
import { EVENTS, logEvent } from '@/lib/eventLog';
import { useTheme } from '@/hooks/use-theme';

export default function ListenScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const categorySummary = categories
    .filter((c) => c.preparedItemCount > 0)
    .map((c) => `${c.name} ${c.preparedItemCount}개`)
    .join(' · ');

  const onPlay = () => {
    logEvent(EVENTS.newsPlayed, { sessionId: todaySession.id });
    router.push('/briefing-session');
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.four,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
        },
      ]}>
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            VibeNews
          </ThemedText>
          <StatusBadge status="mock" />
        </View>

        <ThemedText type="title" style={styles.hero}>
          {USER_NAME}님을 위한{'\n'}뉴스가 준비되어 있어요.
        </ThemedText>

        <Pressable
          onPress={onPlay}
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: theme.text },
            pressed && styles.pressed,
          ]}>
          <ThemedText style={[styles.playIcon, { color: theme.background }]}>▶</ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={styles.playHint} themeColor="textSecondary">
          탭하면 오늘의 브리핑이 시작돼요
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.summaryCard}>
          <ThemedText type="default" style={styles.summaryMain}>
            오늘 {TODAY_TOTAL_ITEMS}개 뉴스 · 약 {TODAY_TOTAL_MINUTES}분 준비됨
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {categorySummary}
          </ThemedText>
        </ThemedView>

        <View style={styles.chips}>
          {categories.map((c) => (
            <View key={c.id} style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small">
                {c.name} {c.preparedItemCount}
              </ThemedText>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.push('/voice-command')}
          style={({ pressed }) => [
            styles.voiceButton,
            { borderColor: theme.backgroundSelected },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="small">🎙️ 음성으로 명령하기</ThemedText>
          <StatusBadge status="future" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    gap: Spacing.three,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hero: {
    fontSize: 32,
    lineHeight: 42,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  playButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  playIcon: {
    fontSize: 56,
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  playHint: {
    marginTop: Spacing.one,
  },
  summaryCard: {
    width: '100%',
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
    marginTop: Spacing.three,
    alignItems: 'center',
  },
  summaryMain: {
    fontWeight: '700',
    textAlign: 'center',
  },
  chips: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  voiceButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
  },
});
