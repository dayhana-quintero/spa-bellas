import { describe, expect, it } from 'vitest';

import {
  canAccessAdminArea,
  createAdminSession,
  isAdminActive,
  requireAdminSession,
} from '../../../src/shared/auth';

describe('admin access', () => {
  it('accepts only a valid active admin session', () => {
    expect(canAccessAdminArea(createAdminSession({ accessStatus: 'activo', role: 'admin' }))).toBe(true);
    expect(isAdminActive(createAdminSession({ accessStatus: 'inactivo', role: 'admin' }))).toBe(false);
    expect(canAccessAdminArea({ accessStatus: 'activo', role: 'user' })).toBe(false);
    expect(canAccessAdminArea(null)).toBe(false);
  });

  it('returns null when the session is not an active admin', () => {
    expect(requireAdminSession(createAdminSession({ accessStatus: 'activo', role: 'admin' })?.role ? createAdminSession({ accessStatus: 'activo', role: 'admin' }) : null)).toMatchObject({ role: 'admin' });
    expect(requireAdminSession({ accessStatus: 'inactivo', role: 'admin' })).toBeNull();
    expect(requireAdminSession({ accessStatus: 'activo', role: 'user' })).toBeNull();
  });
});
