import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  progress: number; // 0~1
  onSeekFraction?: (fraction: number) => void; // 탭 위치(0~1)로 seek
};

/** 진행바. onSeekFraction 이 있으면 탭한 위치로 seek 한다. */
export function ProgressBar({ progress, onSeekFraction }: Props) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  const track = (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.fill, { backgroundColor: theme.text, width: `${pct}%` }]} />
    </View>
  );

  if (!onSeekFraction) return track;

  return (
    <Pressable
      style={styles.pressWrap}
      onPress={(e) => {
        if (width > 0) onSeekFraction(e.nativeEvent.locationX / width);
      }}>
      {track}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: { width: '100%', paddingVertical: Spacing.two },
  track: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
