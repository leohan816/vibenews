import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

// 카테고리별 커버 그라데이션(앨범 아트 느낌).
const GRADIENTS: Record<string, [string, string]> = {
  ai: ['#6366f1', '#8b5cf6'],
  health: ['#10b981', '#059669'],
  invest: ['#f59e0b', '#ef4444'],
  kbeauty: ['#ec4899', '#f472b6'],
  beauty: ['#f472b6', '#a78bfa'],
  biz: ['#3b82f6', '#06b6d4'],
};

function gradientFor(categoryId: string): [string, string] {
  return GRADIENTS[categoryId] ?? ['#334155', '#0f172a'];
}

/**
 * 음악 앱의 "재생 중" 앨범 커버 스타일. 재생 시 살짝 커진다(애플뮤직 느낌).
 */
export function CoverArt({
  categoryId,
  categoryName,
  playing,
}: {
  categoryId: string;
  categoryName?: string;
  playing: boolean;
}) {
  const [scale] = useState(() => new Animated.Value(playing ? 1 : 0.92));

  useEffect(() => {
    Animated.spring(scale, {
      toValue: playing ? 1 : 0.92,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [playing, scale]);

  const colors = gradientFor(categoryId);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.shadow, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cover}>
          <ThemedText style={styles.note}>♪</ThemedText>
          {categoryName ? <ThemedText style={styles.category}>{categoryName}</ThemedText> : null}
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  shadow: {
    width: '78%',
    maxWidth: 300,
    aspectRatio: 1,
    borderRadius: 20,
    // iOS 그림자 + Android elevation
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  cover: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  note: {
    color: '#ffffff',
    fontSize: 88,
    lineHeight: 96,
    opacity: 0.95,
  },
  category: {
    position: 'absolute',
    bottom: Spacing.four,
    left: Spacing.four,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    opacity: 0.95,
  },
});
