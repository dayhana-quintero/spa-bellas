import { describe, expect, it } from 'vitest';

import {
  getAppointmentById,
  getAvailableStatusTransitions,
  listPendingAppointments,
} from '../../../src/domain/appointments/admin-appointment-service';

describe('admin pending appointments', () => {
  const appointments = [
    {
      id: '123e4567-e89b-12d3-a456-426614174100',
      clientId: '123e4567-e89b-12d3-a456-426614174101',
      serviceId: '123e4567-e89b-12d3-a456-426614174200',
      scheduledStart: new Date('2026-09-24T10:00:00Z'),
      scheduledEnd: new Date('2026-09-24T11:00:00Z'),
      status: 'pendiente' as const,
      source: 'publico' as const,
      holdExpiresAt: new Date('2026-09-24T10:30:00Z'),
      createdAt: new Date('2026-09-24T09:00:00Z'),
      updatedAt: new Date('2026-09-24T09:00:00Z'),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174110',
      clientId: '123e4567-e89b-12d3-a456-426614174111',
      serviceId: '123e4567-e89b-12d3-a456-426614174201',
      scheduledStart: new Date('2026-09-24T12:00:00Z'),
      scheduledEnd: new Date('2026-09-24T13:00:00Z'),
      status: 'confirmada' as const,
      source: 'admin' as const,
      createdAt: new Date('2026-09-24T09:00:00Z'),
      updatedAt: new Date('2026-09-24T09:00:00Z'),
    },
  ];

  it('lists only pending appointments and resolves the detail by id', () => {
    expect(listPendingAppointments(appointments)).toHaveLength(1);
    expect(listPendingAppointments(appointments)[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174100');
    expect(getAppointmentById(appointments, '123e4567-e89b-12d3-a456-426614174110')?.status).toBe('confirmada');
    expect(getAppointmentById(appointments, 'not-found')).toBeNull();
  });

  it('exposes the valid next actions for each appointment status', () => {
    expect(getAvailableStatusTransitions('pendiente')).toEqual(['confirmada', 'cancelada', 'vencida', 'reprogramada']);
    expect(getAvailableStatusTransitions('confirmada')).toEqual(['completada', 'cancelada', 'reprogramacion solicitada', 'vencida', 'reprogramada']);
    expect(getAvailableStatusTransitions('cancelada')).toEqual([]);
  });
});
