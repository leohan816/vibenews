import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  isPlaying: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
};

/** 이전 / 재생·정지 / 다음 컨트롤 (뉴스 단위 이동). */
export function ChapterControls({
  isPlaying,
  canPrev,
  canNext,
  onPrev,
  onTogglePlay,
  onNext,
}: Props) {
  const theme = useTheme();
  return (
    <View style={styles.controls}>
      <CtrlButton label="⏮" onPress={onPrev} disabled={!canPrev} />
      <Pressable
        onPress={onTogglePlay}
        style={({ pressed }) => [
          styles.playBtn,
          { backgroundColor: theme.text },
          pressed && styles.pressed,
        ]}>
        <ThemedText style={[styles.playIcon, { color: theme.background }]}>
          {isPlaying ? '❚❚' : '▶'}
        </ThemedText>
      </Pressable>
      <CtrlButton label="⏭" onPress={onNext} disabled={!canNext} />
    </View>
  );
}

function CtrlButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.ctrlBtn,
        { backgroundColor: theme.backgroundElement },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <ThemedText style={styles.ctrlIcon}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  ctrlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlIcon: { fontSize: 20 },
  playBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 26 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
