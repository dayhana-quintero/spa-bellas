"use client";

import Link from 'next/link';
import { Calendar, CalendarDays, Clock, Phone, Sparkles } from 'lucide-react';

import { listPendingAppointments } from '../../../domain/appointments/admin-appointment-service';
import type { Appointment } from '../../../shared/types/appointment';
import { PendingCancelAction, PendingConfirmAction, PendingWhatsAppActions } from './pending-card-actions';

/** "vie 7 ago 2026" sin comas. */
function formatDayLabel(value: Date): string {
  return value
    .toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .replace(/,/g, '');
}

/** "10:30" + "AM/PM" para la hora grande y la fila de datos. */
function splitTime(value: Date): { time: string; period: string } {
  const hours = value.getHours();
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return { time: `${hours % 12 || 12}:${minutes}`, period: hours >= 12 ? 'PM' : 'AM' };
}

/** "300 555 0142": agrupa celular colombiano/mexicano y respeta otros formatos. */
function formatPhone(phone?: string): string {
  const digits = (phone ?? '').replace(/\D/g, '');
  const hasCountryCode = digits.length === 12 && (digits.startsWith('57') || digits.startsWith('52'));
  const local = hasCountryCode ? digits.slice(2) : digits;
  if (local.length === 10) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone?.trim() || 'Sin teléfono';
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function PendingAppointmentsPage({ appointments }: { appointments: Appointment[] }) {
  const pending = listPendingAppointments(appointments);

  if (pending.length === 0) {
    return <p>No hay citas pendientes.</p>;
  }

  return (
    <section className="rounded-2xl border border-[#e7d8d3] bg-white p-6 shadow-sm">
      <h2 className="font-serif text-3xl text-[#d56572]">Citas pendientes</h2>
      <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {pending.map((appointment) => {
          const enriched = appointment as Appointment & {
            client?: { name?: string; phone?: string } | null;
            service?: { name?: string } | null;
          };
          const start = new Date(appointment.scheduledStart);
          const { time, period } = splitTime(start);
          const dayLabel = formatDayLabel(start);

          return (
            <li
              key={appointment.id}
              className="rounded-2xl border border-[#efe4dd] bg-white p-5 shadow-sm"
            >
              <div className="flex gap-4">
                {/* Hora destacada */}
                <div className="flex w-24 shrink-0 flex-col items-center border-r border-[#efe4dd] pr-4">
                  <p className="font-serif text-[40px] leading-none text-[#1f1b1b]">{time}</p>
                  <p className="mt-1 text-sm font-bold text-[#bf4a55]">{period}</p>
                  <p className="mt-3 text-center text-xs leading-4 text-[#7d6966]">{dayLabel}</p>
                </div>

                {/* Datos de la cita */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/appointments/${appointment.id}`}
                      className="text-xl font-semibold text-[#1f1b1b] underline-offset-4 hover:underline"
                    >
                      {enriched.client?.name ?? 'Cliente sin nombre'}
                    </Link>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#f5eddc] px-3 py-1 text-xs font-semibold text-[#7a6444]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#b08d4f]" aria-hidden="true" />
                      {capitalize(appointment.status)}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2 text-sm text-[#4a4342]">
                    <li className="flex items-center gap-2">
                      <Calendar size={15} className="shrink-0 text-[#d56572]" aria-hidden="true" />
                      <span>
                        <span className="font-semibold">Fecha:</span> {dayLabel}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock size={15} className="shrink-0 text-[#d56572]" aria-hidden="true" />
                      <span>
                        <span className="font-semibold">Hora:</span> {time} {period}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles size={15} className="shrink-0 text-[#d56572]" aria-hidden="true" />
                      <span>
                        <span className="font-semibold">Servicio:</span>{' '}
                        {enriched.service?.name ?? 'Servicio'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone size={15} className="shrink-0 text-[#d56572]" aria-hidden="true" />
                      <span>
                        <span className="font-semibold">Teléfono:</span>{' '}
                        {formatPhone(enriched.client?.phone)}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#efe4dd] pt-4">
                <PendingConfirmAction appointmentId={appointment.id} />
                <Link
                  href={`/admin/appointments/${appointment.id}?reschedule=1`}
                  className="flex items-center gap-2 rounded-xl border border-[#e3d5d1] bg-white px-4 py-2.5 text-sm font-semibold text-[#2b2b2b] hover:border-[#d56572]"
                >
                  <CalendarDays size={15} aria-hidden="true" />
                  Reprogramar
                </Link>
                <PendingCancelAction appointmentId={appointment.id} />
              </div>

              {/* Trazabilidad de WhatsApp */}
              <PendingWhatsAppActions
                appointmentId={appointment.id}
                clientName={enriched.client?.name}
                phone={enriched.client?.phone}
                serviceName={enriched.service?.name}
                scheduledStart={start}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
