import { describe, expect, it } from 'vitest';

import { generateAvailableSlots } from '../../../src/domain/availability/generate-available-slots';

describe('availability generator', () => {
  it('generates only free slots within opening hours and excludes booked and blocked times', () => {
    const slots = generateAvailableSlots({
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
        adminBlocks: [
          { startsAt: new Date('2026-09-24T12:00:00'), endsAt: new Date('2026-09-24T13:00:00') },
        ],
        professionalAvailability: undefined,
      },
      bookedAppointments: [
        { scheduledStart: new Date('2026-09-24T09:30:00'), scheduledEnd: new Date('2026-09-24T10:30:00') },
      ],
      pendingHolds: [
        { scheduledStart: new Date('2026-09-24T11:00:00'), scheduledEnd: new Date('2026-09-24T12:00:00') },
      ],
    });

    expect(slots.map((slot) => slot.time)).toContain('13:00');
    expect(slots.map((slot) => slot.time)).not.toContain('09:30');
    expect(slots.map((slot) => slot.time)).not.toContain('11:00');
    expect(slots.map((slot) => slot.time)).not.toContain('12:00');
    expect(slots.length).toBeGreaterThan(0);
  });

  it('returns an empty list when the day is not working or there are no free slots', () => {
    const slots = generateAvailableSlots({
      date: '2026-09-25',
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

    expect(slots).toEqual([]);
  });
});
