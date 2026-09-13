# Research: Spa PWA Management

## Decision: Single PWA With Public and Admin Surfaces

Rationale: The feature has one business domain and two user surfaces. A single PWA codebase keeps
shared service catalog, appointment and availability rules consistent while allowing public and
administrator navigation to remain separate.

Alternatives considered:

- Separate public and admin applications: rejected for the first version because it increases setup
  and deployment work before the domain is stable.
- Public-only first release: rejected because administrator confirmation and state changes are
  required for appointment value.

## Decision: Availability Is a Domain Rule, Not Free Text

Rationale: The client must only select exact slots generated from spa configuration, service
duration, appointment holds, confirmed appointments and administrative blocks. This prevents
unbounded requests and makes conflict tests deterministic.

Alternatives considered:

- Client proposes any date and time: rejected because it creates manual conflict resolution for
  every request.
- Administrator-only scheduling: rejected because the client experience requires self-service
  appointment requests.

## Decision: Pending Appointment Holds Reserve the Slot Temporarily

Rationale: Creating a pending request should prevent duplicate requests for the same slot while the
administrator confirms or cancels. A hold expiration keeps abandoned requests from blocking the
calendar forever.

Alternatives considered:

- Reserve only after confirmation: rejected because multiple clients could request the same slot.
- Reserve pending slots without expiration: rejected because missed administrative action could
  block future booking.

## Decision: One Administrator Role in Version 1

Rationale: A single administrator role is sufficient for the first release and reduces permission
complexity. The model still records the responsible administrator for auditability.

Alternatives considered:

- Receptionist and owner roles: deferred until the business needs separate duties.
- Professional-specific roles: deferred until professional-level availability is introduced.

## Decision: WhatsApp Confirmation Is Administrator-Assisted

Rationale: The specification requires WhatsApp confirmation but does not require automated
conversation handling. Preparing a message and letting the administrator record the outcome provides
value while keeping appointment state reliable if WhatsApp cannot be completed.

Alternatives considered:

- Fully automated WhatsApp conversations: deferred because it introduces consent, delivery and
  message-state complexity beyond the first version.
- No WhatsApp integration: rejected because confirmation through WhatsApp is a core requirement.

## Decision: Inventory Movements Are Manual in Version 1

Rationale: Manual entries, consumptions and corrections match the clarified scope. This avoids
assuming per-service supply recipes before the spa has defined them.

Alternatives considered:

- Automatic supply deduction when appointments are completed: deferred for a future version.
- Mixed automatic/manual inventory: rejected for v1 because it requires service-to-supply
  consumption rules that are not part of current scope.

## Decision: Accessibility and Privacy Are Acceptance Constraints

Rationale: The Constitution makes accessibility, privacy and safe error messages product
requirements. These concerns must be part of validation, not post-release polish.

Alternatives considered:

- Treat accessibility and privacy as implementation refinements: rejected by the Constitution.
