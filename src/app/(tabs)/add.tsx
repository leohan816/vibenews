// Add tab (설계문서/18 §5). Manual batch → progress → channel standing approvals, plus a push link to
// the preserved Briefing flow. Uses the private API client with the SecureStore bearer token.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getItemAsync } from 'expo-secure-store';

import { ApiClient } from '@/api/client';
import type { ChannelView, ManualBatchView } from '@/api/contracts';
import { ChannelRegistrationPanel } from '@/components/add/channel-registration-panel';
import { ManualBatchForm } from '@/components/add/manual-batch-form';
import { ManualBatchStatusList } from '@/components/add/manual-batch-status-list';

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [batch, setBatch] = useState<ManualBatchView | null>(null);
  const [channels, setChannels] = useState<ChannelView[]>([]);

  const client = useMemo(
    () => new ApiClient({ baseUrl: process.env.EXPO_PUBLIC_VIBENEWS_API_BASE_URL ?? '', getToken: () => getItemAsync('vibenews.device-token.v1') }),
    [],
  );

  const refreshChannels = useCallback(async () => {
    try {
      setChannels(await client.listChannels());
    } catch {
      // API may be unavailable; keep the current list.
    }
  }, [client]);

  // Initial load: fetch inside the effect so the setState only runs after the await (never
  // synchronously within the effect), guarded against a late resolution after unmount.
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const list = await client.listChannels();
        if (active) setChannels(list);
      } catch {
        // API may be unavailable; keep the current list.
      }
    })();
    return () => {
      active = false;
    };
  }, [client]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }]}
    >
      <View style={styles.inner}>
        <Text style={styles.h1} accessibilityRole="header">
          Add
        </Text>
        <ManualBatchForm client={client} onBatch={setBatch} />
        <ManualBatchStatusList batch={batch} />
        <ChannelRegistrationPanel client={client} channels={channels} onChange={refreshChannels} />
        <Pressable
          onPress={() => router.push('/briefing')}
          accessibilityRole="button"
          accessibilityLabel="예약 브리핑 관리 열기"
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        >
          <Text style={styles.linkText}>🗂️ 예약 브리핑 관리 ›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#16110D' },
  content: { paddingHorizontal: 16, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 800, gap: 16 },
  h1: { color: '#F4EBE0', fontSize: 22, fontWeight: '800' },
  link: { padding: 14, borderRadius: 14, backgroundColor: '#211A14', borderWidth: 1, borderColor: '#33281F' },
  linkText: { color: '#F4EBE0', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.8 },
});
