import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(() => true),
  saveClientToSupabase: vi.fn(async () => ({ id: 'client-1' })),
  saveServiceToSupabase: vi.fn(async () => ({ id: '33333333-3333-4333-8333-333333333333' })),
  saveAppointmentToSupabase: vi.fn(async () => ({ id: 'appointment-1' })),
  getServiceFromSupabase: vi.fn(async () => ({
    id: 'service-1',
    category: 'tratamientos',
    name: 'Masaje relajante',
    description: 'Masaje relajante',
    estimatedDuration: 60,
    isActive: true,
    isBookable: true,
  })),
  getAvailabilitySettingsFromSupabase: vi.fn(async () => ({
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
  })),
}));

vi.mock('../../../src/lib/supabase', () => ({
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

vi.mock('../../../src/lib/supabase-data', () => ({
  findClientByPhoneFromSupabase: vi.fn(async () => null),
  getAvailabilitySettingsFromSupabase: mocks.getAvailabilitySettingsFromSupabase,
  getServiceFromSupabase: mocks.getServiceFromSupabase,
  listAppointmentStatusHistoryFromSupabase: vi.fn(async () => []),
  listAppointmentsFromSupabase: vi.fn(async () => []),
  listServicesFromSupabase: vi.fn(async () => []),
  listSuppliesFromSupabase: vi.fn(async () => []),
  listWhatsAppCommunicationsFromSupabase: vi.fn(async () => []),
  recordSupplyMovementToSupabase: vi.fn(async () => ({ id: 'movement-1' })),
  saveAppointmentToSupabase: mocks.saveAppointmentToSupabase,
  saveClientToSupabase: mocks.saveClientToSupabase,
  saveServiceToSupabase: mocks.saveServiceToSupabase,
  saveSupplyToSupabase: vi.fn(async () => ({ id: 'supply-1' })),
  updateAppointmentStatusInSupabase: vi.fn(async () => ({ status: 'confirmada', updatedAt: new Date() })),
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
    const slots = await getAvailableSlots('service-1', date);
    const slot = slots[0];
    expect(slot).toBeDefined();

    const appointment = await requestAppointment({
      clientName: 'Ana García',
      clientPhone: '573001234567',
      serviceId: 'service-1',
      date,
      startsAt: slot!.startsAt,
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
    expect(mocks.saveServiceToSupabase).not.toHaveBeenCalled();
    expect(mocks.saveAppointmentToSupabase).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: appointment.clientId,
        serviceId: 'service-1',
        status: 'pendiente',
        source: 'publico',
      }),
    );
  });
});
