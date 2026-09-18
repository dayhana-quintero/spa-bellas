import { InMemoryRepository } from '../index';
import { Appointment } from '../../shared/types/appointment';

// Repositorio en memoria para citas (por ahora único, inyectable en el futuro).
const appointmentRepo = new InMemoryRepository<Appointment>();

// Locks por slot para asegurar operaciones atómicas por horario+servicio.
const slotLocks = new Set<string>();

function slotKey(serviceId: string, scheduledStart: string) {
  return `${serviceId}:${new Date(scheduledStart).toISOString()}`;
}

// Intenta crear una cita solo si el horario está libre. Devuelve true si se creó.
export async function createAppointmentIfSlotAvailable(
  appointment: Appointment,
): Promise<boolean> {
  const key = slotKey(appointment.serviceId, appointment.scheduledStart as unknown as string);

  // Intento inmediato de bloqueo; si ya está bloqueado, fallo rápido.
  if (slotLocks.has(key)) return false;
  slotLocks.add(key);

  try {
    // Verifica si existe una cita activa o pendiente en el mismo slot.
    const conflict = appointmentRepo
      .list()
      .find(
        (a) =>
          a.serviceId === appointment.serviceId &&
          new Date(a.scheduledStart).toISOString() === new Date(appointment.scheduledStart).toISOString() &&
          a.status !== 'cancelada' &&
          a.status !== 'vencida',
      );

    if (conflict) {
      return false;
    }

    appointmentRepo.save(appointment);
    return true;
  } finally {
    slotLocks.delete(key);
  }
}

export function listAppointments() {
  return appointmentRepo.list();
}

export function clearAppointments() {
  appointmentRepo.clear();
}
