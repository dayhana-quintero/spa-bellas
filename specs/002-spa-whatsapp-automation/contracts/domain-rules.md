# Domain Contract: WhatsApp and Appointment State Rules

## Rules

1. A pending appointment may send WhatsApp only if the client phone is valid and consent is present.
2. A WhatsApp message must include name, service, date and time.
3. Any state change must create an immutable audit event.
4. Manual fallback is allowed when the outbound action fails.
5. Reprogramacion solicitada requires an explicit admin action and note.
6. A canceled or confirmed appointment cannot be reopened without a separate admin flow.
7. The history must be append-only for communication attempts and status events.

## Errors

- Invalid phone: "No es posible iniciar la confirmacion porque el telefono no es valido."
- Missing consent: "Debe existir consentimiento previo para confirmar por WhatsApp."
- Failed transmission: "No se pudo completar la comunicacion; registra el resultado manualmente."
