# Quickstart: WhatsApp Workflow

## Scenario 1: Admin opens contact flow

1. Login as administrator.
2. Navigate to pending appointments.
3. Open a pending appointment.
4. Use the WhatsApp action.
5. Verify that a generated message is shown with name, service, date and time.

## Scenario 2: Message is prepared and edited

1. Open a pending appointment.
2. Adjust the generated message text.
3. Save the edited message.
4. Verify the final message is displayed in the appointment detail.

## Scenario 3: WhatsApp fails and fallback is recorded

1. Trigger the contact action in a simulated failed environment.
2. Record the fallback manual result.
3. Verify the communication log stores the manual outcome.
4. Verify the state change is recorded with admin id and note.

## Scenario 4: Client confirms appointment

1. Admin marks the appointment as confirmed.
2. Verify the audit trail records the previous status and the new status.
3. Confirm the pending hold is released or transitioned according to domain rules.

## Scenario 5: Reprogramacion requested

1. Admin records a client request to reprogram.
2. Verify the appointment state changes to reprogramacion_solicitada.
3. Confirm the history keeps the reason and admin actor.
