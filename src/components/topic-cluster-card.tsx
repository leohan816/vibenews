import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Spacing } from "@/constants/theme";
import type { TopicCluster } from "@/data/types";

// Neo-Retro AI Radio 로컬 토큰 (Listen 홈 카드 전용. 설계문서 17)
const NEO = {
  surfaceDark: "#211A14",
  surfaceSoft: "#2B2219",
  accentAmber: "#FFA23A",
  textCream: "#F4EBE0",
  textMuted: "#A6968A",
  signalCoral: "#FF6F61",
  border: "#33281F",
};

// 카테고리별 아이콘 블록(썸네일). 톤 다운된 그라데이션 + 이모지.
const GRADIENT: Record<string, [string, string]> = {
  ai: ["#4f46e5", "#7c3aed"],
  health: ["#0f766e", "#065f46"],
  invest: ["#b45309", "#9a3412"],
  skincare: ["#9d174d", "#be185d"],
  beauty: ["#7e22ce", "#9d174d"],
  biz: ["#1e40af", "#0e7490"],
};
const EMOJI: Record<string, string> = {
  ai: "🤖",
  health: "💪",
  invest: "📈",
  skincare: "💧",
  beauty: "✨",
  biz: "💼",
};

/** "오늘의 흐름" 카드(=FlowCard). 뉴스 카드가 아니라 방송/트랙/채널 카드. */
export function TopicClusterCard({
  cluster,
  onPress,
}: {
  cluster: TopicCluster;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={GRADIENT[cluster.categoryId] ?? ["#3a2f24", "#211a14"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.thumb}
      >
        <Text style={styles.emoji}>{EMOJI[cluster.categoryId] ?? "📡"}</Text>
      </LinearGradient>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{cluster.title}</Text>
          {cluster.hasNewItems ? <View style={styles.signalDot} /> : null}
        </View>
        <Text style={styles.meta}>
          오늘 {cluster.itemCount}개 · 약 {cluster.estimatedDurationMin}분
        </Text>
        <Text style={styles.tags}>
          {cluster.tags.map((t) => `#${t}`).join(" ")}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: NEO.surfaceDark,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: NEO.border,
    padding: Spacing.three,
  },
  pressed: { opacity: 0.75 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 28 },
  info: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  title: { color: NEO.textCream, fontWeight: "800", fontSize: 16 },
  signalDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: NEO.signalCoral,
  },
  meta: { color: NEO.textMuted, fontSize: 13, fontWeight: "600" },
  tags: { color: NEO.accentAmber, fontSize: 13, fontWeight: "600" },
  chevron: { color: NEO.textMuted, fontSize: 22 },
});
