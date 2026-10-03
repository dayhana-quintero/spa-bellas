import { describe, expect, it } from 'vitest';

import { findAdminUserByCode } from '../../../src/shared/auth';

describe('admin user directory', () => {
  it('resolves a privileged admin user from a valid code and rejects unknown access codes', () => {
    expect(findAdminUserByCode('spa-admin')?.role).toBe('admin');
    expect(findAdminUserByCode('unknown-code')).toBeNull();
    expect(findAdminUserByCode('')).toBeNull();
  });
});
