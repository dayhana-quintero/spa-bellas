import { describe, expect, it, vi } from 'vitest';

import { getAvailableSlots } from '@/domain/spa-service';
import {
  RESCHEDULABLE_STATUSES,
  canTransitionStatus,
} from '@/domain/appointments/appointment-state-machine';
import { getAvailableStatusTransitions } from '@/domain/appointments/admin-appointment-service';
import {
  listAppointmentsFromSupabase,
  rescheduleAppointmentInSupabase,
} from '@/lib/supabase-data';

type StoredAppointment = Awaited<ReturnType<typeof listAppointmentsFromSupabase>>[number];

const DATE = '2026-10-20';

const state = vi.hoisted(() => ({
  ids: {
    OWN_ID: '11111111-1111-4111-8111-111111111111',
    OTHER_ID: '22222222-2222-4222-8222-222222222222',
    SERVICE_ID: '33333333-3333-4333-8333-333333333333',
    CLIENT_ID: '44444444-4444-4444-8444-444444444444',
    OTHER_CLIENT_ID: '55555555-5555-4555-8555-555555555555',
  },
  availability: {
    spaCapacity: 1,
    bufferBetweenAppointments: 0,
    defaultHoldDuration: 30,
    workingDays: [
      'domingo',
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
    ],
    nonWorkingDays: [] as string[],
    openingHours: Object.fromEntries(
      [
        'domingo',
        'lunes',
        'martes',
        'miercoles',
        'jueves',
        'viernes',
        'sabado',
      ].map((day) => [day, { opensAt: 8 * 60, closesAt: 18 * 60 }]),
    ),
    adminBlocks: [] as Array<{ startsAt: string; endsAt: string }>,
  },
  service: {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Masaje relajante',
    category: 'general',
    description: 'Masaje relajante',
    estimatedDuration: 60,
    priceDisplay: undefined,
    isActive: true,
    isBookable: true,
  },
  appointments: [] as StoredAppointment[],
  updateResults: [] as Array<{ data: Record<string, unknown> | null; error: unknown }>,
  historyResults: [] as Array<{ data: { id: string } | null; error: unknown }>,
  updatePayloads: [] as Array<Record<string, unknown>>,
  historyPayloads: [] as Array<Record<string, unknown>>,
  eqFilters: [] as string[],
}));

const { OWN_ID, OTHER_ID, SERVICE_ID, CLIENT_ID, OTHER_CLIENT_ID } = state.ids;

function buildAppointment(overrides: {
  id: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  status?: 'pendiente' | 'confirmada' | 'cancelada' | 'reprogramada';
  clientId?: string;
}): StoredAppointment {
  return {
    id: overrides.id,
    clientId: overrides.clientId ?? CLIENT_ID,
    serviceId: SERVICE_ID,
    scheduledStart: overrides.scheduledStart,
    scheduledEnd: overrides.scheduledEnd,
    status: overrides.status ?? ('confirmada' as const),
    notes: undefined,
    source: 'publico' as const,
    holdExpiresAt: undefined,
    createdAt: new Date('2026-10-01T10:00:00.000Z'),
    updatedAt: new Date('2026-10-01T10:00:00.000Z'),
    client: undefined,
    service: undefined,
  };
}

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdminClient: () => ({
    from(table: string) {
      if (table === 'appointments') {
        return {
          update(payload: Record<string, unknown>) {
            state.updatePayloads.push(payload);
            return this;
          },
          eq(column: string, value: unknown) {
            state.eqFilters.push(`${column}=${String(value)}`);
            return this;
          },
          select() {
            return this;
          },
          async maybeSingle() {
            return state.updateResults.shift() ?? { data: null, error: null };
          },
        };
      }

      return {
        insert(payload: Record<string, unknown>) {
          state.historyPayloads.push(payload);
          return this;
        },
        select() {
          return this;
        },
        async single() {
          return state.historyResults.shift() ?? { data: { id: 'history-1' }, error: null };
        },
      };
    },
  }),
}));

