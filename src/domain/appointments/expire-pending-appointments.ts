import type { Appointment } from '../../shared/types/appointment';

export function expirePendingAppointments({
  appointments,
  now,
}: {
  appointments: Appointment[];
  now: Date;
}): Appointment[] {
  return appointments.map((appointment) => {
    if (
      appointment.status === 'pendiente' &&
      appointment.holdExpiresAt &&
      new Date(appointment.holdExpiresAt).getTime() <= now.getTime()
    ) {
      return { ...appointment, status: 'vencida', updatedAt: now };
    }

    return appointment;
  });
}
