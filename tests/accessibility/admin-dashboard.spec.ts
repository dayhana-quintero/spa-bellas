import type { Page } from '@playwright/test';

import { expect, test } from '../e2e/fixtures/viewport';

import { createAdminSessionCookie } from '../../src/shared/auth/server';
import { expectNoAccessibilityViolations } from '../helpers/accessibility';

async function useAdminSession(page: Page) {
  await page.context().addCookies([
    {
      name: 'admin-session',
      value: createAdminSessionCookie(),
      url: 'http://localhost:3000',
      sameSite: 'Lax',
    },
  ]);
}

test.describe('accesibilidad del dashboard administrativo', () => {
  test('expone el resumen operativo con tarjetas y navegacion accesibles', async ({ desktopPage }) => {
    await useAdminSession(desktopPage);
    await desktopPage.goto('/admin');

    await expect(
      desktopPage.getByRole('heading', { level: 1, name: /resumen operativo/i }),
    ).toBeVisible();

    await expect(desktopPage.getByRole('link', { name: /^Pendientes/ })).toBeVisible();
    await expect(desktopPage.getByRole('link', { name: /^Confirmadas/ })).toBeVisible();
    await expect(desktopPage.getByRole('link', { name: /^Vencidas/ })).toBeVisible();
    await expect(desktopPage.getByRole('link', { name: /^Stock bajo/ })).toBeVisible();

    await expect(desktopPage.getByRole('navigation').first()).toBeVisible();

    await expectNoAccessibilityViolations(desktopPage);
  });

  test('la navegacion rapida lleva a las pantallas operativas', async ({ desktopPage }) => {
    await useAdminSession(desktopPage);
    await desktopPage.goto('/admin');

    const quickAccess = desktopPage.locator('nav').filter({ hasText: 'Acceso rápido' });
    await expect(quickAccess.getByRole('link', { name: /inventario/i })).toBeVisible();

    await quickAccess.getByRole('link', { name: /inventario/i }).click();
    await expect(desktopPage).toHaveURL(/\/admin\/inventory$/);
    await expect(
      desktopPage.getByRole('heading', { level: 1, name: /insumos del spa/i }),
    ).toBeVisible();
  });

  test('mantiene el resumen legible y accesible en movil', async ({ mobilePage }) => {
    await useAdminSession(mobilePage);
    await mobilePage.goto('/admin');

    await expect(
      mobilePage.getByRole('heading', { level: 1, name: /resumen operativo/i }),
    ).toBeVisible();

    await expectNoAccessibilityViolations(mobilePage);
  });
});
