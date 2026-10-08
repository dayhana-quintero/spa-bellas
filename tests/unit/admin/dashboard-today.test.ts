import { describe, expect, it } from 'vitest';

import {
  filterAppointmentsForLocalDay,
  getLocalDayBounds,
} from '../../../src/domain/admin-dashboard';

function appointment(id: string, scheduledStart: Date) {
  return { id, scheduledStart };
}

describe('local day bounds', () => {
  it('covers exactly [today 00:00, tomorrow 00:00)', () => {
    const now = new Date(2026, 9, 7, 21, 45, 0, 0);
    const { start, end } = getLocalDayBounds(now);

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(9);
    expect(start.getDate()).toBe(7);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);
    expect(end.getDate()).toBe(8);
  });
});

describe('filterAppointmentsForLocalDay', () => {
  const now = new Date(2026, 9, 7, 21, 45, 0, 0);

  it('keeps appointments scheduled for the local day', () => {
    const morning = appointment('morning', new Date(2026, 9, 7, 9, 0, 0, 0));
    const evening = appointment('evening', new Date(2026, 9, 7, 19, 59, 0, 0));
    const midnightEdge = appointment('edge', new Date(2026, 9, 7, 23, 59, 0, 0));

    const result = filterAppointmentsForLocalDay([morning, evening, midnightEdge], now);

    expect(result.map((item) => item.id)).toEqual(['morning', 'evening', 'edge']);
  });

  it('drops yesterday, tomorrow, and day boundaries outside the window', () => {
    const yesterdayLastMinute = appointment('yesterday', new Date(2026, 9, 6, 23, 59, 0, 0));
    const tomorrowFirstMinute = appointment('tomorrow', new Date(2026, 9, 8, 0, 1, 0, 0));
    const today = appointment('today', new Date(2026, 9, 7, 8, 0, 0, 0));

    const result = filterAppointmentsForLocalDay([yesterdayLastMinute, tomorrowFirstMinute, today], now);

    expect(result.map((item) => item.id)).toEqual(['today']);
  });

  it('returns the appointments sorted from earliest to latest', () => {
    const late = appointment('late', new Date(2026, 9, 7, 16, 0, 0, 0));
    const early = appointment('early', new Date(2026, 9, 7, 8, 30, 0, 0));
    const middle = appointment('middle', new Date(2026, 9, 7, 12, 0, 0, 0));

    const result = filterAppointmentsForLocalDay([late, early, middle], now);

    expect(result.map((item) => item.id)).toEqual(['early', 'middle', 'late']);
  });

  it('returns an empty list when no appointment falls on the local day', () => {
    const other = appointment('other', new Date(2026, 9, 22, 9, 45, 0, 0));

    expect(filterAppointmentsForLocalDay([other], now)).toEqual([]);
  });
});
