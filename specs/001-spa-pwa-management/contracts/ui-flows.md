# UI Flow Contract: Spa PWA Management

This contract defines user-visible flows and acceptance expectations.

## Public Service Discovery

Entry: Client opens the public area.

Expected behavior:

1. Client sees service categories for unas, alisados, tratamientos capilares, limpieza facial and
   diseno de cejas.
2. Client opens a category and sees available services or procedures.
3. Each service shows enough detail to decide whether to request an appointment.
4. Services that are not bookable do not allow appointment requests.

Success signal: Client can find a service and start booking without administrator help.

## Public Appointment Request

Entry: Client selects a bookable service.

Expected behavior:

1. Client selects a date.
2. System shows only generated available exact slots for that service and date.
3. Client selects one available slot.
4. Client enters required contact details and optional notes.
5. System validates required data and WhatsApp contact expectation.
6. System creates a pending appointment and temporary hold.
7. Client sees confirmation that the spa will confirm the appointment.

Error states:

- Missing required data keeps the entered data and explains what must be corrected.
- No available slots shows a clear empty state and does not allow free-text time entry.
- Invalid phone prevents WhatsApp confirmation and must be corrected before submission.

## Admin Pending Appointment Management

Entry: Administrator opens pending appointments.

Expected behavior:

1. Administrator sees pending appointments with client, service, date, time and hold status.
2. Administrator opens appointment details.
3. Administrator prepares a WhatsApp confirmation message.
4. Administrator records the communication outcome.
5. Administrator changes the appointment state to confirmed, canceled or reprogramacion solicitada.
6. For rescheduling, the administrator selects a new generated available slot and updates the appointment according to the rescheduling rules.
7. The administrator communicates the new appointment details through WhatsApp.
8. System records all state changes with responsible administrator.

Success signal: Administrator can complete the pending appointment decision in under 2 minutes
during acceptance testing.

## Admin Appointment History

Entry: Administrator opens appointment history.

Expected behavior:

1. Administrator filters by status, date range, client or service.
2. System shows matching appointments or a clear empty state.
3. Administrator opens an appointment and reviews client, service, final state, notes and state
   change history.

Success signal: All historical records matching the selected filters are visible and understandable.

## Admin Service Catalog Management

Entry: Administrator opens service catalog management.

Expected behavior:

1. Administrator creates or edits service name, category, description, availability, duration and
   price display when defined.
2. Administrator activates or deactivates services.
3. Public catalog reflects active service information.
4. Non-bookable or inactive services cannot start new appointment requests.

Success signal: Public service information matches administrator-approved catalog data.

## Admin Inventory Management

Entry: Administrator opens inventory.

Expected behavior:

1. Administrator creates supplies with name, unit, quantity and minimum threshold.
2. Administrator records manual entries, consumptions or corrections.
3. System updates available quantity and keeps the movement history.
4. Supplies at or below threshold are highlighted as low stock.

Error states:

- Negative stock is blocked unless the administrator records an explicit exception.
- Empty inventory or filtered results show clear empty states.

Success signal: Administrator can identify low-stock supplies without manual calculation.
