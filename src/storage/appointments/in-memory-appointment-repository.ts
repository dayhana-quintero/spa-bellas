import { randomUUID } from 'crypto';
import { type Appointment, appointmentSchema } from '@/shared/types/appointment';

const appointments: Appointment[] = [
{
    id: '11111111-1111-4111-8111-111111111101',
    clientId: '22222222-2222-4222-8222-222222222201',
    serviceId: '33333333-3333-4333-8333-333333333301',
    scheduledStart: new Date('2026-09-01T09:00:00Z'),
    scheduledEnd: new Date('2026-09-01T09:45:00Z'),
    status: 'pendiente',
    notes: 'Primera visita',
    source: 'publico',
    holdExpiresAt: new Date('2026-09-01T09:15:00Z'),
    previousAppointmentId: undefined,
    createdAt: new Date('2026-08-30T10:00:00Z'),
    updatedAt: new Date('2026-08-30T10:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    clientId: '22222222-2222-4222-8222-222222222202',
    serviceId: '33333333-3333-4333-8333-333333333302',
    scheduledStart: new Date('2026-09-02T10:00:00Z'),
    scheduledEnd: new Date('2026-09-02T11:00:00Z'),
    status: 'confirmada',
    notes: undefined,
    source: 'admin',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-08-30T11:00:00Z'),
    updatedAt: new Date('2026-08-31T09:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    clientId: '22222222-2222-4222-8222-222222222201',
    serviceId: '33333333-3333-4333-8333-333333333303',
    scheduledStart: new Date('2026-09-03T14:00:00Z'),
    scheduledEnd: new Date('2026-09-03T14:30:00Z'),
    status: 'cancelada',
    notes: 'Cliente cancelo por enfermedad',
    source: 'publico',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-08-31T08:00:00Z'),
    updatedAt: new Date('2026-09-02T09:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    clientId: '22222222-2222-4222-8222-222222222203',
    serviceId: '33333333-3333-4333-8333-333333333301',
    scheduledStart: new Date('2026-09-04T16:00:00Z'),
    scheduledEnd: new Date('2026-09-04T16:45:00Z'),
    status: 'vencida',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: new Date('2026-09-04T15:15:00Z'),
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-01T12:00:00Z'),
    updatedAt: new Date('2026-09-04T16:16:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    clientId: '22222222-2222-4222-8222-222222222202',
    serviceId: '33333333-3333-4333-8333-333333333302',
    scheduledStart: new Date('2026-09-05T09:30:00Z'),
    scheduledEnd: new Date('2026-09-05T10:30:00Z'),
    status: 'completada',
    notes: 'Servicio completado sin novedad',
    source: 'admin',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-01T13:00:00Z'),
    updatedAt: new Date('2026-09-05T11:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    clientId: '22222222-2222-4222-8222-222222222201',
    serviceId: '33333333-3333-4333-8333-333333333303',
    scheduledStart: new Date('2026-09-06T11:00:00Z'),
    scheduledEnd: new Date('2026-09-06T11:30:00Z'),
    status: 'no asistio',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-02T09:00:00Z'),
    updatedAt: new Date('2026-09-06T12:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111107',
    clientId: '22222222-2222-4222-8222-222222222203',
    serviceId: '33333333-3333-4333-8333-333333333302',
    scheduledStart: new Date('2026-09-07T13:00:00Z'),
    scheduledEnd: new Date('2026-09-07T13:45:00Z'),
    status: 'reprogramacion solicitada',
    notes: 'Cliente pidio cambiar la fecha',
    source: 'publico',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-03T10:00:00Z'),
    updatedAt: new Date('2026-09-07T14:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111108',
    clientId: '22222222-2222-4222-8222-222222222202',
    serviceId: '33333333-3333-4333-8333-333333333301',
    scheduledStart: new Date('2026-09-08T15:00:00Z'),
    scheduledEnd: new Date('2026-09-08T15:45:00Z'),
    status: 'reprogramada',
    notes: undefined,
    source: 'admin',
    holdExpiresAt: undefined,
    previousAppointmentId: '11111111-1111-4111-8111-111111111107',
    createdAt: new Date('2026-09-07T14:05:00Z'),
    updatedAt: new Date('2026-09-07T14:05:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111109',
    clientId: '22222222-2222-4222-8222-222222222201',
    serviceId: '33333333-3333-4333-8333-333333333302',
    scheduledStart: new Date('2026-09-09T09:00:00Z'),
    scheduledEnd: new Date('2026-09-09T09:45:00Z'),
    status: 'pendiente',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: new Date('2026-09-09T09:15:00Z'),
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-08T09:00:00Z'),
    updatedAt: new Date('2026-09-08T09:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111110',
    clientId: '22222222-2222-4222-8222-222222222203',
    serviceId: '33333333-3333-4333-8333-333333333303',
    scheduledStart: new Date('2026-09-10T10:00:00Z'),
    scheduledEnd: new Date('2026-09-10T11:00:00Z'),
    status: 'confirmada',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-08T10:00:00Z'),
    updatedAt: new Date('2026-09-09T09:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111111',
    clientId: '22222222-2222-4222-8222-222222222202',
    serviceId: '33333333-3333-4333-8333-333333333301',
    scheduledStart: new Date('2026-09-11T14:00:00Z'),
    scheduledEnd: new Date('2026-09-11T14:30:00Z'),
    status: 'cancelada',
    notes: 'Duplicado por error',
    source: 'admin',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-09T11:00:00Z'),
    updatedAt: new Date('2026-09-10T09:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111112',
    clientId: '22222222-2222-4222-8222-222222222201',
    serviceId: '33333333-3333-4333-8333-333333333302',
    scheduledStart: new Date('2026-09-12T16:00:00Z'),
    scheduledEnd: new Date('2026-09-12T16:45:00Z'),
    status: 'completada',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-10T12:00:00Z'),
    updatedAt: new Date('2026-09-12T17:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111113',
    clientId: '22222222-2222-4222-8222-222222222203',
    serviceId: '33333333-3333-4333-8333-333333333301',
    scheduledStart: new Date('2026-09-13T09:00:00Z'),
    scheduledEnd: new Date('2026-09-13T09:45:00Z'),
    status: 'no asistio',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-11T09:00:00Z'),
    updatedAt: new Date('2026-09-13T10:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111114',
    clientId: '22222222-2222-4222-8222-222222222202',
    serviceId: '33333333-3333-4333-8333-333333333303',
    scheduledStart: new Date('2026-09-14T10:00:00Z'),
    scheduledEnd: new Date('2026-09-14T10:30:00Z'),
    status: 'pendiente',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: new Date('2026-09-14T10:15:00Z'),
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-13T09:00:00Z'),
    updatedAt: new Date('2026-09-13T09:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111115',
    clientId: '22222222-2222-4222-8222-222222222201',
    serviceId: '33333333-3333-4333-8333-333333333301',
    scheduledStart: new Date('2026-09-15T13:00:00Z'),
    scheduledEnd: new Date('2026-09-15T13:45:00Z'),
    status: 'confirmada',
    notes: undefined,
    source: 'admin',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-13T14:00:00Z'),
    updatedAt: new Date('2026-09-14T09:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111116',
    clientId: '22222222-2222-4222-8222-222222222203',
    serviceId: '33333333-3333-4333-8333-333333333302',
    scheduledStart: new Date('2026-09-16T15:00:00Z'),
    scheduledEnd: new Date('2026-09-16T15:30:00Z'),
    status: 'vencida',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: new Date('2026-09-16T14:15:00Z'),
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-13T10:00:00Z'),
    updatedAt: new Date('2026-09-16T15:16:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111117',
    clientId: '22222222-2222-4222-8222-222222222202',
    serviceId: '33333333-3333-4333-8333-333333333303',
    scheduledStart: new Date('2026-09-17T09:00:00Z'),
    scheduledEnd: new Date('2026-09-17T09:45:00Z'),
    status: 'reprogramacion solicitada',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-14T11:00:00Z'),
    updatedAt: new Date('2026-09-17T10:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111118',
    clientId: '22222222-2222-4222-8222-222222222201',
    serviceId: '33333333-3333-4333-8333-333333333301',
    scheduledStart: new Date('2026-09-18T11:00:00Z'),
    scheduledEnd: new Date('2026-09-18T11:45:00Z'),
    status: 'reprogramada',
    notes: undefined,
    source: 'admin',
    holdExpiresAt: undefined,
    previousAppointmentId: '11111111-1111-4111-8111-111111111117',
    createdAt: new Date('2026-09-17T10:05:00Z'),
    updatedAt: new Date('2026-09-17T10:05:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111119',
    clientId: '22222222-2222-4222-8222-222222222203',
    serviceId: '33333333-3333-4333-8333-333333333302',
    scheduledStart: new Date('2026-09-19T14:00:00Z'),
    scheduledEnd: new Date('2026-09-19T14:30:00Z'),
    status: 'completada',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: undefined,
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-17T12:00:00Z'),
    updatedAt: new Date('2026-09-19T15:00:00Z'),
  },
  {
    id: '11111111-1111-4111-8111-111111111120',
    clientId: '22222222-2222-4222-8222-222222222202',
    serviceId: '33333333-3333-4333-8333-333333333303',
    scheduledStart: new Date('2026-09-20T16:00:00Z'),
    scheduledEnd: new Date('2026-09-20T16:45:00Z'),
    status: 'pendiente',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: new Date('2026-09-20T15:15:00Z'),
    previousAppointmentId: undefined,
    createdAt: new Date('2026-09-19T09:00:00Z'),
    updatedAt: new Date('2026-09-19T09:00:00Z'),
  }
];

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

export function findAllAppointments(): Appointment[] {
  return [...appointments]
}