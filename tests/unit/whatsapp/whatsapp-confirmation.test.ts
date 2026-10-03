import { describe, expect, it } from 'vitest';

import {
  BrowserWhatsAppChannel,
  createWhatsAppAdapter,
} from '../../../src/integrations/whatsapp/whatsapp-adapter';
import {
  buildWhatsAppUrl,
  prepareConfirmationMessage,
  recordManualConfirmationOutcome,
} from '../../../src/integrations/whatsapp/whatsapp-confirmation';

describe('whatsapp confirmation', () => {
  it('prepares a confirmation message with the appointment details and a valid whatsapp link', () => {
    const prepared = prepareConfirmationMessage({
      appointmentId: '123e4567-e89b-12d3-a456-426614174100',
      clientName: 'María López',
      phone: '+34 600 123 456',
      serviceName: 'Masaje relajante',
      scheduledStart: new Date('2026-09-24T10:30:00Z'),
      consent: true,
    });

    expect(prepared.messageText).toContain('María López');
    expect(prepared.messageText).toContain('Masaje relajante');
    expect(prepared.contactPhone).toBe('+34600123456');
    expect(buildWhatsAppUrl(prepared.contactPhone, prepared.messageText)).toContain('wa.me');
  });

  it('rejects invalid phone numbers or missing consent for confirmation', () => {
    expect(() =>
      prepareConfirmationMessage({
        appointmentId: '123e4567-e89b-12d3-a456-426614174100',
        clientName: 'María López',
        phone: '123',
        serviceName: 'Masaje relajante',
        scheduledStart: new Date('2026-09-24T10:30:00Z'),
        consent: true,
      }),
    ).toThrow(/telefono|phone/i);

    expect(() =>
      prepareConfirmationMessage({
        appointmentId: '123e4567-e89b-12d3-a456-426614174100',
        clientName: 'María López',
        phone: '+34600123456',
        serviceName: 'Masaje relajante',
        scheduledStart: new Date('2026-09-24T10:30:00Z'),
        consent: false,
      }),
    ).toThrow(/consent|consentimiento/i);
  });

  it('records a manual confirmation result when WhatsApp cannot be sent automatically', () => {
    const result = recordManualConfirmationOutcome({
      appointmentId: '123e4567-e89b-12d3-a456-426614174100',
      outcomeNote: 'Cliente contactado por teléfono y confirmó manualmente.',
    });

    expect(result.outcome).toBe('manually-recorded');
    expect(result.outcomeNote).toContain('manualmente');
  });

  it('opens a secure browser channel with the generated WhatsApp URL', () => {
    const opened: string[] = [];

    Object.defineProperty(globalThis, 'window', {
      value: {
        open: (url: string) => {
          opened.push(url);
          return {} as Window;
        },
      },
      configurable: true,
    });

    const channel = createWhatsAppAdapter(new BrowserWhatsAppChannel());
    const url = channel.openConfirmation('+34600123456', 'Hola María, confirmamos tu cita.');

    expect(url).toContain('wa.me');
    expect(opened).toHaveLength(1);
  });
});
