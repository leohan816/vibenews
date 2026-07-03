import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { categoryById, savedCards, sourceMetaById } from '@/data/mockData';
import type { KnowledgeType } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { EVENTS, logEvent } from '@/lib/eventLog';

// 파라미터가 없으므로 첫 저장 카드를 대표 예시로 사용한다.
const card = savedCards[0];

export default function SavedCardDetailScreen() {
  const router = useRouter();
  const category = categoryById(card.categoryId);
  const sources = card.sourceMetaIds.map(sourceMetaById).filter(Boolean);

  const openExploreMore = () => {
    logEvent(EVENTS.exploreMoreOpened, {});
    router.push('/explore-more');
  };

  return (
    <Screen subtitle="저장된 뉴스 지식 하나를 자세히 봅니다." status="mock">
      {/* 라벨 + 지식 유형 배지 + 카테고리 */}
      <View style={styles.headerRow}>
        <TypeBadge type={card.knowledgeType} />
        <ThemedText type="small" themeColor="textSecondary">
          뉴스 지식{category ? ` · ${category.name}` : ''}
        </ThemedText>
      </View>

      {/* 지식 문장 */}
      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          지식 문장
        </ThemedText>
        <ThemedText type="default" style={styles.knowledge}>
          {card.knowledgeText}
        </ThemedText>
      </Card>

      {/* 요약 */}
      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          요약
        </ThemedText>
        <ThemedText type="default">{card.summary}</ThemedText>
      </Card>

      {/* 원문 미저장 원칙 */}
      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          저장 원칙
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          원문 전체는 저장하거나 표시하지 않습니다. 가치 있는 지식 문장, 요약, 출처 메타데이터만 남깁니다.
        </ThemedText>
      </Card>

      {/* 출처 메타: 타입/제목만 (링크 클릭 비의존) */}
      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          출처 메타 {sources.length}곳
        </ThemedText>
        {sources.length > 0 ? (
          sources.map((s) => (
            <ThemedText key={s!.id} type="small">
              • <ThemedText type="smallBold">{s!.type.toUpperCase()}</ThemedText> {s!.title}
            </ThemedText>
          ))
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            연결된 출처 메타가 없습니다.
          </ThemedText>
        )}
        <ThemedText type="small" themeColor="textSecondary">
          링크 클릭 없이 출처의 유형과 제목만 기록합니다.
        </ThemedText>
      </Card>

      {/* Foundation 후보 상태 */}
      <Card>
        <View style={styles.headerRow}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Foundation 상태
          </ThemedText>
          <FoundationBadge label="candidate" />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          가치 있는 지식만 Foundation 후보로 올라갑니다. 검토를 거쳐 장기 지식 베이스에 동기화될 수 있습니다.
        </ThemedText>
      </Card>

      {/* 더 알아보기 */}
      <Pressable onPress={openExploreMore} style={({ pressed }) => [pressed && styles.pressed]}>
        <Card>
          <ThemedText type="linkPrimary">🔎 더 알아보기</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            링크 목록이 아니라, 관련 자료를 내부적으로 분석한 심층 요약을 봅니다.
          </ThemedText>
        </Card>
      </Pressable>
    </Screen>
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

function FoundationBadge({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.foundationBadge, { backgroundColor: theme.backgroundSelected }]}>
      <ThemedText type="small">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  foundationBadge: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
