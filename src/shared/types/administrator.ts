import { z } from 'zod';

export const adminSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'name must be at least 2 characters'),
  accessStatus: z.enum(['activo', 'inactivo']),
});

export type Administrator = z.infer<typeof adminSchema>;
