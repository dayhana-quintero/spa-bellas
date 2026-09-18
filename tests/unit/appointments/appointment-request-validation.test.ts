import { describe, expect, it } from 'vitest';

import {
  createAppointmentRequest,
  validateAppointmentRequest,
} from '../../../src/domain/appointments/create-appointment-request';

describe('appointment request validation', () => {
  it('normalizes the phone and accepts a valid request with consent', () => {
    const result = validateAppointmentRequest({
      serviceId: '123e4567-e89b-12d3-a456-426614174000',
      client: {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Ana García',
        phone: '(55) 1234-5678',
        notes: 'Necesito un masaje relajante.',
      },
      date: '2026-09-24',
      slot: '10:30',
      consent: true,
    });

    expect(result.client.phone).toBe('+525512345678');
    expect(result.status).toBe('pendiente');
    expect(result.source).toBe('publico');
  });

  it('rejects missing data, invalid phone, or missing consent', () => {
    expect(() =>
      createAppointmentRequest({
        serviceId: '',
        client: { id: '123e4567-e89b-12d3-a456-426614174001', name: '', phone: '', notes: '' },
        date: '2026-09-24',
        slot: '10:30',
        consent: true,
      }),
    ).toThrow();

    expect(() =>
      createAppointmentRequest({
        serviceId: '123e4567-e89b-12d3-a456-426614174000',
        client: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Ana García',
          phone: '123',
          notes: '',
        },
        date: '2026-09-24',
        slot: '10:30',
        consent: false,
      }),
    ).toThrow();
  });
});
