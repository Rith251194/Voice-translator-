/**
 * Generates the standardized audio filename based on:
 * "▶︎ •၊၊||၊|။||||။၊|• + time of voice.mp3"
 */
export function formatTimeOfVoice(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '00.03';
  }
  const totalSecs = Math.round(seconds);
  const mins = Math.floor(totalSecs / 60)
    .toString()
    .padStart(2, '0');
  const secs = (totalSecs % 60).toString().padStart(2, '0');
  return `${mins}.${secs}`;
}

export function formatTimeOfVoiceColon(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '0:03';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const AESTHETIC_VOICE_PREFIX = '▶︎ •၊၊||၊|။||||။၊|•';

export function getVoiceFileName(durationSeconds: number, format: 'mp3' | 'wav' = 'mp3'): string {
  const timeStr = formatTimeOfVoice(durationSeconds);
  const ext = format === 'wav' ? 'wav' : 'mp3';
  return `${AESTHETIC_VOICE_PREFIX} ${timeStr}.${ext}`;
}
