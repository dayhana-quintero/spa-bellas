import { expect, test } from '@playwright/test';

import { createAdminSessionCookie } from '../../src/shared/auth/server';

test.describe('admin inventory flow', () => {
  test('allows creating an item and recording a movement with the proper stock update', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1024 } });
    await context.addCookies([
      {
        name: 'admin-session',
        value: createAdminSessionCookie(),
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    const page = await context.newPage();
    await page.goto('/admin/inventory');

    await expect(page.getByRole('heading', { name: /insumos del spa/i })).toBeVisible();

    await page.getByLabel('Nombre').fill('Aceite de lavanda');
    await page.getByLabel('Unidad').fill('botellas');
    await page.getByLabel('Stock disponible').fill('12');
    await page.getByLabel('Umbral mínimo').fill('3');
    await page.getByRole('button', { name: /guardar insumo/i }).click();

    await expect(page.getByText('Insumo guardado correctamente.')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Aceite de lavanda' })).toBeVisible();

    await page.getByLabel('Insumo').selectOption({ label: 'Aceite de lavanda' });
    await page.getByLabel('Tipo').selectOption('consumo');
    await page.getByLabel('Cantidad del movimiento').fill('4');
    await page.getByLabel('Motivo').fill('Uso de tratamiento');
    await page.getByRole('button', { name: /registrar movimiento/i }).click();

    await expect(page.getByText('Movimiento registrado correctamente.')).toBeVisible();
  });
});
