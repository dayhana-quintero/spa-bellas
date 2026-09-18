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
    <article>
      <h2>Detalle de la cita</h2>
      <p>{appointment.id}</p>
      <p>{appointment.status}</p>
      <p>{new Date(appointment.scheduledStart).toISOString()}</p>
      <StatusControls appointmentId={appointment.id} status={appointment.status} />
    </article>
  );
}
