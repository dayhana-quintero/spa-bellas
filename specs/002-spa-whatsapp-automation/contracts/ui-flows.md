# UI Flow Contract: WhatsApp Workflow

## Main flows

### Flow A: Pending appointment to WhatsApp action
1. Admin opens a pending appointment detail.
2. System displays service, date, time and client data.
3. Admin clicks "WhatsApp".
4. System opens message composer with the generated text.
5. Admin confirms or edits the message.
6. System records the communication attempt.

### Flow B: Fallback manual outcome
1. Admin hits a failed send state.
2. System exposes a manual resolution action.
3. Admin records the outcome and note.
4. System updates appointment state and stores a communication event.

### Flow C: State transition audit
1. Admin changes appointment to confirmed or reprogramacion_solicitada.
2. System records previous and next statuses.
3. History shows both the communication result and the state change.

## UI states
- pending
- preparing message
- failed send
- manual fallback
- confirmed
- canceled
- reprogramacion_solicitada

## Accessibility requirements
- Focus visible for all buttons and dialogs.
- Meaningful labels for WhatsApp composer, fallback form and state controls.
- Clear success and error messaging without exposing hidden internal metadata.
