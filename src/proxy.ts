import { NextResponse, type NextRequest } from 'next/server';

import { evaluateRouteAccess } from './shared/auth/access';

// Rutas administrativas que deben seguir siendo alcanzables sin sesion valida.
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/access-denied'];
// El endpoint de sesion (login/logout) es el unico API admin publico.
const PUBLIC_ADMIN_API_PATHS = ['/api/admin/session'];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Bloquea el area administrativa (paginas y APIs) antes de que Next renderice:
 * asi ninguna RCP con datos del panel ni ningun endpoint admin se sirve sin
 * sesion valida. Las APIs responden 401 JSON porque un fetch no debe seguir
 * una redireccion HTML al login.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicAdminPath(pathname) || PUBLIC_ADMIN_API_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const access = evaluateRouteAccess(request.cookies.get('admin-session')?.value);
  if (access.isAllowed) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Sesión de administrador requerida.' }, { status: 401 });
  }

  const target = new URL(access.redirectTo ?? '/admin/login', request.url);

  // Evita bucles de redireccion si la destino ya es la ruta solicitada.
  if (`${target.pathname}${target.search}` === `${pathname}${search}`) {
    return NextResponse.next();
  }

  return NextResponse.redirect(target);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
