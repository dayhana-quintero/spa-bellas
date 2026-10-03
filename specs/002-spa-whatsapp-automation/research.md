# Research: Spa WhatsApp Automation

## Decision Summary

This feature should extend the existing appointment domain rather than create a parallel flow. The admin panel already manages appointments and state transitions, so the WhatsApp integration should be implemented as a thin adapter plus an event log tied to each appointment.

## Key findings

1. The admin workflow already has a pending appointment view and state machine, so WhatsApp is a communication action within that existing domain rather than a separate product.
2. The project must keep user safety and data minimization in mind: only the necessary fields are included in outgoing messages.
3. A real WhatsApp integration should be optional and isolated behind an adapter interface to preserve manual fallback and tests.
4. Every message and result should be persisted as part of the appointment history, not as a side-effect in UI-only state.

## Decision Details

### Messaging format
The message includes:
- client name
- service name
- date
- time
- instruction to confirm or reply

It excludes internal IDs, sensitive admin metadata and anything not necessary for customer confirmation.

### Hour and state handling
State changes triggered by WhatsApp must remain consistent with the appointment state machine. A pending appointment can transition to confirmed, canceled, or rescheduled requested only through a recorded admin action.

### Manual fallback
If the external WhatsApp action fails, the admin must be able to record the outcome manually without losing traceability. This is essential because the first version must work even without a live WhatsApp API.

### Data ownership
The appointment history will own both state transitions and communication events. This keeps the audit record consistent and reduces accidental drift between UI state and persisted domain state.

## Deferred decisions

- Real WhatsApp Business API integration can be added later by swapping the adapter implementation.
- Actual outbound message sending should remain behind a service boundary to avoid browser leakage of secrets.
