import { normalizePhone } from '@/shared/validation/phone';

import { createClient, findClientByPhone } from '@/storage/clients/in-memory-client-repository';
import {
  createAppointment,
  hasConflictingAppointment,
} from '@/storage/appointments/in-memory-appointment-repository';
import { findServiceById } from '@/storage/services/in-memory-service-repository';
import type { Appointment } from '@/shared/types/appointment';
import { z } from 'zod';
import { formatZodErrors } from '@/shared/validation/formatZodErrors';

const DEFAULT_HOLD_DURATION_MINUTES = 15;
const MINUTE_IN_MS = 60 * 1000;

const createAppointmentRequestInputSchema = z.object({
  clientName: z.string().min(3),
  clientPhoneRaw: z.string(),
  whatsappConsent: z.boolean(),
  serviceId: z.string().trim().min(1),
  scheduledStart: z.coerce.date(),
  notes: z.string().optional(),
});

export type CreateAppointmentRequestInput = z.input<typeof createAppointmentRequestInputSchema>;

export type CreateAppointmentRequestResult =
  | { success: true; appointment: Appointment }
  | { success: false; errors: Record<string, string> };

export function createAppointmentRequest(
  rawInput: CreateAppointmentRequestInput,
): CreateAppointmentRequestResult {
  const parsedInput = createAppointmentRequestInputSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    return { success: false, errors: formatZodErrors(parsedInput.error) };
  }

  const input = parsedInput.data;

  if (!input.whatsappConsent) {
    return {
      success: false,
      errors: { whatsappConsent: 'Debes aceptar el contacto por WhatsApp para continuar' },
    };
  }

  // Edge case del spec: no se puede agendar un servicio inactivo o no agendable.
  const service = findServiceById(input.serviceId);
  if (!service || !service.isActive || !service.isBookable) {
    return {
      success: false,
      errors: { serviceId: 'Este servicio no esta disponible para agendar' },
    };
  }

  // El servicio debe tener duracion definida para poder calcular el fin de la cita.
  if (!service.estimatedDuration) {
    return {
      success: false,
      errors: { serviceId: 'Este servicio aun no tiene duracion configurada' },
    };
  }

  // scheduledEnd SIEMPRE se deriva de la duracion real del servicio,
  // nunca se confia en un valor externo.
  const scheduledEnd = new Date(
    input.scheduledStart.getTime() + service.estimatedDuration * MINUTE_IN_MS,
  );

  if (hasConflictingAppointment(input.serviceId, input.scheduledStart, scheduledEnd)) {
    return {
      success: false,
      errors: { scheduledStart: 'Ese horario ya no esta disponible, elige otro' },
    };
  }

  const cleanPhone = normalizePhone(input.clientPhoneRaw);

  let client = findClientByPhone(cleanPhone);
  if (!client) {
    client = createClient({
      name: input.clientName,
      phone: cleanPhone,
      whatsappConsent: input.whatsappConsent,
      notes: undefined,
    });
  }

  const holdExpiresAt = new Date(Date.now() + DEFAULT_HOLD_DURATION_MINUTES * MINUTE_IN_MS);

  const appointment = createAppointment({
    clientId: client.id,
    serviceId: input.serviceId,
    scheduledStart: input.scheduledStart,
    scheduledEnd,
    status: 'pendiente',
    notes: input.notes,
    source: 'publico',
    holdExpiresAt,
    previousAppointmentId: undefined,
  });

  return { success: true, appointment };
}