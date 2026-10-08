import { describe, expect, it } from 'vitest';

import {
  getAppointmentHistory,
} from '../../../src/domain/appointments/appointment-history-service';
import { listAppointmentsForAdmin } from '../../../src/domain/spa-service';
import { readSpaData } from '../../../src/storage/spa-store';

// El historial y el listado del panel deben leer la misma fuente: si el
// historial consultara un almacén distinto (p. ej. el JSON local) mostraría
// 0 citas mientras el panel reporta citas reales.
async function loadSourceAppointments() {
  return listAppointmentsForAdmin().catch(() => readSpaData().appointments);
}

describe('admin appointment history source', () => {
  it('lista el historial desde la misma fuente que las citas del panel', async () => {
    const [history, appointments] = await Promise.all([
      getAppointmentHistory({}),
      loadSourceAppointments(),
    ]);

    expect(history.total).toBe(appointments.length);
  });

  it('filtra por estado con la misma regla que la fuente de datos', async () => {
    const [history, appointments] = await Promise.all([
      getAppointmentHistory({ status: 'confirmada' }),
      loadSourceAppointments(),
    ]);

    const confirmed = appointments.filter((appointment) => appointment.status === 'confirmada');

    expect(history.total).toBe(confirmed.length);
    expect(history.items.every((item) => item.status === 'confirmada')).toBe(true);
  });

  it('pagina el listado sin perder el total filtrado', async () => {
    const [firstPage, secondPage] = await Promise.all([
      getAppointmentHistory({ page: 1, pageSize: 2 }),
      getAppointmentHistory({ page: 2, pageSize: 2 }),
    ]);

    expect(firstPage.items.length).toBeLessThanOrEqual(2);
    expect(secondPage.total).toBe(firstPage.total);
    expect(secondPage.page).toBe(2);
  });
});
