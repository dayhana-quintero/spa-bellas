"use client";

import { getAppointmentById } from '../../../domain/appointments/admin-appointment-service';
import type { Appointment } from '../../../shared/types/appointment';
import { StatusControls } from './status-controls';

export type StatusHistoryEntry = {
  id: string;
  previousStatus: string;
  newStatus: string;
  changedByAdminId: string;
  changedAt: Date;
  note?: string;
};

export function AppointmentDetailPage({
  appointments,
  appointmentId,
  history = [],
  adminNames = {},
}: {
  appointments: Appointment[];
  appointmentId: string;
  /** Registros de cambios de estado de la cita (auditoria). */
  history?: StatusHistoryEntry[];
  /** Nombres de administradores por identificador para el historial. */
  adminNames?: Record<string, string>;
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
          serviceId={appointment.serviceId}
        />
      </div>
      <section aria-label="Historial de estados" className="mt-6 rounded-2xl border border-[#e7d8d3] bg-[#faf5f3] p-5">
        <h3 className="font-serif text-2xl text-[#d56572]">Historial de estados</h3>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-[#5a4541]">Todavía no hay cambios de estado registrados.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {history.map((record) => (
              <li key={record.id} className="rounded-xl bg-white p-3 text-sm text-[#2d2828] shadow-sm">
                <p className="font-semibold text-[#1f1f21]">{record.previousStatus} → {record.newStatus}</p>
                {record.note ? <p className="mt-1 text-[#5a4541]">{record.note}</p> : null}
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#7d6966]">
                  {new Date(record.changedAt).toLocaleString('es-ES')} ·{' '}
                  {adminNames[record.changedByAdminId] ?? 'Administrador'}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  );
}
