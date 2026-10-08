import { expect, test } from '@playwright/test';

import { createAdminSessionCookie } from '../../src/shared/auth/server';

function buildExpiredSessionCookie(): string {
  const cookie = createAdminSessionCookie({ role: 'admin' });
  const [encoded, signature] = cookie.split('.');
  const payload = JSON.parse(Buffer.from(encoded!, 'base64url').toString('utf8')) as {
    expiresAt: number;
  };
  payload.expiresAt = Date.now() - 1000;

  return `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${signature}`;
}

test.describe('proteccion de rutas administrativas', () => {
  test('sin sesion redirige al login', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('con la sesion expirada redirige al login con el motivo', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'admin-session',
        value: buildExpiredSessionCookie(),
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/admin\/login\?reason=expired/);
  });

  test('con un rol sin permisos redirige a acceso denegado', async ({ page }) => {
    const cookie = createAdminSessionCookie({ role: 'admin' });
    const [encoded, signature] = cookie.split('.');
    const payload = JSON.parse(Buffer.from(encoded!, 'base64url').toString('utf8')) as {
      role: string;
    };
    payload.role = 'user';
    const tampered = `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${signature}`;

    await page.context().addCookies([
      {
        name: 'admin-session',
        value: tampered,
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/admin\/access-denied/);
    await expect(page.getByRole('heading', { name: /permisos insuficientes|acceso denegado|sesión inválida/i })).toBeVisible();
  });

  test('con una sesion valida muestra el panel', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'admin-session',
        value: createAdminSessionCookie({ role: 'admin' }),
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { level: 1, name: /resumen operativo/i })).toBeVisible();
  });
});
