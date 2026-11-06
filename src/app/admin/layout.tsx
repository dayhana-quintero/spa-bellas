import { cookies } from 'next/headers';

import { listAppointmentsForAdmin } from '@/domain/spa-service';
import { evaluateRouteAccess } from '@/shared/auth/access';
import { readAdminSessionFromCookie } from '@/shared/auth';
import AdminSidebar from './admin-sidebar';
import { AdminSessionGuard } from './admin-session-guard';
import { AdminThemeToggle } from './admin-theme-toggle';
import AdminAutoRefresh from './auto-refresh';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin-session');
  // El filtrado de rutas ocurre en src/proxy.ts antes de renderizar; aqui solo
  // se decide que shell mostrar (panel vs. pantalla publica del area admin).
  const accessResult = evaluateRouteAccess(sessionCookie?.value);

  const session = readAdminSessionFromCookie(sessionCookie?.value);

  let pendingCount = 0;
  if (session) {
    try {
      const pending = await listAppointmentsForAdmin({ status: 'pendiente' });
      pendingCount = pending.length;
    } catch {
      pendingCount = 0;
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background text-foreground md:flex-row">
      {/* El sidebar solo aparece con sesión iniciada; login y access-denied van a pantalla completa. */}
      {accessResult.isAllowed ? <AdminSidebar pendingCount={pendingCount} /> : null}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminThemeToggle />
        {/* El panel se refresca solo para reflejar altas hechas desde el area publica. */}
        {accessResult.isAllowed ? <AdminAutoRefresh /> : null}
        <AdminSessionGuard accessResult={accessResult}>
          {children}
        </AdminSessionGuard>
      </div>
    </div>
  );
}
