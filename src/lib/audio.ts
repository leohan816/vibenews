// 오디오 시간 표기 헬퍼. 실제 재생/이어듣기 상태는 전역 플레이어(global-audio-controller)가 소유한다.
// 로컬 플레이어나 데모용 원격 오디오는 이 프로젝트에서 사용하지 않는다.

/** 초 → "m:ss" 표기. */
export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor(totalSeconds / 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
