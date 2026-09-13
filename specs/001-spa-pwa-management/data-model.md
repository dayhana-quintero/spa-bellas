# Data Model: Spa PWA Management

## Cliente

Represents a person who requests appointments through the public area.

Fields:

- `id`: Unique identifier.
- `name`: Required display name.
- `phone`: Required WhatsApp-capable contact number.
- `whatsappConsent`: Required consent or clear contact expectation for appointment confirmation.
- `notes`: Optional appointment-related notes.
- `createdAt`: Creation date and time.

Validation rules:

- Name and phone are required before an appointment request can be created.
- Phone must be valid enough for administrator contact by WhatsApp.
- Consent or contact expectation must be recorded before WhatsApp confirmation is initiated.

## Servicio o Procedimiento

Represents an offer visible in the public catalog.

Fields:

- `id`: Unique identifier.
- `category`: One of unas, alisados, tratamientos capilares, limpieza facial or diseno de cejas.
- `name`: Required public service name.
- `description`: Required public explanation.
- `estimatedDuration`: Optional until defined by the business; required for generated availability.
- `priceDisplay`: Optional exact price, range, "desde" value or hidden price policy.
- `isActive`: Whether the service appears in the public catalog.
- `isBookable`: Whether clients can request appointments for this service.

Validation rules:

- Inactive or non-bookable services cannot start new client appointment requests.
- Services used for generated availability must have an estimated duration.

## Configuracion de Disponibilidad

Defines how available appointment slots are generated.

Fields:

- `openingHours`: Opening and closing rules by day.
- `workingDays`: Days when the spa accepts appointments.
- `nonWorkingDays`: Holidays or blocked non-working dates.
- `bufferBetweenAppointments`: Time between appointments.
- `defaultHoldDuration`: Time before a pending appointment hold expires.
- `spaCapacity`: Number of simultaneous appointments the spa can accept.
- `adminBlocks`: Administrator-created blocked times.
- `professionalAvailability`: Future optional availability by professional.

Validation rules:

- Generated slots must respect working days, opening hours, non-working days, service duration,
  buffers, existing appointment holds, confirmed appointments, admin blocks and spa capacity.
- Clients cannot submit a time that was not generated as available.
- Pending holds must expire according to the configured hold duration.

## Cita

Represents an appointment request or booked appointment.

Fields:

- `id`: Unique identifier.
- `clientId`: Related Cliente.
- `serviceId`: Related Servicio o Procedimiento.
- `scheduledStart`: Exact selected appointment start.
- `scheduledEnd`: Derived from service duration and scheduling rules.
- `status`: Current Estado de Cita.
- `notes`: Optional notes from client or administrator.
- `source`: Public request or administrator-created request.
- `holdExpiresAt`: Expiration date and time for pending holds.
- `previousAppointmentId`: Optional link for rescheduled appointments.
- `createdAt`: Creation date and time.
- `updatedAt`: Last update date and time.

Validation rules:

- New public appointment requests start as `pendiente`.
- A pending appointment reserves its selected slot until confirmed, canceled or expired.
- Confirmed and active appointment slots count against availability.
- Public users cannot directly reschedule confirmed appointments in v1.

State transitions:

```text
pendiente -> confirmada
pendiente -> cancelada
pendiente -> vencida
confirmada -> completada
confirmada -> no asistio
confirmada -> cancelada
confirmada -> reprogramacion solicitada
reprogramacion solicitada -> reprogramada
reprogramacion solicitada -> confirmada
reprogramada -> confirmada
```

## Registro de Estado

Represents an auditable appointment state change.

Fields:

- `id`: Unique identifier.
- `appointmentId`: Related Cita.
- `previousStatus`: Status before the change.
- `newStatus`: Status after the change.
- `changedByAdminId`: Administrator responsible for the change.
- `changedAt`: Date and time of the change.
- `note`: Optional explanation.

Validation rules:

- Every administrator-driven appointment status change creates one record.
- Previous and new status cannot be the same.

## Mensaje de Confirmacion

Represents the WhatsApp confirmation message prepared for an appointment.

Fields:

- `id`: Unique identifier.
- `appointmentId`: Related Cita.
- `messageText`: Prepared message with client name, service, date and time.
- `contactPhone`: Destination phone.
- `preparedAt`: Date and time the message was prepared.
- `outcome`: Prepared, sent-by-admin, failed, client-confirmed or manually-recorded.
- `outcomeNote`: Optional administrator note.

Validation rules:

- A message can only be prepared when the appointment has a valid phone and WhatsApp consent.
- Failure to complete WhatsApp must not prevent manual outcome recording.

## Insumo

Represents a material or product used by the spa.

Fields:

- `id`: Unique identifier.
- `name`: Required supply name.
- `category`: Optional grouping.
- `unit`: Required unit of measure.
- `quantityAvailable`: Current quantity.
- `minimumThreshold`: Low-stock threshold.
- `isActive`: Whether the supply is actively tracked.

Validation rules:

- Quantity cannot become negative unless an administrator records an explicit exception.
- Supplies at or below the minimum threshold are low stock.

## Movimiento de Insumo

Represents a manual inventory movement.

Fields:

- `id`: Unique identifier.
- `supplyId`: Related Insumo.
- `type`: Entrada, consumo or correccion.
- `quantity`: Positive movement amount.
- `reason`: Required reason for the movement.
- `adminId`: Administrator responsible.
- `createdAt`: Date and time.

Validation rules:

- All inventory changes in v1 are manual movements.
- Automatic deduction on appointment completion is not allowed in v1.

## Administrador

Represents the single administrative role for version 1.

Fields:

- `id`: Unique identifier.
- `name`: Display name.
- `accessStatus`: Active or inactive.

Validation rules:

- Only active administrators can access the administrative area.
- All appointment state changes and inventory movements require an administrator.
