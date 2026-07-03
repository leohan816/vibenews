import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { voiceCommands } from '@/data/mockData';
import type { VoiceCommand } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { EVENTS, logEvent } from '@/lib/eventLog';

export default function VoiceCommandScreen() {
  const theme = useTheme();
  const [demoTapped, setDemoTapped] = useState(false);

  const onMicPress = () => {
    logEvent(EVENTS.voiceCommandUsed, { demo: true });
    setDemoTapped(true);
  };

  return (
    <Screen
      subtitle="손을 쓰기 어려운 순간에 목소리로 재생을 제어하는 기능입니다. 아직 준비 중이에요."
      status="future">
      {/* 안내 */}
      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          아직 준비 중이에요
        </ThemedText>
        <ThemedText type="default">
          실제 음성 인식(STT)이나 마이크 녹음은 아직 연결되어 있지 않아요. 지금은 어떤 명령을
          지원할지 미리 보여드리는 단계입니다.
        </ThemedText>
      </Card>

      {/* 마이크 버튼 placeholder */}
      <View style={styles.micWrap}>
        <Pressable
          onPress={onMicPress}
          style={({ pressed }) => [
            styles.mic,
            { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary },
            pressed && styles.pressed,
          ]}>
          <ThemedText style={styles.micIcon}>🎙️</ThemedText>
        </Pressable>
        <ThemedText type="small" themeColor="textSecondary" style={styles.micHint}>
          {demoTapped
            ? '음성 명령은 아직 준비 중이에요. 실제로 듣고 있지 않아요.'
            : '마이크를 눌러보세요 (데모 — 실제 인식 없음)'}
        </ThemedText>
      </View>

      {/* 지원 예정 명령 */}
      <ThemedText type="smallBold" themeColor="textSecondary">
        지원 예정 음성 명령
      </ThemedText>
      {voiceCommands.map((cmd) => (
        <CommandCard key={cmd.id} command={cmd} />
      ))}

      <ThemedText type="small" themeColor="textSecondary">
        위 명령들은 예시이며, 음성 인식이 연결되기 전까지는 동작하지 않아요.
      </ThemedText>
    </Screen>
  );
}

function CommandCard({ command }: { command: VoiceCommand }) {
  return (
    <Card>
      <View style={styles.cardTop}>
        <ThemedText type="default" style={styles.phrase}>
          “{command.phrase}”
        </ThemedText>
        <StatusBadge status={command.status} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        의도: <ThemedText type="code">{command.intent}</ThemedText>
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  micWrap: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  mic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: 48,
    lineHeight: 56,
  },
  micHint: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  phrase: {
    flexShrink: 1,
    fontWeight: '600',
  },
});
