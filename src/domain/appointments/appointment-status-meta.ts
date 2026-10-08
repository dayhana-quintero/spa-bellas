import type { Appointment } from '@/shared/types/appointment';

export type AppointmentStatusMeta = {
  label: string;
  color: string;
  bg: string;
};

export const APPOINTMENT_STATUS_META: Record<Appointment['status'], AppointmentStatusMeta> = {
  pendiente: { label: 'Pendiente', color: '#7a2a2a', bg: '#f8e1e3' },
  confirmada: { label: 'Confirmada', color: '#1d6a4d', bg: '#dff5ea' },
  cancelada: { label: 'Cancelada', color: '#8b2d2d', bg: '#f4d5d5' },
  vencida: { label: 'Vencida', color: '#5f4b41', bg: '#f0e2d8' },
  completada: { label: 'Completada', color: '#9f2d46', bg: '#f7dfe4' },
  'no asistio': { label: 'No asistió', color: '#6e4d35', bg: '#f6e8d8' },
  'reprogramacion solicitada': { label: 'Reprogramación', color: '#5f3d69', bg: '#f0e4f4' },
  reprogramada: { label: 'Reprogramada', color: '#214f63', bg: '#dfeff4' },
};

// Etiqueta visual del estado, con respaldo para estados inesperados.
export function getAppointmentStatusMeta(status: string): AppointmentStatusMeta {
  return (
    APPOINTMENT_STATUS_META[status as Appointment['status']] ?? {
      label: status,
      color: '#47413f',
      bg: '#ece2dd',
    }
  );
}
