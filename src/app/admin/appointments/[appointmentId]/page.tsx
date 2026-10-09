import Link from 'next/link';
import { Calendar, Clock, Phone, Sparkles, StickyNote } from 'lucide-react';

import { getAppointmentDetailsForAdmin } from '@/domain/spa-service';
import { formatDayLabel, formatPhone, splitTime } from '../format';
import { StatusPill } from '../status-pill';
import { StatusControls } from '../status-controls';

const OUTCOME_LABELS: Record<string, string> = {
  prepared: 'Preparado',
  'sent-by-admin': 'Enviado por el administrador',
  failed: 'Fallido',
  'client-confirmed': 'Confirmado por el cliente',
  'manually-recorded': 'Registrado manualmente',
};

export default async function AdminAppointmentDetailRoute({
  params,
  searchParams,
}: {
  params: Promise<{ appointmentId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { appointmentId } = await params;
  const queryParams = searchParams ? await searchParams : undefined;
  const autoOpenReschedule = queryParams?.reschedule === '1';
  const detail = await getAppointmentDetailsForAdmin(appointmentId);

  if (!detail || !detail.appointment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0ee] px-6 py-10">
        <div className="rounded-3xl border border-[#e7d8d3] bg-white p-8 text-center shadow-sm">
          <h1 className="font-serif text-4xl text-[#d56572]">Cita no encontrada</h1>
          <Link href="/admin/appointments/pending" className="mt-6 inline-block rounded-xl bg-[#1f1f21] px-4 py-2.5 text-white">
            Volver a pendientes
          </Link>
        </div>
      </main>
    );
  }

  const start = new Date(detail.appointment.scheduledStart);
  const { time, period } = splitTime(start);
  const dayLabel = formatDayLabel(start);

  return (
    <main className="flex-1 overflow-auto bg-[#f5f0ee] px-6 py-10 text-[#1f1b1b]">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-[#e7d8d3] bg-white p-8 shadow-sm">
        <Link href="/admin/appointments/pending" className="text-sm font-medium text-[#6d5a56] underline-offset-4 hover:underline">
          ← Volver a pendientes
        </Link>

        <h1 className="mt-6 font-serif text-5xl text-[#d56572]">Detalle de cita</h1>

        {/* Cita destacada */}
        <article className="mt-6 rounded-2xl border border-[#efe4dd] bg-white p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="flex w-24 shrink-0 flex-col items-center border-r border-[#efe4dd] pr-4">
              <p className="font-serif text-[40px] leading-none text-[#1f1b1b]">{time}</p>
              <p className="mt-1 text-sm font-bold text-[#bf4a55]">{period}</p>
              <p className="mt-3 text-center text-xs leading-4 text-[#7d6966]">{dayLabel}</p>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xl font-semibold text-[#1f1b1b]">
                  {detail.client?.name ?? 'Cliente sin nombre'}
                </p>
                <p className="flex shrink-0 items-center gap-2 text-sm text-[#7d6966]">
                  Estado:
                  <StatusPill status={detail.appointment.status} />
                </p>
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
                    {detail.service?.name ?? 'Sin servicio'}
                  </span>
                </li>
                {detail.client?.phone ? (
                  <li className="flex items-center gap-2">
                    <Phone size={15} className="shrink-0 text-[#d56572]" aria-hidden="true" />
                    <span>
                      <span className="font-semibold">Teléfono:</span>{' '}
                      {formatPhone(detail.client.phone)}
                    </span>
                  </li>
                ) : null}
                {detail.appointment.notes ? (
                  <li className="flex items-start gap-2">
                    <StickyNote size={15} className="mt-0.5 shrink-0 text-[#d56572]" aria-hidden="true" />
                    <span>
                      <span className="font-semibold">Notas:</span> {detail.appointment.notes}
                    </span>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <p className="mt-4 border-t border-[#efe4dd] pt-3 text-xs text-[#7d6966]">
            ID de la cita: <span className="font-mono">{detail.appointment.id}</span>
          </p>
        </article>

        <div className="mt-8">
          <StatusControls
            appointmentId={detail.appointment.id}
            status={detail.appointment.status}
            clientName={detail.client?.name}
            phone={detail.client?.phone}
            serviceName={detail.service?.name}
            scheduledStart={detail.appointment.scheduledStart}
            serviceId={detail.appointment.serviceId}
            service={detail.service ?? undefined}
            autoOpenReschedule={autoOpenReschedule}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-[#e7d8d3] bg-[#faf5f3] p-5">
          <h2 className="font-serif text-2xl text-[#d56572]">Historial de estados</h2>
          {detail.history.length === 0 ? (
            <p className="mt-3 text-sm text-[#5a4541]">Todavía no hay cambios de estado registrados.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {detail.history.map((record) => (
                <li key={record.id} className="rounded-xl bg-white p-3 text-sm text-[#2d2828] shadow-sm">
                  <p className="font-semibold text-[#1f1f21]">{record.previousStatus} → {record.newStatus}</p>
                  {record.note ? <p className="mt-1 text-[#5a4541]">{record.note}</p> : null}
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#7d6966]">
                    {new Date(record.changedAt).toLocaleString('es-ES')} ·{' '}
                    {detail.adminNames[record.changedByAdminId] ?? 'Administrador'}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-[#e7d8d3] bg-[#faf5f3] p-5">
          <h2 className="font-serif text-2xl text-[#d56572]">Historial de WhatsApp</h2>
          {detail.communicationRecords.length === 0 ? (
            <p className="mt-3 text-sm text-[#5a4541]">Todavía no hay registros de contacto por WhatsApp para esta cita.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {detail.communicationRecords.map((record) => (
                <li key={record.id} className="rounded-xl bg-white p-3 text-sm text-[#2d2828] shadow-sm">
                  <p className="font-semibold text-[#1f1f21]">
                    {OUTCOME_LABELS[record.outcome] ?? record.outcome}
                  </p>
                  <p className="mt-1">{record.messageText}</p>
                  {record.outcomeNote ? <p className="mt-1 text-[#5a4541]">{record.outcomeNote}</p> : null}
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#7d6966]">
                    {new Date(record.createdAt).toLocaleString('es-ES')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
