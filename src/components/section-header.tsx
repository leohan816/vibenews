import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** cosmile 스타일 섹션 헤더: "🔥 제목 ............ 더보기 ›" */
export function SectionHeader({
  emoji,
  title,
  moreLabel = '더보기',
  onMore,
}: {
  emoji?: string;
  title: string;
  moreLabel?: string;
  onMore?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <ThemedText style={styles.title}>
        {emoji ? `${emoji} ` : ''}
        {title}
      </ThemedText>
      {onMore ? (
        <Pressable onPress={onMore} style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
          <ThemedText type="small" style={{ color: theme.tint, fontWeight: '700' }}>
            {moreLabel} ›
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  title: { fontSize: 18, fontWeight: '800' },
  pressed: { opacity: 0.6 },
});
