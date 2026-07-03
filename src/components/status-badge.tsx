import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ContentStatus } from '@/data/types';

const LABELS: Record<ContentStatus, { text: string; color: string }> = {
  mock: { text: 'MOCK', color: '#8b5cf6' },
  partial: { text: '일부 동작', color: '#f59e0b' },
  working: { text: '동작', color: '#10b981' },
  future: { text: '준비 중', color: '#64748b' },
};

export function StatusBadge({ status = 'mock' }: { status?: ContentStatus }) {
  const { text, color } = LABELS[status];
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <ThemedText style={styles.text}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.three,
  },
  text: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
});
