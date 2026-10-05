/**
 * Convierte minutos a texto legible.
 * 45 → "45 min"
 * 60 → "1 h"
 * 90 → "1 h 30 min"
 */
export function formatDuration(minutes: number | undefined | null): string {
  const m = minutes ?? 0;
  if (m <= 0) return '';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h} h` : `${h} h ${r} min`;
}
