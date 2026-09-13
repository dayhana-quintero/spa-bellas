import { z } from 'zod';

export const appointmentStatusValues = z.enum([
  'pendiente',
  'confirmada',
  'cancelada',
  'vencida',
  'completada',
  'no asistio',
  'reprogramacion solicitada',
  'reprogramada',
]);

export const appointmentStatusRecordSchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid(),
  previousStatus: appointmentStatusValues,
  newStatus: appointmentStatusValues,
  changedByAdminId: z.string().uuid(),
  changedAt: z.coerce.date(),
  note: z.string().optional(),
});

export type AppointmentStatusRecord = z.infer<typeof appointmentStatusRecordSchema>;
