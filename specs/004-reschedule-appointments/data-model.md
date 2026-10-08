# Data Model: Reschedule Appointments (Reprogramar citas)

## Entities

### Appointment (mutado por este feature)
- id: string (uuid)
- clientId: string (uuid)
- serviceId: string (uuid)
- scheduledStart: ISO datetime — **se actualiza** al nuevo horario
- scheduledEnd: ISO datetime — **se recalcula** con la duración original del servicio
- status: 'pendiente' | 'confirmada' | 'cancelada' | 'vencida' | 'completada' | 'no asistio' | 'reprogramacion solicitada' | 'reprogramada' — **pasa a 'reprogramada'**
- notes: string? — se conserva; la nota del cambio va al historial, no sobreescribe estas notas
- holdExpiresAt: ISO datetime? — se limpia si quedara vencida al moverse
- updatedAt: ISO datetime — se actualiza en cada reprogramación

### AppointmentStatusRecord (rastro de auditoría)
- id: string (uuid)
- appointmentId: string (uuid)
- previousStatus: Appointment['status']
- newStatus: 'reprogramada' (o el mismo estado si ya lo era)
- changedByAdminId: string (uuid) — **identidad real de la sesión**
- changedAt: ISO datetime
- note: string? — **nota automática con fecha anterior → nueva** + nota opcional del administrador

### WhatsAppCommunication (aviso al cliente)
- id: string (uuid)
- appointmentId: string (uuid)
- messageText: string (>= 10 caracteres, con la nueva fecha y hora)
- outcome: 'prepared' | 'sent-by-admin' | 'failed' | 'client-confirmed' | 'manually-recorded'
- outcomeNote: string?
- adminId: string (uuid) — de la sesión, nunca un id fijo
- createdAt: ISO datetime

### RescheduleRequest (entrada de la confirmación)
- appointmentId: string (uuid)
- date: 'YYYY-MM-DD' — día elegido
- slot: 'HH:MM' — hora elegida
- expectedScheduledStart: ISO datetime — fecha actual vista por el admin (para la escritura condicional)
- expectedStatus: Appointment['status'] — estado actual visto por el admin
- note: string? — nota adicional del administrador

### AvailabilitySlot (salida del selector, no persistida)
- time: 'HH:MM'
- startsAt: ISO datetime
- endsAt: ISO datetime

### RescheduleOutcome (resultado de la operación)
- outcome: 'rescheduled' | 'slot-unavailable' | 'client-conflict' | 'stale-appointment' | 'status-not-allowed' | 'past-datetime'
- appointment?: Appointment — presente cuando es 'rescheduled'

## Relationships

- One appointment owns many AppointmentStatusRecord entries; cada reprogramación añade uno sin borrar los anteriores.
- One appointment owns many WhatsAppCommunication entries; el aviso se suma a los eventos ya registrados por el spec 002.
- One appointment belongs to one client and one service; la reprogramación no cambia ninguna de las dos relaciones.
- AvailabilitySlot se deriva de appointments + disponibilidad del spa; no tiene entidad propia en almacenamiento.

## Validation Rules

- Solo se reprograma si el estado es pendiente, confirmada, reprogramacion solicitada o reprogramada (FR-012 veta los terminales).
- Fecha y hora elegidas no pueden estar en el pasado; se recalculan en servidor.
- El nuevo horario debe figurar como libre en el motor de disponibilidad con la propia cita excluida (FR-002/FR-004).
- No puede solaparse con otra cita activa de la misma clienta (FR-005).
- `expectedScheduledStart` y `expectedStatus` deben coincidir con lo persistido; si no, la operación se rechaza sin tocar nada (FR-006).
- `scheduledEnd` se deriva siempre de `scheduledStart` + duración del servicio; no se envía ni se acepta del cliente.
- Toda operación exige sesión administrativa; sin ella no se lee ni se escribe (FR-011).
- El aviso de WhatsApp solo se prepara con consentimiento registrado en la cita (FR-010).

## State Transitions

Antes:

```text
pendiente  -> confirmada | cancelada | vencida
confirmada -> completada | no asistio | cancelada | reprogramacion solicitada
reprogramacion solicitada -> reprogramada | cancelada
reprogramada -> confirmada
cancelada | vencida | completada | no asistio -> (sin salidas)
```

Después de este feature:

```text
pendiente  -> confirmada | cancelada | vencida | reprogramada   (NUEVO)
confirmada -> completada | no asistio | cancelada | reprogramacion solicitada | reprogramada   (NUEVO)
reprogramacion solicitada -> reprogramada | cancelada           (ya existía)
reprogramada -> confirmada | (sigue reprogramada al mover de nuevo: cambio de fecha sin transición)
cancelada | vencida | completada | no asistio -> (sin salidas, sin acción de reprogramar)
```

Reglas derivadas:

- `reprogramada -> reprogramada` no es una transición: si la cita ya está reprogramada solo se actualizan fechas y se añade el registro de auditoría con `previousStatus = newStatus = 'reprogramada'`.
- Los estados terminales no generan transición ni registro; la acción ni siquiera se ofrece (FR-012).
- El resto de transiciones existentes se conservan sin cambios.
