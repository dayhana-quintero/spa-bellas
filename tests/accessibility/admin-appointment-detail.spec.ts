import { expect, test } from '../e2e/fixtures/viewport';

import { createAdminSessionCookie } from '../../src/shared/auth/server';
import { createPendingAppointment } from '../e2e/fixtures/appointments';
import { expectNoAccessibilityViolations } from '../helpers/accessibility';

test.describe('accesibilidad del detalle de cita', () => {
  test('expone los controles de WhatsApp y de cambio de estado sin errores de accesibilidad', async ({
    desktopPage,
  }) => {
    await desktopPage.context().addCookies([
      {
        name: 'admin-session',
        value: createAdminSessionCookie(),
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    const appointmentId = await createPendingAppointment(desktopPage);
    await desktopPage.goto(`/admin/appointments/${appointmentId}`);

    await expect(
      desktopPage.getByRole('button', { name: /confirmar por whatsapp/i }),
    ).toBeVisible();
    await expect(
      desktopPage.getByRole('button', { name: /registrar resultado manual/i }),
    ).toBeVisible();
    await expect(
      desktopPage.getByRole('button', { name: /cambiar estado a/i }).first(),
    ).toBeVisible();

    await expectNoAccessibilityViolations(desktopPage);

    // El fallback manual se puede abrir y expone campos etiquetados.
    await desktopPage.getByRole('button', { name: /registrar resultado manual/i }).click();
    await expect(desktopPage.getByLabel('Resultado manual')).toBeVisible();
    await expect(desktopPage.getByLabel('Nota')).toBeVisible();

    await expectNoAccessibilityViolations(desktopPage);
  });
});
