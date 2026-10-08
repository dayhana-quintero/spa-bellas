# Domain Rules: Reschedule Appointments (Reprogramar citas)

## Eligibility Rules

- The reschedule action is available only for statuses: pendiente, confirmada, reprogramacion solicitada, reprogramada.
- Cancelled, expired, completed and no-show appointments never expose the action, and the server rejects them too.
- Rescheduling is an admin-only operation; a request without a valid admin session is refused without reading or changing data.

## Availability Rules

- Slot availability comes from the same engine as public booking: opening hours, working days, admin blocks, service duration plus buffer, spa capacity and blocking appointments/holds.
- The appointment being rescheduled is excluded from occupancy calculations; otherwise a partial move (for example 10:00 → 10:30) would be rejected by its own current occurrence.
- Past dates and times are never offered, and a past datetime that reaches the server is rejected.
- The server recalculates start and end from the submitted date and time; client-supplied ranges are never trusted.
- When a whole day has no free slots the flow reports it as an empty state, not as an error.

## Conflict Rules

- The new slot must still be free at confirmation time; otherwise the operation fails and the appointment keeps its original date (FR-004).
- The new slot must not overlap another active appointment of the same client (FR-005).
- The stored appointment must still match the date and status the admin saw; a mismatch means another admin changed it and the operation is refused without modifying anything (FR-006).

## Atomicity Rules

- Applying the change updates the appointment (start, end, status, updatedAt), writes the status history record and returns the result in one operation.
- Any failing step leaves the appointment exactly as it was: no half-moved appointments, no history entries for failed attempts.

## State Rules

- A rescheduled appointment ends in status "reprogramada", keeping it when it was already "reprogramada".
- Pendiente and confirmada gain a direct transition to reprogramada; every other existing transition stays the same.
- Terminal statuses gain no transitions and no reschedule action.

## Audit Rules

- Every successful reschedule writes a status history record with previous status, new status, the admin identity from the session and the change timestamp.
- The record always carries an automatic note with the previous and new date-time; the admin note is optional and appended to it.
- Failed attempts write no history, so the trail only contains real changes.
- WhatsApp notice events are stored with the admin identity from the session, never with a fixed identifier.

## Notification Rules

- The notice message contains the service, the new date and the new time in client-facing wording about the change.
- The notice is prepared only when the client granted WhatsApp consent when booking; without consent the reschedule still completes and no notice is offered.
- Blocking the WhatsApp window is reported to the admin and never affects the reschedule result.

## Error Communication Rules

- Every rejection maps to one clear message: slot taken, overlap with another appointment of the same client, appointment changed elsewhere, status not eligible, date/time in the past.
- Errors keep the admin in the appointment context with the selected day still visible for another attempt.

## Privacy Rules

- The flow exposes no service keys, session identifiers or other clients' data; the phone number appears only in the admin detail, as elsewhere in the panel.
