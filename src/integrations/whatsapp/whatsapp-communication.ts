import {
  type WhatsAppCommunicationRecord,
  whatsappCommunicationRecordSchema,
} from '@/shared/types/whatsapp-communication';
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
