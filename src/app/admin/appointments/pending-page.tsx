import {
  getAppointmentById,
  listPendingAppointments,
} from '../../../domain/appointments/admin-appointment-service';
import type { Appointment } from '../../../shared/types/appointment';

export function PendingAppointmentsPage({ appointments }: { appointments: Appointment[] }) {
  const pending = listPendingAppointments(appointments);

  if (pending.length === 0) {
    return <p>No hay citas pendientes.</p>;
  }

  return (
    <section>
      <h2>Citas pendientes</h2>
      <ul>
        {pending.map((appointment) => (
          <li key={appointment.id}>
            <p>{appointment.id}</p>
            <p>{appointment.status}</p>
            <p>{new Date(appointment.scheduledStart).toISOString()}</p>
            <p>{getAppointmentById(appointments, appointment.id)?.status ?? 'pendiente'}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
