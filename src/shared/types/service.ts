import { z } from 'zod';

export const serviceSchema = z.object({
id: z.string().uuid(),
category: z.enum(['unas','alisados','tratamientos capilares','limpieza facial','diseno de cejas']),
name: z.string().min(7),
description: z.string().min(15),
estimatedDuration: z.number().positive().optional(),
priceDisplay: z.string().optional(),
isActive: z.boolean(),
isBookable: z.boolean()
})

export type Service = z.infer<typeof serviceSchema>