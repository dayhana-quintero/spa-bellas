import { randomUUID } from 'crypto';
import { type Appointment, appointmentSchema } from '@/shared/types/appointment';

const appointments: Appointment[] = [];

export function createAppointment(
  data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>,
): Appointment {
  const now = new Date();
  const appointment = appointmentSchema.parse({
    ...data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  });

  appointments.push(appointment);
  return appointment;
}

// Estados que "ocupan" un horario: no se puede solicitar el mismo slot
// mientras exista una cita pendiente (con hold activo) o confirmada.
const BLOCKING_STATUSES = ['pendiente', 'confirmada'] as const;

export function hasConflictingAppointment(
  serviceId: string,
  scheduledStart: Date,
  scheduledEnd: Date,
): boolean {
  return appointments.some((appt) => {
    const isBlockingStatus = BLOCKING_STATUSES.includes(
      appt.status as (typeof BLOCKING_STATUSES)[number],
    );
    
    if (!isBlockingStatus || appt.serviceId !== serviceId) {
      return false;
    }

    // Un hold vencido ya no cuenta como conflicto, aunque el estado
    // todavia diga "pendiente" (la expiracion real la resuelve T036/T043).
    if (appt.holdExpiresAt && appt.holdExpiresAt < new Date()) {
      return false;
    }

    const overlaps =
      scheduledStart < appt.scheduledEnd && scheduledEnd > appt.scheduledStart;
    return overlaps;
  });
}

export function findAppointmentById(id: string): Appointment | undefined {
  return appointments.find((a) => a.id === id);
}

// Solo para tests: limpia el estado en memoria entre corridas.
export function _resetAppointments(): void {
  appointments.length = 0;
}