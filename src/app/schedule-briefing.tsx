import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { categories, scheduledBriefings } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';
import { EVENTS, logEvent } from '@/lib/eventLog';

const base = scheduledBriefings[0];

const DAYS: { value: number; label: string }[] = [
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
  { value: 0, label: '일' },
];

const LENGTHS = [3, 5, 10, 15] as const;
const READY_LENGTH = 10; // 지금은 10분만 실제 제공, 나머지는 준비 중

function formatTime(timeOfDay: string): string {
  const [hStr, mStr] = timeOfDay.split(':');
  const hour = Number(hStr);
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${hour12}:${mStr}`;
}

function formatDays(selected: number[]): string {
  if (selected.length === 0) return '요일 미선택';
  if (selected.length === 7) return '매일';
  const weekdays = [1, 2, 3, 4, 5];
  if (selected.length === 5 && weekdays.every((d) => selected.includes(d))) return '평일';
  return DAYS.filter((d) => selected.includes(d.value))
    .map((d) => d.label)
    .join('·');
}

export default function ScheduleBriefingScreen() {
  const theme = useTheme();
  const [days, setDays] = useState<number[]>(base.daysOfWeek);
  const [lengthMin, setLengthMin] = useState<number>(base.lengthMin);
  const [categoryIds, setCategoryIds] = useState<string[]>(base.categoryIds);
  const [saved, setSaved] = useState(false);

  const dirty = () => setSaved(false);

  const toggleDay = (value: number) => {
    dirty();
    setDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  };

  const toggleCategory = (id: string) => {
    dirty();
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const selectLength = (min: number) => {
    dirty();
    setLengthMin(min);
  };

  const onSave = () => {
    logEvent(EVENTS.scheduledBriefingCreated, {});
    setSaved(true);
  };

  const selectedCategoryNames = categories
    .filter((c) => categoryIds.includes(c.id))
    .map((c) => c.name)
    .join(' · ');

  return (
    <Screen subtitle="정해진 시간에 브리핑이 자동으로 준비되도록 예약합니다." status="mock">
      {/* 요약 배너 */}
      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          예약 요약
        </ThemedText>
        <ThemedText type="subtitle">
          {formatDays(days)} {formatTime(base.timeOfDay)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {selectedCategoryNames || '카테고리 미선택'} · 약 {lengthMin}분
        </ThemedText>
      </Card>

      {/* 예약 시간 */}
      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          예약 시간
        </ThemedText>
        <Card>
          <ThemedText type="default">{formatTime(base.timeOfDay)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            시간 직접 선택은 준비 중입니다. 지금은 매일 아침 7:00 기준으로 준비돼요.
          </ThemedText>
        </Card>
        <View style={styles.chipRow}>
          {DAYS.map((d) => (
            <Chip
              key={d.value}
              label={d.label}
              active={days.includes(d.value)}
              onPress={() => toggleDay(d.value)}
            />
          ))}
        </View>
      </View>

      {/* 브리핑 길이 */}
      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          브리핑 길이
        </ThemedText>
        <View style={styles.chipRow}>
          {LENGTHS.map((min) => (
            <Chip
              key={min}
              label={`${min}분`}
              active={lengthMin === min}
              onPress={() => selectLength(min)}
            />
          ))}
        </View>
        {lengthMin === READY_LENGTH ? (
          <ThemedText type="small" themeColor="textSecondary">
            기본 길이 10분으로 준비됩니다.
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            {lengthMin}분 길이는 준비 중이에요. 지금은 10분 브리핑으로 제공됩니다.
          </ThemedText>
        )}
      </View>

      {/* 카테고리 선택 */}
      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          카테고리 선택
        </ThemedText>
        <View style={styles.chipRow}>
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              active={categoryIds.includes(c.id)}
              onPress={() => toggleCategory(c.id)}
            />
          ))}
        </View>
      </View>

      {/* 안내 문구 */}
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          밤새 시스템이 선택한 카테고리의 뉴스를 찾아 정리해, 다음 날 아침 예약 시간에 맞춰 브리핑을 준비해 둡니다.
        </ThemedText>
      </Card>

      {/* 예약 저장 */}
      <Pressable
        onPress={onSave}
        style={({ pressed }) => [
          styles.saveButton,
          { backgroundColor: theme.text },
          pressed && styles.pressed,
        ]}>
        <ThemedText type="smallBold" themeColor="background">
          예약 저장
        </ThemedText>
      </Pressable>

      {saved ? (
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.savedNote}>
          저장됨 (mock) — 실제 스케줄러 연동은 준비 중입니다.
        </ThemedText>
      ) : null}
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: active ? theme.text : theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="small" style={{ color: active ? theme.background : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  pressed: { opacity: 0.7 },
  saveButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  savedNote: {
    textAlign: 'center',
  },
});
