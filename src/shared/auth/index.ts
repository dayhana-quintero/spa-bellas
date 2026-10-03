import { parseAdminSession } from './server';

// Representa la sesión mínima del único rol administrativo permitido por la v1.
export type AdminSession = {
  id: string;
  name: string;
  accessStatus: 'activo' | 'inactivo';
  role: 'admin';
};

export type AdminSessionInput = Partial<Omit<AdminSession, 'role'>> & {
  role?: string;
};

// Crea una sesión de administrador con valores por defecto seguros.
export function createAdminSession(
  session: AdminSessionInput = {},
): AdminSession {
  return {
    id: session.id ?? '',
    name: session.name ?? 'Admin',
    accessStatus: session.accessStatus ?? 'activo',
    role: 'admin',
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

  return session.role === 'admin' && session.accessStatus === 'activo';
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
