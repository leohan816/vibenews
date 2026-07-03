import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { todayRecap } from '@/data/mockData';
import { EVENTS, logEvent } from '@/lib/eventLog';
import { useTheme } from '@/hooks/use-theme';

export default function DailyRecapDetailScreen() {
  return (
    <Screen
      subtitle="밤 11시 자동 생성(설정에서 변경) · 음성 + 텍스트 + 저장 카드로 제공됩니다."
      status="mock">
      <RecapAudioBar />

      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          한 줄 요약
        </ThemedText>
        <ThemedText type="default">{todayRecap.summary}</ThemedText>
      </Card>

      <RecapSection title="오늘 들은 핵심 흐름 5개" items={todayRecap.keyTrends} />

      <KeywordSection title="반복해서 나온 키워드" keywords={todayRecap.repeatedKeywords} />

      <RecapSection title="내 관심사와 연결되는 포인트" items={todayRecap.personalConnections} />
      <RecapSection title="나중에 다시 봐야 할 소스" items={todayRecap.sourcesToReview} />
      <RecapSection title="실행 아이디어" items={todayRecap.actionIdeas} />
      <RecapSection title="놓치면 아까운 뉴스" items={todayRecap.mustNotMissItems} />
      <RecapSection title="추가 학습 질문" items={todayRecap.followUpQuestions} />

      <SaveRecapButton />
    </Screen>
  );
}

/** 음성 재생바 placeholder — 진행바/재생버튼 흉내, 실제 TTS 없음 */
function RecapAudioBar() {
  const theme = useTheme();
  const [playing, setPlaying] = useState(false);

  return (
    <Card>
      <View style={styles.audioRow}>
        <Pressable
          onPress={() => setPlaying((p) => !p)}
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: theme.text },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            {playing ? '❚❚' : '▶'}
          </ThemedText>
        </Pressable>
        <View style={styles.audioMain}>
          <View style={[styles.progressTrack, { backgroundColor: theme.background }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.textSecondary }]} />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            음성 요약 준비 중 · TTS 음성 Recap 연결 예정
          </ThemedText>
        </View>
      </View>
    </Card>
  );
}

/** 제목 + bullet 목록 섹션 */
function RecapSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {title}
      </ThemedText>
      {items.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          아직 정리된 내용이 없어요.
        </ThemedText>
      ) : (
        items.map((t, i) => (
          <ThemedText key={i} type="small">
            • {t}
          </ThemedText>
        ))
      )}
    </Card>
  );
}

/** 제목 + 키워드 칩 목록 섹션 */
function KeywordSection({ title, keywords }: { title: string; keywords: string[] }) {
  const theme = useTheme();
  return (
    <Card>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {title}
      </ThemedText>
      <View style={styles.chipWrap}>
        {keywords.map((k) => (
          <View key={k} style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small">{k}</ThemedText>
          </View>
        ))}
      </View>
    </Card>
  );
}

/** "카드로 저장" (mock) — 누르면 이벤트 로깅 + 저장됨 표시 */
function SaveRecapButton() {
  const theme = useTheme();
  const [saved, setSaved] = useState(false);

  const onPress = () => {
    if (saved) return;
    logEvent(EVENTS.recapCardSaved, {});
    setSaved(true);
  };

  return (
    <View style={styles.saveBlock}>
      <Pressable
        onPress={onPress}
        disabled={saved}
        style={({ pressed }) => [
          styles.saveButton,
          { backgroundColor: saved ? theme.backgroundElement : theme.text },
          pressed && styles.pressed,
        ]}>
        <ThemedText
          type="smallBold"
          style={{ color: saved ? theme.textSecondary : theme.background }}>
          {saved ? '✓ Saved에 저장됨' : '카드로 저장'}
        </ThemedText>
      </Pressable>
      <ThemedText type="small" themeColor="textSecondary">
        {saved
          ? '이 Recap이 저장 카드(mock)로 Saved 탭에 반영됩니다.'
          : '저장하면 지식 카드로 남아 Saved 탭에서 다시 볼 수 있어요.'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioMain: {
    flex: 1,
    gap: Spacing.two,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '35%',
    borderRadius: 3,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  saveBlock: {
    gap: Spacing.two,
  },
  saveButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
