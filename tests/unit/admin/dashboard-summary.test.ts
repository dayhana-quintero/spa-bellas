import { describe, expect, it, vi } from 'vitest';

import { getAdminDashboardSummary } from '../../../src/domain/admin-dashboard';import { withSpaData } from '../../../src/storage/spa-store';

// Sin Supabase configurado el resumen debe degradar al almacenamiento local.
vi.mock('../../../src/lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  getSupabaseClient: () => null,
  getSupabaseAdminClient: () => null,
  assertSupabaseReady: () => null,
}));

describe('admin dashboard summary', () => {
  it('counts active appointments, services and stock risk from the current spa data', async () => {
    withSpaData((data) => {
      data.appointments = [
        {
          id: '11111111-1111-4111-8111-111111111111',
          clientId: '22222222-2222-4222-8222-222222222222',
          serviceId: '33333333-3333-4333-8333-333333333333',
          scheduledStart: new Date('2026-10-02T10:00:00Z'),
          scheduledEnd: new Date('2026-10-02T11:00:00Z'),
          status: 'pendiente',
          source: 'publico',
          createdAt: new Date('2026-10-01T09:00:00Z'),
          updatedAt: new Date('2026-10-01T09:00:00Z'),
          holdExpiresAt: new Date('2026-10-02T10:30:00Z'),
        },
        {
          id: '44444444-4444-4444-8444-444444444444',
          clientId: '55555555-5555-4555-8555-555555555555',
          serviceId: '33333333-3333-4333-8333-333333333333',
          scheduledStart: new Date('2026-10-03T10:00:00Z'),
          scheduledEnd: new Date('2026-10-03T11:00:00Z'),
          status: 'confirmada',
          source: 'admin',
          createdAt: new Date('2026-10-01T09:00:00Z'),
          updatedAt: new Date('2026-10-01T09:00:00Z'),
        },
        {
          id: '77777777-7777-4777-8777-777777777777',
          clientId: '88888888-8888-4888-8888-888888888888',
          serviceId: '33333333-3333-4333-8333-333333333333',
          scheduledStart: new Date('2026-10-04T10:00:00Z'),
          scheduledEnd: new Date('2026-10-04T11:00:00Z'),
          status: 'vencida',
          source: 'publico',
          createdAt: new Date('2026-10-01T09:00:00Z'),
          updatedAt: new Date('2026-10-01T09:00:00Z'),
        },
      ];

      data.services = [
        {
          id: '33333333-3333-4333-8333-333333333333',
          category: 'unas',
          name: 'Manicura',
          description: 'Servicio',
          estimatedDuration: 60,
          isActive: true,
          isBookable: true,
        },
        {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          category: 'faciales',
          name: 'Facial',
          description: 'Servicio inactivo',
          estimatedDuration: 90,
          isActive: false,
          isBookable: true,
        },
      ];

      data.supplies = [
        {
          id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          name: 'Exfoliante',
          category: 'cosmeticos',
          unit: 'botellas',
          quantityAvailable: 2,
          minimumThreshold: 4,
          isActive: true,
        },
        {
          id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          name: 'Gel',
          category: 'cosmeticos',
          unit: 'botellas',
          quantityAvailable: 8,
          minimumThreshold: 5,
          isActive: true,
        },
      ];
    });

    const summary = await getAdminDashboardSummary();

    expect(summary).toMatchObject({
      pendingAppointments: 1,
      confirmedAppointments: 1,
      expiredAppointments: 1,
      activeServices: 1,
      lowStockItems: 1,
    });

    expect(summary.generatedAt).toBeInstanceOf(Date);
    expect(summary.lowStockSupplies.map((item) => item.name)).toEqual(['Exfoliante']);
  });
});
