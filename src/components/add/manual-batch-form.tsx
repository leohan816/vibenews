// Manual batch card (설계문서/18 §5.2). Up to 10 links; per-line client validation mirrors the
// server; the CTA is the explicit processing approval AND the D-009-A scope attestation.
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiClient } from '@/api/client';
import { SCOPE_ATTESTATION_VERSION, type ManualBatchView } from '@/api/contracts';

const ATTESTATION_COPY =
  '공개 YouTube의 저위험 기술 콘텐츠만 분석합니다. private 문서·개인 대화·민감정보는 넣지 마세요. 공개 자막을 분석하고 개인용 음성을 만들며 원본 영상·음성은 내려받지 않아요.';

type LineStatus = 'valid' | 'duplicate_in_input' | 'unsupported_host' | 'invalid_video_url';

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
function classifyLine(raw: string, seen: Set<string>): LineStatus {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return 'invalid_video_url';
  }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return 'unsupported_host';
  const host = u.hostname.toLowerCase();
  let id: string | null = null;
  if (host === 'www.youtube.com' || host === 'youtube.com' || host === 'm.youtube.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else if (u.pathname.startsWith('/shorts/')) id = u.pathname.slice(8).split('/')[0] ?? null;
    else return 'unsupported_host';
  } else if (host === 'youtu.be') {
    id = u.pathname.slice(1).split('/')[0] ?? null;
  } else {
    return 'unsupported_host';
  }
  if (!id || !VIDEO_ID.test(id)) return 'invalid_video_url';
  if (seen.has(id)) return 'duplicate_in_input';
  seen.add(id);
  return 'valid';
}

export function ManualBatchForm({ client, onBatch }: { client: ApiClient; onBatch: (batch: ManualBatchView) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const lines = useMemo(() => text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0), [text]);
  const tooMany = lines.length > 10;
  const seen = new Set<string>();
  const statuses = lines.slice(0, 10).map((l) => classifyLine(l, seen));
  const validUrls = lines.slice(0, 10).filter((_, i) => statuses[i] === 'valid');

  const submit = async () => {
    if (tooMany) {
      setError('한 번에 최대 10개예요');
      return;
    }
    if (validUrls.length === 0) {
      setError('유효한 YouTube 링크를 한 개 이상 넣어주세요');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const batch = await client.createManualBatch({ urls: validUrls, scopeAttested: true, scopeAttestationVersion: SCOPE_ATTESTATION_VERSION });
      onBatch(batch);
      setText('');
    } catch {
      setError('서버에 연결할 수 없어요 · 다시 시도');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        YouTube 링크 추가
      </Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
        placeholder={'한 줄에 링크 하나씩 (최대 10개)'}
        placeholderTextColor="#6b5d50"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="YouTube 링크 입력, 한 줄에 하나씩 최대 10개"
      />
      {tooMany ? (
        <Text style={styles.error} accessibilityLiveRegion="assertive" accessibilityRole="alert">
          한 번에 최대 10개예요
        </Text>
      ) : null}
      <Text style={styles.attestation}>{ATTESTATION_COPY}</Text>
      <Pressable
        onPress={submit}
        disabled={submitting}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="분석·음성 생성. 누르면 공개 저위험 기술 콘텐츠 범위에 동의합니다."
        accessibilityState={{ disabled: submitting }}
      >
        <Text style={styles.ctaText}>{submitting ? '요청 중…' : '분석·음성 생성'}</Text>
      </Pressable>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="assertive" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 18, backgroundColor: '#211A14', borderWidth: 1, borderColor: '#33281F', gap: 10 },
  title: { color: '#F4EBE0', fontSize: 17, fontWeight: '800' },
  input: { minHeight: 96, borderRadius: 12, borderWidth: 1, borderColor: '#33281F', color: '#F4EBE0', padding: 12, fontSize: 14, textAlignVertical: 'top' },
  attestation: { color: '#A6968A', fontSize: 12, lineHeight: 18 },
  cta: { backgroundColor: '#FFA23A', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  ctaText: { color: '#16110D', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.8 },
  error: { color: '#FF6F61', fontSize: 13, fontWeight: '600' },
});
