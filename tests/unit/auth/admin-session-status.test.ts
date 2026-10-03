import { describe, expect, it } from 'vitest';

import { DELETE } from '../../../src/app/api/admin/session/route';
import { getAdminSessionState } from '../../../src/shared/auth';
import { createAdminSessionCookie, isAdminSessionAuthenticated, parseAdminSession } from '../../../src/shared/auth/server';

describe('admin session status', () => {
  it('confirms a valid signed admin session and rejects expired or invalid ones', () => {
    const valid = createAdminSessionCookie();
    expect(isAdminSessionAuthenticated(valid)).toBe(true);
    expect(parseAdminSession(valid)?.role).toBe('admin');

    expect(isAdminSessionAuthenticated('not-a-real-cookie')).toBe(false);
    expect(isAdminSessionAuthenticated('')).toBe(false);
  });

  it('classifies missing, expired and denied session states', () => {
    expect(getAdminSessionState(undefined)).toBe('missing');
    expect(getAdminSessionState('not-a-real-cookie')).toBe('denied');

    const expiredCookie = createAdminSessionCookie({
      id: 'expired-user',
      name: 'Expirada',
      role: 'admin',
    });

    const expiredPayload = expiredCookie.split('.')[0];
    const expiredSession = JSON.parse(Buffer.from(expiredPayload, 'base64url').toString('utf8')) as { expiresAt: number };
    expiredSession.expiresAt = Date.now() - 1000;

    const tamperedCookie = `${Buffer.from(JSON.stringify(expiredSession)).toString('base64url')}.${expiredCookie.split('.')[1]}`;
    expect(getAdminSessionState(tamperedCookie)).toBe('expired');
  });

  it('removes the admin session cookie with an immediate expiration during logout', () => {
    const response = DELETE();
    const cookieValue = response.headers.get('set-cookie') ?? '';

    expect(cookieValue).toContain('admin-session=');
    expect(cookieValue).toContain('Path=/');
    expect(cookieValue).toContain('Max-Age=0');
    expect(cookieValue).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });
});
