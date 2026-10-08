import type { Appointment } from '../../shared/types/appointment';
import { canTransitionStatus, transitionAppointmentStatus } from './appointment-state-machine';

export type AdminAppointmentAction = {
  appointmentId: string;
  previousStatus: Appointment['status'];
  newStatus: Appointment['status'];
  reason?: string;
};

const allowedTransitions: Record<Appointment['status'], Appointment['status'][]> = {
  pendiente: ['confirmada', 'cancelada', 'vencida', 'reprogramada'],
  confirmada: ['completada', 'cancelada', 'reprogramacion solicitada', 'vencida', 'reprogramada'],
  cancelada: [],
  vencida: [],
  completada: [],
  'no asistio': [],
  'reprogramacion solicitada': ['reprogramada', 'cancelada'],
  reprogramada: [],
};

export function updateAppointmentStatus(input: AdminAppointmentAction): Appointment['status'] {
  const { appointmentId, previousStatus, newStatus, reason } = input;

  if (!appointmentId) {
    throw new Error('El identificador de la cita es obligatorio.');
  }

  if (!canTransitionStatus(previousStatus, newStatus)) {
    throw new Error(`La transición de ${previousStatus} a ${newStatus} no está permitida.`);
  }

  if (reason && reason.trim().length === 0) {
    throw new Error('La razón no puede estar vacía.');
  }

  return transitionAppointmentStatus({ previousStatus, newStatus });
}

export function listPendingAppointments(appointments: Appointment[]): Appointment[] {
  return appointments.filter((appointment) => appointment.status === 'pendiente');
}

export function getAppointmentById(appointments: Appointment[], appointmentId: string): Appointment | null {
  return appointments.find((appointment) => appointment.id === appointmentId) ?? null;
}

export function getAvailableStatusTransitions(status: Appointment['status']): Appointment['status'][] {
  return allowedTransitions[status] ?? [];
}
