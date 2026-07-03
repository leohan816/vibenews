import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import type { Category } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

/** 카테고리 큰 카드: 오늘 준비된 개수 · 예상 청취 시간 · 핵심 키워드. */
export function CategoryCard({ category, onPress }: { category: Category; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <ThemedText type="default" style={styles.name}>
          {category.name}
        </ThemedText>
        {category.hasNewItems ? (
          <View style={[styles.dot, { backgroundColor: theme.text }]} />
        ) : null}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        오늘 {category.preparedItemCount}개 준비됨 · 약 {category.estimatedDurationMin}분
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        키워드: {category.topKeywords.join(' · ')}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontWeight: '700', fontSize: 18 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
