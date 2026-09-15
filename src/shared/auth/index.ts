// Representa la sesión mínima del único rol administrativo permitido por la v1.
export type AdminSession = {
  id: string;
  name: string;
  accessStatus: 'activo' | 'inactivo';
  role: 'admin';
};

// Crea una sesión de administrador con valores por defecto seguros.
export function createAdminSession(
  session: Partial<AdminSession> = {},
): AdminSession {
  return {
    id: session.id ?? '',
    name: session.name ?? 'Admin',
    accessStatus: session.accessStatus ?? 'activo',
    role: 'admin',
  };
}

// Verifica si la sesión actual pertenece a un administrador activo.
export function isAdminActive(session?: Partial<AdminSession> | null): boolean {
  if (!session) {
    return false;
  }

  return session.role === 'admin' && session.accessStatus === 'activo';
}

// Permite decidir de forma centralizada si el usuario puede entrar al área administrativa.
export function canAccessAdminArea(session?: Partial<AdminSession> | null): boolean {
  return isAdminActive(session);
}

// Retorna la sesión validada o null si el usuario no tiene permisos de administrador.
export function requireAdminSession(
  session?: Partial<AdminSession> | null,
): AdminSession | null {
  if (!canAccessAdminArea(session)) {
    return null;
  }

  return createAdminSession(session ?? {});
}
