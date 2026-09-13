# Implementation Plan: Spa PWA Management

**Branch**: `001-spa-pwa-management` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-spa-pwa-management/spec.md`

## Summary

Build a progressive web application for a beauty spa with a public client area and a protected
administrator area. The public area lets clients browse services and request appointments only from
generated available slots. The administrator area manages pending, confirmed, canceled,
rescheduled, completed and no-show appointments, WhatsApp-assisted confirmations, appointment
history, service catalog content and manual supply inventory movements.

The technical approach is a single web application with clear domain boundaries for public
experience, administration, appointment scheduling, service catalog, availability, WhatsApp
confirmation and inventory. Business rules are isolated from UI components so appointment state,
availability generation and inventory movements can be tested independently.

## Technical Context

**Language/Version**: TypeScript for application code; runtime pinned during project scaffolding to
the active Node.js LTS line.

**Primary Dependencies**: PWA-capable frontend app framework, typed form validation, accessible UI
primitives, date/time utilities, test runner, browser end-to-end test tool. Exact packages are
chosen during implementation tasks and must satisfy the architecture boundaries in this plan.

**Storage**: Persistent application storage required for clients, services, appointments,
availability configuration, state history, WhatsApp confirmation records and inventory movements.
The first implementation may use a simple local/server-backed store, but the domain model must not
depend on a specific storage provider.

**Testing**: Unit tests for domain rules, component/interaction tests for key screens, and
end-to-end tests for client appointment request, admin confirmation, history filtering and inventory
movement flows.

**Target Platform**: Modern mobile and desktop browsers with installable PWA behavior for the client
and administrator experiences.

**Project Type**: Web application / PWA.

**Performance Goals**: Clients can browse services and submit a valid appointment request in under
3 minutes; administrators can confirm or update a pending appointment in under 2 minutes; main
screens provide visible feedback within 1 second for ordinary interactions in acceptance testing.

**Constraints**: No client-side exposure of secrets or administrative data; public users cannot
access administration features; WhatsApp confirmation must be isolated from appointment state so
manual fallback remains possible; appointment availability must be generated from spa configuration,
existing appointments and administrative blocks.

**Scale/Scope**: First version supports one spa location, one administrator role, manual inventory
movements, no online payments and no direct client-side rescheduling. Future professional-level
availability and role separation must remain possible without rewriting the appointment domain.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec-driven delivery: PASS. The plan is derived from `spec.md` and maintains traceability to
  functional requirements FR-001 through FR-032.
- User-centered PWA experience: PASS. The public and administrator flows remain separate and
  focused on service discovery, appointment booking and operational administration.
- Testable quality gates: PASS. The plan defines unit, interaction and end-to-end validation targets
  for scheduling, state changes, WhatsApp fallback, history and inventory.
- Maintainable architecture: PASS. Domain logic is separated from UI, persistence and external
  integration concerns.
- Security, privacy and accessibility: PASS. Administrative access, secret handling, consent for
  WhatsApp and accessible interaction states are explicit constraints.
- Responsible AI usage: PASS. No AI-generated data or external sensitive information is required by
  the implementation plan.

## Project Structure

### Documentation (this feature)

```text
specs/001-spa-pwa-management/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- domain-rules.md
|   `-- ui-flows.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- public/
|   `-- admin/
|-- domain/
|   |-- appointments/
|   |-- availability/
|   |-- services/
|   `-- inventory/
|-- integrations/
|   `-- whatsapp/
|-- shared/
|   |-- accessibility/
|   |-- validation/
|   `-- ui/
`-- storage/

tests/
|-- unit/
|-- integration/
|-- e2e/
`-- accessibility/
```

**Structure Decision**: Use one PWA codebase with separated public/admin app surfaces and domain
modules. Keep scheduling, availability, state transitions, WhatsApp message preparation and
inventory movements testable outside visual components.

## Complexity Tracking

No constitution violations require justification.

## Phase 0 Research

See [research.md](./research.md). All planning unknowns are resolved into bounded first-version
decisions or deferred future decisions.

## Phase 1 Design

See [data-model.md](./data-model.md), [contracts/domain-rules.md](./contracts/domain-rules.md),
[contracts/ui-flows.md](./contracts/ui-flows.md) and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- Spec-driven delivery: PASS. Design artifacts map back to user stories, requirements and
  clarifications in `spec.md`.
- User-centered PWA experience: PASS. Contracts cover public booking and administrator workflows
  without mixing roles.
- Testable quality gates: PASS. Quickstart scenarios and contracts define verifiable behavior for
  primary flows and edge cases.
- Maintainable architecture: PASS. Data model and contracts preserve domain boundaries and keep
  provider-specific details outside business rules.
- Security, privacy and accessibility: PASS. Administrative access, consent, safe errors and
  accessible interactions are preserved in contracts.
- Responsible AI usage: PASS. No sensitive production data is required for design or validation.
