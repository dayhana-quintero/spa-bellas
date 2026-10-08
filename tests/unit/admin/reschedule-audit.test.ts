import { beforeEach, describe, expect, it, vi } from 'vitest';

import { rescheduleAppointmentForAdmin } from '@/domain/appointments/admin-reschedule-service';
import { getAvailableSlots } from '@/domain/spa-service';
import {
  listAppointmentsFromSupabase,
  rescheduleAppointmentInSupabase,
} from '@/lib/supabase-data';

vi.mock('@/domain/spa-service', () => ({
  getAvailableSlots: vi.fn(),
}));

vi.mock('@/lib/supabase-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase-data')>();
  return {
    ...actual,
    listAppointmentsFromSupabase: vi.fn(),
    rescheduleAppointmentInSupabase: vi.fn(),
  };
});

type StoredAppointment = Awaited<ReturnType<typeof listAppointmentsFromSupabase>>[number];

const APPOINTMENT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const CLIENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const SERVICE_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const ADMIN_ID = '00000000-0000-4000-8000-000000000009';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function localDateKey(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function formatStamp(value: Date): string {
  return value.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Fecha futura para que la validacion de "futuro" no caduque con el tiempo. */
function futureDay(offsetDays: number): Date {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  value.setHours(0, 0, 0, 0);
  return value;
}

function slotOn(day: Date, hours: number, minutes: number): {
  time: string;
  startsAt: string;
  endsAt: string;
} {
  const startsAt = new Date(day);
  startsAt.setHours(hours, minutes, 0, 0);
  const endsAt = new Date(startsAt.getTime() + 60 * 60000);
  return {
    time: `${pad(hours)}:${pad(minutes)}`,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
}

function buildStoredAppointment(
  overrides: Partial<StoredAppointment> & { id: string; scheduledStart: Date },
): StoredAppointment {
  const scheduledEnd = new Date(overrides.scheduledStart.getTime() + 60 * 60000);
  return {
    clientId: CLIENT_ID,
    serviceId: SERVICE_ID,
    status: 'confirmada',
    notes: undefined,
    source: 'publico',
    holdExpiresAt: undefined,
    createdAt: new Date('2026-10-01T10:00:00.000Z'),
    updatedAt: new Date('2026-10-01T10:00:00.000Z'),
    client: undefined,
    service: undefined,
    ...overrides,
    scheduledEnd,
  } as StoredAppointment;
}

const day = futureDay(14);
const date = localDateKey(day);
const currentStart = new Date(day);
currentStart.setHours(10, 0, 0, 0);
const stored = buildStoredAppointment({ id: APPOINTMENT_ID, scheduledStart: currentStart });

function baseInput(overrides: Record<string, unknown> = {}) {
  return {
    appointmentId: APPOINTMENT_ID,
    date,
    slot: '16:00',
    expectedScheduledStart: currentStart,
    expectedStatus: 'confirmada' as const,
    adminId: ADMIN_ID,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAvailableSlots).mockResolvedValue([slotOn(day, 16, 0), slotOn(day, 17, 0)]);
  vi.mocked(listAppointmentsFromSupabase).mockImplementation(async (filters = {}) => {
    if (filters.id) return [stored];
    return [];
  });
  vi.mocked(rescheduleAppointmentInSupabase).mockImplementation(async (input) => ({
    id: input.appointmentId,
    status: input.nextStatus,
    scheduledStart: input.nextStart,
    scheduledEnd: input.nextEnd,
    updatedAt: new Date(),
    historyId: `history-${vi.mocked(rescheduleAppointmentInSupabase).mock.calls.length}`,
  }));
});

describe('auditoria de reprogramacion', () => {
  it('la nota automatica encadena la fecha anterior con la nueva y suma la nota del administrador', async () => {
    const result = await rescheduleAppointmentForAdmin(
      baseInput({ note: 'La clienta lo pidio por telefono' }),
    );

    const firstNext = new Date(slotOn(day, 16, 0).startsAt);
    expect(result.statusRecord.note).toBe(
      `Reprogramada de ${formatStamp(currentStart)} a ${formatStamp(firstNext)}. ` +
        'La clienta lo pidio por telefono',
    );
    expect(result.statusRecord.changedAt).toBeInstanceOf(Date);
  });

  it('usa la identidad real del administrador de la sesion, nunca un identificador fijo', async () => {
    await rescheduleAppointmentForAdmin(baseInput({ adminId: ADMIN_ID }));

    expect(rescheduleAppointmentInSupabase).toHaveBeenCalledWith(
      expect.objectContaining({ adminId: ADMIN_ID }),
    );
    const call = vi.mocked(rescheduleAppointmentInSupabase).mock.calls[0]?.[0];
    expect(call?.adminId).not.toBe('admin-1');
    expect(call?.adminId).not.toBe('');
  });

  it('dos reprogramaciones dejan dos registros independientes sin pisarse', async () => {
    const first = await rescheduleAppointmentForAdmin(baseInput({ slot: '16:00' }));

    // La cita ya quedo reprogramada: la segunda usa lo que ve el administrador.
    vi.mocked(listAppointmentsFromSupabase).mockImplementation(async (filters = {}) => {
      if (filters.id) {
        return [
          buildStoredAppointment({
            id: APPOINTMENT_ID,
            scheduledStart: first.appointment.scheduledStart,
            status: 'reprogramada',
          }),
        ];
      }
      return [];
    });

    const second = await rescheduleAppointmentForAdmin(
      baseInput({
        slot: '17:00',
        expectedStatus: 'reprogramada' as const,
        expectedScheduledStart: first.appointment.scheduledStart,
        note: 'Segundo cambio acordado con la clienta',
      }),
    );

    expect(rescheduleAppointmentInSupabase).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = vi.mocked(rescheduleAppointmentInSupabase).mock.calls;

    // Cada registro tiene su propio par de fechas y su propia nota.
    const firstNext = new Date(slotOn(day, 16, 0).startsAt);
    const secondNext = new Date(slotOn(day, 17, 0).startsAt);
    expect(firstCall?.[0].nextStart).toEqual(firstNext);
    expect(secondCall?.[0].nextStart).toEqual(secondNext);
    expect(secondCall?.[0].note).toContain(`Reprogramada de ${formatStamp(firstNext)} a ${formatStamp(secondNext)}`);
    expect(secondCall?.[0].note).toContain('Segundo cambio acordado con la clienta');
    expect(firstCall?.[0].note).not.toBe(secondCall?.[0].note);

    // Ambos usan la identidad real y encadenan el estado.
    expect(firstCall?.[0].adminId).toBe(ADMIN_ID);
    expect(secondCall?.[0].adminId).toBe(ADMIN_ID);
    expect(first.statusRecord.newStatus).toBe('reprogramada');
    expect(second.statusRecord.previousStatus).toBe('reprogramada');
    expect(second.statusRecord.newStatus).toBe('reprogramada');
    expect(second.appointment.status).toBe('reprogramada');
  });
});
