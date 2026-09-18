import { describe, expect, it } from 'vitest';

import { updateAppointmentStatus } from '../../../src/domain/appointments/admin-appointment-service';

describe('admin appointment service', () => {
  it('updates valid states for administrators and blocks invalid transitions', () => {
    expect(
      updateAppointmentStatus({
        appointmentId: '123e4567-e89b-12d3-a456-426614174100',
        previousStatus: 'pendiente',
        newStatus: 'confirmada',
        reason: 'confirmado por WhatsApp',
      }),
    ).toBe('confirmada');

    expect(() =>
      updateAppointmentStatus({
        appointmentId: '123e4567-e89b-12d3-a456-426614174101',
        previousStatus: 'pendiente',
        newStatus: 'completada',
      }),
    ).toThrow(/no está permitida/i);
  });
});
