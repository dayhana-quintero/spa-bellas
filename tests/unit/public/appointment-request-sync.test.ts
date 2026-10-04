import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(() => true),
  saveClientToSupabase: vi.fn(async () => ({ id: 'client-1' })),
  saveServiceToSupabase: vi.fn(async () => ({ id: '33333333-3333-4333-8333-333333333333' })),
  saveAppointmentToSupabase: vi.fn(async () => ({ id: 'appointment-1' })),
}));

vi.mock('../../../src/lib/supabase', () => ({
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

vi.mock('../../../src/lib/supabase-data', () => ({
  listAppointmentsFromSupabase: vi.fn(async () => []),
  saveClientToSupabase: mocks.saveClientToSupabase,
  saveServiceToSupabase: mocks.saveServiceToSupabase,
  saveAppointmentToSupabase: mocks.saveAppointmentToSupabase,
}));

import { getAvailableSlots, requestAppointment } from '../../../src/domain/spa-service';
import { withSpaData } from '../../../src/storage/spa-store';

describe('public appointment request sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withSpaData((data) => {
      data.clients = [];
      data.appointments = [];
      data.services = [
        {
          id: 'service-1',
          category: 'tratamientos',
          name: 'Masaje relajante',
          description: 'Masaje relajante',
          estimatedDuration: 60,
          isActive: true,
          isBookable: true,
        },
      ];
      data.availability = {
        spaCapacity: 1,
        bufferBetweenAppointments: 15,
        defaultHoldDuration: 15,
        workingDays: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
        nonWorkingDays: [],
        openingHours: {
          lunes: { opensAt: 540, closesAt: 1020 },
          martes: { opensAt: 540, closesAt: 1020 },
          miercoles: { opensAt: 540, closesAt: 1020 },
          jueves: { opensAt: 540, closesAt: 1020 },
          viernes: { opensAt: 540, closesAt: 1020 },
          sabado: { opensAt: 540, closesAt: 840 },
        },
        adminBlocks: [],
      };
    });
  });

  it('syncs the appointment to Supabase when the project is configured', async () => {
    const date = '2026-10-05';
    const slot = getAvailableSlots('service-1', date)[0];

    const appointment = await requestAppointment({
      clientName: 'Ana García',
      clientPhone: '573001234567',
      serviceId: 'service-1',
      date,
      startsAt: slot.startsAt,
      notes: 'Quiero una cita tranquila',
      whatsappConsent: true,
    });

    expect(appointment.status).toBe('pendiente');
    expect(mocks.saveClientToSupabase).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ana García',
        phone: '+573001234567',
        whatsappConsent: true,
      }),
    );
    expect(mocks.saveServiceToSupabase).toHaveBeenCalledWith({
      id: 'service-1',
      name: 'Masaje relajante',
      durationMinutes: 60,
      isActive: true,
      isBookable: true,
    });
    expect(mocks.saveAppointmentToSupabase).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: appointment.clientId,
        serviceId: '33333333-3333-4333-8333-333333333333',
        status: 'pendiente',
        source: 'publico',
      }),
    );
  });
});
