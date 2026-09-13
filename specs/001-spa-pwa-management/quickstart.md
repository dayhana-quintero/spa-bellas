# Quickstart: Spa PWA Management Validation

This guide describes validation scenarios for the planned feature. It does not prescribe a specific
implementation stack.

## Prerequisites

- Feature specification: [spec.md](./spec.md)
- Data model: [data-model.md](./data-model.md)
- Domain rules: [contracts/domain-rules.md](./contracts/domain-rules.md)
- UI flows: [contracts/ui-flows.md](./contracts/ui-flows.md)
- A runnable implementation with test data for services, availability configuration and one active
  administrator.

## Validation Scenario 1: Client Requests an Appointment

1. Open the public area.
2. Browse each required service category.
3. Select a bookable service with a defined duration.
4. Select a date with generated availability.
5. Choose an exact available slot.
6. Enter valid name, WhatsApp-capable phone and consent or contact expectation.
7. Submit the appointment request.

Expected outcome:

- Appointment is created as `pendiente`.
- Selected slot is temporarily held.
- Client sees a clear pending-confirmation message.
- The appointment appears in the administrator pending list.

## Validation Scenario 2: Unavailable Slot Cannot Be Requested

1. Create or identify a date with no generated availability for a service.
2. Open the public appointment request flow for that service and date.
3. Attempt to choose a time not shown as available.

Expected outcome:

- The system does not permit free entry of unavailable times.
- The client sees alternatives or a clear no-availability message.
- No appointment is created for an unavailable slot.

## Validation Scenario 3: Administrator Confirms by WhatsApp

1. Open the administrator area with an active administrator.
2. Open a pending appointment with valid WhatsApp contact data.
3. Prepare the WhatsApp confirmation message.
4. Record the communication outcome.
5. Change appointment state to `confirmada`.

Expected outcome:

- Message includes client name, service, date and time.
- Appointment state changes to `confirmada`.
- A state history record captures previous state, new state, administrator and date.

## Validation Scenario 4: Pending Hold Expires

1. Create a pending appointment.
2. Confirm the selected slot is not available to other clients while the hold is active.
3. Let the hold pass its configured expiration without confirmation.

Expected outcome:

- Appointment moves to `vencida` or is treated as expired according to domain rules.
- The previously held slot becomes available again if no other rule blocks it.
- The expiration is visible to the administrator.

## Validation Scenario 5: Confirmed Appointment Reprogramming

1. Start with a confirmed appointment.
2. Attempt to reprogram from the public area.
3. Open the appointment as administrator.
4. Register that the client contacted the spa by WhatsApp.
5. Choose a new available slot and record the reprogramming.

Expected outcome:

- Public area tells the client to contact the spa by WhatsApp.
- Administrator can register `reprogramacion solicitada`.
- New available slot is selected by administrator.
- Prior appointment time remains traceable.

## Validation Scenario 6: Appointment History

1. Create appointments in multiple states.
2. Open appointment history as administrator.
3. Filter by date range, state, client and service.
4. Open a historical appointment detail.

Expected outcome:

- Matching appointments are listed.
- Empty filters show clear empty state when no records match.
- Detail shows client, service, final state, notes and state change history.

## Validation Scenario 7: Manual Inventory Movement

1. Create a supply with unit, quantity and minimum threshold.
2. Record an entrada.
3. Record a consumo.
4. Record a correccion.
5. Lower quantity to the threshold.

Expected outcome:

- Quantity changes according to manual movements.
- Each movement remains visible with date, reason and administrator.
- Low-stock supply is highlighted.
- Negative quantity is blocked unless an explicit exception is recorded.

## Validation Scenario 8: Accessibility and Error Handling

1. Complete public appointment request using keyboard navigation.
2. Trigger validation errors for missing name, invalid phone and missing slot.
3. Complete administrator appointment update and inventory movement on mobile and desktop viewport
   sizes.

Expected outcome:

- Focus is visible and moves predictably.
- Errors are specific, actionable and do not expose sensitive information.
- Primary tasks remain readable and usable on mobile and desktop.
