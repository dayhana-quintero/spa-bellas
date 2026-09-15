import { describe, expect, it } from 'vitest';

import {
  canAccessAdminArea,
  createAdminSession,
  isAdminActive,
  requireAdminSession,
} from '../../../src/shared/auth';

describe('admin auth logic', () => {
  it('allows access for an active admin session', () => {
    const session = createAdminSession({
      id: 'a1',
      name: 'Admin',
      accessStatus: 'activo',
      role: 'admin',
    });

    expect(isAdminActive(session)).toBe(true);
    expect(canAccessAdminArea(session)).toBe(true);
    expect(requireAdminSession(session)?.id).toBe('a1');
  });

  it('denies access for inactive or missing sessions', () => {
    expect(canAccessAdminArea(null)).toBe(false);
    expect(canAccessAdminArea({ role: 'admin', accessStatus: 'inactivo' })).toBe(false);
    expect(requireAdminSession(null)).toBeNull();
  });
});
