import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { canAccessAdminArea } from '../../shared/auth';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin-session');
  let session = null;

  if (sessionCookie?.value) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      session = null;
    }
  }

  if (!canAccessAdminArea(session)) redirect('/admin/access-denied');
  return <main><h1>Panel administrativo</h1><p>Bienvenido al area administrativa.</p></main>;
}
