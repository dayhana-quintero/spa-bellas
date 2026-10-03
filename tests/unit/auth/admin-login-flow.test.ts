import { describe, expect, it } from 'vitest';

import { isAdminCodeValid } from '../../../src/shared/auth/server';

describe('admin login flow', () => {
  it('accepts the configured admin code and rejects invalid attempts', () => {
    expect(isAdminCodeValid('spa-admin')).toBe(true);
    expect(isAdminCodeValid('wrong-code')).toBe(false);
    expect(isAdminCodeValid('')).toBe(false);
    expect(isAdminCodeValid(null)).toBe(false);
  });
});
