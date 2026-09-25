import { createHmac, timingSafeEqual } from 'node:crypto';

const cookieName = 'admin-session';
const secret = process.env.ADMIN_SESSION_SECRET ?? 'development-only-change-me';
const adminCode = process.env.ADMIN_ACCESS_CODE ?? 'spa-admin';

type SignedSession = { id: string; name: string; role: 'admin'; accessStatus: 'activo'; expiresAt: number };

function signature(value: string): string { return createHmac('sha256', secret).update(value).digest('base64url'); }

export function createAdminSessionCookie(): string {
  const payload: SignedSession = { id: '00000000-0000-4000-8000-000000000001', name: 'Administrador', role: 'admin', accessStatus: 'activo', expiresAt: Date.now() + 8 * 60 * 60 * 1000 };
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
  try { const session = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SignedSession; return session.expiresAt > Date.now() && session.role === 'admin' && session.accessStatus === 'activo' ? session : null; } catch { return null; }
}

export { cookieName };
