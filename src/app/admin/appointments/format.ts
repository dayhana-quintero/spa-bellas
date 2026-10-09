/** Formateos compartidos entre las tarjetas de pendientes y el detalle. */

/** "vie 7 ago 2026" sin comas. */
export function formatDayLabel(value: Date): string {
  return value
    .toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .replace(/,/g, '');
}

/** "10:30" + "AM/PM" para la hora grande y la fila de datos. */
export function splitTime(value: Date): { time: string; period: string } {
  const hours = value.getHours();
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return { time: `${hours % 12 || 12}:${minutes}`, period: hours >= 12 ? 'PM' : 'AM' };
}

/** "300 555 0142": agrupa celular colombiano/mexicano y respeta otros formatos. */
export function formatPhone(phone?: string): string {
  const digits = (phone ?? '').replace(/\D/g, '');
  const hasCountryCode = digits.length === 12 && (digits.startsWith('57') || digits.startsWith('52'));
  const local = hasCountryCode ? digits.slice(2) : digits;
  if (local.length === 10) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone?.trim() || 'Sin teléfono';
}

/** "pendiente" → "Pendiente". */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
