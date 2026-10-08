"use client";

import { useState } from 'react';

import { getAvailableStatusTransitions } from '../../../domain/appointments/admin-appointment-service';
import { RESCHEDULABLE_STATUSES } from '../../../domain/appointments/appointment-state-machine';
import type { WhatsAppCommunicationRecord } from '../../../shared/types/whatsapp-communication';
import {
  openWhatsAppConfirmation,
} from '../../../integrations/whatsapp/whatsapp-adapter';
import { prepareConfirmationMessage } from '../../../integrations/whatsapp/whatsapp-confirmation';
import type { Appointment } from '../../../shared/types/appointment';
import type { Service } from '../../../shared/types/service';
import { ReschedulePanel } from './reschedule-panel';

export function StatusControls({
  appointmentId,
  status,
  clientName,
  phone,
  serviceName,
  scheduledStart,
  serviceId,
  service,
}: {
  appointmentId: string;
  status: Appointment['status'];
  clientName?: string;
  phone?: string;
  serviceName?: string;
  scheduledStart?: Date;
  serviceId?: string;
  service?: Service;
}) {
  const transitions = getAvailableStatusTransitions(status);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [manualResult, setManualResult] = useState<Appointment['status'] | 'sin respuesta'>('sin respuesta');
  const [manualNote, setManualNote] = useState('');
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const canReschedule = RESCHEDULABLE_STATUSES.includes(status);

  const patchStatus = async (nextStatus: Appointment['status'], note: string) => {
    const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, note }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(result.error ?? 'No se pudo actualizar el estado.');
    }
  };

  const handleTransition = async (nextStatus: Appointment['status']) => {
    try {
      await patchStatus(nextStatus, 'Cambio realizado desde la vista administrativa');
      setStatusMessage(`Estado actualizado a ${nextStatus}.`);
      window.location.reload();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'No se pudo actualizar el estado.');
    }
  };

  // Persiste el evento en el servidor para que quede en la trazabilidad real
  // (Supabase) atribuido al administrador en sesion.
  const postCommunication = async (
    messageText: string,
    outcome: WhatsAppCommunicationRecord['outcome'],
    outcomeNote: string,
  ) => {
    const response = await fetch(`/api/admin/appointments/${appointmentId}/communications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageText, outcome, outcomeNote }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(result.error ?? 'No se pudo registrar la comunicacion de WhatsApp.');
    }
  };

  const handleWhatsApp = async () => {
    try {
      const prepared = prepareConfirmationMessage({
        appointmentId,
        clientName: clientName ?? 'Cliente',
        phone: phone ?? '+0000000000',
        serviceName: serviceName ?? 'servicio',
        scheduledStart: scheduledStart ?? new Date(),
        consent: Boolean(phone),
      });

      // Se abre primero la pestana de WhatsApp (si no, el navegador la bloquea)
      // y enseguida se registra el evento en el servidor.
      const url = openWhatsAppConfirmation(prepared.contactPhone, prepared.messageText);
      await postCommunication(
        prepared.messageText,
        'prepared',
        'Mensaje preparado y abierto para envio por WhatsApp.',
      );
      setStatusMessage('Mensaje de WhatsApp preparado y listo para enviar.');
      setManualFormOpen(false);
      void url;
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'No se pudo preparar el mensaje de WhatsApp.',
      );
    }
  };

  const handleMarkSent = async () => {
    try {
      await postCommunication(
        'Mensaje de confirmación enviado por el administrador.',
        'sent-by-admin',
        'El administrador confirmó el envío del mensaje por WhatsApp.',
      );
      setStatusMessage('Marcado como enviado en la trazabilidad de la cita.');
      window.location.reload();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'No se pudo marcar como enviado.',
      );
    }
  };

  const handleManualResult = async () => {
    try {
      if (!manualNote.trim()) {
        throw new Error('Escribe una nota para registrar el resultado manual.');
      }

      const resultText = manualResult === 'sin respuesta'
        ? 'Sin respuesta del cliente.'
        : `Resultado manual: ${manualResult}.`;

      if (manualResult !== 'sin respuesta') {
        await patchStatus(manualResult, manualNote.trim());
      }

      await postCommunication(
        resultText,
        'manually-recorded',
        `${resultText} ${manualNote.trim()}`,
      );

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
          className="rounded-lg bg-[#0a7d49] px-3 py-2 text-sm font-medium text-white"
        >
          Confirmar por WhatsApp
        </button>
        <button
          type="button"
          onClick={handleMarkSent}
          className="rounded-lg border border-[#0a7d49] bg-white px-3 py-2 text-sm font-medium text-[#0a7d49]"
        >
          Marcar como enviado
        </button>
        <button
          type="button"
          onClick={() => setManualFormOpen((value) => !value)}
          className="rounded-lg border border-[#d8c7c2] bg-[#f4ece9] px-3 py-2 text-sm text-[#2d2828]"
        >
          Registrar resultado manual
        </button>
        {canReschedule && serviceId ? (
          <button
            type="button"
            aria-expanded={rescheduleOpen}
            onClick={() => setRescheduleOpen((value) => !value)}
            className="rounded-lg border border-[#d8c7c2] bg-[#f4ece9] px-3 py-2 text-sm text-[#2d2828]"
          >
            Reprogramar
          </button>
        ) : null}
      </div>

      {rescheduleOpen && serviceId && scheduledStart ? (
        <ReschedulePanel
          appointmentId={appointmentId}
          serviceId={serviceId}
          service={service}
          currentStart={scheduledStart}
          expectedStatus={status}
          onClose={() => setRescheduleOpen(false)}
        />
      ) : null}

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
