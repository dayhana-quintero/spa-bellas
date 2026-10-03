# Implementation Plan: Spa WhatsApp Automation

**Branch**: `002-spa-whatsapp-automation` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-spa-whatsapp-automation/spec.md`

## Summary

Build the operational WhatsApp flow for the spa so an administrator can review a pending appointment, generate a message with customer details, trigger WhatsApp confirmation, capture a manual fallback result and keep a complete audit trail. The feature extends the existing scheduling domain without changing the public-facing booking flow.

## Technical Context

**Language/Version**: TypeScript with the existing Next.js app structure.

**Primary Dependencies**: existing domain services for appointments, WhatsApp integration abstraction,
accessible UI components, test runners for unit and e2e flows.

**Storage**: Use the existing domain-first persistence model. WhatsApp results and state transitions should be stored with the appointment history in the same ownership boundary as appointment events.

**Testing**: Unit tests for message generation, state transitions and manual fallback; integration tests for admin workflow; e2e tests for pending appointment confirmation and failure recovery.

**Target Platform**: Mobile and desktop browsers in the same PWA app.

**Project Type**: Web application / operational workflow extension.

**Performance Goals**: Admin can prepare a confirmation and record the result within 2 minutes; message generation completes instantly; history and state changes remain visible in the detail view without reload.

**Constraints**: No secrets in the browser; manual fallback remains possible; messages must be safe and non-sensitive; dated audit records are immutable.

## Project Structure

```text
specs/002-spa-whatsapp-automation/
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

## Phase 0 Research

See [research.md](./research.md).

## Phase 1 Design

See [data-model.md](./data-model.md), [contracts/domain-rules.md](./contracts/domain-rules.md), [contracts/ui-flows.md](./contracts/ui-flows.md), [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- Spec-driven delivery: PASS.
- User-centered flow: PASS.
- Testable quality gates: PASS.
- Maintainable architecture: PASS.
- Security and privacy: PASS.
- Responsible AI usage: PASS.
