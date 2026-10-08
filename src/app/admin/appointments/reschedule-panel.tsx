'use client';

import { useState } from 'react';

import AppointmentSlotPicker from '../../public/appointments/slot-picker';
import type { Appointment } from '../../../shared/types/appointment';
import type { Service } from '../../../shared/types/service';

type ReschedulePanelProps = {
  appointmentId: string;
  serviceId: string;
  service?: Service;
  currentStart: Date;
  expectedStatus: Appointment['status'];
  onClose: () => void;
};

function toDateInput(value: Date): string {
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

export function ReschedulePanel({
  appointmentId,
  serviceId,
  service,
  currentStart,
  expectedStatus,
  onClose,
}: ReschedulePanelProps) {
  const [date, setDate] = useState(() => toDateInput(currentStart));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const handleConfirm = async () => {
    if (!selectedSlot) {
      setMessage({ tone: 'error', text: 'Elige un horario para reprogramar la cita.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          slot: selectedSlot,
          expectedScheduledStart: currentStart.toISOString(),
          expectedStatus,
          note: note.trim() || undefined,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        appointment?: { scheduledStart: string };
      };

      if (!response.ok || !result.appointment) {
        throw new Error(result.error ?? 'No se pudo reprogramar la cita.');
      }

      const formatted = new Date(result.appointment.scheduledStart).toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      setMessage({ tone: 'success', text: `Cita reprogramada para el ${formatted}.` });
      // Deja leer el aviso y luego recarga el detalle con la fecha nueva.
      window.setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudo reprogramar la cita.',
      });
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Reprogramar cita"
      className="mt-4 rounded-2xl border border-[#e7d8d3] bg-[#f9f4f2] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-2xl text-[#d56572]">Reprogramar cita</h3>
        <p className="text-sm text-[#5a4541]">
          <strong>Actual:</strong>{' '}
          {currentStart.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4">
        <AppointmentSlotPicker
          service={service}
          serviceId={serviceId}
          date={date}
          selectedSlot={selectedSlot}
          onDateChange={setDate}
          onSlotChange={setSelectedSlot}
          slotsEndpoint={`/api/admin/slots?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}&appointmentId=${encodeURIComponent(appointmentId)}`}
        />
      </div>

      <label className="mt-4 block text-sm font-medium text-[#2f2b2b]">
        Nota (opcional)
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-[#d7c6c2] bg-white px-3 py-2.5 text-[#1f1b1b] outline-none transition focus:border-[#d56572]"
          placeholder="Motivo del cambio de horario."
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="rounded-lg bg-[#1f1f21] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Confirmando...' : 'Confirmar reprogramacion'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-lg border border-[#d8c7c2] bg-white px-4 py-2 text-sm text-[#2d2828]"
        >
          Cancelar
        </button>
      </div>

      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={`mt-3 text-sm ${message.tone === 'success' ? 'text-[#0a7d49]' : 'text-[#b3261e]'}`}
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
