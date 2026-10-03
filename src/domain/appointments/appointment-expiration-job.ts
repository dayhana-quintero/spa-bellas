import type { Appointment } from '../../shared/types/appointment';
import { expirePendingAppointments } from './expire-pending-appointments';

export type AppointmentExpirationJobResult = {
  expiredCount: number;
  expiredAppointments: Appointment[];
  remainingAppointments: Appointment[];
};

export function runAppointmentExpirationJob({
  appointments,
  now = new Date(),
}: {
  appointments: Appointment[];
  now?: Date;
}): AppointmentExpirationJobResult {
  const previousAppointments = appointments;
  const nextAppointments = expirePendingAppointments({ appointments: previousAppointments, now });

  const expiredAppointments = nextAppointments.filter((appointment) => {
    const previous = previousAppointments.find((item) => item.id === appointment.id);
    return previous?.status === 'pendiente' && appointment.status === 'vencida';
  });

  return {
    expiredCount: expiredAppointments.length,
    expiredAppointments,
    remainingAppointments: nextAppointments,
  };
}

export function releaseExpiredHolds({
  appointments,
  now = new Date(),
}: {
  appointments: Appointment[];
  now?: Date;
}): Appointment[] {
  return runAppointmentExpirationJob({ appointments, now }).remainingAppointments;
}
