# API Contracts: Reschedule Appointments (Reprogramar citas)

Ambas rutas pertenecen al área protegida de administración: exigen cookie de sesión de admin (patrón `requireAdmin`).

## GET /api/admin/slots

Horarios libres del servicio para un día, excluyendo la ocurrencia actual de la cita que se está reprogramando.

Query:

| Param | Tipo | Requerido | Notas |
|---|---|---|---|
| serviceId | uuid | sí | servicio de la cita |
| date | `YYYY-MM-DD` | sí | día a consultar |
| appointmentId | uuid | sí | propia cita; se ignora al calcular ocupación |

Respuestas:

- `200` → `Array<{ time: "HH:MM", startsAt: ISO, endsAt: ISO }>` (vacío si el día no tiene huecos o el servicio está inactivo)
- `400` → `{ "error": "Parámetros inválidos." }`
- `401` → `{ "error": "No autorizado." }`

## POST /api/admin/appointments/{id}/reschedule

Confirma la reprogramación. El servidor recalcula fechas, revalida y escribe de forma condicional.

Body:

```json
{
  "date": "2026-10-20",
  "slot": "16:00",
  "expectedScheduledStart": "2026-10-08T15:00:00.000Z",
  "expectedStatus": "confirmada",
  "note": "La clienta pidió cambiar de día"
}
```

`note` es opcional. `date`, `slot`, `expectedScheduledStart` y `expectedStatus` son obligatorios.

Respuestas:

- `200` → `{ "appointment": { "id", "status", "scheduledStart", "scheduledEnd" }, "statusRecord": { "previousStatus", "newStatus", "changedAt", "note" }, "notice": { "available": true, "messageText": "…" } | { "available": false } }`
  - `notice.available` refleja el consentimiento de WhatsApp de la cita (FR-010).
- `400` → `{ "error": "…" }` — cuerpo inválido o fecha u hora pasadas.
- `401` → `{ "error": "No autorizado." }` — sin sesión; no se lee ni se escribe nada.
- `409` → `{ "error": "…", "reason": "slot-unavailable" | "client-conflict" | "stale-appointment" | "status-not-allowed" }` — cualquier rechazo de negocio; la cita queda intacta.

Errores de negocio mapeados (mensaje mostrado por la interfaz):

| reason | error |
|---|---|
| slot-unavailable | "Ese horario ya no está libre. Elige otro." |
| client-conflict | "La clienta ya tiene otra cita que se cruza con ese horario." |
| stale-appointment | "La cita cambió desde otra pestaña. Revisa su estado antes de reprogramar." |
| status-not-allowed | "Esta cita ya no se puede reprogramar." |

## POST /api/admin/appointments/{id}/communications (reutilizado)

Registro del aviso de reprogramación; contrato ya existente y verificado en el spec 002:

- Body: `{ "messageText": string, "outcome": "prepared" | "sent-by-admin" | "failed" | "client-confirmed" | "manually-recorded", "outcomeNote"?: string }`
- `200` → registro persistido con `adminId` de la sesión · `401` sin sesión · `400` si el mensaje o el resultado son inválidos.

## Invariantes

- Ninguna respuesta expone claves, identificadores de sesión o datos de otras clientas.
- Toda respuesta de rechazo (`409`) garantiza que la cita no fue modificada.
- Los códigos `4xx` nunca dejan escrituras parciales.
