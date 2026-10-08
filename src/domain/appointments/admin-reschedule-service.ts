import type { Appointment } from '../../shared/types/appointment';
import {
  RESCHEDULABLE_STATUSES,
  canTransitionStatus,
} from './appointment-state-machine';
import { getAvailableSlots } from '../spa-service';
import {
  listAppointmentsFromSupabase,
  rescheduleAppointmentInSupabase,
} from '../../lib/supabase-data';

/** Motivos de rechazo de una reprogramacion (mapeados a HTTP en la ruta API). */
export type RescheduleFailure =
  | 'invalid-params'
  | 'past-datetime'
  | 'slot-unavailable'
  | 'client-conflict'
  | 'stale-appointment'
  | 'status-not-allowed';

export class RescheduleError extends Error {
  readonly reason: RescheduleFailure;

  constructor(reason: RescheduleFailure, message: string) {
    super(message);
    this.name = 'RescheduleError';
    this.reason = reason;
  }
}

export type RescheduleAppointmentInput = {
  appointmentId: string;
  /** Dia elegido en formato YYYY-MM-DD. */
  date: string;
  /** Hora elegida en formato HH:MM. */
  slot: string;
  /** Fecha y hora que el administrador vio en pantalla (escritura condicional). */
  expectedScheduledStart: Date;
  /** Estado que el administrador vio en pantalla (escritura condicional). */
  expectedStatus: Appointment['status'];
  /** Identidad de la sesion administrativa responsable del cambio. */
  adminId: string;
  /** Nota opcional escrita por el administrador. */
  note?: string;
};

export type RescheduleResult = {
  appointment: {
    id: string;
    status: Appointment['status'];
    scheduledStart: Date;
    scheduledEnd: Date;
  };
  statusRecord: {
    previousStatus: Appointment['status'];
    newStatus: Appointment['status'];
    changedAt: Date;
    note: string;
  };
};

function parseSlotDateTime(date: string, slot: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = slot.split(':').map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hours > 23 ||
    minutes > 59
  ) {
    throw new RescheduleError('invalid-params', 'La fecha y la hora no son validas.');
  }

  const value = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (
    value.getFullYear() !== year ||
    value.getMonth() !== month - 1 ||
    value.getDate() !== day
  ) {
    throw new RescheduleError('invalid-params', 'La fecha y la hora no son validas.');
  }

  return value;
}

export function buildRescheduleNote(previousStart: Date, nextStart: Date, adminNote?: string): string {
  const format = (value: Date) =>
    value.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
  const automatic = `Reprogramada de ${format(previousStart)} a ${format(nextStart)}.`;
  const trimmed = adminNote?.trim();
  return trimmed ? `${automatic} ${trimmed}` : automatic;
}

/**
 * Mueve una cita existente a otro horario libre del mismo servicio.
 *
 * Reglas (spec 004): revalida en servidor con la propia cita excluida del
 * calculo de ocupacion, impide solapes con otras citas de la misma clienta,
 * exige que la cita siga igual que en pantalla (escritura condicional) y deja
 * el cambio con auditoria en el historial.
 */
export async function rescheduleAppointmentForAdmin(
  input: RescheduleAppointmentInput,
): Promise<RescheduleResult> {
  if (!input.appointmentId || !input.date || !input.slot || !input.adminId) {
    throw new RescheduleError('invalid-params', 'Faltan datos para reprogramar la cita.');
  }

  if (!RESCHEDULABLE_STATUSES.includes(input.expectedStatus)) {
    throw new RescheduleError('status-not-allowed', 'Esta cita ya no se puede reprogramar.');
  }

  const nextStart = parseSlotDateTime(input.date, input.slot);

  if (nextStart.getTime() <= Date.now()) {
    throw new RescheduleError('past-datetime', 'Elige una fecha y hora futuras.');
  }

  const storedList = await listAppointmentsFromSupabase({ id: input.appointmentId });
  const stored = storedList[0];
  const staleMessage = 'La cita cambio desde otra pestana. Revisa su estado antes de reprogramar.';

  if (!stored) {
    throw new RescheduleError('stale-appointment', staleMessage);
  }

  if (
    stored.status !== input.expectedStatus ||
    stored.scheduledStart.getTime() !== input.expectedScheduledStart.getTime()
  ) {
    throw new RescheduleError('stale-appointment', staleMessage);
  }

  if (!RESCHEDULABLE_STATUSES.includes(stored.status)) {
    throw new RescheduleError('status-not-allowed', 'Esta cita ya no se puede reprogramar.');
  }

  // El motor de disponibilidad excluye la propia cita para permitir movimientos
  // que se solapen parcialmente con su horario actual (research R1).
  const slots = await getAvailableSlots(stored.serviceId, input.date, {
    excludeAppointmentId: stored.id,
  });
  const chosen = slots.find((candidate) => candidate.time === input.slot);
  if (!chosen) {
    throw new RescheduleError('slot-unavailable', 'Ese horario ya no esta libre. Elige otro.');
  }

  const nextEnd = new Date(chosen.endsAt);

  // La capacidad del spa no detecta dos citas simultaneas de la misma clienta
  // cuando hay mas de un cupo: esa regla es explicita del dominio (research R7).
  const dayAppointments = await listAppointmentsFromSupabase({
    from: `${input.date}T00:00:00.000Z`,
    to: input.date,
  });
  const conflict = dayAppointments.some(
    (candidate) =>
      candidate.id !== stored.id &&
      candidate.clientId === stored.clientId &&
      RESCHEDULABLE_STATUSES.includes(candidate.status) &&
      nextStart < candidate.scheduledEnd &&
      nextEnd > candidate.scheduledStart,
  );
  if (conflict) {
    throw new RescheduleError(
      'client-conflict',
      'La clienta ya tiene otra cita que se cruza con ese horario.',
    );
  }

  const nextStatus: Appointment['status'] = 'reprogramada';
  if (stored.status !== nextStatus && !canTransitionStatus(stored.status, nextStatus)) {
    throw new RescheduleError('status-not-allowed', 'Esta cita ya no se puede reprogramar.');
  }

  const note = buildRescheduleNote(stored.scheduledStart, nextStart, input.note);

  const updated = await rescheduleAppointmentInSupabase({
    appointmentId: stored.id,
    expectedScheduledStart: stored.scheduledStart,
    expectedScheduledEnd: stored.scheduledEnd,
    expectedStatus: stored.status,
    nextStart,
    nextEnd,
    nextStatus,
    adminId: input.adminId,
    note,
  });

  if (!updated) {
    throw new RescheduleError('stale-appointment', staleMessage);
  }

  return {
    appointment: {
      id: updated.id,
      status: updated.status as Appointment['status'],
      scheduledStart: updated.scheduledStart,
      scheduledEnd: updated.scheduledEnd,
    },
    statusRecord: {
      previousStatus: stored.status,
      newStatus: nextStatus,
      changedAt: updated.updatedAt,
      note,
    },
  };
}
