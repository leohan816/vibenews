// Per-item pipeline status pill. Status is conveyed by icon + text, never color alone (설계문서/18 §5.3).
import { StyleSheet, Text, View } from 'react-native';

const LABELS: Record<string, { ko: string; icon: string }> = {
  invalid: { ko: '잘못된 링크', icon: '⚠️' },
  duplicate: { ko: '중복', icon: '♻️' },
  queued: { ko: '검사 중', icon: '⏳' },
  processing: { ko: '분석 중', icon: '⚙️' },
  deferred: { ko: '다음 한도로 연기', icon: '⏸️' },
  human_review_required: { ko: '사람 검토 필요', icon: '👀' },
  audio_ready: { ko: '준비됨', icon: '✅' },
  failed: { ko: '실패', icon: '⚠️' },
  deleted: { ko: '삭제됨', icon: '🗑️' },
};

export function PipelineStatusPill({ status }: { status: string }) {
  const label = LABELS[status] ?? { ko: status, icon: '•' };
  return (
    <View style={styles.pill} accessibilityRole="text" accessibilityLabel={`상태: ${label.ko}`}>
      <Text style={styles.text}>
        {label.icon} {label.ko}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#221A14', borderWidth: 1, borderColor: '#33281F', alignSelf: 'flex-start' },
  text: { color: '#F4EBE0', fontSize: 12, fontWeight: '600' },
});
