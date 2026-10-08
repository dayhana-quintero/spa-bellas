import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

import { createPendingAppointment } from './fixtures/appointments';
import { ADMIN_SESSION_ID, createAdminContext } from './fixtures/admin-session';

type AppointmentDetailResponse = {
  appointment: {
    id: string;
    status: string;
    scheduledStart: string;
    scheduledEnd: string;
    serviceId: string;
  };
  history: Array<{
    previousStatus: string;
    newStatus: string;
    changedByAdminId: string;
    changedAt: string;
    note?: string;
  }>;
};

function dayKey(value: Date): string {
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

function dayWithOffset(offsetDays: number): Date {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  value.setHours(0, 0, 0, 0);
  return value;
}

async function fetchDetail(
  request: APIRequestContext,
  appointmentId: string,
): Promise<AppointmentDetailResponse> {
  const response = await request.get(`/api/admin/appointments/${appointmentId}`);
  expect(response.ok(), 'El detalle administrativo debe responder').toBeTruthy();
  return (await response.json()) as AppointmentDetailResponse;
}

async function postReschedule(
  request: APIRequestContext,
  appointmentId: string,
  data: Record<string, unknown>,
) {
  return request.post(`/api/admin/appointments/${appointmentId}/reschedule`, { data });
}

test.describe('Reprogramar citas desde el panel', () => {
  test('US1: mueve la cita a otro horario con estado reprogramada y auditoria', async ({
    browser,
  }) => {
    test.setTimeout(60_000);
    const context = await createAdminContext(browser);
    const page = await context.newPage();
    const appointmentId = await createPendingAppointment(page);

    const initial = await fetchDetail(page.request, appointmentId);
    expect(initial.appointment.status).toBe('pendiente');
    const initialStart = new Date(initial.appointment.scheduledStart);

    await page.goto(`/admin/appointments/${appointmentId}`);

    const rescheduleButton = page.getByRole('button', { name: 'Reprogramar', exact: true });
    await expect(rescheduleButton).toBeVisible();
    await rescheduleButton.click();

    const panel = page.getByRole('region', { name: 'Reprogramar cita' });
    await expect(panel).toBeVisible();
    // El selector arranca en la fecha actual de la cita y muestra esa fecha.
    await expect(panel.locator('#slot-date')).toHaveValue(dayKey(initialStart));

    const targetDay = dayWithOffset(22);
    await panel.locator('#slot-date').fill(dayKey(targetDay));

    // Reintenta con otros horarios si otro proceso toma el hueco entre el
    // render y la confirmacion (suite en paralelo).
    let slotTime = '';
    let confirmationMessage = '';
    const statusRegion = panel.getByRole('status');
    for (let attempt = 0; attempt < 3 && !confirmationMessage.includes('Cita reprogramada'); attempt += 1) {
      const slotButtons = panel.locator('button', { hasText: 'Hora' });
      await expect(slotButtons.first(), 'Debe haber horarios libres para reprogramar').toBeVisible({
        timeout: 15_000,
      });
      const total = await slotButtons.count();
      const target = slotButtons.nth(Math.min(attempt, total - 1));
      slotTime = (await target.locator('span').last().textContent()) ?? '';
      await target.click();
      await panel.getByRole('button', { name: 'Confirmar reprogramacion' }).click();
      await expect(statusRegion).toBeVisible();
      confirmationMessage = (await statusRegion.textContent()) ?? '';
    }
    expect(confirmationMessage).toContain('Cita reprogramada');

    const [hoursText, minutesText] = slotTime.split(':');
    const expectedStart = new Date(targetDay);
    expectedStart.setHours(Number(hoursText), Number(minutesText), 0, 0);

    // El detalle se recarga con la fecha nueva y el estado reprogramada.
    await expect(panel).toBeHidden({ timeout: 15_000 });
    await expect(page.locator('p').filter({ hasText: 'Fecha:' }).first()).toContainText(
      expectedStart.toLocaleString('es-ES'),
    );
    await expect(page.getByText(/Estado:\s*reprogramada/)).toBeVisible();

    const after = await fetchDetail(page.request, appointmentId);
    expect(after.appointment.status).toBe('reprogramada');
    expect(new Date(after.appointment.scheduledStart).getTime()).toBe(expectedStart.getTime());
    expect(new Date(after.appointment.scheduledStart).getTime()).not.toBe(initialStart.getTime());

    const record = after.history.find((entry) => entry.newStatus === 'reprogramada');
    expect(record, 'Debe quedar un registro de reprogramacion en el historial').toBeDefined();
    expect(record?.previousStatus).toBe('pendiente');
    expect(record?.changedByAdminId).toBe(ADMIN_SESSION_ID);
    expect(record?.note).toContain('Reprogramada de');

    await context.close();
  });

  test('US1: los rechazos del servidor no modifican la cita', async ({ browser }) => {
    test.setTimeout(60_000);
    const context = await createAdminContext(browser);
    const page = await context.newPage();
    const appointmentId = await createPendingAppointment(page);
    const initial = await fetchDetail(page.request, appointmentId);
    const initialStart = new Date(initial.appointment.scheduledStart);

    const futureKey = dayKey(dayWithOffset(24));

    // Horario fuera de la disponibilidad del servicio.
    const slotTaken = await postReschedule(page.request, appointmentId, {
      date: futureKey,
      slot: '06:00',
      expectedScheduledStart: initial.appointment.scheduledStart,
      expectedStatus: initial.appointment.status,
    });
    expect(slotTaken.status()).toBe(409);
    expect((await slotTaken.json()).reason).toBe('slot-unavailable');

    // La cita cambio en otra pestana respecto de lo que ve el administrador.
    const stale = await postReschedule(page.request, appointmentId, {
      date: futureKey,
      slot: '09:00',
      expectedScheduledStart: '2020-01-01T00:00:00.000Z',
      expectedStatus: initial.appointment.status,
    });
    expect(stale.status()).toBe(409);
    expect((await stale.json()).reason).toBe('stale-appointment');

    // Fecha pasada.
    const past = await postReschedule(page.request, appointmentId, {
      date: dayKey(dayWithOffset(-1)),
      slot: '09:00',
      expectedScheduledStart: initial.appointment.scheduledStart,
      expectedStatus: initial.appointment.status,
    });
    expect(past.status()).toBe(400);
    expect((await past.json()).reason).toBe('past-datetime');

    // Cuerpo invalido.
    const invalid = await postReschedule(page.request, appointmentId, {
      date: 'no-es-fecha',
      slot: '09:00',
      expectedScheduledStart: initial.appointment.scheduledStart,
      expectedStatus: initial.appointment.status,
    });
    expect(invalid.status()).toBe(400);

    // Estado terminal: se cancela y ya no admite reprogramacion.
    const cancelled = await page.request.patch(`/api/admin/appointments/${appointmentId}`, {
      data: { status: 'cancelada', note: 'preparacion e2e de reprogramacion' },
    });
    expect(cancelled.ok()).toBeTruthy();

    const terminal = await postReschedule(page.request, appointmentId, {
      date: futureKey,
      slot: '09:00',
      expectedScheduledStart: initial.appointment.scheduledStart,
      expectedStatus: 'cancelada',
    });
    expect(terminal.status()).toBe(409);
    expect((await terminal.json()).reason).toBe('status-not-allowed');

    // Ningun intento movio la cita ni dejo rastro de reprogramacion.
    const after = await fetchDetail(page.request, appointmentId);
    expect(after.appointment.status).toBe('cancelada');
    expect(new Date(after.appointment.scheduledStart).getTime()).toBe(initialStart.getTime());
    expect(after.history.some((entry) => entry.newStatus === 'reprogramada')).toBe(false);

    // En la interfaz, la cita cancelada ni siquiera ofrece la accion (FR-012).
    await page.goto(`/admin/appointments/${appointmentId}`);
    await expect(page.getByRole('button', { name: 'Reprogramar', exact: true })).toHaveCount(0);

    await context.close();
  });

  test('FR-011: sin sesion administrativa no se reprograma ni se leen horarios', async ({
    browser,
  }) => {
    const anonymous = await browser.newContext();

    const reschedule = await postReschedule(
      anonymous.request,
      '11111111-1111-4111-8111-111111111111',
      {
        date: dayKey(dayWithOffset(20)),
        slot: '09:00',
        expectedScheduledStart: new Date().toISOString(),
        expectedStatus: 'pendiente',
      },
    );
    expect(reschedule.status()).toBe(401);

    const slots = await anonymous.request.get(
      '/api/admin/slots?serviceId=33333333-3333-4333-8333-333333333333&date=2026-11-01&appointmentId=11111111-1111-4111-8111-111111111111',
    );
    expect(slots.status()).toBe(401);

    await anonymous.close();
  });
});
