import Link from 'next/link';

import { getAppointmentDetails } from '@/domain/spa-service';
import { StatusControls } from '../status-controls';

export default async function AdminAppointmentDetailRoute({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  const detail = getAppointmentDetails(appointmentId);

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

  return (
    <main className="min-h-screen bg-[#f5f0ee] px-6 py-10 text-[#1f1b1b]">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-[#e7d8d3] bg-white p-8 shadow-sm">
        <Link href="/admin/appointments/pending" className="text-sm font-medium text-[#6d5a56] underline-offset-4 hover:underline">
          ← Volver a pendientes
        </Link>

        <h1 className="mt-6 font-serif text-5xl text-[#d56572]">Detalle de cita</h1>

        <div className="mt-6 space-y-3 text-[#2b2b2b]">
          <p><strong>ID:</strong> {detail.appointment.id}</p>
          <p><strong>Estado:</strong> {detail.appointment.status}</p>
          <p><strong>Fecha:</strong> {new Date(detail.appointment.scheduledStart).toLocaleString('es-ES')}</p>
          <p><strong>Servicio:</strong> {detail.service?.name ?? 'Sin servicio'}</p>
          <p><strong>Cliente:</strong> {detail.client?.name ?? 'Sin cliente'}</p>
          <p><strong>Notas:</strong> {detail.appointment.notes ?? 'Sin notas'}</p>
        </div>

        <div className="mt-8">
          <StatusControls
            appointmentId={detail.appointment.id}
            status={detail.appointment.status}
            clientName={detail.client?.name}
            phone={detail.client?.phone}
            serviceName={detail.service?.name}
            scheduledStart={detail.appointment.scheduledStart}
          />
        </div>
      </div>
    </main>
  );
}
