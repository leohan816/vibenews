import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { knowledgeCandidates } from '@/data/mockData';
import type { FoundationStatus, KnowledgeType } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { EVENTS, logEvent } from '@/lib/eventLog';

// 상태 한국어 병기 라벨
const STATUS_LABELS: Record<FoundationStatus, string> = {
  local_only: '내부 저장',
  candidate: '후보',
  approved_for_foundation: '승인됨',
  synced_to_foundation: '동기화됨',
  rejected: '거부됨',
};

const STATUS_FILTERS: { value: FoundationStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'local_only', label: `local_only · ${STATUS_LABELS.local_only}` },
  { value: 'candidate', label: `candidate · ${STATUS_LABELS.candidate}` },
  {
    value: 'approved_for_foundation',
    label: `approved · ${STATUS_LABELS.approved_for_foundation}`,
  },
  { value: 'synced_to_foundation', label: `synced · ${STATUS_LABELS.synced_to_foundation}` },
  { value: 'rejected', label: `rejected · ${STATUS_LABELS.rejected}` },
];

export default function FoundationCandidateScreen() {
  const [filter, setFilter] = useState<FoundationStatus | 'all'>('all');

  // 승인/거부는 로컬 state 로만 반영 (실제 Foundation 동기화 없음)
  const [statusById, setStatusById] = useState<Record<string, FoundationStatus>>(() =>
    Object.fromEntries(knowledgeCandidates.map((c) => [c.id, c.foundationStatus])),
  );

  const filtered = useMemo(
    () => knowledgeCandidates.filter((c) => filter === 'all' || statusById[c.id] === filter),
    [filter, statusById],
  );

  const decide = (id: string, next: FoundationStatus) => {
    setStatusById((prev) => ({ ...prev, [id]: next }));
    logEvent(EVENTS.foundationCandidateCreated, { id, foundationStatus: next, mock: true });
  };

  return (
    <Screen subtitle="검증된 뉴스 지식만 Foundation 후보로 검토합니다." status="future">
      {/* 저장 원칙 안내 */}
      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Foundation 저장 원칙
        </ThemedText>
        <ThemedText type="small">
          원문 전체 저장 금지 — 검증된 지식 / 요약 / 인사이트 / 출처 메타만 Foundation 후보로
          올립니다.
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          knowledgeClass = news_knowledge · knowledgeSource = vibenews · freshness = time_sensitive
        </ThemedText>
      </Card>

      {/* 상태 필터 칩 */}
      <FilterRow>
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            active={filter === f.value}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </FilterRow>

      {/* 후보 카드 목록 */}
      {filtered.map((c) => {
        const status = statusById[c.id];
        return (
          <Card key={c.id}>
            <View style={styles.cardTop}>
              <TypeBadge type={c.knowledgeType} />
              <FoundationBadge status={status} />
            </View>

            <ThemedText type="default" style={styles.title}>
              {c.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {c.summary}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              출처 {c.sourceMetaIds.length}곳 · 신뢰도 {c.confidenceLevel} · knowledgeClass{' '}
              {c.knowledgeClass}
            </ThemedText>

            <View style={styles.actions}>
              <ActionButton
                label="승인"
                variant="solid"
                disabled={status === 'approved_for_foundation' || status === 'synced_to_foundation'}
                onPress={() => decide(c.id, 'approved_for_foundation')}
              />
              <ActionButton
                label="거부"
                variant="outline"
                disabled={status === 'rejected'}
                onPress={() => decide(c.id, 'rejected')}
              />
            </View>
          </Card>
        );
      })}

      {filtered.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          이 상태에 해당하는 후보가 없어요.
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

function FoundationBadge({ status }: { status: FoundationStatus }) {
  const theme = useTheme();
  return (
    <View style={[styles.foundationBadge, { borderColor: theme.textSecondary }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {status} · {STATUS_LABELS[status]}
      </ThemedText>
    </View>
  );
}

function ActionButton({
  label,
  variant,
  disabled,
  onPress,
}: {
  label: string;
  variant: 'solid' | 'outline';
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const solid = variant === 'solid';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        solid
          ? { backgroundColor: theme.text }
          : { borderWidth: 1, borderColor: theme.textSecondary },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <ThemedText type="smallBold" style={{ color: solid ? theme.background : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
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
  disabled: { opacity: 0.4 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    fontWeight: '600',
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  foundationBadge: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
});
