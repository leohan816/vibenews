import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  categories,
  TODAY_TOTAL_ITEMS,
  TODAY_TOTAL_MINUTES,
  todaySession,
  USER_NAME,
} from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';
import { EVENTS, logEvent } from '@/lib/eventLog';

const CAT_GRADIENT: Record<string, [string, string]> = {
  ai: ['#6366f1', '#8b5cf6'],
  health: ['#10b981', '#059669'],
  invest: ['#f59e0b', '#ef4444'],
  kbeauty: ['#ec4899', '#f472b6'],
  beauty: ['#f472b6', '#a78bfa'],
  biz: ['#3b82f6', '#06b6d4'],
};
const CAT_EMOJI: Record<string, string> = {
  ai: '🤖',
  health: '💪',
  invest: '📈',
  kbeauty: '💧',
  beauty: '✨',
  biz: '💼',
};

export default function ListenScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeCat, setActiveCat] = useState('all');

  const onPlay = () => {
    logEvent(EVENTS.newsPlayed, { sessionId: todaySession.id });
    router.push('/briefing-session');
  };

  const shownCats = activeCat === 'all' ? categories : categories.filter((c) => c.id === activeCat);
  const tabs = [{ id: 'all', name: '전체' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.two,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
        },
      ]}>
      <View style={styles.inner}>
        {/* 헤더 */}
        <View style={styles.header}>
          <ThemedText style={styles.menuIcon}>☰</ThemedText>
          <ThemedText style={[styles.logo, { color: theme.tint }]}>🎧 VibeNews</ThemedText>
          <ThemedText style={styles.menuIcon}>🔍</ThemedText>
        </View>

        {/* 카테고리 탭 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}>
          {tabs.map((t) => {
            const active = activeCat === t.id;
            return (
              <Pressable key={t.id} onPress={() => setActiveCat(t.id)} style={styles.tabItem}>
                <ThemedText
                  style={[
                    styles.tabText,
                    { color: active ? theme.text : theme.textSecondary, fontWeight: active ? '800' : '600' },
                  ]}>
                  {t.name}
                </ThemedText>
                {active ? <View style={[styles.tabUnderline, { backgroundColor: theme.tint }]} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* AI 필 배너 */}
        <View style={[styles.pill, { backgroundColor: theme.tintSoft }]}>
          <View style={[styles.dot, { backgroundColor: theme.tint }]} />
          <ThemedText type="small" style={{ fontWeight: '700' }}>
            오늘 {TODAY_TOTAL_ITEMS}개 · 약 {TODAY_TOTAL_MINUTES}분 — AI가 골라 담았어요
          </ThemedText>
        </View>

        {/* 히어로: 오늘의 브리핑 재생 카드 */}
        <Card onPress={onPlay} style={styles.hero}>
          <ThemedText style={styles.heroTitle}>
            {USER_NAME}님을 위한 뉴스가{'\n'}준비되어 있어요
          </ThemedText>
          <View style={styles.heroRow}>
            <View style={[styles.playBtn, { backgroundColor: theme.tint }]}>
              <ThemedText style={styles.playIcon}>▶</ThemedText>
            </View>
            <View style={styles.heroInfo}>
              <ThemedText style={{ fontWeight: '800' }}>오늘의 브리핑 시작</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {TODAY_TOTAL_ITEMS}개 뉴스 · 약 {TODAY_TOTAL_MINUTES}분
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* 카테고리 섹션 */}
        <SectionHeader emoji="🗂" title="카테고리" onMore={() => router.push('/briefing')} />
        {shownCats.map((c) => (
          <Card key={c.id} onPress={() => router.push('/briefing-session')} style={styles.catCard}>
            <View style={styles.catRow}>
              <LinearGradient
                colors={CAT_GRADIENT[c.id] ?? ['#334155', '#0f172a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.catThumb}>
                <ThemedText style={styles.catEmoji}>{CAT_EMOJI[c.id] ?? '📰'}</ThemedText>
              </LinearGradient>
              <View style={styles.catInfo}>
                <View style={styles.catTitleRow}>
                  <ThemedText style={{ fontWeight: '800', fontSize: 16 }}>{c.name}</ThemedText>
                  {c.hasNewItems ? (
                    <View style={[styles.newDot, { backgroundColor: theme.danger }]} />
                  ) : null}
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  오늘 {c.preparedItemCount}개 · 약 {c.estimatedDurationMin}분
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.tint, fontWeight: '600' }}>
                  {c.topKeywords.map((k) => `#${k}`).join(' ')}
                </ThemedText>
              </View>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 20 }}>›</ThemedText>
            </View>
          </Card>
        ))}

        {/* 음성 명령 */}
        <Pressable
          onPress={() => router.push('/voice-command')}
          style={({ pressed }) => [
            styles.voiceBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="small" style={{ fontWeight: '700' }}>
            🎙️ 음성으로 명령하기
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            준비 중 ›
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.three, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  menuIcon: { fontSize: 20 },
  logo: { fontSize: 20, fontWeight: '800' },
  tabRow: { gap: Spacing.four, paddingRight: Spacing.four, alignItems: 'flex-end' },
  tabItem: { alignItems: 'center', gap: Spacing.half },
  tabText: { fontSize: 15 },
  tabUnderline: { height: 3, width: 20, borderRadius: 2 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  hero: { gap: Spacing.three, padding: Spacing.four },
  heroTitle: { fontSize: 22, fontWeight: '800', lineHeight: 30 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#ffffff', fontSize: 24, marginLeft: 3 },
  heroInfo: { gap: 2 },
  catCard: { padding: Spacing.three },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  catThumb: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catEmoji: { fontSize: 30 },
  catInfo: { flex: 1, gap: 2 },
  catTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  newDot: { width: 7, height: 7, borderRadius: 4 },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    marginTop: Spacing.one,
  },
  pressed: { opacity: 0.7 },
});
