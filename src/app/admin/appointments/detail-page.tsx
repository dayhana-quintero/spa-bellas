"use client";

import { getAppointmentById } from '../../../domain/appointments/admin-appointment-service';
import type { Appointment } from '../../../shared/types/appointment';
import { StatusControls } from './status-controls';

export function AppointmentDetailPage({
  appointments,
  appointmentId,
}: {
  appointments: Appointment[];
  appointmentId: string;
}) {
  const appointment = getAppointmentById(appointments, appointmentId);

  if (!appointment) {
    return <p>No se encontró la cita.</p>;
  }

  return (
    <article className="rounded-2xl border border-[#e7d8d3] bg-white p-6 shadow-sm">
      <h2 className="font-serif text-3xl text-[#d56572]">Detalle de la cita</h2>
      <div className="mt-4 space-y-2 text-[#2b2b2b]">
        <p><strong>ID:</strong> {appointment.id}</p>
        <p><strong>Estado:</strong> {appointment.status}</p>
        <p><strong>Fecha:</strong> {new Date(appointment.scheduledStart).toLocaleString('es-ES')}</p>
        <p><strong>Notas:</strong> {appointment.notes ?? 'Sin notas'}</p>
      </div>
      <div className="mt-6">
        <StatusControls
          appointmentId={appointment.id}
          status={appointment.status}
          clientName="Cliente"
          phone="+0000000000"
          serviceName="Servicio"
          scheduledStart={appointment.scheduledStart}
        />
      </div>
    </article>
  );
}
