import { expect, test } from '../e2e/fixtures/viewport';

import { createAdminSessionCookie } from '../../src/shared/auth/server';
import { expectNoAccessibilityViolations } from '../helpers/accessibility';

test.describe('accesibilidad del historial administrativo', () => {
  test('expone filtros y tabla con labels accesibles y sin errores de accesibilidad', async ({ desktopPage }) => {
    await desktopPage.context().addCookies([
      {
        name: 'admin-session',
        value: createAdminSessionCookie(),
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    await desktopPage.goto('/admin/appointments/history');
    await expectNoAccessibilityViolations(desktopPage);

    await expect(desktopPage.getByRole('heading', { name: /historial de citas/i })).toBeVisible();
    await expect(desktopPage.getByLabel('Fecha desde')).toBeVisible();
    await expect(desktopPage.getByLabel('Fecha hasta')).toBeVisible();
    await expect(desktopPage.getByLabel('Estado')).toBeVisible();
  });
});
