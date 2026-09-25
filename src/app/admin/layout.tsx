import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { canAccessAdminArea } from '../../shared/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const adminSessionCookie = cookieStore.get('admin-session');
  let currentSession = null;

  if (adminSessionCookie?.value) {
    try {
      currentSession = JSON.parse(adminSessionCookie.value);
    } catch {
      currentSession = null;
    }
  }

  if (!canAccessAdminArea(currentSession)) redirect('/admin/access-denied');
  return <>{children}</>;
}
