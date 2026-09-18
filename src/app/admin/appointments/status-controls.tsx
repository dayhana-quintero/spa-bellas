import { getAvailableStatusTransitions } from '../../../domain/appointments/admin-appointment-service';
import type { Appointment } from '../../../shared/types/appointment';

export function StatusControls({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: Appointment['status'];
}) {
  const transitions = getAvailableStatusTransitions(status);

  if (transitions.length === 0) {
    return <p>No hay acciones disponibles para este estado.</p>;
  }

  return (
    <div>
      <p>Acciones disponibles:</p>
      <ul>
        {transitions.map((transition) => (
          <li key={`${appointmentId}-${transition}`}>
            <button type="button" aria-label={`Cambiar estado a ${transition}`}>
              {transition}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
