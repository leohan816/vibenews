/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// cosmile 스타일 팔레트: 따뜻한 크림 배경 + 오렌지 포인트 + 흰 카드.
export const Colors = {
  light: {
    text: '#2A211C',
    textSecondary: '#8C7F77',
    background: '#FBEDE6', // 페이지: 크림/피치
    card: '#FFFFFF', // 카드: 흰색
    backgroundElement: '#FBE2D4', // 칩/연한 면
    backgroundSelected: '#F7D3C0',
    tint: '#F5641E', // 브랜드 오렌지
    tintSoft: '#FDE6DA', // 배지/필 배경
    border: '#F0DBCF',
    danger: '#FF3B30',
  },
  dark: {
    text: '#F7EDE7',
    textSecondary: '#B9ABA3',
    background: '#1A1512',
    card: '#241C18',
    backgroundElement: '#2E2420',
    backgroundSelected: '#3A2D27',
    tint: '#FF7A3D',
    tintSoft: '#3A2A22',
    border: '#3A2D27',
    danger: '#FF6B5E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
