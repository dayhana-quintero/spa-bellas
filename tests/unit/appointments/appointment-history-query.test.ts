import { randomUUID } from 'crypto';

import { beforeEach, describe, expect, it } from 'vitest';

import { findAppointmentHistory } from '../../../src/storage/appointments/appointment-history-repository';
import { withSpaData } from '../../../src/storage/spa-store';
import type { Appointment } from '../../../src/shared/types/appointment';

const clientA = '123e4567-e89b-12d3-a456-426614174001';
const clientB = '123e4567-e89b-12d3-a456-426614174002';
const serviceA = '123e4567-e89b-12d3-a456-426614174101';
const serviceB = '123e4567-e89b-12d3-a456-426614174102';

const storage = new Map<string, string>();

function seedAppointment(
  scheduledStart: string,
  overrides: Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'scheduledStart' | 'scheduledEnd'>> = {},
): Appointment {
  const start = new Date(scheduledStart);
  const now = new Date(start.getTime() - 24 * 60 * 60 * 1000);

  return withSpaData((data) => {
    const appointment: Appointment = {
      id: randomUUID(),
      clientId: clientA,
      serviceId: serviceA,
      scheduledStart: start,
      scheduledEnd: new Date(start.getTime() + 60 * 60 * 1000),
      status: 'confirmada',
      source: 'admin',
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };

    data.appointments.push(appointment);
    return appointment;
  });
}

describe('appointment history repository', () => {
  beforeEach(() => {
    storage.clear();
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: {
          getItem: (key: string) => storage.get(key) ?? null,
          setItem: (key: string, value: string) => {
            storage.set(key, value);
          },
          removeItem: (key: string) => {
            storage.delete(key);
          },
          clear: () => storage.clear(),
        },
      },
      configurable: true,
    });
    withSpaData((data) => {
      data.appointments = [];
    });
  });

  it('combines status, date, client, and service filters', () => {
    const match = seedAppointment('2026-09-24T10:00:00Z');
    seedAppointment('2026-09-25T10:00:00Z', { status: 'cancelada' });
    seedAppointment('2026-09-24T11:00:00Z', { clientId: clientB });
    seedAppointment('2026-09-24T12:00:00Z', { serviceId: serviceB });

    const result = findAppointmentHistory({
      status: 'confirmada',
      from: new Date('2026-09-24T00:00:00Z'),
      to: new Date('2026-09-24T23:59:59Z'),
      clientId: clientA,
      serviceId: serviceA,
    });

    expect(result.total).toBe(1);
    expect(result.items.map((appointment) => appointment.id)).toEqual([match.id]);
  });

  it('sorts newest first and returns the requested page', () => {
    const oldest = seedAppointment('2026-09-20T10:00:00Z');
    const middle = seedAppointment('2026-09-21T10:00:00Z');
    const newest = seedAppointment('2026-09-22T10:00:00Z');

    const result = findAppointmentHistory({ page: 2, pageSize: 1 });

    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(2);
    expect(result.items.map((appointment) => appointment.id)).toEqual([middle.id]);
    expect([oldest.id, newest.id]).not.toContain(result.items[0]?.id);
  });

  it('returns an empty page when no appointments match', () => {
    seedAppointment('2026-09-24T10:00:00Z');

    expect(findAppointmentHistory({ status: 'no asistio' })).toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });
  });
});
