import { expect, test } from '@playwright/test';

import { createAdminSessionCookie } from '../../src/shared/auth/server';

test.describe('tema claro y oscuro', () => {
  test('el toggle cambia el tema, persiste tras recargar y vuelve a claro', async ({ browser }) => {
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

    // Chromium headless arranca con preferencia de sistema en claro.
    await page.goto('/admin');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click();
    await expect(html).toHaveClass(/dark/);

    // La eleccion persiste en localStorage.
    await page.reload();
    await expect(html).toHaveClass(/dark/);

    // En oscuro aparece la accion de volver a claro.
    await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
    await expect(html).not.toHaveClass(/dark/);

    await context.close();
  });

  test('el toggle del sitio publico aplica el mismo tema', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click();
    await expect(html).toHaveClass(/dark/);

    await context.close();
  });
});
