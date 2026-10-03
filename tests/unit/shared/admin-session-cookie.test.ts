import { describe, expect, it } from 'vitest';

import { readAdminSessionFromCookie } from '../../../src/shared/auth';

describe('admin session cookie parser', () => {
  it('accepts a valid active admin session cookie', () => {
    const session = readAdminSessionFromCookie(
      JSON.stringify({ id: 'a1', name: 'Admin', accessStatus: 'activo', role: 'admin' }),
    );

    expect(session?.role).toBe('admin');
    expect(session?.accessStatus).toBe('activo');
  });

  it('rejects invalid or inactive admin sessions', () => {
    expect(readAdminSessionFromCookie('')).toBeNull();
    expect(readAdminSessionFromCookie(JSON.stringify({ role: 'admin', accessStatus: 'inactivo' }))).toBeNull();
    expect(readAdminSessionFromCookie(JSON.stringify({ role: 'user', accessStatus: 'activo' }))).toBeNull();
  });
});
