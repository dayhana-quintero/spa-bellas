import {  z } from 'zod';

export const availabilitySchema = z.object({
spaCapacity: z.number().positive().int(),
bufferBetweenAppointments: z.number().positive(),
defaultHoldDuration: z.number().positive(),
workingDays: z.array(z.enum(['lunes','martes','miercoles','jueves','viernes','sabado','domingo'])),
nonWorkingDays: z.array(z.coerce.date()),
openingHours: z.record(
  z.enum(['lunes','martes','miercoles','jueves','viernes','sabado','domingo']),
  z.object({ opensAt: z.number().positive(), closesAt: z.number().positive() })
),
adminBlocks: z.array(
  z.object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    reason: z.string().optional(),
  })
),
professionalAvailability: z.unknown().optional(),
})


export type Availability = z.infer<typeof availabilitySchema>