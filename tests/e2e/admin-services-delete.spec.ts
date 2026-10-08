import { expect, test } from '@playwright/test';

import { createAdminSessionCookie } from '../../src/shared/auth/server';
import { createPendingAppointment } from './fixtures/appointments';

async function openServicesPage(browser: import('@playwright/test').Browser) {
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
  // La eliminacion pide confirmacion con un dialogo nativo.
  page.on('dialog', (dialog) => void dialog.accept());
  return { context, page };
}

test.describe('eliminar servicios del catalogo', () => {
  test('crea un servicio y lo elimina desde Servicios actuales', async ({ browser }) => {
    const { context, page } = await openServicesPage(browser);

    const serviceName = `Servicio desechable ${Date.now()}`;
    const created = await page.request.post('/api/admin/services', {
      data: {
        category: 'Pruebas',
        name: serviceName,
        description: 'Servicio creado por el e2e para comprobar el borrado.',
        estimatedDuration: 30,
        // Fuera de la agenda para no interferir con la reserva publica.
        isActive: true,
        isBookable: false,
      },
    });
    expect(created.ok(), 'El servicio de prueba debe crearse').toBeTruthy();

    await page.goto('/admin/services');
    const card = page
      .locator('article')
      .filter({ has: page.getByRole('heading', { name: serviceName, exact: true }) });
    await expect(card).toBeVisible();

    await card.getByRole('button', { name: 'Eliminar' }).click();

    await expect(page.getByText('Servicio eliminado correctamente.')).toBeVisible();
    await expect(card).toHaveCount(0);

    await context.close();
  });

  test('no permite eliminar un servicio que tiene citas asociadas', async ({ browser }) => {
    const { context, page } = await openServicesPage(browser);

    // El servicio de una cita existente no se puede borrar.
    const appointmentId = await createPendingAppointment(page);
    const detail = (await (
      await page.request.get(`/api/admin/appointments/${appointmentId}`)
    ).json()) as { service: { name: string } | null };
    const serviceName = detail.service?.name;
    expect(serviceName, 'La cita debe tener servicio').toBeTruthy();

    await page.goto('/admin/services');
    const card = page
      .locator('article')
      .filter({ has: page.getByRole('heading', { name: serviceName ?? '', exact: true }) });
    await expect(card).toBeVisible();

    await card.getByRole('button', { name: 'Eliminar' }).click();

    // El servidor rechaza el borrado y el servicio sigue en la lista.
    await expect(
      page.getByText('No se puede eliminar: tiene citas asociadas. Desactívalo para ocultarlo.'),
    ).toBeVisible();
    await expect(card).toBeVisible();

    await context.close();
  });

  test('sin sesion administrativa no se puede eliminar', async ({ browser }) => {
    const anonymous = await browser.newContext();

    const response = await anonymous.request.delete(
      '/api/admin/services/123e4567-e89b-12d3-a456-426614174099',
    );
    expect(response.status()).toBe(401);

    await anonymous.close();
  });
});
