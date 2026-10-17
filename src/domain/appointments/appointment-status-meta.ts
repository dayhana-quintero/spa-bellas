import type { Appointment } from '@/shared/types/appointment';

export type AppointmentStatusMeta = {
  label: string;
  color: string;
  bg: string;
};

// Los colores son variables CSS (definidas en globals.css con valores para el
// tema claro y el oscuro), por lo que se aplican igual en ambos temas.
export const APPOINTMENT_STATUS_META: Record<Appointment['status'], AppointmentStatusMeta> = {
  pendiente: { label: 'Pendiente', color: 'var(--meta-pend-fg)', bg: 'var(--meta-pend-bg)' },
  confirmada: { label: 'Confirmada', color: 'var(--meta-conf-fg)', bg: 'var(--meta-conf-bg)' },
  cancelada: { label: 'Cancelada', color: 'var(--meta-cancel-fg)', bg: 'var(--meta-cancel-bg)' },
  vencida: { label: 'Vencida', color: 'var(--meta-venc-fg)', bg: 'var(--meta-venc-bg)' },
  completada: { label: 'Completada', color: 'var(--meta-comp-fg)', bg: 'var(--meta-comp-bg)' },
  'no asistio': { label: 'No asistió', color: 'var(--meta-noinf-fg)', bg: 'var(--meta-noinf-bg)' },
  'reprogramacion solicitada': {
    label: 'Reprogramación',
    color: 'var(--meta-repsol-fg)',
    bg: 'var(--meta-repsol-bg)',
  },
  reprogramada: { label: 'Reprogramada', color: 'var(--meta-reprog-fg)', bg: 'var(--meta-reprog-bg)' },
};

// Etiqueta visual del estado, con respaldo para estados inesperados.
export function getAppointmentStatusMeta(status: string): AppointmentStatusMeta {
  return (
    APPOINTMENT_STATUS_META[status as Appointment['status']] ?? {
      label: status,
      color: 'var(--meta-neutral-fg)',
      bg: 'var(--meta-neutral-bg)',
    }
  );
}
