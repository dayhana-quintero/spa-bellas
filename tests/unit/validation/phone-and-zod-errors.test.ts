import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { normalizePhone } from '../../../src/shared/validation/phone';
import { formatZodErrors } from '../../../src/shared/validation/formatZodErrors';

describe('validation helpers', () => {
  it('normalizes common phone inputs', () => {
    expect(normalizePhone('+52 55 1234 5678')).toBe('+525512345678');
    expect(normalizePhone('(55) 1234-5678')).toBe('+525512345678');
    expect(normalizePhone('5512345678')).toBe('+525512345678');
    expect(normalizePhone('')).toBe('');
  });

  it('formats zod errors into field keyed messages', () => {
    const schema = z.object({
      name: z.string().min(3),
      phone: z.string().min(10),
    });

    const result = formatZodErrors(
      schema.safeParse({ name: 'Al', phone: '1' }).error as z.ZodError,
    );

    expect(result.name).toContain('al menos');
    expect(result.phone).toContain('al menos');
  });
});
