import { describe, expect, it } from 'vitest';

import { getAvailableSlotsForDate } from '../../../src/domain/availability/availability-service';

describe('availability service', () => {
  it('returns the public slots for an open working day', () => {
    const slots = getAvailableSlotsForDate({
      date: '2026-09-24',
      serviceDurationMinutes: 60,
      availability: {
        spaCapacity: 1,
        bufferBetweenAppointments: 15,
        defaultHoldDuration: 30,
        workingDays: ['jueves'],
        nonWorkingDays: [],
        openingHours: {
          jueves: { opensAt: 9 * 60, closesAt: 17 * 60 },
        },
        adminBlocks: [],
        professionalAvailability: undefined,
      },
      bookedAppointments: [],
      pendingHolds: [],
    });

    expect(slots[0]?.time).toBe('09:00');
    expect(slots.map((slot) => slot.time)).toContain('10:30');
    expect(slots.map((slot) => slot.time)).not.toContain('18:00');
  });
});
