import { describe, expect, it } from 'vitest';

import {
  canTransitionStatus,
  createAppointmentStatusTransition,
  transitionAppointmentStatus,
} from '../../../src/domain/appointments/appointment-state-machine';
import { expirePendingAppointments } from '../../../src/domain/appointments/expire-pending-appointments';

describe('appointment state machine', () => {
  it('allows valid transitions and rejects invalid ones', () => {
    expect(canTransitionStatus('pendiente', 'confirmada')).toBe(true);
    expect(canTransitionStatus('pendiente', 'cancelada')).toBe(true);
    expect(canTransitionStatus('confirmada', 'completada')).toBe(true);
    expect(canTransitionStatus('pendiente', 'completada')).toBe(false);

    const transition = createAppointmentStatusTransition({
      appointmentId: '123e4567-e89b-12d3-a456-426614174010',
      previousStatus: 'pendiente',
      newStatus: 'confirmada',
      changedByAdminId: '123e4567-e89b-12d3-a456-426614174011',
      changedAt: new Date('2026-09-24T10:00:00Z'),
      note: 'Confirmado por WhatsApp.',
    });

    expect(transition.previousStatus).toBe('pendiente');
    expect(transition.newStatus).toBe('confirmada');
    expect(transition.note).toBe('Confirmado por WhatsApp.');

    expect(() =>
      transitionAppointmentStatus({
        previousStatus: 'pendiente',
        newStatus: 'completada',
      }),
    ).toThrow(/no está permitida/i);
  });

  it('expires pending appointments whose hold has elapsed and releases them to the public catalog', () => {
    const now = new Date('2026-09-24T11:00:00Z');
    const expired = [
      {
        id: '123e4567-e89b-12d3-a456-426614174020',
        serviceId: '123e4567-e89b-12d3-a456-426614174000',
        clientId: '123e4567-e89b-12d3-a456-426614174021',
        scheduledStart: new Date('2026-09-24T10:30:00Z'),
        scheduledEnd: new Date('2026-09-24T11:30:00Z'),
        status: 'pendiente' as const,
        notes: 'Por confirmar',
        source: 'publico' as const,
        holdExpiresAt: new Date('2026-09-24T10:45:00Z'),
        createdAt: new Date('2026-09-24T10:00:00Z'),
        updatedAt: new Date('2026-09-24T10:00:00Z'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174022',
        serviceId: '123e4567-e89b-12d3-a456-426614174000',
        clientId: '123e4567-e89b-12d3-a456-426614174023',
        scheduledStart: new Date('2026-09-24T12:00:00Z'),
        scheduledEnd: new Date('2026-09-24T13:00:00Z'),
        status: 'confirmada' as const,
        notes: 'Confirmada',
        source: 'admin' as const,
        holdExpiresAt: new Date('2026-09-24T12:45:00Z'),
        createdAt: new Date('2026-09-24T11:00:00Z'),
        updatedAt: new Date('2026-09-24T11:00:00Z'),
      },
    ];

    const updated = expirePendingAppointments({ appointments: expired, now });

    expect(updated).toHaveLength(2);
    expect(updated[0]?.status).toBe('vencida');
    expect(updated[1]?.status).toBe('confirmada');
  });
});
