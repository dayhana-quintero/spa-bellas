"use client";

import Link from 'next/link';

import { listPendingAppointments } from '../../../domain/appointments/admin-appointment-service';
import type { Appointment } from '../../../shared/types/appointment';

export function PendingAppointmentsPage({ appointments }: { appointments: Appointment[] }) {
  const pending = listPendingAppointments(appointments);

  if (pending.length === 0) {
    return <p>No hay citas pendientes.</p>;
  }

  return (
    <section className="rounded-2xl border border-[#e7d8d3] bg-white p-6 shadow-sm">
      <h2 className="font-serif text-3xl text-[#d56572]">Citas pendientes</h2>
      <ul className="mt-5 space-y-4">
        {pending.map((appointment) => (
          <li key={appointment.id} className="rounded-2xl bg-[#f8efee] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-[#2b2b2b]">{appointment.id.slice(0, 8)}</p>
              <span className="rounded-full bg-[#f8e1e3] px-2.5 py-1 text-xs font-semibold text-[#8a4955]">
                {appointment.status}
              </span>
            </div>

            <p className="mt-2 text-sm text-[#4a4342]">
              {new Date(appointment.scheduledStart).toLocaleString('es-ES', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>

            <div className="mt-4 flex gap-3">
              <Link
                href={`/admin/appointments/${appointment.id}`}
                className="rounded-xl bg-[#1f1f21] px-3 py-2 text-sm text-white"
              >
                Ver detalle
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
