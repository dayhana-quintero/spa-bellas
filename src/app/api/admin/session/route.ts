import { NextResponse } from 'next/server';
import { cookieName, createAdminSessionCookie, isAdminCodeValid } from '@/shared/auth/server';

export async function POST(request: Request) {
  const { accessCode } = await request.json();
  if (!isAdminCodeValid(accessCode)) return Response.json({ error: 'Codigo de acceso invalido.' }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, createAdminSessionCookie(), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/admin', maxAge: 8 * 60 * 60 });
  return response;
}

export function DELETE() { const response = NextResponse.json({ ok: true }); response.cookies.delete(cookieName); return response; }
