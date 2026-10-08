import { describe, expect, it } from 'vitest';

import { prepareRescheduleNoticeMessage } from '@/integrations/whatsapp/whatsapp-confirmation';

const BASE_INPUT = {
  appointmentId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  clientName: 'Ana García',
  // Telefono explicito en formato internacional para no depender del prefijo
  // por defecto del normalizador.
  phone: '+525512345678',
  serviceName: 'Masaje relajante',
  previousStart: new Date(2026, 9, 20, 10, 0),
  nextStart: new Date(2026, 9, 22, 16, 0),
  consent: true,
};

describe('prepareRescheduleNoticeMessage', () => {
  it('redacta el aviso con la clienta, el servicio, la fecha anterior y la nueva', () => {
    const prepared = prepareRescheduleNoticeMessage(BASE_INPUT);

    expect(prepared.messageText).toContain('Ana García');
    expect(prepared.messageText).toContain('Masaje relajante');
    // Fecha y hora nuevas en formato claro para la clienta (FR-010).
    expect(prepared.messageText).toContain('22 oct 2026');
    expect(prepared.messageText).toContain('16:00');
    // Fecha anterior para que el cambio se entienda.
    expect(prepared.messageText).toContain('20 oct 2026');
    // Redaccion de cambio, no de confirmacion.
    expect(prepared.messageText).toContain('pasa a');
    expect(prepared.messageText).not.toContain('confirmamos tu cita');

    expect(prepared.contactPhone).toBe('+525512345678');
    expect(prepared.appointmentId).toBe(BASE_INPUT.appointmentId);
    expect(prepared.outcome).toBe('prepared');
  });

  it('rechaza sin consentimiento de WhatsApp', () => {
    expect(() => prepareRescheduleNoticeMessage({ ...BASE_INPUT, consent: false })).toThrow(
      /consentimiento/i,
    );
  });

  it('rechaza un telefono invalido', () => {
    expect(() => prepareRescheduleNoticeMessage({ ...BASE_INPUT, phone: 'no-telefono' })).toThrow(
      /telefono/i,
    );
    expect(() => prepareRescheduleNoticeMessage({ ...BASE_INPUT, phone: '' })).toThrow(
      /telefono/i,
    );
  });
});
