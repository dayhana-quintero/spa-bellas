import { describe, expect, it } from 'vitest';

import { canAccessAdminArea, createAdminSession } from '../../../src/shared/auth';

describe('admin role model', () => {
  it('allows configured admin roles while denying regular users', () => {
    expect(canAccessAdminArea(createAdminSession({ role: 'admin', accessStatus: 'activo' }))).toBe(true);
    expect(canAccessAdminArea(createAdminSession({ role: 'manager', accessStatus: 'activo' }))).toBe(true);
    expect(canAccessAdminArea(createAdminSession({ role: 'user', accessStatus: 'activo' }))).toBe(false);
  });
});
