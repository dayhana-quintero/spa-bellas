import { z } from 'zod';

import { createId } from '@/shared/id';
import { normalizePhone } from '../../shared/validation/phone';

const appointmentRequestSchema = z.object({
  serviceId: z.string().uuid(),
  client: z.object({
    id: z.string().uuid(),
    name: z.string().min(3),
    phone: z.string().min(10),
    notes: z.string().optional(),
  }),
  date: z.string().min(8),
  slot: z.string().regex(/^\d{2}:\d{2}$/),
  consent: z.boolean().refine((value) => value === true, {
    message: 'Se requiere el consentimiento para confirmar por WhatsApp.',
  }),
});

export type AppointmentRequestInput = z.infer<typeof appointmentRequestSchema> & {
  client: {
    id: string;
    name: string;
    phone: string;
    notes?: string;
  };
};

export type AppointmentRequest = {
  id: string;
  serviceId: string;
  client: {
    id: string;
    name: string;
    phone: string;
    notes?: string;
  };
  date: string;
  slot: string;
  status: 'pendiente';
  source: 'publico';
  consent: boolean;
  holdExpiresAt: Date;
  scheduledStart: Date;
  scheduledEnd: Date;
};

export function validateAppointmentRequest(input: AppointmentRequestInput): AppointmentRequest {
  const parsed = appointmentRequestSchema.parse({
    ...input,
    client: {
      ...input.client,
      phone: normalizePhone(input.client.phone),
    },
  });

  const scheduledStart = new Date(`${parsed.date}T${parsed.slot}:00`);
  const scheduledEnd = new Date(scheduledStart.getTime() + 60 * 60 * 1000);

  const holdExpiresAt = new Date(scheduledStart.getTime() + 30 * 60 * 1000);

  return {
    id: createId(),
    serviceId: parsed.serviceId,
    client: {
      ...parsed.client,
      phone: normalizePhone(parsed.client.phone),
    },
    date: parsed.date,
    slot: parsed.slot,
    status: 'pendiente',
    source: 'publico',
    consent: parsed.consent,
    holdExpiresAt,
    scheduledStart,
    scheduledEnd,
  };
}

export function createAppointmentRequest(input: AppointmentRequestInput): AppointmentRequest {
  return validateAppointmentRequest(input);
}
