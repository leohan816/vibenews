import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { TopicCluster } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

// 카테고리별 그라데이션/이모지(썸네일). 상단 CategoryFilter와 색을 공유.
const GRADIENT: Record<string, [string, string]> = {
  ai: ['#6366f1', '#8b5cf6'],
  health: ['#10b981', '#059669'],
  invest: ['#f59e0b', '#ef4444'],
  skincare: ['#ec4899', '#f472b6'],
  beauty: ['#f472b6', '#a78bfa'],
  biz: ['#3b82f6', '#06b6d4'],
};
const EMOJI: Record<string, string> = {
  ai: '🤖',
  health: '💪',
  invest: '📈',
  skincare: '💧',
  beauty: '✨',
  biz: '💼',
};

/** "오늘의 흐름" 카드(=FlowCard). 카테고리가 아니라 TopicCluster 단위. */
export function TopicClusterCard({
  cluster,
  onPress,
}: {
  cluster: TopicCluster;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <LinearGradient
          colors={GRADIENT[cluster.categoryId] ?? ['#334155', '#0f172a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.thumb}>
          <ThemedText style={styles.emoji}>{EMOJI[cluster.categoryId] ?? '📰'}</ThemedText>
        </LinearGradient>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.title}>{cluster.title}</ThemedText>
            {cluster.hasNewItems ? (
              <View style={[styles.newDot, { backgroundColor: theme.danger }]} />
            ) : null}
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            오늘 {cluster.itemCount}개 · 약 {cluster.estimatedDurationMin}분
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.tint, fontWeight: '600' }}>
            {cluster.tags.map((t) => `#${t}`).join(' ')}
          </ThemedText>
        </View>
        <ThemedText style={{ color: theme.textSecondary, fontSize: 20 }}>›</ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 30 },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  title: { fontWeight: '800', fontSize: 16 },
  newDot: { width: 7, height: 7, borderRadius: 4 },
});
