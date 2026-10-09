import { expect, test } from '@playwright/test';

import { createAdminSessionCookie } from '../../src/shared/auth/server';
import { createPendingAppointment, createPendingAppointmentDetails } from './fixtures/appointments';

const ADMIN_SESSION_ID = '00000000-0000-4000-8000-000000000001';

test.describe('trazabilidad de WhatsApp del panel', () => {
  test('registra el evento con la sesion real del administrador y exige autorizacion', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: 'admin-session',
        value: createAdminSessionCookie(),
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    const page = await context.newPage();
    // La accion abre la pestana de wa.me: se cierra apenas aparece.
    page.on('popup', (popup) => void popup.close());

    const appointmentId = await createPendingAppointment(page);

    await page.goto(`/admin/appointments/${appointmentId}`);

    // Paso 1: preparar el mensaje queda registrado como "prepared".
    await page.getByRole('button', { name: /confirmar por whatsapp/i }).click();
    await expect(page.getByText(/preparado y listo para enviar/i)).toBeVisible();

    const detailResponse = await page.request.get(`/api/admin/appointments/${appointmentId}`);
    const detail = (await detailResponse.json()) as {
      communicationRecords?: Array<{ outcome: string; adminId?: string; messageText?: string }>;
    };

    const prepared = detail.communicationRecords?.find((item) => item.outcome === 'prepared');
    expect(prepared, 'el evento preparado de WhatsApp debe quedar en la trazabilidad').toBeTruthy();
    expect(prepared?.adminId).toBe(ADMIN_SESSION_ID);
    expect(prepared?.messageText).toContain('confirmamos tu cita');

    // Paso 2: confirmar el envio manual queda registrado como "sent-by-admin".
    await page.getByRole('button', { name: /marcar como enviado/i }).click();

    // El aviso visual se pierde al recargar la pagina, asi que se consulta la
    // API hasta que el evento aparezca (se persiste antes de la recarga).
    await expect
      .poll(
        async () => {
          const response = await page.request.get(`/api/admin/appointments/${appointmentId}`);
          const body = (await response.json()) as {
            communicationRecords?: Array<{ outcome: string }>;
          };
          return (
            body.communicationRecords?.some((item) => item.outcome === 'sent-by-admin') ?? false
          );
        },
        { timeout: 10_000 },
      )
      .toBe(true);

    const afterSent = (await (
      await page.request.get(`/api/admin/appointments/${appointmentId}`)
    ).json()) as {
      communicationRecords?: Array<{ outcome: string; adminId?: string }>;
    };

    const sent = afterSent.communicationRecords?.find(
      (item) => item.outcome === 'sent-by-admin',
    );
    expect(sent, 'el evento de WhatsApp enviado debe quedar en la trazabilidad').toBeTruthy();
    expect(sent?.adminId).toBe(ADMIN_SESSION_ID);

    // Sin sesion administrativa la API rechaza el registro.
    const anonymous = await browser.newContext();
    const anonymousPage = await anonymous.newPage();
    const denied = await anonymousPage.request.post(
      `/api/admin/appointments/${appointmentId}/communications`,
      {
        data: {
          messageText: 'Mensaje de prueba suficientemente largo.',
          outcome: 'sent-by-admin',
        },
      },
    );
    expect(denied.status()).toBe(401);

    await anonymous.close();
    await context.close();
  });

  test('registra la trazabilidad desde las tarjetas de pendientes', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: 'admin-session',
        value: createAdminSessionCookie(),
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    const page = await context.newPage();
    // La accion abre la pestana de wa.me: se cierra apenas aparece.
    page.on('popup', (popup) => void popup.close());

    const created = await createPendingAppointmentDetails(page);

    await page.goto('/admin/appointments/pending');

    // La tarjeta se localiza por el telefono formateado (unico por creacion).
    const digits = created.phone;
    const formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    const card = page
      .locator('li')
      .filter({ has: page.getByRole('button', { name: /confirmar por whatsapp/i }) })
      .filter({ hasText: formatted });
    await expect(card).toHaveCount(1);

    // Paso 1: preparar el mensaje desde la tarjeta queda registrado como "prepared".
    await card.getByRole('button', { name: /confirmar por whatsapp/i }).click();
    await expect(card.getByText(/preparado y listo para enviar/i)).toBeVisible();

    const detailResponse = await page.request.get(`/api/admin/appointments/${created.id}`);
    const detail = (await detailResponse.json()) as {
      communicationRecords?: Array<{ outcome: string; adminId?: string }>;
    };

    const prepared = detail.communicationRecords?.find((item) => item.outcome === 'prepared');
    expect(prepared, 'el evento preparado debe quedar en la trazabilidad').toBeTruthy();
    expect(prepared?.adminId).toBe(ADMIN_SESSION_ID);

    // Paso 2: marcar como enviado desde la tarjeta queda registrado como "sent-by-admin".
    await card.getByRole('button', { name: /marcar como enviado/i }).click();
    await expect(card.getByText(/marcado como enviado/i)).toBeVisible();

    await expect
      .poll(
        async () => {
          const response = await page.request.get(`/api/admin/appointments/${created.id}`);
          const body = (await response.json()) as {
            communicationRecords?: Array<{ outcome: string }>;
          };
          return (
            body.communicationRecords?.some((item) => item.outcome === 'sent-by-admin') ?? false
          );
        },
        { timeout: 10_000 },
      )
      .toBe(true);

    await context.close();
  });
});
