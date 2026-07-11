import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { GlobalPlaybackProvider } from '@/audio/global-playback-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GlobalPlaybackProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="briefing" options={{ title: '브리핑 관리' }} />
          <Stack.Screen name="briefing-session" options={{ title: '재생 중' }} />
        <Stack.Screen name="explore-more" options={{ title: '더 알아보기' }} />
        <Stack.Screen name="daily-recap-detail" options={{ title: 'Daily Recap' }} />
        <Stack.Screen name="saved-card-detail" options={{ title: '뉴스 지식' }} />
        <Stack.Screen name="schedule-briefing" options={{ title: '예약 브리핑' }} />
        <Stack.Screen name="foundation-candidate" options={{ title: 'Foundation 후보' }} />
        <Stack.Screen name="product-recommendation" options={{ title: '개인화 상품' }} />
          <Stack.Screen name="voice-command" options={{ title: '음성 명령' }} />
        </Stack>
      </GlobalPlaybackProvider>
    </ThemeProvider>
  );
}
