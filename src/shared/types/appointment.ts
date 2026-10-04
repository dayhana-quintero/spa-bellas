import { z } from 'zod';

export const appointmentStatusSchema = z.enum([
  'pendiente',
  'confirmada',
  'cancelada',
  'vencida',
  'completada',
  'no asistio',
  'reprogramacion solicitada',
  'reprogramada',
]);

export const appointmentSourceSchema = z.enum(['publico', 'admin']);

export const appointmentSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  serviceId: z.string().trim().min(1),
  scheduledStart: z.coerce.date(),
  scheduledEnd: z.coerce.date(),
  status: appointmentStatusSchema,
  notes: z.string().optional(),
  source: appointmentSourceSchema,
  holdExpiresAt: z.coerce.date().optional(),
  previousAppointmentId: z.string().uuid().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Appointment = z.infer<typeof appointmentSchema>;