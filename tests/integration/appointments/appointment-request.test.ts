import { describe, expect, it } from 'vitest';

import { createAppointmentRequest } from '../../../src/domain/appointments/create-appointment-request';
import { clearAppointments, createAppointmentIfSlotAvailable, listAppointments } from '../../../src/storage/appointments';

describe('appointment request flow', () => {
  it('creates a pending appointment and keeps the slot reserved until expiry', async () => {
    clearAppointments();

    const request = createAppointmentRequest({
      serviceId: '123e4567-e89b-12d3-a456-426614174000',
      client: {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Ana García',
        phone: '(55) 1234-5678',
        notes: 'Necesito un masaje.',
      },
      date: '2026-09-24',
      slot: '10:30',
      consent: true,
    });

    const created = await createAppointmentIfSlotAvailable({
      id: request.id,
      clientId: request.client.id,
      serviceId: request.serviceId,
      scheduledStart: request.scheduledStart,
      scheduledEnd: request.scheduledEnd,
      status: request.status,
      notes: request.client.notes,
      source: request.source,
      holdExpiresAt: request.holdExpiresAt,
      previousAppointmentId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(created).toBe(true);
    expect(listAppointments()).toHaveLength(1);
    expect(listAppointments()[0]?.status).toBe('pendiente');
    expect(listAppointments()[0]?.holdExpiresAt).toBeDefined();
  });

  it('rejects a second appointment for the same slot while the first is still pending', async () => {
    clearAppointments();

    const first = createAppointmentRequest({
      serviceId: '123e4567-e89b-12d3-a456-426614174000',
      client: {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Ana',
        phone: '5512345678',
      },
      date: '2026-09-24',
      slot: '11:30',
      consent: true,
    });

    const second = createAppointmentRequest({
      serviceId: '123e4567-e89b-12d3-a456-426614174000',
      client: {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Beto',
        phone: '5512345679',
      },
      date: '2026-09-24',
      slot: '11:30',
      consent: true,
    });

    const createdFirst = await createAppointmentIfSlotAvailable({
      id: first.id,
      clientId: first.client.id,
      serviceId: first.serviceId,
      scheduledStart: first.scheduledStart,
      scheduledEnd: first.scheduledEnd,
      status: first.status,
      notes: first.client.notes,
      source: first.source,
      holdExpiresAt: first.holdExpiresAt,
      previousAppointmentId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdSecond = await createAppointmentIfSlotAvailable({
      id: second.id,
      clientId: second.client.id,
      serviceId: second.serviceId,
      scheduledStart: second.scheduledStart,
      scheduledEnd: second.scheduledEnd,
      status: second.status,
      notes: second.client.notes,
      source: second.source,
      holdExpiresAt: second.holdExpiresAt,
      previousAppointmentId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(createdFirst).toBe(true);
    expect(createdSecond).toBe(false);
    expect(listAppointments()).toHaveLength(1);
  });
});
