import type { Appointment } from '../../shared/types/appointment';
import type { AppointmentStatusRecord } from '../../shared/types/appointment-status';

export type AppointmentStatus = Appointment['status'];

const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  pendiente: ['confirmada', 'cancelada', 'vencida'],
  confirmada: ['completada', 'no asistio', 'cancelada', 'reprogramacion solicitada'],
  cancelada: [],
  vencida: [],
  completada: [],
  'no asistio': [],
  'reprogramacion solicitada': ['reprogramada', 'cancelada'],
  reprogramada: ['confirmada'],
};

export function canTransitionStatus(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return allowedTransitions[from]?.includes(to) ?? false;
}

export function transitionAppointmentStatus({
  previousStatus,
  newStatus,
}: {
  previousStatus: AppointmentStatus;
  newStatus: AppointmentStatus;
}): AppointmentStatus {
  if (!canTransitionStatus(previousStatus, newStatus)) {
    throw new Error(`La transición de ${previousStatus} a ${newStatus} no está permitida.`);
  }

  return newStatus;
}

export function createAppointmentStatusTransition({
  appointmentId,
  previousStatus,
  newStatus,
  changedByAdminId,
  changedAt,
  note,
}: {
  appointmentId: string;
  previousStatus: AppointmentStatus;
  newStatus: AppointmentStatus;
  changedByAdminId: string;
  changedAt: Date;
  note?: string;
}): AppointmentStatusRecord {
  transitionAppointmentStatus({ previousStatus, newStatus });

  return {
    id: crypto.randomUUID(),
    appointmentId,
    previousStatus,
    newStatus,
    changedByAdminId,
    changedAt,
    note,
  };
}
