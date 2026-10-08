import { describe, expect, it } from 'vitest';

import { readAdminSessionFromCookie } from '../../../src/shared/auth';
import { createAdminSessionCookie } from '../../../src/shared/auth/server';

describe('admin session cookie parser', () => {
  it('accepts a valid signed active admin session cookie', () => {
    const session = readAdminSessionFromCookie(
      createAdminSessionCookie({ id: 'a1', name: 'Admin', role: 'admin' }),
    );

    expect(session?.role).toBe('admin');
    expect(session?.accessStatus).toBe('activo');
  });

  it('rejects unsigned, tampered, or inactive admin sessions', () => {
    expect(readAdminSessionFromCookie('')).toBeNull();
    expect(
      readAdminSessionFromCookie(
        JSON.stringify({ id: 'a1', name: 'Admin', accessStatus: 'activo', role: 'admin' }),
      ),
    ).toBeNull();

    const signed = createAdminSessionCookie({ role: 'admin' });
    const tampered = `${signed.slice(0, -2)}${signed.endsWith('aa') ? 'bb' : 'aa'}`;
    expect(readAdminSessionFromCookie(tampered)).toBeNull();

    expect(readAdminSessionFromCookie(JSON.stringify({ role: 'admin', accessStatus: 'inactivo' }))).toBeNull();
    expect(readAdminSessionFromCookie(JSON.stringify({ role: 'user', accessStatus: 'activo' }))).toBeNull();
  });
});
