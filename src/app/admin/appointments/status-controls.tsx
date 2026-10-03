"use client";

import { useState } from 'react';

import { getAvailableStatusTransitions } from '../../../domain/appointments/admin-appointment-service';
import { changeAppointmentStatus } from '../../../domain/spa-service';
import { createWhatsAppCommunicationRecord } from '../../../integrations/whatsapp/whatsapp-communication';
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
  const [manualResult, setManualResult] = useState<Appointment['status'] | 'sin respuesta'>('sin respuesta');
  const [manualNote, setManualNote] = useState('');
  const [manualFormOpen, setManualFormOpen] = useState(false);

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
      createWhatsAppCommunicationRecord({
        appointmentId,
        messageText: prepared.messageText,
        outcome: 'sent-by-admin',
        outcomeNote: 'Mensaje preparado y abierto para envío por WhatsApp.',
        adminId: 'admin-1',
      });
      setStatusMessage('Mensaje de WhatsApp preparado y listo para enviar.');
      setManualFormOpen(false);
      void url;
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'No se pudo preparar el mensaje de WhatsApp.',
      );
    }
  };

  const handleManualResult = () => {
    try {
      if (!manualNote.trim()) {
        throw new Error('Escribe una nota para registrar el resultado manual.');
      }

      const resultText = manualResult === 'sin respuesta'
        ? 'Sin respuesta del cliente.'
        : `Resultado manual: ${manualResult}.`;

      createWhatsAppCommunicationRecord({
        appointmentId,
        messageText: resultText,
        outcome: 'manually-recorded',
        outcomeNote: `${resultText} ${manualNote.trim()}`,
        adminId: 'admin-1',
      });

      if (manualResult !== 'sin respuesta') {
        changeAppointmentStatus(appointmentId, manualResult, 'admin-1', manualNote.trim());
      }

      setManualFormOpen(false);
      setManualNote('');
      setStatusMessage('Resultado manual registrado en la trazabilidad de la cita.');
      window.location.reload();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'No se pudo registrar el resultado manual.');
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
        <button
          type="button"
          onClick={() => setManualFormOpen((value) => !value)}
          className="rounded-lg border border-[#d8c7c2] bg-[#f4ece9] px-3 py-2 text-sm text-[#2d2828]"
        >
          Registrar resultado manual
        </button>
      </div>

      {manualFormOpen ? (
        <div className="mb-4 space-y-3 rounded-2xl border border-[#e7d8d3] bg-[#f9f4f2] p-4">
          <label className="block text-sm font-medium text-[#2d2828]">
            Resultado manual
            <select
              value={manualResult}
              onChange={(event) => setManualResult(event.target.value as Appointment['status'] | 'sin respuesta')}
              className="mt-1 w-full rounded-lg border border-[#d8c7c2] bg-white px-3 py-2 text-sm"
            >
              <option value="sin respuesta">Sin respuesta</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="reprogramacion solicitada">Reprogramación solicitada</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-[#2d2828]">
            Nota
            <textarea
              value={manualNote}
              onChange={(event) => setManualNote(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[#d8c7c2] bg-white px-3 py-2 text-sm"
              placeholder="Describe la respuesta, reprogramación o motivo de la ausencia."
            />
          </label>
          <button
            type="button"
            onClick={handleManualResult}
            className="rounded-lg bg-[#1f1f21] px-3 py-2 text-sm font-medium text-white"
          >
            Guardar resultado
          </button>
        </div>
      ) : null}

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
