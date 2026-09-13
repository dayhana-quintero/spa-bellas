import { describe, expect, it } from 'vitest';

import { appointmentSchema } from '../../src/shared/types/appointment';
import { adminSchema } from '../../src/shared/types/administrator';
import { appointmentStatusRecordSchema } from '../../src/shared/types/appointment-status';
import { confirmationMessageSchema } from '../../src/shared/types/confirmation-message';
import { supplySchema } from '../../src/shared/types/supply';
import { supplyMovementSchema } from '../../src/shared/types/supply-movement';

describe('domain schemas', () => {
  it('accepts a valid appointment payload', () => {
    const result = appointmentSchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      clientId: '123e4567-e89b-12d3-a456-426614174001',
      serviceId: '123e4567-e89b-12d3-a456-426614174002',
      scheduledStart: '2026-09-15T10:00:00.000Z',
      scheduledEnd: '2026-09-15T11:00:00.000Z',
      status: 'pendiente',
      notes: 'Primera cita',
      source: 'publico',
      holdExpiresAt: '2026-09-15T10:15:00.000Z',
      createdAt: '2026-09-12T08:00:00.000Z',
      updatedAt: '2026-09-12T08:00:00.000Z',
    });

    expect(result.status).toBe('pendiente');
  });

  it('accepts a valid administrator and inventory record', () => {
    const admin = adminSchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174010',
      name: 'Admin principal',
      accessStatus: 'activo',
    });

    const supply = supplySchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174011',
      name: 'Crema hidratante',
      category: 'cosmeticos',
      unit: 'botellas',
      quantityAvailable: 12,
      minimumThreshold: 3,
      isActive: true,
    });

    const movement = supplyMovementSchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174012',
      supplyId: supply.id,
      type: 'entrada',
      quantity: 5,
      reason: 'Compra semanal',
      adminId: admin.id,
      createdAt: '2026-09-12T09:00:00.000Z',
    });

    const record = appointmentStatusRecordSchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174013',
      appointmentId: '123e4567-e89b-12d3-a456-426614174000',
      previousStatus: 'pendiente',
      newStatus: 'confirmada',
      changedByAdminId: admin.id,
      changedAt: '2026-09-12T09:30:00.000Z',
      note: 'Confirmado por WhatsApp',
    });

    const message = confirmationMessageSchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174014',
      appointmentId: '123e4567-e89b-12d3-a456-426614174000',
      messageText: 'Hola Ana, confirmamos tu cita para el martes a las 10:00.',
      contactPhone: '+5215512345678',
      preparedAt: '2026-09-12T09:31:00.000Z',
      outcome: 'prepared',
      outcomeNote: 'Listo para enviar',
    });

    expect(movement.quantity).toBe(5);
    expect(record.newStatus).toBe('confirmada');
    expect(message.outcome).toBe('prepared');
  });
});
