import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { TopicClusterCard } from '@/components/topic-cluster-card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  categories,
  TODAY_TOTAL_ITEMS,
  TODAY_TOTAL_MINUTES,
  todaySession,
  topicClusters,
  USER_NAME,
} from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';
import { EVENTS, logEvent } from '@/lib/eventLog';

export default function ListenScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // 상단 가로 탭 = CategoryFilter. 하단 카드 = 오늘의 흐름(TopicCluster).
  const [activeCat, setActiveCat] = useState('all');

  const onPlay = () => {
    logEvent(EVENTS.newsPlayed, { sessionId: todaySession.id });
    router.push('/briefing-session');
  };

  const tabs = [{ id: 'all', name: '전체' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];
  const shownFlows =
    activeCat === 'all' ? topicClusters : topicClusters.filter((f) => f.categoryId === activeCat);

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

        {/* 카테고리 필터 탭 (CategoryFilter) */}
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
                    {
                      color: active ? theme.text : theme.textSecondary,
                      fontWeight: active ? '800' : '600',
                    },
                  ]}>
                  {t.name}
                </ThemedText>
                {active ? (
                  <View style={[styles.tabUnderline, { backgroundColor: theme.tint }]} />
                ) : null}
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

        {/* 오늘의 흐름 (TopicCluster, 카테고리 아님) */}
        <SectionHeader emoji="🌊" title="오늘의 흐름" onMore={() => router.push('/briefing')} />
        {shownFlows.map((f) => (
          <TopicClusterCard
            key={f.id}
            cluster={f}
            onPress={() => router.push('/briefing-session')}
          />
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
