'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AppointmentConfirmAction({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function confirmAppointment() {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmada' }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'No se pudo confirmar la cita.');
      router.push('/admin?status=confirmada');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo confirmar la cita.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={confirmAppointment}
        disabled={isSaving}
        className="rounded-xl bg-[#e5b7b9] px-4 py-2.5 text-[13px] font-semibold text-[#2b1e1c] shadow-sm hover:bg-[#ddb0b2] disabled:cursor-wait disabled:opacity-60"
      >
        {isSaving ? 'Confirmando...' : 'Confirmar cita'}
      </button>
      {error ? <p role="alert" className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}