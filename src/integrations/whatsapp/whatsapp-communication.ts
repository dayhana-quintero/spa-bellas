import {
  type WhatsAppCommunicationRecord,
  whatsappCommunicationRecordSchema,
} from '@/shared/types/whatsapp-communication';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { saveWhatsAppCommunicationToSupabase } from '@/lib/supabase-data';
import { createId, readSpaData, withSpaData } from '@/storage/spa-store';

export const communicationRecordSchema = whatsappCommunicationRecordSchema;

export function createWhatsAppCommunicationRecord(input: {
  appointmentId: string;
  messageText: string;
  outcome: WhatsAppCommunicationRecord['outcome'];
  outcomeNote?: string;
  adminId?: string;
}): WhatsAppCommunicationRecord {
  if (!input.appointmentId) {
    throw new Error('El identificador de la cita es obligatorio.');
  }

  if (!input.messageText || input.messageText.trim().length < 10) {
    throw new Error('El texto del mensaje es obligatorio para registrar la comunicacion.');
  }

  const record: WhatsAppCommunicationRecord = {
    id: createId(),
    appointmentId: input.appointmentId,
    messageText: input.messageText,
    outcome: input.outcome,
    outcomeNote: input.outcomeNote,
    adminId: input.adminId,
    createdAt: new Date(),
  };

  return withSpaData((data) => {
    data.communicationRecords.push(record);
    return communicationRecordSchema.parse(record);
  });
}

export function listCommunicationRecordsForAppointment(appointmentId: string): WhatsAppCommunicationRecord[] {
  return readSpaData().communicationRecords
    .filter((record) => record.appointmentId === appointmentId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

// Registra un evento de WhatsApp del panel en Supabase con la identidad del
// administrador en sesion; si Supabase no esta disponible, degrada al
// almacenamiento local para no perder la trazabilidad.
export async function recordAppointmentCommunicationForAdmin(input: {
  appointmentId: string;
  messageText: string;
  outcome: WhatsAppCommunicationRecord['outcome'];
  outcomeNote?: string;
  adminId: string;
}): Promise<WhatsAppCommunicationRecord> {
  const record = whatsappCommunicationRecordSchema.parse({
    id: createId(),
    appointmentId: input.appointmentId,
    messageText: input.messageText,
    outcome: input.outcome,
    outcomeNote: input.outcomeNote,
    adminId: input.adminId,
    createdAt: new Date(),
  });

  if (getSupabaseAdminClient()) {
    try {
      await saveWhatsAppCommunicationToSupabase({
        id: record.id,
        appointmentId: record.appointmentId,
        messageText: record.messageText,
        outcome: record.outcome,
        outcomeNote: record.outcomeNote,
        adminId: record.adminId,
        createdAt: record.createdAt,
      });
      return record;
    } catch (cause) {
      console.error('No se pudo guardar la comunicacion de WhatsApp en Supabase:', cause);
    }
  }

  return createWhatsAppCommunicationRecord(input);
}
