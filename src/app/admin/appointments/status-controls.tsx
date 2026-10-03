"use client";

import { useState } from 'react';

import { getAvailableStatusTransitions } from '../../../domain/appointments/admin-appointment-service';
import { changeAppointmentStatus } from '../../../domain/spa-service';
import {
  openWhatsAppConfirmation,
} from '../../../integrations/whatsapp/whatsapp-adapter';
import { prepareConfirmationMessage } from '../../../integrations/whatsapp/whatsapp-confirmation';
import type { Appointment } from '../../../shared/types/appointment';

export function StatusControls({
  appointmentId,
  status,
  clientName,
  phone,
  serviceName,
  scheduledStart,
}: {
  appointmentId: string;
  status: Appointment['status'];
  clientName?: string;
  phone?: string;
  serviceName?: string;
  scheduledStart?: Date;
}) {
  const transitions = getAvailableStatusTransitions(status);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleTransition = (nextStatus: Appointment['status']) => {
    try {
      changeAppointmentStatus(appointmentId, nextStatus, 'admin-1', 'Cambio realizado desde la vista administrativa');
      setStatusMessage(`Estado actualizado a ${nextStatus}.`);
      window.location.reload();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'No se pudo actualizar el estado.');
    }
  };

  const handleWhatsApp = () => {
    try {
      const prepared = prepareConfirmationMessage({
        appointmentId,
        clientName: clientName ?? 'Cliente',
        phone: phone ?? '+0000000000',
        serviceName: serviceName ?? 'servicio',
        scheduledStart: scheduledStart ?? new Date(),
        consent: Boolean(phone),
      });

      const url = openWhatsAppConfirmation(prepared.contactPhone, prepared.messageText);
      window.open(url, '_blank', 'noopener,noreferrer');
      setStatusMessage('Mensaje de WhatsApp preparado y listo para enviar.');
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'No se pudo preparar el mensaje de WhatsApp.',
      );
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="rounded-lg bg-[#0d9f5d] px-3 py-2 text-sm font-medium text-white"
        >
          Confirmar por WhatsApp
        </button>
      </div>

      <p>Acciones disponibles:</p>
      <ul>
        {transitions.map((transition) => (
          <li key={`${appointmentId}-${transition}`}>
            <button
              type="button"
              aria-label={`Cambiar estado a ${transition}`}
              onClick={() => handleTransition(transition)}
              className="mt-2 rounded-lg border border-[#d8c7c2] bg-[#f4ece9] px-3 py-2 text-sm text-[#2d2828]"
            >
              {transition}
            </button>
          </li>
        ))}
      </ul>
      {statusMessage ? <p className="mt-3 text-sm text-[#3d3b3b]">{statusMessage}</p> : null}
    </div>
  );
}
