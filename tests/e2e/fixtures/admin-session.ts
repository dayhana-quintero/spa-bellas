import type { Browser, BrowserContext, Page } from '@playwright/test';

import { createAdminSessionCookie } from '../../../src/shared/auth/server';

/** Identidad por defecto de la cookie de sesión usada en pruebas. */
export const ADMIN_SESSION_ID = '00000000-0000-4000-8000-000000000001';

/** Crea un contexto de navegador con sesión administrativa válida. */
export async function createAdminContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext();
  await addAdminSession(context);
  return context;
}

/** Añade la cookie de sesión administrativa a un contexto existente. */
export async function addAdminSession(context: BrowserContext): Promise<void> {
  await context.addCookies([
    {
      name: 'admin-session',
      value: createAdminSessionCookie(),
      url: 'http://localhost:3000',
      sameSite: 'Lax',
    },
  ]);
}

/** Añade la sesión administrativa a la página en uso (su contexto subyacente). */
export async function useAdminSession(page: Page): Promise<void> {
  await addAdminSession(page.context());
}
