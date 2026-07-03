// 오디오 재생용 fallback 샘플 + 헬퍼 (설계문서/02_Listen_오디오_플레이어.md)
// NewsAudioItem.audioUrl 이 없을 때(현재 mock: 전부 null) 아래 원격 샘플을 사용한다.
// 실제 TTS audioUrl 이 채워지면 controller 가 그걸 그대로 재생한다(코드 변경 없음).

// 길이가 다양한 짧은 샘플들 — chapter 자동 이어재생을 확인하기 좋다.
export const FALLBACK_SAMPLES: string[] = [
  'https://download.samplelib.com/mp3/sample-9s.mp3',
  'https://download.samplelib.com/mp3/sample-12s.mp3',
  'https://download.samplelib.com/mp3/sample-6s.mp3',
  'https://download.samplelib.com/mp3/sample-15s.mp3',
  'https://download.samplelib.com/mp3/sample-3s.mp3',
];

/** chapter index 에 매핑된 fallback 샘플 URL. */
export function fallbackSampleFor(index: number): string {
  return FALLBACK_SAMPLES[index % FALLBACK_SAMPLES.length];
}

/** 초 → "m:ss" 표기. */
export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor(totalSeconds / 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
