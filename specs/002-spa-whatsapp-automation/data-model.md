# Data Model: Spa WhatsApp Automation

## Entities

### Appointment
- id: string
- clientId: string
- serviceId: string
- appointmentDate: ISO date
- slot: time string
- status: pending | confirmed | canceled | reprogramacion_solicitada | reprogramada | completada | no_asistio
- consent: boolean
- createdAt: ISO datetime
- updatedAt: ISO datetime

### Client
- id: string
- name: string
- phone: string
- notes?: string
- consentForWhatsApp: boolean

### CommunicationAttempt
- id: string
- appointmentId: string
- direction: outbound
- status: prepared | sent | failed | responded | manual_fallback
- messageText: string
- sentAt?: ISO datetime
- createdByAdminId?: string
- result?: string
- notes?: string

### AppointmentStateEvent
- id: string
- appointmentId: string
- previousStatus: string
- nextStatus: string
- changedAt: ISO datetime
- changedByAdminId: string
- note?: string

### WhatsAppMessageTemplate
- key: string
- subject: string
- content: string
- usedFor: pending | reprogramacion | cancellation

## Relationships

- One client has many appointments.
- One appointment has many communication attempts.
- One appointment has many state events.
- One admin can create many communication attempts and state events.

## Validation Rules

- A pending appointment needs a valid client phone and consent before WhatsApp can be opened.
- A message template must include service, date and time.
- A state change cannot be recorded without a previous and next status.
- Manual fallback must create both a communication log and a state-event record when the outcome changes the appointment.
