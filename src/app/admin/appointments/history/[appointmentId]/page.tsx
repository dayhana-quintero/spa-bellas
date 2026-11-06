import Link from 'next/link';

import { getAppointmentDetail } from '@/domain/appointments/appointment-history-service';
import { getAppointmentStatusMeta } from '@/domain/appointments/appointment-status-meta';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatHour(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default async function AppointmentHistoryDetailPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  const detail = await getAppointmentDetail(appointmentId);

  if (!detail) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8">
        <h1 className="font-serif text-4xl text-foreground">Cita no encontrada</h1>
        <Link href="/admin/appointments/history" className="rounded-xl bg-strong px-4 py-2 text-strong-fg">
          Volver al historial
        </Link>
      </main>
    );
  }

  const { appointment, clientName, serviceName, timeline } = detail;
  const statusMeta = getAppointmentStatusMeta(appointment.status);

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-background px-4 pb-24 pt-14 md:p-8 md:pb-8">
      <div className="mx-auto max-w-3xl rounded-[24px] bg-background p-8 shadow-sm">
        <Link href="/admin/appointments/history" className="mb-6 inline-block text-sm text-body underline">
          ← Volver
        </Link>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Detalle de cita</p>
            <h1 className="mt-2 font-serif text-4xl text-foreground">#{appointment.id.slice(0, 8)}</h1>
          </div>
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{
              backgroundColor: statusMeta.bg,
              color: statusMeta.color,
            }}
          >
            {appointment.status}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-surface-soft p-4">
            <p className="text-sm text-muted-foreground">Cliente</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{clientName}</p>
          </div>
          <div className="rounded-2xl bg-surface-soft p-4">
            <p className="text-sm text-muted-foreground">Servicio</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{serviceName}</p>
          </div>
          <div className="rounded-2xl bg-surface-soft p-4">
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{formatDate(appointment.scheduledStart)}</p>
          </div>
          <div className="rounded-2xl bg-surface-soft p-4">
            <p className="text-sm text-muted-foreground">Hora</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{formatHour(appointment.scheduledStart)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-surface-soft p-4">
          <p className="text-sm text-muted-foreground">Notas</p>
          <p className="mt-2 text-foreground">{appointment.notes ?? 'Sin notas registradas.'}</p>
        </div>

        <div className="mt-6 rounded-2xl bg-surface-soft p-4">
          <p className="text-sm text-muted-foreground">Trazabilidad</p>
          <ul className="mt-3 space-y-2 text-foreground">
            <li>Origen: {appointment.source}</li>
            <li>Creada: {formatDate(appointment.createdAt)} · {formatHour(appointment.createdAt)}</li>
            <li>Actualizada: {formatDate(appointment.updatedAt)} · {formatHour(appointment.updatedAt)}</li>
            {appointment.holdExpiresAt ? (
              <li>Hold expira: {formatDate(appointment.holdExpiresAt)} · {formatHour(appointment.holdExpiresAt)}</li>
            ) : null}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl bg-surface-soft p-4">
          <p className="text-sm text-muted-foreground">Línea de tiempo</p>
          {timeline.length === 0 ? (
            <p className="mt-3 text-foreground">Sin eventos registrados.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {timeline.map((entry) => (
                <li key={entry.id} className="rounded-xl bg-background p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {entry.kind === 'status' ? 'Estado' : 'WhatsApp'}
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{entry.title}</p>
                  <p className="mt-1 text-body">{entry.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(entry.timestamp)} · {formatHour(entry.timestamp)}
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
