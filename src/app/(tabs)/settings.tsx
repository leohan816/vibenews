import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <Screen title="Settings" subtitle="개인화 설정" status="mock">
      <Section title="관심 & 브리핑">
        <NavRow label="관심 카테고리" value="AI · 건강 · 투자 · K-Beauty" />
        <NavRow
          label="예약 브리핑 시간"
          value="매일 07:00"
          onPress={() => router.push('/schedule-briefing')}
        />
        <NavRow label="기본 브리핑 길이" value="10분" />
        <NavRow label="Daily Recap 자동 시간" value="매일 23:00" />
      </Section>

      <Section title="오디오 & 분석">
        <NavRow label="톤 / 목소리" value="차분한 남성 (준비 중)" />
        <NavRow label="분석 깊이" value="표준" />
        <NavRow label="음성 명령" value="설정하기" onPress={() => router.push('/voice-command')} />
      </Section>

      <Section title="지식 & 연동">
        <ToggleRow label="개인화 상품 추천" defaultOn />
        <NavRow
          label="상품 추천 살펴보기"
          value="열기"
          onPress={() => router.push('/product-recommendation')}
        />
        <NavRow
          label="Foundation 연동 상태"
          value="내부 저장 중"
          onPress={() => router.push('/foundation-candidate')}
        />
        <ToggleRow label="원문 전체 저장 금지 (지식만 저장)" defaultOn disabled />
      </Section>

      <ThemedView type="backgroundElement" style={styles.freeNote}>
        <ThemedText type="smallBold">현재 모든 기능 무료</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          결제 / paywall 없음. 개인·친구 테스트용입니다.
        </ThemedText>
      </ThemedView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {title}
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.sectionBody}>
        {children}
      </ThemedView>
    </View>
  );
}

function NavRow({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : undefined]}>
      <ThemedText type="small">{label}</ThemedText>
      <View style={styles.rowRight}>
        <ThemedText type="small" themeColor="textSecondary">
          {value}
        </ThemedText>
        {onPress ? (
          <ThemedText type="small" themeColor="textSecondary">
            ›
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

function ToggleRow({
  label,
  defaultOn,
  disabled,
}: {
  label: string;
  defaultOn?: boolean;
  disabled?: boolean;
}) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <View style={styles.row}>
      <ThemedText type="small" style={styles.toggleLabel}>
        {label}
      </ThemedText>
      <Switch value={on} onValueChange={setOn} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  sectionBody: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexShrink: 1,
  },
  toggleLabel: {
    flexShrink: 1,
    paddingRight: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
  freeNote: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
});