vi.mock('@/lib/supabase-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase-data')>();
  return {
    ...actual,
    getAvailabilitySettingsFromSupabase: vi.fn(async () => state.availability),
    getServiceFromSupabase: vi.fn(async () => state.service),
    listAppointmentsFromSupabase: vi.fn(async () => state.appointments),
  };
});

const ownAppointment = buildAppointment({
  id: OWN_ID,
  scheduledStart: new Date(2026, 9, 20, 10, 0),
  scheduledEnd: new Date(2026, 9, 20, 11, 0),
});

const otherAppointment = buildAppointment({
  id: OTHER_ID,
  scheduledStart: new Date(2026, 9, 20, 12, 0),
  scheduledEnd: new Date(2026, 9, 20, 13, 0),
  clientId: OTHER_CLIENT_ID,
});

describe('reschedule foundation: state machine', () => {
  it('permite reprogramar desde pendiente, confirmada y reprogramacion solicitada', () => {
    expect(canTransitionStatus('pendiente', 'reprogramada')).toBe(true);
    expect(canTransitionStatus('confirmada', 'reprogramada')).toBe(true);
    expect(canTransitionStatus('reprogramacion solicitada', 'reprogramada')).toBe(true);
  });

  it('veta la reprogramacion en estados terminales', () => {
    expect(canTransitionStatus('cancelada', 'reprogramada')).toBe(false);
    expect(canTransitionStatus('vencida', 'reprogramada')).toBe(false);
    expect(canTransitionStatus('completada', 'reprogramada')).toBe(false);
    expect(canTransitionStatus('no asistio', 'reprogramada')).toBe(false);
  });

  it('conserva las transiciones existentes hacia confirmada', () => {
    expect(canTransitionStatus('reprogramada', 'confirmada')).toBe(true);
    expect(canTransitionStatus('reprogramacion solicitada', 'cancelada')).toBe(true);
  });

  it('el desplegable administrativo refleja las mismas transiciones nuevas', () => {
    expect(getAvailableStatusTransitions('pendiente')).toContain('reprogramada');
    expect(getAvailableStatusTransitions('confirmada')).toContain('reprogramada');
    expect(getAvailableStatusTransitions('cancelada')).toEqual([]);
  });

  it('expone exactamente los estados reprogramables del spec', () => {
    expect(RESCHEDULABLE_STATUSES).toEqual([
      'pendiente',
      'confirmada',
      'reprogramacion solicitada',
      'reprogramada',
    ]);
  });
});

describe('reschedule foundation: availability excludes the appointment itself', () => {
  it('sin excluir, la propia cita bloquea su horario actual y los solapes', async () => {
    state.appointments = [ownAppointment, otherAppointment];

    const times = (await getAvailableSlots(SERVICE_ID, DATE)).map((slot) => slot.time);

    // Ocupacion propia estricta y solape parcial (10:00 -> 10:30).
    expect(times).not.toContain('10:00');
    expect(times).not.toContain('10:30');
    // La otra cita sigue bloqueando su horario.
    expect(times).not.toContain('12:00');
    expect(times).not.toContain('12:30');
    expect(times).toContain('09:00');
  });

  it('al excluir la propia cita se liberan su horario y sus solapes, no los ajenos', async () => {
    state.appointments = [ownAppointment, otherAppointment];

    const times = (await getAvailableSlots(SERVICE_ID, DATE, {
      excludeAppointmentId: OWN_ID,
    })).map((slot) => slot.time);

    expect(times).toContain('10:00');
    expect(times).toContain('10:30');
    expect(times).not.toContain('12:00');
    expect(times).not.toContain('12:30');
  });

  it('excluye horas de dias pasados solo cuando se pide, sin tocar la reserva publica (FR-003)', async () => {
    state.appointments = [];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const pastKey = `${yesterday.getFullYear()}-${month}-${day}`;

    const withoutFilter = await getAvailableSlots(SERVICE_ID, pastKey);
    const withFilter = await getAvailableSlots(SERVICE_ID, pastKey, { excludePast: true });

    expect(withoutFilter.length).toBeGreaterThan(0);
    expect(withFilter).toEqual([]);
  });
});

