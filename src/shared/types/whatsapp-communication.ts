import { z } from 'zod';

export const whatsappCommunicationRecordSchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid(),
  messageText: z.string().min(10),
  outcome: z.enum(['prepared', 'sent-by-admin', 'failed', 'client-confirmed', 'manually-recorded']),
  outcomeNote: z.string().optional(),
  adminId: z.string().uuid().optional(),
  createdAt: z.coerce.date(),
});

export type WhatsAppCommunicationRecord = z.infer<typeof whatsappCommunicationRecordSchema>;
