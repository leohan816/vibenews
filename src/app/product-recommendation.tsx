import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { categoryById, productRecommendations } from '@/data/mockData';
import type { ProductRecommendation } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { EVENTS, logEvent } from '@/lib/eventLog';

export default function ProductRecommendationScreen() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const onSave = (id: string) => {
    logEvent(EVENTS.productCardSaved, { id });
    setSavedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <Screen
      subtitle="오늘 들은 주제/관심사와 연결된 제품 예시 (mock)"
      status="mock">
      {productRecommendations.map((p) => (
        <ProductCard key={p.id} product={p} saved={savedIds.includes(p.id)} onSave={() => onSave(p.id)} />
      ))}

      <ThemedText type="small" themeColor="textSecondary" style={styles.notice}>
        관심사·관련 키워드 기반으로 연결한 제품 예시일 뿐이며, 효능·효과를 보장하지 않습니다. 구매나 섭취 전 전문가와 상담하세요.
      </ThemedText>
    </Screen>
  );
}

function ProductCard({
  product,
  saved,
  onSave,
}: {
  product: ProductRecommendation;
  saved: boolean;
  onSave: () => void;
}) {
  const theme = useTheme();
  const category = categoryById(product.relatedCategoryId);

  return (
    <Card>
      <View style={styles.cardTop}>
        <ThemedView type="background" style={styles.image}>
          <ThemedText type="title">🛍️</ThemedText>
        </ThemedView>
        <View style={styles.headText}>
          <ThemedText type="smallBold">{product.name}</ThemedText>
          {category ? (
            <ThemedText type="small" themeColor="textSecondary">
              관심사 기반 · {category.name}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <ThemedText type="small">{product.reasonText}</ThemedText>

      <View style={styles.keywordRow}>
        {product.reasonKeywords.map((kw) => (
          <View key={kw} style={[styles.keyword, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small"># {kw}</ThemedText>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onSave}
        disabled={saved}
        style={({ pressed }) => [
          styles.saveButton,
          { borderColor: theme.text },
          saved && { backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}>
        <ThemedText type="smallBold" themeColor={saved ? 'textSecondary' : 'text'}>
          {saved ? '저장됨 (mock)' : '저장 (mock)'}
        </ThemedText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginTop: Spacing.one,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  keyword: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.five,
  },
  saveButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    marginTop: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
});
