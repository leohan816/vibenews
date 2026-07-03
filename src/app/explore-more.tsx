import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { exploreMores, sourceMetaById } from '@/data/mockData';

const em = exploreMores[0];

export default function ExploreMoreScreen() {
  const sources = em.sourceMetaIds.map(sourceMetaById).filter(Boolean);

  return (
    <Screen subtitle="링크 목록이 아니라, 관련 자료를 내부적으로 분석한 심층 요약입니다." status="mock">
      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          핵심 결론
        </ThemedText>
        <ThemedText type="default">{em.keyConclusion}</ThemedText>
      </Card>

      <Bullets title="여러 자료에서 반복되는 흐름" items={em.recurringThemes} />

      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          서로 다른 관점
        </ThemedText>
        {em.perspectives.map((p) => (
          <ThemedText key={p.label} type="small">
            • <ThemedText type="smallBold">{p.label}:</ThemedText> {p.text}
          </ThemedText>
        ))}
      </Card>

      <Bullets title="확실한 사실" items={em.certainFacts} />
      <Bullets title="불확실한 주장" items={em.uncertainClaims} />
      <Bullets title="커뮤니티 반응" items={em.communityReactions} />
      <Bullets title="사용자와의 연결" items={em.personalConnections} />
      <Bullets title="실행 아이디어" items={em.actionIdeas} />
      <Bullets title="추가 학습 질문" items={em.followUpQuestions} />

      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          분석에 사용한 출처 {sources.length}곳
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {sources.map((s) => s!.type.toUpperCase()).join(' · ')} — 링크 클릭 없이 내부 분석 결과만 제공합니다.
        </ThemedText>
      </Card>
    </Screen>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.block}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {title}
      </ThemedText>
      {items.map((t, i) => (
        <ThemedText key={i} type="small">
          • {t}
        </ThemedText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.one,
  },
});
