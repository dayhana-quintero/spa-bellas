import { describe, expect, it, beforeEach } from 'vitest';

import type { Appointment } from '../../../src/shared/types/appointment';
import {
  createAppointmentIfSlotAvailable,
  listAppointments,
  clearAppointments,
} from '../../../src/storage/appointments';

type AppointmentSeed = Partial<Omit<Appointment, 'scheduledStart' | 'scheduledEnd'>> & {
  id: string;
  scheduledStart?: Date | string;
  scheduledEnd?: Date | string;
};

function buildAppointment(overrides: AppointmentSeed): Appointment {
  const start = new Date(overrides.scheduledStart ?? '2026-09-20T10:00:00.000Z');
  const end = overrides.scheduledEnd
    ? new Date(overrides.scheduledEnd)
    : new Date(start.getTime() + 60 * 60 * 1000);

  return {
    clientId: 'c1',
    serviceId: 's1',
    status: 'pendiente',
    source: 'publico',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
    scheduledStart: start,
    scheduledEnd: end,
  };
}

describe('appointment atomic creation', () => {
  beforeEach(() => {
    clearAppointments();
  });

  it('allows only one creation for the same slot when attempted concurrently', async () => {
    const slot = '2026-09-20T10:00:00.000Z';

    const a1 = buildAppointment({ id: 'a1', scheduledStart: slot });
    const a2 = buildAppointment({ id: 'a2', clientId: 'c2', scheduledStart: slot });

    // Iniciar ambas promesas casi simultáneamente para simular concurrencia.
    const p1 = createAppointmentIfSlotAvailable(a1);
    const p2 = createAppointmentIfSlotAvailable(a2);

    const results = await Promise.all([p1, p2]);

    // Solo una debe haber triunfado
    expect(results.filter(Boolean)).toHaveLength(1);

    const saved = listAppointments();
    expect(saved).toHaveLength(1);
  });

  it('allows creations for different slots', async () => {
    const a1 = buildAppointment({ id: 'b1' });
    const a2 = buildAppointment({ id: 'b2', clientId: 'c2', scheduledStart: '2026-09-20T12:00:00.000Z' });

    const res1 = await createAppointmentIfSlotAvailable(a1);
    const res2 = await createAppointmentIfSlotAvailable(a2);

    expect(res1).toBe(true);
    expect(res2).toBe(true);

    const saved = listAppointments();
    expect(saved).toHaveLength(2);
  });
});
