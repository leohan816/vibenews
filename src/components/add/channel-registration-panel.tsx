// Standing-approval channel controls (설계문서/18 §5.2). Max 5, ON/OFF revocation, delete, exact
// standing-approval copy. Enabling requires a fresh D-009-A attestation.
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { ApiClient } from '@/api/client';
import { SCOPE_ATTESTATION_VERSION, type ChannelView } from '@/api/contracts';

const ON_COPY =
  '이 공개 기술 채널의 새 공개 자막 영상을 매시간 확인해 자동 분석·음성 생성을 승인합니다. private·personal·민감 콘텐츠가 되면 먼저 중지하고 범위 승인을 다시 받아야 합니다.';

export function ChannelRegistrationPanel({
  client,
  channels,
  onChange,
}: {
  client: ApiClient;
  channels: ChannelView[];
  onChange: () => void;
}) {
  const [url, setUrl] = useState('');
  const [enable, setEnable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const register = async () => {
    setError(null);
    try {
      await client.createChannel({
        url: url.trim(),
        autoProcessingEnabled: enable,
        ...(enable ? { scopeAttested: true as const, scopeAttestationVersion: SCOPE_ATTESTATION_VERSION } : {}),
      });
      setUrl('');
      onChange();
    } catch {
      setError('채널을 등록할 수 없어요 · 최대 5개까지 등록할 수 있어요');
    }
  };

  const toggle = async (ch: ChannelView, next: boolean) => {
    try {
      await client.patchChannel(ch.id, next ? { autoProcessingEnabled: true, scopeAttested: true, scopeAttestationVersion: SCOPE_ATTESTATION_VERSION } : { autoProcessingEnabled: false });
      onChange();
    } catch {
      setError('상태를 변경할 수 없어요');
    }
  };

  const remove = async (ch: ChannelView) => {
    try {
      await client.deleteChannel(ch.id);
      onChange();
    } catch {
      setError('삭제할 수 없어요');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        자동 처리 채널 ({channels.length}/5)
      </Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="youtube.com/channel/UC… 또는 @handle"
        placeholderTextColor="#6b5d50"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="채널 URL 입력"
      />
      <View style={styles.enableRow}>
        <Text style={styles.enableLabel}>등록 시 자동 처리 켜기</Text>
        <Switch value={enable} onValueChange={setEnable} accessibilityLabel="등록 시 자동 처리 켜기" />
      </View>
      <Text style={styles.copy}>{ON_COPY}</Text>
      <Pressable onPress={register} style={({ pressed }) => [styles.cta, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="채널 등록">
        <Text style={styles.ctaText}>채널 등록</Text>
      </Pressable>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="assertive" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {channels.map((ch) => (
        <View key={ch.id} style={styles.channelRow}>
          <View style={styles.channelMain}>
            <Text style={styles.channelTitle} numberOfLines={1}>
              {ch.publicTitle}
            </Text>
            <Text style={styles.channelMeta}>
              {ch.autoProcessingEnabled ? '자동 처리 켜짐' : '자동 처리 꺼짐'}
              {ch.deferredCount > 0 ? ` · ${ch.deferredCount}개 다음 실행으로 연기됨` : ''}
            </Text>
          </View>
          <Switch value={ch.autoProcessingEnabled} onValueChange={(v) => toggle(ch, v)} accessibilityLabel={`${ch.publicTitle} 자동 처리 토글`} />
          <Pressable onPress={() => remove(ch)} accessibilityRole="button" accessibilityLabel={`${ch.publicTitle} 삭제`} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>삭제</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 18, backgroundColor: '#211A14', borderWidth: 1, borderColor: '#33281F', gap: 10 },
  title: { color: '#F4EBE0', fontSize: 17, fontWeight: '800' },
  input: { borderRadius: 12, borderWidth: 1, borderColor: '#33281F', color: '#F4EBE0', padding: 12, fontSize: 14 },
  enableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  enableLabel: { color: '#F4EBE0', fontSize: 14 },
  copy: { color: '#A6968A', fontSize: 12, lineHeight: 18 },
  cta: { backgroundColor: '#2B2219', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFA23A' },
  ctaText: { color: '#FFA23A', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.8 },
  error: { color: '#FF6F61', fontSize: 13, fontWeight: '600' },
  channelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#221A14' },
  channelMain: { flex: 1, gap: 2 },
  channelTitle: { color: '#F4EBE0', fontSize: 14, fontWeight: '600' },
  channelMeta: { color: '#A6968A', fontSize: 12 },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  deleteText: { color: '#FF6F61', fontSize: 13, fontWeight: '600' },
});
