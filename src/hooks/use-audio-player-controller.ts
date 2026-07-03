// 오디오 재생 컨트롤러 (설계문서/02_Listen_오디오_플레이어.md)
// expo-audio 를 래핑해 chapter 큐/재생 상태/컨트롤을 노출한다. 실제 수집/TTS 없음.
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { NewsAudioItem, PlaybackStatus } from '@/data/types';
import { fallbackSampleFor } from '@/lib/audio';
import { EVENTS, logEvent } from '@/lib/eventLog';

const PLAYER_OPTIONS = { updateInterval: 400 };

function uriFor(item: NewsAudioItem, index: number): string {
  return item.audioUrl ?? fallbackSampleFor(index);
}

export type AudioController = {
  index: number;
  total: number;
  current: NewsAudioItem;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  status: PlaybackStatus;
  sessionCompleted: boolean;
  usingFallbackAudio: boolean;
  canPrev: boolean;
  canNext: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seekToFraction: (fraction: number) => void;
};

export function useAudioPlayerController(items: NewsAudioItem[]): AudioController {
  const [index, setIndex] = useState(0);
  const [wantPlaying, setWantPlaying] = useState(true); // 진입 시 자동재생 의도
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const current = items[index];
  // source(uri)가 바뀌면 훅이 player 를 값 기준으로 재생성한다.
  const player = useAudioPlayer({ uri: uriFor(current, index) }, PLAYER_OPTIONS);
  const status = useAudioPlayerStatus(player);

  // iOS 무음 스위치에서도 재생되도록. 배경 재생은 future(설정 안 함).
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  // 로드 완료 + 재생 의도면 재생(자동 이어재생/진입 자동재생). 웹 autoplay 차단 시엔 조용히 무시된다.
  useEffect(() => {
    if (wantPlaying && status.isLoaded && !sessionCompleted) {
      player.play();
    }
  }, [player, status.isLoaded, wantPlaying, sessionCompleted]);

  // 재생 완료 → 다음 chapter, 마지막이면 session completed. player 당 1회만 처리.
  const finishGuard = useRef<unknown>(null);
  useEffect(() => {
    if (status.didJustFinish && finishGuard.current !== player) {
      finishGuard.current = player;
      logEvent(EVENTS.audioCompleted, { id: current.id, index });
      if (index < items.length - 1) {
        setIndex(index + 1);
      } else {
        setWantPlaying(false);
        setSessionCompleted(true);
      }
    }
  }, [status.didJustFinish, player, index, items.length, current.id]);

  const play = useCallback(() => {
    if (sessionCompleted) player.seekTo(0);
    setSessionCompleted(false);
    setWantPlaying(true);
    player.play();
    logEvent(EVENTS.audioPlayStarted, { id: current.id, index });
  }, [player, current.id, index, sessionCompleted]);

  const pause = useCallback(() => {
    setWantPlaying(false);
    player.pause();
    logEvent(EVENTS.audioPaused, { id: current.id, index });
  }, [player, current.id, index]);

  const togglePlay = useCallback(() => {
    if (status.playing) pause();
    else play();
  }, [status.playing, play, pause]);

  const next = useCallback(() => {
    if (index >= items.length - 1) return;
    logEvent(EVENTS.chapterNextClicked, { from: current.id });
    setWantPlaying(true);
    setIndex(index + 1);
  }, [index, items.length, current.id]);

  const previous = useCallback(() => {
    // 3초 이상 재생했으면 현재 chapter 처음으로, 아니면 이전 chapter.
    if (status.currentTime > 3) {
      player.seekTo(0);
      logEvent(EVENTS.chapterPreviousClicked, { id: current.id, restart: true });
      return;
    }
    if (index === 0) {
      player.seekTo(0);
      return;
    }
    logEvent(EVENTS.chapterPreviousClicked, { from: current.id });
    setWantPlaying(true);
    setIndex(index - 1);
  }, [status.currentTime, index, player, current.id]);

  const seekToFraction = useCallback(
    (fraction: number) => {
      const dur = status.duration || 0;
      if (dur <= 0) return;
      const sec = Math.max(0, Math.min(1, fraction)) * dur;
      player.seekTo(sec);
      logEvent(EVENTS.audioSeeked, { id: current.id, to: Math.round(sec) });
    },
    [player, status.duration, current.id],
  );

  const playbackStatus: PlaybackStatus = status.error
    ? 'error'
    : sessionCompleted
      ? 'completed'
      : !status.isLoaded || status.isBuffering
        ? 'loading'
        : status.playing
          ? 'playing'
          : 'paused';

  return {
    index,
    total: items.length,
    current,
    isPlaying: status.playing,
    positionSec: status.currentTime || 0,
    durationSec: status.duration || 0,
    status: playbackStatus,
    sessionCompleted,
    usingFallbackAudio: !current.audioUrl,
    canPrev: index > 0 || status.currentTime > 3,
    canNext: index < items.length - 1,
    play,
    pause,
    togglePlay,
    next,
    previous,
    seekToFraction,
  };
}
