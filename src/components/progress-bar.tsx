import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** mock 진행바. progress 는 0~1. */
export function ProgressBar({ progress }: { progress: number }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.fill, { backgroundColor: theme.text, width: `${pct}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
