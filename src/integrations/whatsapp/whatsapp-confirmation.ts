import { createId } from '@/shared/id';
import { confirmationMessageSchema } from '../../shared/types/confirmation-message';
import { normalizePhone } from '../../shared/validation/phone';

export type PrepareConfirmationInput = {
  appointmentId: string;
  clientName: string;
  phone: string;
  serviceName: string;
  scheduledStart: Date;
  consent: boolean;
};

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizePhone(phone).replace(/\D/g, '');

  if (!digits || digits.length < 8) {
    throw new Error('El teléfono de WhatsApp no es válido.');
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function prepareConfirmationMessage(input: PrepareConfirmationInput) {
  if (!input.consent) {
    throw new Error('Se requiere el consentimiento del cliente para confirmar por WhatsApp.');
  }

  const contactPhone = normalizePhone(input.phone);

  if (!contactPhone || contactPhone.length < 10) {
    throw new Error('El telefono del cliente no es valido para confirmar por WhatsApp.');
  }

  const scheduledText = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(input.scheduledStart);

  const messageText = `Hola ${input.clientName}, confirmamos tu cita de ${input.serviceName} para el ${scheduledText}. Responde este mensaje para confirmar tu asistencia.`;

  return confirmationMessageSchema.parse({
    id: createId(),
    appointmentId: input.appointmentId,
    messageText,
    contactPhone,
    preparedAt: new Date(),
    outcome: 'prepared',
    outcomeNote: 'Listo para enviar',
  });
}

export function recordManualConfirmationOutcome({
  appointmentId,
  outcomeNote,
}: {
  appointmentId: string;
  outcomeNote: string;
}) {
  if (!appointmentId) {
    throw new Error('El identificador de la cita es obligatorio.');
  }

  if (!outcomeNote || outcomeNote.trim().length < 5) {
    throw new Error('La nota de confirmación manual no puede estar vacía.');
  }

  return confirmationMessageSchema.parse({
    id: createId(),
    appointmentId,
    messageText: 'Confirmación registrada manualmente por el administrador.',
    contactPhone: '+0000000000',
    preparedAt: new Date(),
    outcome: 'manually-recorded',
    outcomeNote,
  });
}
