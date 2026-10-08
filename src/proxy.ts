import { NextResponse, type NextRequest } from 'next/server';

import { evaluateRouteAccess } from './shared/auth/access';

// Rutas administrativas que deben seguir siendo alcanzables sin sesion valida.
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/access-denied'];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Bloquea el area administrativa antes de que Next renderice las paginas:
 * asi ninguna RCP con datos del panel llega al navegador sin sesion valida.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const access = evaluateRouteAccess(request.cookies.get('admin-session')?.value);
  if (access.isAllowed) {
    return NextResponse.next();
  }

  const target = new URL(access.redirectTo ?? '/admin/login', request.url);

  // Evita bucles de redireccion si la destino ya es la ruta solicitada.
  if (`${target.pathname}${target.search}` === `${pathname}${search}`) {
    return NextResponse.next();
  }

  return NextResponse.redirect(target);
}

export const config = {
  matcher: '/admin/:path*',
};
