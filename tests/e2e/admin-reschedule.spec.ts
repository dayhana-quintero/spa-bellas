import { expect, test } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';

import { createPendingAppointment } from './fixtures/appointments';
import { ADMIN_SESSION_ID, createAdminContext } from './fixtures/admin-session';
import { supabaseAdminFromEnv } from './fixtures/supabase-admin';

type CommunicationRecord = {
  outcome: string;
  adminId?: string;
  messageText?: string;
};

type AppointmentDetailResponse = {
  appointment: {
    id: string;
    status: string;
    scheduledStart: string;
    scheduledEnd: string;
    serviceId: string;
  };
  client: {
    id: string;
    name: string;
    phone: string;
    whatsappConsent: boolean;
  } | null;
  history: Array<{
    previousStatus: string;
    newStatus: string;
    changedByAdminId: string;
    changedAt: string;
    note?: string;
  }>;
  communicationRecords?: CommunicationRecord[];
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

/** Formato del aviso y del mensaje de exito (fecha medium + hora short). */
function formatShort(value: Date): string {
  return value.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Formato del detalle administrativo (fecha completa del servidor). */
function formatLong(value: Date): string {
  return value.toLocaleString('es-ES');
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

/**
 * Primer dia futuro (desde minOffset) con horarios libres para el servicio.
 * Evita elegir dias cerrados del spa (p. ej. domingos) o ya completos.
 */
async function findTargetDay(
  request: APIRequestContext,
  serviceId: string,
  minOffset: number,
): Promise<Date> {
  for (let offset = minOffset; offset < minOffset + 10; offset += 1) {
    const candidate = dayWithOffset(offset);
    const response = await request.get(
      `/api/public/slots?serviceId=${encodeURIComponent(serviceId)}&date=${dayKey(candidate)}`,
    );
    const slots = (await response.json()) as Array<{ time: string }>;
    if (slots[0]) return candidate;
  }
  throw new Error('No se encontro ningun dia con horarios libres para la prueba.');
}

/**
 * Abre el panel, comprueba que arranca en la fecha actual de la cita, elige el
 * dia objetivo y confirma con el primer horario libre (reintentando con otros si
 * otro proceso toma el hueco). Devuelve la nueva fecha y hora resultantes.
 */
async function rescheduleViaUi(page: Page, currentStart: Date, targetDay: Date): Promise<Date> {
  const rescheduleButton = page.getByRole('button', { name: 'Reprogramar', exact: true });
  await expect(rescheduleButton).toBeVisible();
  await rescheduleButton.click();

  const panel = page.getByRole('region', { name: 'Reprogramar cita' });
  await expect(panel).toBeVisible();
  // El selector arranca en la fecha actual de la cita.
  await expect(panel.locator('#slot-date')).toHaveValue(dayKey(currentStart));

  await panel.locator('#slot-date').fill(dayKey(targetDay));

  let slotTime = '';
  let confirmationMessage = '';
  const statusRegion = panel.getByRole('status');
  for (
    let attempt = 0;
    attempt < 3 && !confirmationMessage.includes('Cita reprogramada');
    attempt += 1
  ) {
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
  // La nueva fecha y hora aparecen en el mensaje de exito de inmediato (SC-001).
  await expect(statusRegion).toContainText(formatShort(expectedStart));
  return expectedStart;
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
    const targetDay = await findTargetDay(page.request, initial.appointment.serviceId, 20);
    const expectedStart = await rescheduleViaUi(page, initialStart, targetDay);

    // El detalle de atras queda con la fecha nueva sin pasos extra (US3/Flow 1).
    await expect(page.locator('p').filter({ hasText: 'Fecha:' }).first()).toContainText(
      formatLong(expectedStart),
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

  test('US3: el historial encadena dos reprogramaciones con sus notas y el detalle muestra la fecha', async ({
    browser,
  }) => {
    test.setTimeout(90_000);
    const context = await createAdminContext(browser);
    const page = await context.newPage();
    const appointmentId = await createPendingAppointment(page);

    const initial = await fetchDetail(page.request, appointmentId);
    const initialStart = new Date(initial.appointment.scheduledStart);

    await page.goto(`/admin/appointments/${appointmentId}`);

    // Primera reprogramacion.
    const firstDay = await findTargetDay(page.request, initial.appointment.serviceId, 50);
    const firstStart = await rescheduleViaUi(page, initialStart, firstDay);
    await expect(page.locator('p').filter({ hasText: 'Fecha:' }).first()).toContainText(
      formatLong(firstStart),
    );

    // Se cierra y se reabre el panel para un segundo cambio.
    const panel = page.getByRole('region', { name: 'Reprogramar cita' });
    await panel.getByRole('button', { name: 'Cerrar' }).click();
    await expect(panel).toHaveCount(0);

    const secondDay = await findTargetDay(page.request, initial.appointment.serviceId, 60);
    const secondStart = await rescheduleViaUi(page, firstStart, secondDay);
    // La fecha final queda a la vista sin pasos extra (US3, Flow 3.1).
    await expect(page.locator('p').filter({ hasText: 'Fecha:' }).first()).toContainText(
      formatLong(secondStart),
    );

    // El historial encadena los dos registros con sus propias notas.
    const after = await fetchDetail(page.request, appointmentId);
    const records = after.history.filter((entry) => entry.newStatus === 'reprogramada');
    expect(records).toHaveLength(2);
    expect(records[0]?.previousStatus).toBe('pendiente');
    expect(records[1]?.previousStatus).toBe('reprogramada');
    expect(records[0]?.note).toBe(
      `Reprogramada de ${formatShort(initialStart)} a ${formatShort(firstStart)}.`,
    );
    expect(records[1]?.note).toBe(
      `Reprogramada de ${formatShort(firstStart)} a ${formatShort(secondStart)}.`,
    );
    expect(records[0]?.changedByAdminId).toBe(ADMIN_SESSION_ID);
    expect(records[1]?.changedByAdminId).toBe(ADMIN_SESSION_ID);

    // El detalle renderiza los dos cambios con sus notas y la fecha final.
    await expect(page.getByRole('heading', { name: 'Historial de estados' })).toBeVisible();
    await expect(
      page.getByText(`Reprogramada de ${formatShort(firstStart)} a ${formatShort(secondStart)}.`),
    ).toBeVisible();
    await expect(page.getByText(/Estado:\s*reprogramada/)).toBeVisible();

    await context.close();
  });

  test('US2: tras confirmar ofrece el aviso con la nueva fecha y lo registra con la sesion', async ({
    browser,
  }) => {
    test.setTimeout(60_000);
    const context = await createAdminContext(browser);
    const page = await context.newPage();
    // La accion abre la pestana de wa.me: se cierra apenas aparece.
    page.on('popup', (popup) => void popup.close());

    const appointmentId = await createPendingAppointment(page);
    const initial = await fetchDetail(page.request, appointmentId);
    const initialStart = new Date(initial.appointment.scheduledStart);

    await page.goto(`/admin/appointments/${appointmentId}`);
    const targetDay = await findTargetDay(page.request, initial.appointment.serviceId, 30);
    const expectedStart = await rescheduleViaUi(page, initialStart, targetDay);

    const panel = page.getByRole('region', { name: 'Reprogramar cita' });
    const noticeButton = panel.getByRole('button', { name: 'Preparar aviso por WhatsApp' });
    await expect(noticeButton).toBeVisible();
    await noticeButton.click();
    await expect(panel.getByRole('status')).toContainText('Aviso de reprogramacion registrado');

    // El evento queda en la trazabilidad con la identidad real de la sesion
    // y el mensaje habla del cambio con la nueva fecha y hora.
    const detail = await fetchDetail(page.request, appointmentId);
    const record = detail.communicationRecords?.find((item) => item.outcome === 'prepared');
    expect(record, 'el aviso debe quedar en la trazabilidad').toBeTruthy();
    expect(record?.adminId).toBe(ADMIN_SESSION_ID);
    expect(record?.messageText).toContain('pasa a');
    expect(record?.messageText).toContain(formatShort(expectedStart));

    await context.close();
  });

  test('US2: sin consentimiento no se ofrece el aviso y la reprogramacion igual se completa', async ({
    browser,
  }) => {
    test.setTimeout(60_000);
    const context = await createAdminContext(browser);
    const page = await context.newPage();
    const appointmentId = await createPendingAppointment(page);
    const initial = await fetchDetail(page.request, appointmentId);
    const initialStart = new Date(initial.appointment.scheduledStart);
    expect(initial.client?.whatsappConsent).toBe(true);

    // La reserva publica exige consentimiento, pero citas antiguas pueden no
    // tenerlo: se retira en la base real para cubrir ese camino (FR-010).
    expect(initial.client?.id, 'la cita debe tener clienta').toBeTruthy();
    const update = await supabaseAdminFromEnv()
      .from('clients')
      .update({ whatsapp_consent: false })
      .eq('id', initial.client?.id ?? '');
    expect(update.error).toBeNull();

    await page.goto(`/admin/appointments/${appointmentId}`);
    const targetDay = await findTargetDay(page.request, initial.appointment.serviceId, 40);
    const expectedStart = await rescheduleViaUi(page, initialStart, targetDay);

    const panel = page.getByRole('region', { name: 'Reprogramar cita' });
    // Sin consentimiento no se ofrece el aviso...
    await expect(
      panel.getByRole('button', { name: 'Preparar aviso por WhatsApp' }),
    ).toHaveCount(0);
    // ...pero la reprogramacion se completa y el detalle queda actualizado.
    await expect(page.locator('p').filter({ hasText: 'Fecha:' }).first()).toContainText(
      formatLong(expectedStart),
    );
    await expect(page.getByText(/Estado:\s*reprogramada/)).toBeVisible();

    const after = await fetchDetail(page.request, appointmentId);
    expect(after.appointment.status).toBe('reprogramada');
    expect(after.communicationRecords ?? []).toHaveLength(0);

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
