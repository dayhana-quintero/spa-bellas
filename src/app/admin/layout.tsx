import { cookies } from 'next/headers';
import { readAdminSessionFromCookie } from '@/shared/auth';
import { listAppointmentsForAdmin } from '@/domain/spa-service';
import AdminSidebar from './admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let pendingCount = 0;

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin-session');
    const session = readAdminSessionFromCookie(sessionCookie?.value);

    if (session) {
      const pending = await listAppointmentsForAdmin({ status: 'pendiente' });
      pendingCount = pending.length;
    }
  } catch {
    // Si falla (sin sesión, error de red, etc.), no bloquear el render
    pendingCount = 0;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0ef] text-[#2a2423]">
      <AdminSidebar pendingCount={pendingCount} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
