import { findAdminUserByCode as findStoredAdminUserByCode, getAdminUsers as readStoredAdminUsers } from '@/storage/admin-users';

import { parseAdminSession } from './server';

export type AdminRole = 'admin' | 'manager' | 'owner';
export type AdminSessionRole = AdminRole | 'user';

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

export function readAdminSessionFromCookie(cookieValue?: string | null): AdminSession | null {
  if (!cookieValue || !cookieValue.trim()) {
    return null;
  }

  const signedSession = parseAdminSession(cookieValue);
  if (signedSession && canAccessAdminArea(signedSession)) {
    return createAdminSession(signedSession);
  }

  try {
    const parsed = JSON.parse(cookieValue) as AdminSessionInput;
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
