import { describe, expect, it, beforeEach } from 'vitest';

import {
  createAppointmentIfSlotAvailable,
  listAppointments,
  clearAppointments,
} from '../../../src/storage/appointments';

describe('appointment atomic creation', () => {
  beforeEach(() => {
    clearAppointments();
  });

  it('allows only one creation for the same slot when attempted concurrently', async () => {
    const slot = '2026-09-20T10:00:00.000Z';

    const a1 = {
      id: 'a1',
      clientId: 'c1',
      serviceId: 's1',
      scheduledStart: slot,
      scheduledEnd: '2026-09-20T11:00:00.000Z',
      status: 'pendiente',
      source: 'publico',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    const a2 = { ...a1, id: 'a2', clientId: 'c2' } as any;

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
    const a1 = {
      id: 'b1',
      clientId: 'c1',
      serviceId: 's1',
      scheduledStart: '2026-09-20T10:00:00.000Z',
      scheduledEnd: '2026-09-20T11:00:00.000Z',
      status: 'pendiente',
      source: 'publico',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    const a2 = { ...a1, id: 'b2', clientId: 'c2', scheduledStart: '2026-09-20T12:00:00.000Z' } as any;

    const res1 = await createAppointmentIfSlotAvailable(a1);
    const res2 = await createAppointmentIfSlotAvailable(a2);

    expect(res1).toBe(true);
    expect(res2).toBe(true);

    const saved = listAppointments();
    expect(saved).toHaveLength(2);
  });
});
