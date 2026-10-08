import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  RescheduleError,
  buildRescheduleNote,
  rescheduleAppointmentForAdmin,
} from '@/domain/appointments/admin-reschedule-service';
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
const ADMIN_ID = '00000000-0000-4000-8000-000000000001';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function localDateKey(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
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
    note: 'La clienta pidio cambiar de dia',
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
    historyId: 'history-1',
  }));
});

describe('rescheduleAppointmentForAdmin', () => {
  it('mueve la cita al horario elegido con estado reprogramada y auditoria completa', async () => {
    const result = await rescheduleAppointmentForAdmin(baseInput());

    const chosen = slotOn(day, 16, 0);
    expect(result.appointment).toMatchObject({
      id: APPOINTMENT_ID,
      status: 'reprogramada',
      scheduledStart: new Date(chosen.startsAt),
      scheduledEnd: new Date(chosen.endsAt),
    });
    expect(result.statusRecord.previousStatus).toBe('confirmada');
    expect(result.statusRecord.newStatus).toBe('reprogramada');
    expect(result.statusRecord.note).toContain('Reprogramada de');
    expect(result.statusRecord.note).toContain('La clienta pidio cambiar de dia');

    expect(rescheduleAppointmentInSupabase).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentId: APPOINTMENT_ID,
        expectedScheduledStart: currentStart,
        expectedStatus: 'confirmada',
        nextStatus: 'reprogramada',
        adminId: ADMIN_ID,
        nextStart: new Date(chosen.startsAt),
        nextEnd: new Date(chosen.endsAt),
      }),
    );
    // La cita propia se excluye del calculo de ocupacion (FR-002/FR-004).
    expect(getAvailableSlots).toHaveBeenCalledWith(SERVICE_ID, date, {
      excludeAppointmentId: APPOINTMENT_ID,
    });
  });

  it('conserva el estado reprogramada cuando la cita ya estaba reprogramada', async () => {
    const alreadyRescheduled = buildStoredAppointment({
      id: APPOINTMENT_ID,
      scheduledStart: currentStart,
      status: 'reprogramada',
    });
    vi.mocked(listAppointmentsFromSupabase).mockImplementation(async (filters = {}) => {
      if (filters.id) return [alreadyRescheduled];
      return [];
    });

    const result = await rescheduleAppointmentForAdmin(
      baseInput({ expectedStatus: 'reprogramada' as const }),
    );

    expect(result.appointment.status).toBe('reprogramada');
    expect(result.statusRecord.previousStatus).toBe('reprogramada');
    expect(result.statusRecord.newStatus).toBe('reprogramada');
  });

  it('rechaza con slot-unavailable cuando el horario ya no figura libre', async () => {
    vi.mocked(getAvailableSlots).mockResolvedValue([slotOn(day, 17, 0)]);

    await expect(rescheduleAppointmentForAdmin(baseInput({ slot: '16:00' }))).rejects.toMatchObject({
      reason: 'slot-unavailable',
    });
  });

  it('rechaza con client-conflict si la clienta ya tiene otra cita que se cruza', async () => {
    const otherStart = new Date(day);
    otherStart.setHours(16, 30, 0, 0);
    const overlapping = buildStoredAppointment({
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      scheduledStart: otherStart,
      clientId: CLIENT_ID,
      status: 'confirmada',
    });

    vi.mocked(listAppointmentsFromSupabase).mockImplementation(async (filters = {}) => {
      if (filters.id) return [stored];
      return [overlapping];
    });

    await expect(rescheduleAppointmentForAdmin(baseInput())).rejects.toMatchObject({
      reason: 'client-conflict',
    });
  });

  it('permite el solape con la cita propia antigua de otro dia sin confundirlo con otra cita', async () => {
    const sameSlotOtherClient = buildStoredAppointment({
      id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      scheduledStart: new Date(day),
      clientId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    });
    sameSlotOtherClient.scheduledStart.setHours(16, 0, 0, 0);

    vi.mocked(listAppointmentsFromSupabase).mockImplementation(async (filters = {}) => {
      if (filters.id) return [stored];
      return [sameSlotOtherClient];
    });

    const result = await rescheduleAppointmentForAdmin(baseInput());
    expect(result.appointment.status).toBe('reprogramada');
  });

  it('rechaza con status-not-allowed para estados terminales', async () => {
    await expect(
      rescheduleAppointmentForAdmin(baseInput({ expectedStatus: 'cancelada' as const })),
    ).rejects.toMatchObject({ reason: 'status-not-allowed' });
  });

  it('rechaza con stale-appointment cuando la cita cambio en otra pestana', async () => {
    await expect(
      rescheduleAppointmentForAdmin(
        baseInput({ expectedScheduledStart: new Date(currentStart.getTime() - 3600000) }),
      ),
    ).rejects.toMatchObject({ reason: 'stale-appointment' });
  });

  it('rechaza con stale-appointment cuando la escritura condicional no encuentra la fila', async () => {
    vi.mocked(rescheduleAppointmentInSupabase).mockResolvedValue(null);

    await expect(rescheduleAppointmentForAdmin(baseInput())).rejects.toMatchObject({
      reason: 'stale-appointment',
    });
  });

  it('rechaza con stale-appointment cuando la cita ya no existe', async () => {
    vi.mocked(listAppointmentsFromSupabase).mockResolvedValue([]);

    await expect(rescheduleAppointmentForAdmin(baseInput())).rejects.toMatchObject({
      reason: 'stale-appointment',
    });
  });

  it('rechaza con past-datetime para fechas u horas pasadas', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await expect(
      rescheduleAppointmentForAdmin(baseInput({ date: localDateKey(yesterday) })),
    ).rejects.toMatchObject({ reason: 'past-datetime' });
  });

  it('rechaza con invalid-params cuando el formato de fecha u hora es invalido', async () => {
    await expect(rescheduleAppointmentForAdmin(baseInput({ slot: 'noche' }))).rejects.toMatchObject(
      { reason: 'invalid-params' },
    );
    await expect(
      rescheduleAppointmentForAdmin(baseInput({ date: '20-10-2026' })),
    ).rejects.toMatchObject({ reason: 'invalid-params' });
  });

  it('convierte cualquier rechazo en RescheduleError con motivo', async () => {
    vi.mocked(getAvailableSlots).mockResolvedValue([]);
    const error = await rescheduleAppointmentForAdmin(baseInput()).catch((value: unknown) => value);

    expect(error).toBeInstanceOf(RescheduleError);
    expect((error as RescheduleError).message).toContain('horario');
    expect((error as RescheduleError).reason).toBe('slot-unavailable');
  });
});

describe('buildRescheduleNote', () => {
  it('incluye la fecha anterior, la nueva y la nota del administrador', () => {
    const note = buildRescheduleNote(currentStart, new Date(day), ' Motivo ');
    expect(note).toContain('Reprogramada de');
    expect(note).toContain('a ');
    expect(note.trim().endsWith('Motivo')).toBe(true);
  });

  it('funciona sin nota del administrador', () => {
    const note = buildRescheduleNote(currentStart, new Date(day));
    expect(note).toContain('Reprogramada de');
    expect(note).not.toContain('undefined');
  });
});
