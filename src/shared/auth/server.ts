import { createHmac, timingSafeEqual } from 'node:crypto';

const cookieName = 'admin-session';
const secret = process.env.ADMIN_SESSION_SECRET ?? 'development-only-change-me';
const adminCode = process.env.ADMIN_ACCESS_CODE ?? 'spa-admin';
const adminCookiePath = '/';

type AdminRole = 'admin' | 'manager' | 'owner';
type SignedSession = { id: string; name: string; email?: string; role: AdminRole; accessStatus: 'activo'; expiresAt: number };

function signature(value: string): string { return createHmac('sha256', secret).update(value).digest('base64url'); }

function buildCookieBaseOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: adminCookiePath,
  };
}

export function createAdminSessionCookie(input: Partial<Omit<SignedSession, 'accessStatus' | 'expiresAt'>> = {}): string {
  const payload: SignedSession = {
    id: input.id ?? '00000000-0000-4000-8000-000000000001',
    name: input.name ?? 'Administrador',
    email: input.email,
    role: (input.role && ['admin', 'manager', 'owner'].includes(input.role)) ? input.role as AdminRole : 'admin',
    accessStatus: 'activo',
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${signature(encoded)}`;
}

export function isAdminCodeValid(code: unknown): boolean {
  if (typeof code !== 'string' || !code.length || code.length !== adminCode.length) return false;
  return timingSafeEqual(Buffer.from(code), Buffer.from(adminCode));
}

export function parseAdminSession(value?: string): SignedSession | null {
  if (!value) return null;
  const [encoded, provided] = value.split('.');
  if (!encoded || !provided) return null;
  const expected = signature(encoded);
  if (provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return null;
  try {
    const session = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SignedSession;
    const permittedRoles = new Set<AdminRole>(['admin', 'manager', 'owner']);
    return session.expiresAt > Date.now() && permittedRoles.has(session.role) && session.accessStatus === 'activo' ? session : null;
  } catch { return null; }
}

export function clearAdminSessionCookie() {
  return {
    ...buildCookieBaseOptions(),
    maxAge: 0,
    expires: new Date(0),
    value: '',
  };
}

export function isAdminSessionAuthenticated(value?: string): boolean {
  return parseAdminSession(value) !== null;
}

export { cookieName, adminCookiePath };
