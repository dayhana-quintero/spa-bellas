import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { findAdminUserByCode } from '@/shared/auth';
import { clearAdminSessionCookie, cookieName, createAdminSessionCookie, isAdminSessionAuthenticated } from '@/shared/auth/server';

export async function GET() {
  const cookieValue = (await cookies()).get(cookieName)?.value;
  return Response.json({ ok: true, authenticated: isAdminSessionAuthenticated(cookieValue) });
}

export async function POST(request: Request) {
  const { accessCode } = await request.json();
  const adminUser = findAdminUserByCode(accessCode);

  if (!adminUser) {
    return Response.json({ error: 'Codigo de acceso invalido.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: { id: adminUser.id, name: adminUser.name, role: adminUser.role } });
  response.cookies.set(
    cookieName,
    createAdminSessionCookie({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    }),
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 8 * 60 * 60,
    },
  );
  return response;
}

export function DELETE() {
  const response = NextResponse.json({ ok: true });
  const clearedCookie = clearAdminSessionCookie();

  response.cookies.set(cookieName, clearedCookie.value, {
    httpOnly: clearedCookie.httpOnly,
    sameSite: clearedCookie.sameSite,
    secure: clearedCookie.secure,
    path: clearedCookie.path,
    maxAge: clearedCookie.maxAge,
    expires: clearedCookie.expires,
  });

  return response;
}
