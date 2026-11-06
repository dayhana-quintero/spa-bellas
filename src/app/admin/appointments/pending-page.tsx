"use client";

import Link from 'next/link';
import { Calendar, CalendarCheck, CalendarDays, Clock, Phone, Sparkles } from 'lucide-react';

import { listPendingAppointments } from '../../../domain/appointments/admin-appointment-service';
import type { Appointment } from '../../../shared/types/appointment';
import { formatDayLabel, formatPhone, splitTime } from './format';
import { StatusPill } from './status-pill';
import { PendingCancelAction, PendingConfirmAction, PendingWhatsAppActions } from './pending-card-actions';

export function PendingAppointmentsPage({ appointments }: { appointments: Appointment[] }) {
  const pending = listPendingAppointments(appointments);

  if (pending.length === 0) {
    return (
      <section className="animate-in rounded-2xl border border-line bg-surface p-10 text-center fade-in-0 duration-700 shadow-sm">
        <div className="spa-float mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
          <CalendarCheck size={36} className="text-brand" aria-hidden="true" />
        </div>
        <h2 className="mt-5 font-serif text-2xl text-foreground">Todo al día</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          No hay citas pendientes por ahora. Cuando un cliente solicite una cita,
          aparecerá aquí para que la confirmes, reprogrames o cancele.
        </p>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-success-soft px-4 py-1.5 text-xs font-semibold text-success-text">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          Bandeja limpia
        </p>
      </section>
    );
  }

  return (
      <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-6">
      <h2 className="font-serif text-3xl text-foreground">Citas pendientes</h2>
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
              className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5"
            >
              <div className="flex gap-4">
                {/* Hora destacada */}
                <div className="flex w-[4.5rem] shrink-0 flex-col items-center border-r border-line pr-3 sm:w-24 sm:pr-4">
                  <p className="font-serif text-3xl leading-none text-foreground sm:text-[40px]">{time}</p>
                  <p className="mt-1 text-sm font-bold text-brand-strong">{period}</p>
                  <p className="mt-3 text-center text-xs leading-4 text-muted-foreground">{dayLabel}</p>
                </div>

                {/* Datos de la cita */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/appointments/${appointment.id}`}
                      className="text-xl font-semibold text-foreground underline-offset-4 hover:underline"
                    >
                      {enriched.client?.name ?? 'Cliente sin nombre'}
                    </Link>
                    <StatusPill status={appointment.status} />
                  </div>

                  <ul className="mt-3 space-y-2 text-sm text-body">
                    <li className="flex items-center gap-2">
                      <Calendar size={15} className="shrink-0 text-brand" aria-hidden="true" />
                      <span>
                        <span className="font-semibold">Fecha:</span> {dayLabel}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock size={15} className="shrink-0 text-brand" aria-hidden="true" />
                      <span>
                        <span className="font-semibold">Hora:</span> {time} {period}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles size={15} className="shrink-0 text-brand" aria-hidden="true" />
                      <span>
                        <span className="font-semibold">Servicio:</span>{' '}
                        {enriched.service?.name ?? 'Servicio'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone size={15} className="shrink-0 text-brand" aria-hidden="true" />
                      <span>
                        <span className="font-semibold">Teléfono:</span>{' '}
                        {formatPhone(enriched.client?.phone)}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                <PendingConfirmAction appointmentId={appointment.id} />
                <Link
                  href={`/admin/appointments/${appointment.id}?reschedule=1`}
                  className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:border-brand"
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
