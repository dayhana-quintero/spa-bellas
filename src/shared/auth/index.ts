import { getAdminUserByCodeFromSupabase } from '@/lib/supabase-data';
import { isSupabaseConfigured } from '@/lib/supabase';
import { findAdminUserByCode as findStoredAdminUserByCode, getAdminUsers as readStoredAdminUsers } from '@/storage/admin-users';

import { parseAdminSession } from './server';

export type AdminRole = 'admin' | 'manager' | 'owner';
export type AdminSessionRole = AdminRole | 'user';

export type AdminSessionState = 'missing' | 'authenticated' | 'expired' | 'denied';

export type AdminSession = {
  id: string;
  name: string;
  email?: string;
  accessStatus: 'activo' | 'inactivo';
  role: AdminSessionRole;
};

export type AdminUser = {
  id: string;
  name: string;
  email?: string;
  role: AdminRole;
  accessCode: string;
  isActive: boolean;
};

export type AdminSessionInput = Partial<Omit<AdminSession, 'role'>> & {
  role?: string;
  expiresAt?: number;
};

const ADMIN_ACCESS_ROLES = new Set<AdminRole>(['admin', 'manager', 'owner']);

export function getAdminUsers(): AdminUser[] {
  return readStoredAdminUsers().map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    accessCode: user.accessCode,
    isActive: user.isActive,
  }));
}

export function findAdminUserByCode(code: unknown): AdminUser | null {
  const user = findStoredAdminUserByCode(code);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    accessCode: user.accessCode,
    isActive: user.isActive,
  };
}

export async function findAdminUserByCodeForRequest(code: unknown): Promise<AdminUser | null> {
  if (isSupabaseConfigured()) {
    const remoteUser = await getAdminUserByCodeFromSupabase(String(code ?? ''));
    if (remoteUser) {
      return {
        id: remoteUser.id,
        name: remoteUser.name,
        email: remoteUser.email,
        role: (remoteUser.role ?? 'admin') as AdminRole,
        accessCode: remoteUser.code,
        isActive: true,
      };
    }
  }

  return findAdminUserByCode(code);
}

export function createAdminSession(
  session: AdminSessionInput = {},
): AdminSession {
  const normalizedRole = session.role ?? 'admin';

  return {
    id: session.id ?? '',
    name: session.name ?? 'Admin',
    email: session.email,
    accessStatus: session.accessStatus ?? 'activo',
    role: (ADMIN_ACCESS_ROLES.has(normalizedRole as AdminRole) ? normalizedRole : 'user') as AdminSessionRole,
  };
}

export function getAdminSessionState(cookieValue?: string | null): AdminSessionState {
  if (!cookieValue || !cookieValue.trim()) {
    return 'missing';
  }

  if (parseAdminSession(cookieValue)) {
    return 'authenticated';
  }

  try {
    const decoded = JSON.parse(cookieValue) as AdminSessionInput;
    if (decoded && typeof decoded === 'object' && typeof decoded.expiresAt === 'number' && decoded.expiresAt <= Date.now()) {
      return 'expired';
    }
  } catch {
    // No-op: invalid cookie payloads are denied.
  }

  try {
    const [encoded, signature] = cookieValue.split('.');
    if (encoded && signature) {
      const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<AdminSessionInput> & { expiresAt?: number };
      if (typeof payload.expiresAt === 'number' && payload.expiresAt <= Date.now()) {
        return 'expired';
      }
    }
  } catch {
    // No-op: invalid cookie payloads are denied.
  }

  return 'denied';
}

export function readAdminSessionFromCookie(cookieValue?: string | null): AdminSession | null {
  const value = cookieValue ?? '';
  if (!value.trim()) {
    return null;
  }

  const state = getAdminSessionState(value);
  if (state !== 'authenticated') {
    return null;
  }

  const signedSession = parseAdminSession(value);
  if (signedSession && canAccessAdminArea(signedSession)) {
    return createAdminSession(signedSession);
  }

  try {
    const parsed = JSON.parse(value) as AdminSessionInput;
    if (!canAccessAdminArea(parsed)) {
      return null;
    }

    return createAdminSession(parsed);
  } catch {
    return null;
  }
}

// Verifica si la sesión actual pertenece a un administrador activo.
export function isAdminActive(session?: AdminSessionInput | null): boolean {
  if (!session) {
    return false;
  }

  const normalizedRole = session.role as string | undefined;
  return Boolean(normalizedRole && ADMIN_ACCESS_ROLES.has(normalizedRole as AdminRole)) && session.accessStatus === 'activo';
}

// Permite decidir de forma centralizada si el usuario puede entrar al área administrativa.
export function canAccessAdminArea(session?: AdminSessionInput | null): boolean {
  return isAdminActive(session);
}

// Retorna la sesión validada o null si el usuario no tiene permisos de administrador.
export function requireAdminSession(
  session?: AdminSessionInput | null,
): AdminSession | null {
  if (!canAccessAdminArea(session)) {
    return null;
  }

  return createAdminSession(session ?? {});
}
