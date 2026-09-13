import { z } from 'zod';

export const confirmationMessageOutcomeSchema = z.enum([
  'prepared',
  'sent-by-admin',
  'failed',
  'client-confirmed',
  'manually-recorded',
]);

export const confirmationMessageSchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid(),
  messageText: z.string().min(10),
  contactPhone: z.string().min(10).max(20),
  preparedAt: z.coerce.date(),
  outcome: confirmationMessageOutcomeSchema,
  outcomeNote: z.string().optional(),
});

export type ConfirmationMessage = z.infer<typeof confirmationMessageSchema>;
