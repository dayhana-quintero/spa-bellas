import { beforeEach, describe, expect, it } from 'vitest';

import { getAppointmentDetails } from '../../../src/domain/spa-service';
import { createWhatsAppCommunicationRecord } from '../../../src/integrations/whatsapp/whatsapp-communication';
import { readSpaData, withSpaData } from '../../../src/storage/spa-store';

describe('appointment whatsapp history', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: {
          getItem: (key: string) => store.get(key) ?? null,
          setItem: (key: string, value: string) => {
            store.set(key, value);
          },
          removeItem: (key: string) => {
            store.delete(key);
          },
          clear: () => store.clear(),
        },
      },
      configurable: true,
    });
  });

  it('keeps whatsapp communication records attached to the appointment detail', () => {
    const base = readSpaData();
    const serviceId = '11111111-1111-4111-8111-111111111111';
    const clientId = '22222222-2222-4222-8222-222222222222';
    const appointmentId = '33333333-3333-4333-8333-333333333333';

    const appointment = withSpaData((data) => {
      data.services = [{
        id: serviceId,
        category: 'unas',
        name: 'Manicura clásica',
        description: 'Servicio de prueba',
        estimatedDuration: 60,
        isActive: true,
        isBookable: true,
      }];
      data.clients = [{
        id: clientId,
        name: 'Ana García',
        phone: '+34600123456',
        whatsappConsent: true,
        createdAt: new Date('2026-10-01T10:00:00.000Z'),
      }];
      data.appointments = [{
        id: appointmentId,
        clientId,
        serviceId,
        scheduledStart: new Date('2026-10-15T10:00:00.000Z'),
        scheduledEnd: new Date('2026-10-15T11:00:00.000Z'),
        status: 'pendiente',
        notes: 'Necesita confirmación.',
        source: 'publico',
        holdExpiresAt: new Date('2026-10-15T10:30:00.000Z'),
        createdAt: new Date('2026-10-10T12:00:00.000Z'),
        updatedAt: new Date('2026-10-10T12:00:00.000Z'),
      }];
      return data.appointments[0];
    });

    createWhatsAppCommunicationRecord({
      appointmentId: appointment.id,
      messageText: 'Hola Ana, confirmamos tu cita del día 15.',
      outcome: 'sent-by-admin',
      outcomeNote: 'Enviado por el administrador.',
      adminId: '00000000-0000-4000-8000-000000000001',
    });

    const detail = getAppointmentDetails(appointment.id);
    expect(detail?.communicationRecords).toHaveLength(1);
    expect(detail?.communicationRecords[0]?.outcome).toBe('sent-by-admin');
  });
});
