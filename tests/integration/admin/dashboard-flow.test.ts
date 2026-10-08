import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAdminDashboardSummary } from '../../../src/domain/admin-dashboard';
import { listSupplies } from '../../../src/domain/inventory/inventory-service';
import { withSpaData } from '../../../src/storage/spa-store';
import { evaluateRouteAccess } from '../../../src/shared/auth/access';
import { createAdminSessionCookie } from '../../../src/shared/auth/server';

// El flujo del panel se valida contra el almacenamiento local cuando no hay
// Supabase configurado (mismo camino que usa la app en local).
vi.mock('../../../src/lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  getSupabaseClient: () => null,
  getSupabaseAdminClient: () => null,
  assertSupabaseReady: () => null,
}));

const storage = new Map<string, string>();

function seedSpaData() {
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
      {
        id: '99999999-9999-4999-8999-999999999999',
        clientId: '22222222-2222-4222-8222-222222222222',
        serviceId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        scheduledStart: new Date('2026-10-05T10:00:00Z'),
        scheduledEnd: new Date('2026-10-05T11:00:00Z'),
        status: 'completada',
        source: 'admin',
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
      {
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        name: 'Esmalte',
        category: 'unas',
        unit: 'piezas',
        quantityAvailable: 1,
        minimumThreshold: 3,
        isActive: false,
      },
    ];
  });
}

function buildExpiredSessionCookie(): string {
  const cookie = createAdminSessionCookie({ role: 'admin' });
  const [encoded, signature] = cookie.split('.');
  const payload = JSON.parse(Buffer.from(encoded!, 'base64url').toString('utf8')) as {
    expiresAt: number;
  };
  payload.expiresAt = Date.now() - 1000;

  return `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${signature}`;
}

describe('admin dashboard flow', () => {
  beforeEach(() => {
    storage.clear();
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: {
          getItem: (key: string) => storage.get(key) ?? null,
          setItem: (key: string, value: string) => {
            storage.set(key, value);
          },
          removeItem: (key: string) => {
            storage.delete(key);
          },
          clear: () => storage.clear(),
        },
      },
      configurable: true,
    });

    withSpaData((data) => {
      data.appointments = [];
      data.services = [];
      data.supplies = [];
      data.supplyMovements = [];
    });
  });

  it('derives the operational summary from live spa data', async () => {
    seedSpaData();

    const summary = await getAdminDashboardSummary();

    expect(summary).toMatchObject({
      pendingAppointments: 1,
      confirmedAppointments: 1,
      expiredAppointments: 1,
      activeServices: 1,
      lowStockItems: 1,
    });
    expect(summary.generatedAt).toBeInstanceOf(Date);
  });

  it('keeps the low stock alerts aligned with the inventory listing used by the panel', async () => {
    seedSpaData();

    const summary = await getAdminDashboardSummary();
    const alerts = summary.lowStockSupplies;
    const lowStockFromInventory = listSupplies()
      .filter((supply) => supply.isActive && supply.isLowStock)
      .map((supply) => supply.id);

    expect(alerts.map((alert) => alert.id)).toEqual(lowStockFromInventory);
    expect(alerts.map((alert) => alert.name)).toEqual(['Exfoliante']);
    expect(alerts.every((alert) => alert.quantityAvailable <= alert.minimumThreshold)).toBe(true);
    expect(summary.lowStockItems).toBe(alerts.length);
  });

  it('exposes the dashboard only to a valid signed admin session', () => {
    expect(evaluateRouteAccess(createAdminSessionCookie({ role: 'admin' })).isAllowed).toBe(true);

    expect(evaluateRouteAccess(undefined)).toMatchObject({
      isAllowed: false,
      redirectTo: '/admin/login',
    });

    expect(evaluateRouteAccess(buildExpiredSessionCookie())).toMatchObject({
      isAllowed: false,
      reason: 'expired-session',
      redirectTo: '/admin/login?reason=expired',
    });
  });
});
