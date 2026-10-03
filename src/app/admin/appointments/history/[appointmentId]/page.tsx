import Link from 'next/link';

import { getAppointmentDetail } from '@/domain/appointments/appointment-history-service';

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
  const appointment = getAppointmentDetail(appointmentId);

  if (!appointment) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f3f0ef] p-8">
        <h1 className="font-serif text-4xl text-[#d56572]">Cita no encontrada</h1>
        <Link href="/admin/appointments/history" className="rounded-xl bg-[#1f1f21] px-4 py-2 text-white">
          Volver al historial
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f0ef] p-8">
      <div className="mx-auto max-w-3xl rounded-[24px] bg-[#f7f2ef] p-8 shadow-sm">
        <Link href="/admin/appointments/history" className="mb-6 inline-block text-sm text-[#5a4541] underline">
          ← Volver
        </Link>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#7d6966]">Detalle de cita</p>
            <h1 className="mt-2 font-serif text-4xl text-[#d56572]">#{appointment.id.slice(0, 8)}</h1>
          </div>
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{
              backgroundColor: {
                pendiente: '#f8e1e3',
                confirmada: '#dff5ea',
                cancelada: '#f4d5d5',
                vencida: '#f0e2d8',
                completada: '#f7dfe4',
                'no asistio': '#f6e8d8',
                'reprogramacion solicitada': '#f0e4f4',
                reprogramada: '#dfeff4',
              }[appointment.status] ?? '#efefef',
              color: {
                pendiente: '#9a5d5d',
                confirmada: '#2e7d5e',
                cancelada: '#b75a5a',
                vencida: '#8a6f60',
                completada: '#d9697d',
                'no asistio': '#8c6a52',
                'reprogramacion solicitada': '#8b5d8c',
                reprogramada: '#4d7d8d',
              }[appointment.status] ?? '#4d4d4d',
            }}
          >
            {appointment.status}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#efe8e3] p-4">
            <p className="text-sm text-[#6c5d5a]">Cliente</p>
            <p className="mt-2 text-xl font-semibold text-[#2b2b2b]">Cliente #{appointment.clientId.slice(0, 8)}</p>
          </div>
          <div className="rounded-2xl bg-[#efe8e3] p-4">
            <p className="text-sm text-[#6c5d5a]">Servicio</p>
            <p className="mt-2 text-xl font-semibold text-[#2b2b2b]">Servicio #{appointment.serviceId.slice(0, 8)}</p>
          </div>
          <div className="rounded-2xl bg-[#efe8e3] p-4">
            <p className="text-sm text-[#6c5d5a]">Fecha</p>
            <p className="mt-2 text-xl font-semibold text-[#2b2b2b]">{formatDate(appointment.scheduledStart)}</p>
          </div>
          <div className="rounded-2xl bg-[#efe8e3] p-4">
            <p className="text-sm text-[#6c5d5a]">Hora</p>
            <p className="mt-2 text-xl font-semibold text-[#2b2b2b]">{formatHour(appointment.scheduledStart)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#efe8e3] p-4">
          <p className="text-sm text-[#6c5d5a]">Notas</p>
          <p className="mt-2 text-[#2b2b2b]">{appointment.notes ?? 'Sin notas registradas.'}</p>
        </div>

        <div className="mt-6 rounded-2xl bg-[#efe8e3] p-4">
          <p className="text-sm text-[#6c5d5a]">Trazabilidad</p>
          <ul className="mt-3 space-y-2 text-[#2b2b2b]">
            <li>Origen: {appointment.source}</li>
            <li>Creada: {formatDate(appointment.createdAt)} · {formatHour(appointment.createdAt)}</li>
            <li>Actualizada: {formatDate(appointment.updatedAt)} · {formatHour(appointment.updatedAt)}</li>
            {appointment.holdExpiresAt ? (
              <li>Hold expira: {formatDate(appointment.holdExpiresAt)} · {formatHour(appointment.holdExpiresAt)}</li>
            ) : null}
          </ul>
        </div>
      </div>
    </main>
  );
}
