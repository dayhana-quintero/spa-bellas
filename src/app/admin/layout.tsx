import { cookies } from 'next/headers';

import { listAppointmentsForAdmin } from '@/domain/spa-service';
import { evaluateRouteAccess } from '@/shared/auth/access';
import { readAdminSessionFromCookie } from '@/shared/auth';
import AdminSidebar from './admin-sidebar';
import { AdminSessionGuard } from './admin-session-guard';

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
    <div className="flex h-screen overflow-hidden bg-[#f3f0ef] text-[#2a2423]">
      {accessResult.isAllowed ? (
        <AdminSidebar pendingCount={pendingCount} />
      ) : (
        <aside className="flex w-64 shrink-0 flex-col bg-[#17171a] px-4 py-5 text-[#f9f2f1]">
          <div className="font-serif text-[44px] font-bold leading-[0.72] tracking-[0.02em] text-[#f5f0ef]">
            BELLAS
          </div>
          <div className="mt-1 text-[14px] text-[#d7d2d0]">Panel del spa</div>
        </aside>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminSessionGuard accessResult={accessResult}>
          {children}
        </AdminSessionGuard>
      </div>
    </div>
  );
}
