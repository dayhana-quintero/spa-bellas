# Domain Rules Contract: Spa PWA Management

This contract defines behavior that implementation and tests must preserve regardless of UI or
storage choices.

## Appointment Availability

- Available slots are generated from spa configuration, service duration, buffer between
  appointments, non-working days, existing active appointments, pending holds, administrator blocks
  and spa capacity.
- A client cannot request an appointment for a slot that is not currently generated as available.
- A pending appointment immediately creates a temporary hold for its selected slot.
- A pending hold expires according to configured hold duration and then releases the slot.
- Confirmed, rescheduled and active pending appointments count against availability.

## Appointment State Changes

Allowed states:

- `pendiente`
- `confirmada`
- `cancelada`
- `reprogramacion solicitada`
- `reprogramada`
- `completada`
- `no asistio`
- `vencida`

Required transitions:

- New public appointment request -> `pendiente`
- `pendiente` -> `confirmada`
- `pendiente` -> `cancelada`
- `pendiente` -> `vencida`
- `confirmada` -> `completada`
- `confirmada` -> `no asistio`
- `confirmada` -> `cancelada`
- `confirmada` -> `reprogramacion solicitada`
- `reprogramacion solicitada` -> `reprogramada`
- `reprogramada` -> `confirmada`

Reprogramming in version 1:


- The client cannot initiate or manage rescheduling from the PWA.
- If a confirmed appointment needs to be rescheduled, the client contacts the spa through WhatsApp.
- The administrator initiates the rescheduling process.
- The administrator selects a new available slot.
- The original appointment remains protected until the new slot is confirmed.
- The administrator records the rescheduling state changes and communicates the new appointment details through WhatsApp.

Audit rules:

- Each administrator-driven state change records previous state, new state, administrator and date.
- State changes must never erase prior state history.
- Public users cannot directly reschedule confirmed appointments in version 1.

## WhatsApp Confirmation

- WhatsApp confirmation requires a valid client phone and recorded consent or clear contact
  expectation.
- The prepared message includes client name, service, date, time and a clear confirmation request.
- Failure to complete the WhatsApp action must allow manual administrator recording.
- WhatsApp outcome does not replace appointment state; the administrator records the final state.

## Service Catalog

- Public catalog includes at least unas, alisados, tratamientos capilares, limpieza facial and
  diseno de cejas.
- Inactive services are hidden from new appointment requests.
- Non-bookable services may be shown only if they cannot initiate a new appointment request.
- Service duration is required before the service can generate appointment availability.

## Inventory

- All supply changes in version 1 are manual movements: entrada, consumo or correccion.
- Inventory movement quantity is positive; movement type determines whether stock increases or
  decreases.
- Stock cannot become negative unless an administrator records an explicit exception.
- Supplies at or below their minimum threshold are shown as low stock.

## Administration

- Version 1 has one administrator role.
- Administrative screens are not accessible from public flows.
- Appointment changes, service catalog changes and inventory movements require administrator access.
