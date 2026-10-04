import { z } from 'zod';

export const supplySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'name must be at least 2 characters'),
  category: z.string().optional(),
  unit: z.string().min(1, 'unit is required'),
  quantityAvailable: z.number().int().min(0),
  minimumThreshold: z.number().int().min(0),
  isActive: z.boolean(),
});

export type Supply = z.infer<typeof supplySchema>;
