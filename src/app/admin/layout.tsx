import { cookies } from 'next/headers';

import { listAppointmentsForAdmin } from '@/domain/spa-service';
import { evaluateRouteAccess } from '@/shared/auth/access';
import { readAdminSessionFromCookie } from '@/shared/auth';
import AdminSidebar from './admin-sidebar';
import { AdminSessionGuard } from './admin-session-guard';
import { AdminThemeToggle } from './admin-theme-toggle';

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
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {accessResult.isAllowed ? (
        <AdminSidebar pendingCount={pendingCount} />
      ) : (
        <aside className="flex w-64 shrink-0 flex-col bg-sidebar px-4 py-5 text-sidebar-foreground">
          <div className="font-serif text-[44px] font-bold leading-[0.72] tracking-[0.02em] text-sidebar-text">
            BELLAS
          </div>
          <div className="mt-1 text-[14px] text-sidebar-muted">Panel del spa</div>
        </aside>
      )}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AdminThemeToggle />
        <AdminSessionGuard accessResult={accessResult}>
          {children}
        </AdminSessionGuard>
      </div>
    </div>
  );
}
