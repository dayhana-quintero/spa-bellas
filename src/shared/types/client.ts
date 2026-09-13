import { z } from 'zod';

export const clienteSchema = z.object({
id: z.string().uuid(),
name: z.string().min(3,'name must be at least 3 characters'),
phone: z.string().min(12).max(15),
whatsappConsent: z.boolean(),
notes: z.string().optional(),
createdAt: z.coerce.date(),
})

export  type Cliente = z.infer<typeof clienteSchema>

