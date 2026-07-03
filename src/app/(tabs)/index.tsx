import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TopicClusterCard } from "@/components/topic-cluster-card";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import {
  categories,
  TODAY_TOTAL_ITEMS,
  TODAY_TOTAL_MINUTES,
  todaySession,
  topicClusters,
  USER_NAME,
} from "@/data/mockData";
import { EVENTS, logEvent } from "@/lib/eventLog";

// Neo-Retro AI Radio 팔레트 (Listen 홈 전용 로컬 토큰. 설계문서 17)
const NEO = {
  bgWarmBlack: "#16110D",
  surfaceDark: "#211A14",
  surfaceSoft: "#2B2219",
  accentAmber: "#FFA23A",
  textCream: "#F4EBE0",
  textMuted: "#A6968A",
  signalCoral: "#FF6F61",
  border: "#33281F",
};

export default function ListenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // 상단 탭 = 채널 선택(CategoryFilter). 하단 카드 = 오늘의 흐름(TopicCluster).
  const [activeCat, setActiveCat] = useState("all");

  const onPlay = () => {
    logEvent(EVENTS.newsPlayed, { sessionId: todaySession.id });
    router.push("/briefing-session");
  };

  const tabs = [
    { id: "all", name: "전체" },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];
  const shownFlows =
    activeCat === "all"
      ? topicClusters
      : topicClusters.filter((f) => f.categoryId === activeCat);

  return (
    <ScrollView
      style={{ backgroundColor: NEO.bgWarmBlack }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.two,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
        },
      ]}
    >
      <View style={styles.inner}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.iconBtn}>☰</Text>
          <Text style={styles.logo}>📻 VibeNews</Text>
          <Text style={styles.iconBtn}>🔍</Text>
        </View>

        {/* 채널 선택 탭 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {tabs.map((t) => {
            const active = activeCat === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setActiveCat(t.id)}
                style={styles.tabItem}
              >
                <Text
                  style={[
                    styles.tabText,
                    active ? styles.tabTextActive : styles.tabTextMuted,
                  ]}
                >
                  {t.name}
                </Text>
                {active ? <View style={styles.tabUnderline} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 상태 pill (LCD 느낌) */}
        <View style={styles.pill}>
          <View style={styles.signalDot} />
          <Text style={styles.pillText}>
            오늘 {TODAY_TOTAL_ITEMS}개 · 약 {TODAY_TOTAL_MINUTES}분 — AI가 골라
            담았어요
          </Text>
          <Text style={styles.pillTag}>SIGNAL READY</Text>
        </View>

        {/* Hero Playback Card — 오디오 단말기 메인 패널 */}
        <View style={styles.hero}>
          <View style={styles.heroChips}>
            <Text style={styles.lcdChip}>◉ TODAY MIX</Text>
            <Text style={styles.lcdChipMuted}>
              {TODAY_TOTAL_ITEMS} signals · {TODAY_TOTAL_MINUTES} min
            </Text>
          </View>
          <Text style={styles.heroTitle}>
            {USER_NAME}님을 위한{"\n"}브리핑이 준비됐어요
          </Text>

          <Pressable
            onPress={onPlay}
            style={({ pressed }) => [styles.dial, pressed && styles.pressed]}
          >
            <View style={styles.playBtn}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </Pressable>
          <Text style={styles.heroStart}>오늘의 브리핑 시작</Text>
        </View>

        {/* 오늘의 흐름 */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>🌊 오늘의 흐름</Text>
          <Pressable onPress={() => router.push("/briefing")}>
            <Text style={styles.more}>더보기 ›</Text>
          </Pressable>
        </View>
        {shownFlows.map((f) => (
          <TopicClusterCard
            key={f.id}
            cluster={f}
            onPress={() => router.push("/briefing-session")}
          />
        ))}

        {/* 음성 명령 */}
        <Pressable
          onPress={() => router.push("/voice-command")}
          style={({ pressed }) => [styles.voiceBtn, pressed && styles.pressed]}
        >
          <Text style={styles.voiceText}>🎙️ 음성으로 명령하기</Text>
          <Text style={styles.voiceMuted}>준비 중 ›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.three, alignItems: "center" },
  inner: { width: "100%", maxWidth: MaxContentWidth, gap: Spacing.three },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.one,
  },
  iconBtn: { fontSize: 20, color: NEO.textMuted },
  logo: { fontSize: 20, fontWeight: "800", color: NEO.accentAmber },
  tabRow: {
    gap: Spacing.four,
    paddingRight: Spacing.four,
    alignItems: "flex-end",
  },
  tabItem: { alignItems: "center", gap: Spacing.half },
  tabText: { fontSize: 15 },
  tabTextActive: { color: NEO.textCream, fontWeight: "800" },
  tabTextMuted: { color: NEO.textMuted, fontWeight: "600" },
  tabUnderline: {
    height: 3,
    width: 20,
    borderRadius: 2,
    backgroundColor: NEO.accentAmber,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    backgroundColor: NEO.surfaceDark,
    borderWidth: 1,
    borderColor: NEO.border,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NEO.accentAmber,
  },
  pillText: { flex: 1, color: NEO.textCream, fontSize: 13, fontWeight: "600" },
  pillTag: {
    color: NEO.accentAmber,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  hero: {
    backgroundColor: NEO.surfaceSoft,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: NEO.border,
    padding: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
  },
  heroChips: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lcdChip: {
    color: NEO.accentAmber,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  lcdChipMuted: {
    color: NEO.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: NEO.textCream,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32,
    textAlign: "center",
  },
  dial: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NEO.surfaceDark,
    borderWidth: 2,
    borderColor: NEO.border,
    marginTop: Spacing.one,
  },
  playBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NEO.accentAmber,
    // amber glow
    shadowColor: NEO.accentAmber,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  playIcon: { color: "#16110D", fontSize: 34, marginLeft: 4 },
  heroStart: { color: NEO.textCream, fontSize: 15, fontWeight: "700" },
  sectionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.two,
  },
  sectionTitle: { color: NEO.textCream, fontSize: 18, fontWeight: "800" },
  more: { color: NEO.accentAmber, fontSize: 14, fontWeight: "700" },
  voiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: NEO.border,
    backgroundColor: NEO.surfaceDark,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    marginTop: Spacing.one,
  },
  voiceText: { color: NEO.textCream, fontSize: 14, fontWeight: "700" },
  voiceMuted: { color: NEO.textMuted, fontSize: 13 },
  pressed: { opacity: 0.75 },
});
