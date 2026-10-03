import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createWhatsAppCommunicationRecord,
  listCommunicationRecordsForAppointment,
} from '../../../src/integrations/whatsapp/whatsapp-communication';

describe('whatsapp communication records', () => {
  beforeEach(() => {
    const store = new Map<string, string>();

    vi.stubGlobal('window', {
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
    });
  });

  it('stores a whatsapp result for an appointment and allows reading the audit trail', () => {
    const event = createWhatsAppCommunicationRecord({
      appointmentId: '123e4567-e89b-12d3-a456-426614174100',
      messageText: 'Hola Ana, confirmamos tu cita.',
      outcome: 'sent-by-admin',
      outcomeNote: 'Mensaje enviado por WhatsApp.',
      adminId: '00000000-0000-4000-8000-000000000001',
    });

    expect(event.outcome).toBe('sent-by-admin');
    expect(event.appointmentId).toBe('123e4567-e89b-12d3-a456-426614174100');

    const history = listCommunicationRecordsForAppointment('123e4567-e89b-12d3-a456-426614174100');
    expect(history).toHaveLength(1);
    expect(history[0]?.messageText).toContain('Hola Ana');
  });
});
