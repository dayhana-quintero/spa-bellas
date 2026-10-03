import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildAppointmentRequestFormState,
  buildPendingAppointmentSummary,
  clearCustomerSession,
  CUSTOMER_SESSION_STORAGE_KEY,
  readCustomerSession,
  saveCustomerSession,
} from '../../../src/app/public/appointments/appointment-request-form';

describe('public appointment request form state', () => {
  beforeEach(() => {
    const storage = {
      getItem: vi.fn((key: string) => {
        const map = (globalThis as { __customerSessionStore?: Record<string, string> }).__customerSessionStore ?? {};
        return key in map ? map[key] : null;
      }),
      setItem: vi.fn((key: string, value: string) => {
        const map = (globalThis as { __customerSessionStore?: Record<string, string> }).__customerSessionStore ?? {};
        map[key] = value;
        (globalThis as { __customerSessionStore?: Record<string, string> }).__customerSessionStore = map;
      }),
      removeItem: vi.fn((key: string) => {
        const map = (globalThis as { __customerSessionStore?: Record<string, string> }).__customerSessionStore ?? {};
        delete map[key];
        (globalThis as { __customerSessionStore?: Record<string, string> }).__customerSessionStore = map;
      }),
    };

    vi.stubGlobal('sessionStorage', storage);
    (globalThis as { __customerSessionStore?: Record<string, string> }).__customerSessionStore = {};
  });
  it('flags missing required fields before submission', () => {
    const state = buildAppointmentRequestFormState({
      name: '',
      phone: '',
      consent: false,
      slot: '10:30',
      selectedServiceId: '123e4567-e89b-12d3-a456-426614174000',
    });

    expect(state.canSubmit).toBe(false);
    expect(state.message?.toLowerCase()).toContain('completa');
  });

  it('builds a readable pending summary', () => {
    const summary = buildPendingAppointmentSummary({
      name: 'Ana García',
      date: '2026-09-24',
      slot: '10:30',
    });

    expect(summary).toContain('Ana García');
    expect(summary).toContain('2026-09-24');
    expect(summary).toContain('10:30');
  });

  it('persists the customer booking session in sessionStorage', () => {
    clearCustomerSession();

    saveCustomerSession({
      name: 'Ana García',
      phone: '+56912345678',
      notes: 'Prefiero horario de la tarde',
      consent: true,
      selectedServiceId: 'service-1',
      date: '2026-09-24',
      selectedSlot: '10:30',
    });

    const stored = (globalThis as { __customerSessionStore?: Record<string, string> }).__customerSessionStore?.[CUSTOMER_SESSION_STORAGE_KEY] ?? '{}';

    expect(JSON.parse(stored)).toMatchObject({
      name: 'Ana García',
      phone: '+56912345678',
      consent: true,
      selectedServiceId: 'service-1',
      date: '2026-09-24',
      selectedSlot: '10:30',
    });

    expect(readCustomerSession()).toMatchObject({
      name: 'Ana García',
      phone: '+56912345678',
      consent: true,
    });

    clearCustomerSession();
    expect(readCustomerSession()).toEqual({});
  });
});
