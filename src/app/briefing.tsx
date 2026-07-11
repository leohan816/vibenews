// Briefing management moved from a bottom tab to a push route (설계문서/18 §5.1). Reachable from
// Listen and from Add's secondary action; Briefing/ScheduleBriefing/BriefingSession capability stays.
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { CategoryCard } from '@/components/category-card';
import { Screen } from '@/components/screen';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { categories, scheduledBriefings } from '@/data/mockData';

export default function BriefingScreen() {
  const router = useRouter();
  const sched = scheduledBriefings[0];

  return (
    <Screen title="Briefing" subtitle="카테고리별로 준비된 브리핑" status="mock">
      <Card onPress={() => router.push('/schedule-briefing')}>
        <View style={styles.bannerRow}>
          <ThemedText type="smallBold">⏰ 예약 브리핑</ThemedText>
          <StatusBadge status="mock" />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          매일 아침 {sched.timeOfDay} · {sched.lengthMin}분 · {sched.categoryIds.join(' / ')}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          탭하면 예약 설정으로 이동 →
        </ThemedText>
      </Card>

      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} onPress={() => router.push('/briefing-session')} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
