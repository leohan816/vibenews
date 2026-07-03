import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { categories, categoryById, savedCards, TODAY } from '@/data/mockData';
import type { FoundationStatus, KnowledgeType } from '@/data/types';
import { EVENTS, logEvent } from '@/lib/eventLog';
import { useTheme } from '@/hooks/use-theme';

const TIME_FILTERS = ['오늘', '이번 주', '전체'] as const;
const TYPE_FILTERS: (KnowledgeType | '전체')[] = [
  '전체',
  'Fact',
  'Trend',
  'Insight',
  'Action',
  'Question',
];

const FOUNDATION_LABEL: Record<FoundationStatus, string> = {
  local_only: '내부 저장',
  candidate: 'Foundation 후보',
  approved_for_foundation: '승인됨',
  synced_to_foundation: '동기화됨',
  rejected: '거부됨',
};

const dayOf = (iso: string) => iso.slice(0, 10); // 'YYYY-MM-DD'
const daysBetween = (a: string, b: string) =>
  (new Date(`${a}T00:00:00Z`).getTime() - new Date(`${b}T00:00:00Z`).getTime()) / 86_400_000;

function inTimeWindow(savedAt: string, time: (typeof TIME_FILTERS)[number]): boolean {
  if (time === '전체') return true;
  const day = dayOf(savedAt);
  if (time === '오늘') return day === TODAY;
  const diff = daysBetween(TODAY, day); // TODAY 기준 며칠 전
  return diff >= 0 && diff <= 7; // 이번 주 = 최근 7일
}

export default function SavedScreen() {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<string>('all');
  const [time, setTime] = useState<(typeof TIME_FILTERS)[number]>('전체');
  const [type, setType] = useState<(typeof TYPE_FILTERS)[number]>('전체');

  const filtered = savedCards.filter(
    (c) =>
      (categoryId === 'all' || c.categoryId === categoryId) &&
      (type === '전체' || c.knowledgeType === type) &&
      inTimeWindow(c.savedAt, time),
  );

  return (
    <Screen title="Saved" subtitle="저장된 뉴스 지식" status="mock">
      {/* 카테고리 필터 */}
      <FilterRow>
        <Chip label="전체" active={categoryId === 'all'} onPress={() => setCategoryId('all')} />
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            active={categoryId === c.id}
            onPress={() => setCategoryId(c.id)}
          />
        ))}
      </FilterRow>

      {/* 시간 필터 */}
      <FilterRow>
        {TIME_FILTERS.map((t) => (
          <Chip key={t} label={t} active={time === t} onPress={() => setTime(t)} />
        ))}
      </FilterRow>

      {/* 지식 유형 필터 */}
      <FilterRow>
        {TYPE_FILTERS.map((t) => (
          <Chip key={t} label={t} active={type === t} onPress={() => setType(t)} />
        ))}
      </FilterRow>

      {filtered.map((c) => (
        <Card
          key={c.id}
          onPress={() => {
            logEvent(EVENTS.savedCardOpened, { id: c.id });
            router.push('/saved-card-detail');
          }}>
          <View style={styles.cardTop}>
            <TypeBadge type={c.knowledgeType} />
            <ThemedText type="small" themeColor="textSecondary">
              뉴스 지식 · {categoryById(c.categoryId)?.name}
            </ThemedText>
          </View>
          <ThemedText type="default" style={styles.knowledge}>
            {c.knowledgeText}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {c.summary}
          </ThemedText>
          {c.foundationStatus ? <FoundationChip status={c.foundationStatus} /> : null}
        </Card>
      ))}

      {filtered.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          이 필터에 해당하는 저장 카드가 없어요.
        </ThemedText>
      ) : null}
    </Screen>
  );
}

function FilterRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}>
      {children}
    </ScrollView>
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

function TypeBadge({ type }: { type: KnowledgeType }) {
  const theme = useTheme();
  return (
    <View style={[styles.typeBadge, { borderColor: theme.text }]}>
      <ThemedText type="small">{type}</ThemedText>
    </View>
  );
}

function FoundationChip({ status }: { status: FoundationStatus }) {
  const theme = useTheme();
  return (
    <View style={[styles.foundationChip, { backgroundColor: theme.backgroundSelected }]}>
      <ThemedText type="small" themeColor="textSecondary">
        ☁ Foundation: {FOUNDATION_LABEL[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    gap: Spacing.one,
    paddingRight: Spacing.four,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  pressed: { opacity: 0.7 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  knowledge: {
    fontWeight: '600',
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  foundationChip: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    marginTop: Spacing.one,
  },
});
