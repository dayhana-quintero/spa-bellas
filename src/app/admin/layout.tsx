import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { readAdminSessionFromCookie } from '../../shared/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const adminSessionCookie = cookieStore.get('admin-session');
  const currentSession = readAdminSessionFromCookie(adminSessionCookie?.value);

  if (!currentSession) {
    redirect('/admin/access-denied');
  }

  return <>{children}</>;
}
