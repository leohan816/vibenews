import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { todayRecap } from '@/data/mockData';
import { EVENTS, logEvent } from '@/lib/eventLog';
import { useTheme } from '@/hooks/use-theme';

export default function RecapScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [generated, setGenerated] = useState(false);

  const onGenerate = () => {
    logEvent(EVENTS.dailyRecapGenerated, { manual: true });
    setGenerated(true);
  };

  return (
    <Screen title="Recap" subtitle="오늘 들은 내용을 지식으로" status="mock">
      <Pressable
        onPress={onGenerate}
        style={({ pressed }) => [
          styles.genBtn,
          { backgroundColor: theme.text },
          pressed && styles.pressed,
        ]}>
        <ThemedText style={{ color: theme.background, fontWeight: '700' }}>
          {generated ? '✓ 방금 요약했어요 (mock)' : '지금 들은 거 요약하기'}
        </ThemedText>
      </Pressable>

      <ThemedText type="smallBold" themeColor="textSecondary">
        오늘의 Recap
      </ThemedText>
      <Card onPress={() => router.push('/daily-recap-detail')}>
        <ThemedText type="default" style={styles.date}>
          {todayRecap.date}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {todayRecap.summary}
        </ThemedText>
        <View style={styles.chips}>
          {todayRecap.repeatedKeywords.slice(0, 4).map((k) => (
            <View key={k} style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="small">#{k}</ThemedText>
            </View>
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          음성 + 텍스트 + 저장 카드로 보기 →
        </ThemedText>
      </Card>

      <ThemedText type="smallBold" themeColor="textSecondary">
        지난 Recap
      </ThemedText>
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          지난 요약 기록이 여기에 쌓입니다. (나중에 연결 예정)
        </ThemedText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  genBtn: {
    borderRadius: Spacing.five,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  date: { fontWeight: '700' },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.three,
  },
});
