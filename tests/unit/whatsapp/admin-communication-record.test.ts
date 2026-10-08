import { describe, expect, it } from 'vitest';

import {
  listCommunicationRecordsForAppointment,
  recordAppointmentCommunicationForAdmin,
} from '../../../src/integrations/whatsapp/whatsapp-communication';

const APPOINTMENT_ID = '123e4567-e89b-12d3-a456-426614174100';
const ADMIN_ID = '00000000-0000-4000-8000-000000000009';

describe('recordAppointmentCommunicationForAdmin', () => {
  it('registra el evento con la identidad del administrador en sesion', async () => {
    const record = await recordAppointmentCommunicationForAdmin({
      appointmentId: APPOINTMENT_ID,
      messageText: 'Mensaje preparado y abierto para envio por WhatsApp.',
      outcome: 'sent-by-admin',
      outcomeNote: 'Listo para enviar.',
      adminId: ADMIN_ID,
    });

    expect(record.adminId).toBe(ADMIN_ID);
    expect(record.outcome).toBe('sent-by-admin');

    const trail = listCommunicationRecordsForAppointment(APPOINTMENT_ID);
    expect(trail).toHaveLength(1);
    expect(trail[0]?.adminId).toBe(ADMIN_ID);
    expect(trail[0]?.messageText).toContain('Mensaje preparado');
  });

  it('queda en la trazabilidad el resultado manual con su nota', async () => {
    await recordAppointmentCommunicationForAdmin({
      appointmentId: APPOINTMENT_ID,
      messageText: 'Resultado manual: confirmada.',
      outcome: 'manually-recorded',
      outcomeNote: 'Resultado manual: confirmada. Confirmo por llamada.',
      adminId: ADMIN_ID,
    });

    const trail = listCommunicationRecordsForAppointment(APPOINTMENT_ID);
    const manual = trail.find((record) => record.outcome === 'manually-recorded');

    expect(manual?.outcomeNote).toContain('Confirmo por llamada');
    expect(manual?.adminId).toBe(ADMIN_ID);
  });

  it('valida el texto del mensaje antes de persistirlo', async () => {
    await expect(
      recordAppointmentCommunicationForAdmin({
        appointmentId: APPOINTMENT_ID,
        messageText: 'corto',
        outcome: 'sent-by-admin',
        adminId: ADMIN_ID,
      }),
    ).rejects.toThrow();
  });

  it('rechaza un resultado fuera del dominio de comunicaciones', async () => {
    await expect(
      recordAppointmentCommunicationForAdmin({
        appointmentId: APPOINTMENT_ID,
        messageText: 'Mensaje de prueba suficientemente largo.',
        outcome: 'resultado-inventado' as 'sent-by-admin',
        adminId: ADMIN_ID,
      }),
    ).rejects.toThrow();
  });

  it('exige la identidad del administrador', async () => {
    await expect(
      recordAppointmentCommunicationForAdmin({
        appointmentId: APPOINTMENT_ID,
        messageText: 'Mensaje de prueba suficientemente largo.',
        outcome: 'sent-by-admin',
        adminId: '',
      }),
    ).rejects.toThrow();
  });
});
