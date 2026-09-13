import { z } from 'zod';

export const supplyMovementTypeSchema = z.enum(['entrada', 'consumo', 'correccion']);

export const supplyMovementSchema = z.object({
  id: z.string().uuid(),
  supplyId: z.string().uuid(),
  type: supplyMovementTypeSchema,
  quantity: z.number().positive(),
  reason: z.string().min(3, 'reason must be at least 3 characters'),
  adminId: z.string().uuid(),
  createdAt: z.coerce.date(),
});

export type SupplyMovement = z.infer<typeof supplyMovementSchema>;