describe('reschedule foundation: conditional update', () => {
  const baseInput = {
    appointmentId: OWN_ID,
    expectedScheduledStart: new Date(2026, 9, 20, 10, 0),
    expectedScheduledEnd: new Date(2026, 9, 20, 11, 0),
    expectedStatus: 'confirmada',
    nextStart: new Date(2026, 9, 21, 15, 0),
    nextEnd: new Date(2026, 9, 21, 16, 0),
    nextStatus: 'reprogramada',
    adminId: '00000000-0000-4000-8000-000000000001',
    note: 'Reprogramada de prueba.',
  };

  it('devuelve null y no escribe historial cuando otra escritura gano la carrera', async () => {
    state.updateResults = [{ data: null, error: null }];
    state.historyPayloads = [];

    const result = await rescheduleAppointmentInSupabase(baseInput);

    expect(result).toBeNull();
    expect(state.historyPayloads).toHaveLength(0);
  });

  it('condiciona la escritura a id, estado y fecha originales', async () => {
    state.updateResults = [
      {
        data: {
          id: OWN_ID,
          status: 'reprogramada',
          scheduled_start: '2026-10-21T15:00:00.000Z',
          scheduled_end: '2026-10-21T16:00:00.000Z',
          updated_at: '2026-10-21T10:00:00.000Z',
        },
        error: null,
      },
    ];
    state.historyResults = [{ data: { id: 'history-9' }, error: null }];
    state.eqFilters = [];
    state.updatePayloads = [];
    state.historyPayloads = [];

    const result = await rescheduleAppointmentInSupabase(baseInput);

    expect(result).toMatchObject({
      id: OWN_ID,
      status: 'reprogramada',
      historyId: 'history-9',
    });
    expect(state.eqFilters).toEqual([
      `id=${OWN_ID}`,
      'status=confirmada',
      `scheduled_start=${baseInput.expectedScheduledStart.toISOString()}`,
    ]);
    expect(state.updatePayloads[0]).toMatchObject({
      scheduled_start: baseInput.nextStart.toISOString(),
      scheduled_end: baseInput.nextEnd.toISOString(),
      status: 'reprogramada',
    });
    expect(state.historyPayloads[0]).toMatchObject({
      appointment_id: OWN_ID,
      previous_status: 'confirmada',
      new_status: 'reprogramada',
      changed_by_admin_id: baseInput.adminId,
      note: baseInput.note,
    });
  });

  it('revierte la cita cuando el historial no se puede guardar', async () => {
    state.updateResults = [
      {
        data: {
          id: OWN_ID,
          status: 'reprogramada',
          scheduled_start: '2026-10-21T15:00:00.000Z',
          scheduled_end: '2026-10-21T16:00:00.000Z',
          updated_at: '2026-10-21T10:00:00.000Z',
        },
        error: null,
      },
    ];
    state.historyResults = [{ data: null, error: { message: 'boom' } }];
    state.updatePayloads = [];

    await expect(rescheduleAppointmentInSupabase(baseInput)).rejects.toThrow(
      /historial de la reprogramacion/i,
    );
    // Primera escritura (movimiento) + segunda escritura (rollback).
    expect(state.updatePayloads).toHaveLength(2);
    expect(state.updatePayloads[1]).toMatchObject({
      scheduled_start: baseInput.expectedScheduledStart.toISOString(),
      scheduled_end: baseInput.expectedScheduledEnd.toISOString(),
      status: 'confirmada',
    });
  });
});
