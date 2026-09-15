import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { canAccessAdminArea } from '../../shared/auth';

// Guarda la zona administrativa: solo permite entrar si existe una sesión válida de administrador activo.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lee la sesión guardada en cookie para esta v1 y la valida antes de renderizar el contenido.
  const cookieStore = await cookies();
  const adminSessionCookie = cookieStore.get('admin-session');

  let currentSession = null;

  if (adminSessionCookie?.value) {
    try {
      currentSession = JSON.parse(adminSessionCookie.value);
    } catch {
      // Si la sesión no es válida, se descarta y se bloquea el acceso.
      currentSession = null;
    }
  }

  if (!canAccessAdminArea(currentSession)) {
    redirect('/admin/access-denied');
  }

  return <>{children}</>;
}
