import { z } from 'zod';

export const serviceSchema = z.object({
  id: z.string().trim().min(1),
  category: z.string().min(2),
  name: z.string().min(3),
  description: z.string().min(15),
  estimatedDuration: z.number().positive().optional(),
  priceDisplay: z.string().optional(),
  isActive: z.boolean(),
  isBookable: z.boolean(),
});

export type Service = z.infer<typeof serviceSchema>;