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

  it('accepts service ids in the app format even when they are not UUIDs', () => {
    expect(() =>
      validateAppointmentRequest({
        serviceId: '1',
        client: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Ana García',
          phone: '(55) 1234-5678',
          notes: 'Necesito un masaje relajante.',
        },
        date: '2026-09-24',
        slot: '10:30',
        consent: true,
      }),
    ).not.toThrow();
  });

  it('creates a fallback UUID when crypto.randomUUID is unavailable', () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: undefined },
      configurable: true,
    });

    try {
      const result = createAppointmentRequest({
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

      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        configurable: true,
      });
    }
  });
});
