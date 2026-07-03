import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import type { ContentStatus } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  title?: string;
  subtitle?: string;
  status?: ContentStatus;
  children: ReactNode;
  center?: boolean;
};

/** 공용 화면 컨테이너: 테마 배경 + 안전영역 + 제목/부제 + 상태 배지 */
export function Screen({ title, subtitle, status, children, center }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
        },
        center && styles.center,
      ]}>
      <View style={styles.inner}>
        {(title || status) && (
          <View style={styles.header}>
            {title ? (
              <ThemedText type="subtitle" style={styles.title}>
                {title}
              </ThemedText>
            ) : null}
            {status ? <StatusBadge status={status} /> : null}
          </View>
        )}
        {subtitle ? (
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  center: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
  },
  subtitle: {
    marginTop: -Spacing.two,
  },
});
