import { expect, test } from '@playwright/test';

import { createAdminSessionCookie } from '../../src/shared/auth/server';

test.describe('admin appointment history flow', () => {
  test('shows the history table and filters by date and status', async ({ browser }) => {
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
    await page.goto('/admin/appointments/history');

    await expect(page.getByRole('heading', { name: /historial de citas/i })).toBeVisible();
    await expect(page.getByLabel('Fecha desde')).toBeVisible();
    await expect(page.getByLabel('Fecha hasta')).toBeVisible();
    await expect(page.getByLabel('Estado')).toBeVisible();

    await page.getByLabel('Fecha desde').fill('2024-01-01');
    await page.getByLabel('Fecha hasta').fill('2024-12-31');
    await page.getByLabel('Estado').selectOption('confirmada');

    await expect(page.locator('tbody tr').first()).toBeVisible();
    await expect(page.getByText('Total de citas:')).toBeVisible();
  });
});
