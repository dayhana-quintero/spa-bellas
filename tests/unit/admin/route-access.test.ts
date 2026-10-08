import { describe, expect, it } from 'vitest';

import { evaluateRouteAccess } from '../../../src/shared/auth/access';
import { createAdminSessionCookie } from '../../../src/shared/auth/server';

describe('admin route access evaluation', () => {
  it('allows access when the session cookie is a valid signed admin session', () => {
    const cookie = createAdminSessionCookie({ id: 'a1', name: 'Admin', role: 'admin' });
    const result = evaluateRouteAccess(cookie);

    expect(result.isAllowed).toBe(true);
    expect(result.reason).toBeUndefined();
    expect(result.redirectTo).toBeUndefined();
  });

  it('classifies a missing session as missing-session and redirects to login', () => {
    expect(evaluateRouteAccess(undefined)).toMatchObject({
      isAllowed: false,
      reason: 'missing-session',
      redirectTo: '/admin/login',
    });

    expect(evaluateRouteAccess(null)).toMatchObject({
      isAllowed: false,
      reason: 'missing-session',
      redirectTo: '/admin/login',
    });

    expect(evaluateRouteAccess('')).toMatchObject({
      isAllowed: false,
      reason: 'missing-session',
      redirectTo: '/admin/login',
    });
  });

  it('classifies an expired session as expired-session and redirects to login with reason', () => {
    const cookie = createAdminSessionCookie({ id: 'a1', name: 'Admin', role: 'admin' });
    const [encoded] = cookie.split('.');
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as { expiresAt: number };
    payload.expiresAt = Date.now() - 1000;
    const expiredCookie = `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${cookie.split('.')[1]}`;

    const result = evaluateRouteAccess(expiredCookie);

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('expired-session');
    expect(result.redirectTo).toBe('/admin/login?reason=expired');
  });

  it('classifies an invalid signature cookie as invalid-user', () => {
    const result = evaluateRouteAccess('not-a-real-cookie');

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('invalid-user');
    expect(result.redirectTo).toBe('/admin/access-denied?reason=invalid-user');
  });

  it('classifies a cookie with a non-admin role as denied-role', () => {
    const jsonCookie = JSON.stringify({
      id: 'a1',
      name: 'Guest',
      accessStatus: 'activo',
      role: 'user',
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    });

    const result = evaluateRouteAccess(jsonCookie);

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('denied-role');
    expect(result.redirectTo).toBe('/admin/access-denied?reason=denied-role');
  });

  it('classifies a tampered signed cookie with non-admin role as denied-role', () => {
    const cookie = createAdminSessionCookie({ id: 'a1', name: 'Guest', role: 'admin' });
    const [encoded, signature] = cookie.split('.');
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    payload.role = 'user';
    const tamperedCookie = `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${signature}`;

    const result = evaluateRouteAccess(tamperedCookie);

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('denied-role');
    expect(result.redirectTo).toBe('/admin/access-denied?reason=denied-role');
  });

  it('classifies an inactive admin session as denied-role', () => {
    const jsonCookie = JSON.stringify({
      id: 'a1',
      name: 'Admin',
      accessStatus: 'inactivo',
      role: 'admin',
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    });

    const result = evaluateRouteAccess(jsonCookie);

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('denied-role');
    expect(result.redirectTo).toBe('/admin/access-denied?reason=denied-role');
  });

  it('classifies a valid-role unsigned cookie as invalid-user', () => {
    const jsonCookie = JSON.stringify({
      id: 'a1',
      name: 'Admin',
      accessStatus: 'activo',
      role: 'admin',
    });

    const result = evaluateRouteAccess(jsonCookie);

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toBe('invalid-user');
    expect(result.redirectTo).toBe('/admin/access-denied?reason=invalid-user');
  });
});
