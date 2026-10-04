'use client';

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
 console.log(summary);
 
  return (
    <div
      aria-live="polite"
      role="status"
      className="mt-6 rounded-2xl bg-[#edf9ee] px-4 py-3 text-sm text-[#264b2d]"
    >
      {summary}
    </div>
  );
}
