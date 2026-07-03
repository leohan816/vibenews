import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/**
 * 재생 화면 중앙의 ambient / thinking visual (placeholder).
 * 재생 중일 때 부드럽게 맥동(pulse)한다. 실제 오디오 파형은 나중에 연결.
 */
export function AmbientVisual({ active }: { active: boolean }) {
  const theme = useTheme();
  // 렌더 간 안정적인 Animated.Value 인스턴스(ref-during-render 회피).
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!active) {
      pulse.stopAnimation();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const ring = (scaleTo: number, opacityFrom: number) => ({
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, scaleTo] }) }],
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [opacityFrom, 0] }),
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, { borderColor: theme.text }, ring(1.6, 0.25)]} />
      <Animated.View style={[styles.ring, { borderColor: theme.text }, ring(1.35, 0.4)]} />
      <View style={[styles.core, { backgroundColor: theme.backgroundElement, borderColor: theme.text }]}>
        <Animated.Text
          style={[
            styles.emoji,
            { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] },
          ]}>
          {active ? '🧠' : '🎧'}
        </Animated.Text>
      </View>
    </View>
  );
}

const SIZE = 200;
const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
  },
  core: {
    width: SIZE * 0.6,
    height: SIZE * 0.6,
    borderRadius: SIZE * 0.3,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 56,
  },
});
