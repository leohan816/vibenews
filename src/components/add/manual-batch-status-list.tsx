// Recent batch + per-item progress with an assertive/polite live region (설계문서/18 §5.3).
import { StyleSheet, Text, View } from 'react-native';

import type { ManualBatchItemView, ManualBatchView } from '@/api/contracts';
import { PipelineStatusPill } from './pipeline-status-pill';

export function ManualBatchStatusList({ batch }: { batch: ManualBatchView | null }) {
  if (!batch) {
    return (
      <View style={styles.empty} accessibilityRole="text">
        <Text style={styles.emptyText}>아직 요청한 배치가 없어요. 위에 YouTube 링크를 넣고 분석을 시작해 보세요.</Text>
      </View>
    );
  }
  return (
    <View accessibilityLabel="최근 배치 진행 상태" accessibilityLiveRegion="polite">
      <Text style={styles.header}>최근 배치 · {batch.items.length}개</Text>
      {batch.items.map((item: ManualBatchItemView) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.rowMain}>
            <Text style={styles.title} numberOfLines={1}>
              {item.videoId ?? '알 수 없는 링크'}
            </Text>
            {item.error ? <Text style={styles.error}>{item.error.message}</Text> : null}
          </View>
          <PipelineStatusPill status={item.status} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { padding: 16, borderRadius: 14, backgroundColor: '#1A140F', borderWidth: 1, borderColor: '#33281F' },
  emptyText: { color: '#A6968A', fontSize: 13 },
  header: { color: '#F4EBE0', fontSize: 15, fontWeight: '800', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#221A14' },
  rowMain: { flex: 1, gap: 2 },
  title: { color: '#F4EBE0', fontSize: 14, fontWeight: '600' },
  error: { color: '#FF6F61', fontSize: 12 },
});
