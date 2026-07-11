// Root-lifetime audio controller (설계문서/18 §10.4, §18). Owns exactly one createAudioPlayer and
// one playbackStatusUpdate listener for the whole process; screens never create their own player.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';

export interface PlaybackStatus {
  currentTimeSec: number;
  durationSec: number;
  playing: boolean;
  didJustFinish: boolean;
}
export type StatusListener = (status: PlaybackStatus) => void;

export class GlobalAudioController {
  private player: AudioPlayer | null = null;
  private subscription: { remove(): void } | null = null;
  private listener: StatusListener | null = null;

  async init(): Promise<void> {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' });
  }

  onStatus(listener: StatusListener): void {
    this.listener = listener;
  }

  private emit(status: AudioStatus): void {
    this.listener?.({
      currentTimeSec: status.currentTime ?? 0,
      durationSec: status.duration ?? 0,
      playing: status.playing ?? false,
      didJustFinish: status.didJustFinish ?? false,
    });
  }

  private ensurePlayer(source: string): AudioPlayer {
    if (!this.player) {
      this.player = createAudioPlayer(source);
      this.subscription = this.player.addListener('playbackStatusUpdate', (status: AudioStatus) => this.emit(status));
    } else {
      this.player.replace(source);
    }
    return this.player;
  }

  async loadAndPlay(source: string, positionSec: number): Promise<void> {
    const player = this.ensurePlayer(source);
    if (positionSec > 0) await player.seekTo(positionSec);
    player.play();
  }

  pause(): void {
    this.player?.pause();
  }

  async seekTo(positionSec: number): Promise<void> {
    await this.player?.seekTo(positionSec);
  }

  get currentTimeSec(): number {
    return this.player?.currentTime ?? 0;
  }
  get durationSec(): number {
    return this.player?.duration ?? 0;
  }
  get playing(): boolean {
    return this.player?.playing ?? false;
  }

  release(): void {
    this.subscription?.remove();
    this.player?.remove();
    this.player = null;
    this.subscription = null;
  }
}
