'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

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
        className="flex items-center gap-2 rounded-xl bg-[#bf4a55] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#a83e48] disabled:cursor-wait disabled:opacity-60"
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
        className="rounded-xl border border-[#d8a0a0] bg-white px-4 py-2.5 text-sm font-semibold text-[#b3261e] hover:bg-[#fdf3f3] disabled:cursor-wait disabled:opacity-60"
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
