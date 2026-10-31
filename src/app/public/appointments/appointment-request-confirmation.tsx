'use client';

import { CheckCircle2 } from 'lucide-react';

import type { AppointmentRequest } from '@/domain/appointments/create-appointment-request';

export function buildPendingAppointmentSummary({
  name,
  date,
  slot,
}: {
  name: string;
  date: string;
  slot: string;
}): string {
  return `Solicitud pendiente para ${name} el ${date} a las ${slot}.`;
}

type AppointmentRequestConfirmationProps = {
  request: AppointmentRequest;
};

export default function AppointmentRequestConfirmation({
  request,
}: AppointmentRequestConfirmationProps) {
  const summary = buildPendingAppointmentSummary({
    name: request.client.name,
    date: request.date,
    slot: request.slot,
  });

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-success/40 bg-success-soft">
      <div className="flex items-start gap-3 px-4 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success text-white">
          <CheckCircle2 size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-success-text">¡Solicitud enviada correctamente!</p>
          <div role="status" aria-live="polite" className="mt-1 text-sm text-success-text">
            {summary}
          </div>
          <p className="mt-1.5 text-xs leading-5 text-success-text/80">
            Quedó registrada como pendiente. Te confirmamos el horario por WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
