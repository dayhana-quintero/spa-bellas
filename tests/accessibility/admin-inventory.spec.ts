import { expect, test } from '../e2e/fixtures/viewport';

import { createAdminSessionCookie } from '../../src/shared/auth/server';
import { expectNoAccessibilityViolations } from '../helpers/accessibility';

test.describe('accesibilidad del inventario administrativo', () => {
  test('expone formularios y tabla con etiquetas accesibles', async ({ desktopPage }) => {
    await desktopPage.context().addCookies([
      {
        name: 'admin-session',
        value: createAdminSessionCookie(),
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    await desktopPage.goto('/admin/inventory');
    await expectNoAccessibilityViolations(desktopPage);

    await expect(desktopPage.getByRole('heading', { name: /insumos del spa/i })).toBeVisible();
    await expect(desktopPage.getByLabel('Nombre')).toBeVisible();
    await expect(desktopPage.getByLabel('Unidad')).toBeVisible();
    await expect(desktopPage.getByLabel('Stock disponible')).toBeVisible();
    await expect(desktopPage.getByLabel('Umbral mínimo')).toBeVisible();
    await expect(desktopPage.getByRole('button', { name: /guardar insumo/i })).toBeVisible();
  });
});
