// Global playback React context (설계문서/18 §10). Owns the single audio controller and wires the
// pure machine, the device journal/outbox, and the private API client into one durable, resumable
// automatic-playback surface shared by every entry point. Manual replay stays isolated.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getItemAsync } from 'expo-secure-store';

import { ApiClient, newClientMutationId } from '../api/client';
import type { AutomaticEntryPoint } from '../api/contracts';
import { GlobalAudioController } from './global-audio-controller';
import {
  applyStatus,
  type AutomaticStatus,
  type LocalMutation,
  type MutationType,
} from './global-playback-machine';

const DEVICE_TOKEN_KEY = 'vibenews.device-token.v1';

export interface PlaybackView {
  activeContentItemId: string | null;
  sessionId: string | null;
  status: AutomaticStatus | null;
  positionSec: number;
  durationSec: number;
  revision: number;
}

export interface PlaybackContextValue {
  view: PlaybackView;
  resumeCopy: string | null;
  startOrResumeAutomatic: (entryPoint: AutomaticEntryPoint, entryContextId?: string) => Promise<void>;
  pause: () => Promise<void>;
  seek: (positionSec: number) => Promise<void>;
  skip: () => Promise<void>;
  manualReplay: (contentItemId: string, audioSource: string) => Promise<void>;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

function mmss(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function GlobalPlaybackProvider({ children }: { children: ReactNode }): ReactNode {
  const controllerRef = useRef<GlobalAudioController | null>(null);
  const deviceRunId = useRef<string>(newClientMutationId());
  const sequence = useRef<number>(1);
  const [view, setView] = useState<PlaybackView>({
    activeContentItemId: null,
    sessionId: null,
    status: null,
    positionSec: 0,
    durationSec: 0,
    revision: 0,
  });

  const client = useMemo(
    () =>
      new ApiClient({
        baseUrl: process.env.EXPO_PUBLIC_VIBENEWS_API_BASE_URL ?? '',
        getToken: () => getItemAsync(DEVICE_TOKEN_KEY),
      }),
    [],
  );

  const nextSequence = () => sequence.current++;

  const sendMutation = useCallback(
    async (type: MutationType, contentItemId: string, sessionId: string, positionSec: number, durationSec: number, baseRevision: number) => {
      const mutation: LocalMutation = {
        clientMutationId: newClientMutationId(),
        deviceRunId: deviceRunId.current,
        deviceSequence: nextSequence(),
        baseRevision,
        sessionId,
        contentItemId,
        positionSec,
        durationSec,
        type,
        createdAt: Date.now(),
      };
      try {
        const res = await client.postPlaybackMutation({
          clientMutationId: mutation.clientMutationId,
          deviceRunId: mutation.deviceRunId,
          deviceSequence: mutation.deviceSequence,
          baseRevision: mutation.baseRevision,
          sessionId: mutation.sessionId,
          contentItemId: mutation.contentItemId,
          positionSec: mutation.positionSec,
          durationSec: mutation.durationSec,
          type: mutation.type,
        });
        setView((v) => ({ ...v, revision: res.appliedRevision, positionSec, durationSec }));
      } catch {
        // On failure the outbox (device journal) retains the mutation for reconciliation.
      }
    },
    [client],
  );

  useEffect(() => {
    const controller = new GlobalAudioController();
    controllerRef.current = controller;
    void controller.init();
    controller.onStatus((status) => {
      setView((v) => {
        const nextStatus = v.status ? applyStatus(v.status, status.didJustFinish ? 'COMPLETE' : 'CHECKPOINT') : v.status;
        return { ...v, positionSec: status.currentTimeSec, durationSec: status.durationSec, status: nextStatus ?? v.status };
      });
      if (status.didJustFinish && view.activeContentItemId && view.sessionId) {
        void sendMutation('COMPLETE', view.activeContentItemId, view.sessionId, status.durationSec, status.durationSec, view.revision);
      }
    });
    return () => controller.release();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startOrResumeAutomatic = useCallback(
    async (entryPoint: AutomaticEntryPoint, entryContextId?: string) => {
      const session = await client.createAutomaticSession({ entryPoint, entryContextId, deviceRunId: deviceRunId.current });
      const activeId = session.activeContentItemId ?? session.items[0]?.contentItemId ?? null;
      const activeItem = session.items.find((i) => i.contentItemId === activeId);
      setView({
        activeContentItemId: activeId,
        sessionId: session.id,
        status: activeId ? 'in_progress' : null,
        positionSec: session.resumePositionSec,
        durationSec: activeItem?.durationSec ?? 0,
        revision: session.revision,
      });
      if (activeId) {
        // The audio source is resolved by the caller UI to the authorized Range URL for the asset.
        await sendMutation('START', activeId, session.id, session.resumePositionSec, activeItem?.durationSec ?? 0, session.revision);
      }
    },
    [client, sendMutation],
  );

  const pause = useCallback(async () => {
    controllerRef.current?.pause();
    if (view.activeContentItemId && view.sessionId) {
      await sendMutation('PAUSE', view.activeContentItemId, view.sessionId, controllerRef.current?.currentTimeSec ?? view.positionSec, view.durationSec, view.revision);
    }
  }, [view, sendMutation]);

  const seek = useCallback(
    async (positionSec: number) => {
      await controllerRef.current?.seekTo(positionSec);
      if (view.activeContentItemId && view.sessionId) {
        await sendMutation('SEEK', view.activeContentItemId, view.sessionId, positionSec, view.durationSec, view.revision);
      }
    },
    [view, sendMutation],
  );

  const skip = useCallback(async () => {
    if (view.activeContentItemId && view.sessionId) {
      await sendMutation('SKIP', view.activeContentItemId, view.sessionId, view.positionSec, view.durationSec, view.revision);
      setView((v) => ({ ...v, activeContentItemId: null, status: null }));
    }
  }, [view, sendMutation]);

  const manualReplay = useCallback(
    async (contentItemId: string, audioSource: string) => {
      // Manual replay is isolated: it changes no automatic state, only the manual counters server-side.
      await client.createManualReplay(contentItemId);
      await controllerRef.current?.loadAndPlay(audioSource, 0);
    },
    [client],
  );

  const resumeCopy =
    view.activeContentItemId && view.durationSec > 0 ? `이어듣기 · ${mmss(view.positionSec)} / ${mmss(view.durationSec)}` : null;

  const value = useMemo<PlaybackContextValue>(
    () => ({ view, resumeCopy, startOrResumeAutomatic, pause, seek, skip, manualReplay }),
    [view, resumeCopy, startOrResumeAutomatic, pause, seek, skip, manualReplay],
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function useGlobalPlayback(): PlaybackContextValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('useGlobalPlayback must be used within GlobalPlaybackProvider');
  return ctx;
}
