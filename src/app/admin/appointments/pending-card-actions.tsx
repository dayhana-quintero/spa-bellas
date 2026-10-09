'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

import { openWhatsAppConfirmation } from '../../../integrations/whatsapp/whatsapp-adapter';
import { prepareConfirmationMessage } from '../../../integrations/whatsapp/whatsapp-confirmation';
import type { WhatsAppCommunicationRecord } from '../../../shared/types/whatsapp-communication';

type PendingActionProps = { appointmentId: string };

async function patchAppointmentStatus(appointmentId: string, status: string, note: string) {
  const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  const result = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(result.error ?? 'No se pudo actualizar la cita.');
  }
}

/** Confirma la cita desde la tarjeta de pendientes y refresca la lista. */
export function PendingConfirmAction({ appointmentId }: PendingActionProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSaving(true);
    setError(null);
    try {
      await patchAppointmentStatus(
        appointmentId,
        'confirmada',
        'Cita confirmada desde la lista de pendientes',
      );
      // Deja de ser pendiente: el refresco hace que la tarjeta salga sola.
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo confirmar la cita.');
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-[#e5b7b9] px-4 py-2.5 text-sm font-semibold text-[#2b1e1c] shadow-sm hover:bg-[#ddb0b2] disabled:cursor-wait disabled:opacity-60"
      >
        <Check size={15} aria-hidden="true" />
        {saving ? 'Confirmando...' : 'Confirmar cita'}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-[#b3261e]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Cancela la cita (accion terminal, con confirmacion) y refresca la lista. */
export function PendingCancelAction({ appointmentId }: PendingActionProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      '¿Cancelar esta cita? La acción no se puede deshacer.',
    );
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    try {
      await patchAppointmentStatus(
        appointmentId,
        'cancelada',
        'Cita cancelada desde la lista de pendientes',
      );
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cancelar la cita.');
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={saving}
        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#b3261e] hover:bg-[#fdf3f3] disabled:cursor-wait disabled:opacity-60"
      >
        {saving ? 'Cancelando...' : 'Cancelar'}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-[#b3261e]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type PendingWhatsAppProps = {
  appointmentId: string;
  clientName?: string;
  phone?: string;
  serviceName?: string;
  scheduledStart?: Date;
};

/**
 * Trazabilidad de WhatsApp desde la tarjeta: prepara el mensaje de
 * confirmacion (abre wa.me) y registra los eventos "prepared" y
 * "sent-by-admin" en el servidor, igual que el detalle de la cita.
 */
export function PendingWhatsAppActions({
  appointmentId,
  clientName,
  phone,
  serviceName,
  scheduledStart,
}: PendingWhatsAppProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const handlePrepare = async () => {
    setBusy(true);
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
      setMessage('Mensaje de WhatsApp preparado y listo para enviar.');
      void url;
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : 'No se pudo preparar el mensaje de WhatsApp.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleMarkSent = async () => {
    setBusy(true);
    try {
      await postCommunication(
        'Mensaje de confirmación enviado por el administrador.',
        'sent-by-admin',
        'El administrador confirmó el envío del mensaje por WhatsApp.',
      );
      setMessage('Marcado como enviado en la trazabilidad de la cita.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'No se pudo marcar como enviado.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handlePrepare}
          disabled={busy}
          className="rounded-xl bg-[#0a7d49] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#096b3f] disabled:cursor-wait disabled:opacity-60"
        >
          Confirmar por WhatsApp
        </button>
        <button
          type="button"
          onClick={handleMarkSent}
          disabled={busy}
          className="rounded-xl border border-[#0a7d49] bg-white px-4 py-2.5 text-sm font-semibold text-[#0a7d49] hover:bg-[#f0f9f4] disabled:cursor-wait disabled:opacity-60"
        >
          Marcar como enviado
        </button>
      </div>
      {message ? (
        <p role="status" className="mt-2 text-xs text-[#3f5049]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
