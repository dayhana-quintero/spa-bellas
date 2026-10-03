# Implementation Plan: Admin Dashboard and Session Management

**Branch**: `003-admin-dashboard-session` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-admin-dashboard-session/spec.md`

## Summary

Build the missing admin dashboard and session shell for the spa. The feature extends the existing admin access flow so the user sees a concise operational summary, restricted routes remain protected, and the dashboard links back to the established business flows for pending appointments, inventory, and history.

## Technical Context

**Language/Version**: TypeScript on the existing Next.js app router.

**Primary Dependencies**: existing admin auth cookie flow, appointment domain services, service catalog, inventory metrics, and UI primitives.

**Storage**: Continue with the current local-first domain model. Session protection remains server-driven with signed cookies; dashboard metrics are derived from the same spa data store.

**Testing**: Unit tests for dashboard summary derivation and session rules; integration tests for protected routes and redirect behavior; accessibility checks for the admin shell.

**Target Platform**: Desktop and mobile admin screens within the same PWA app.

**Project Type**: Web application / admin operations extension.

**Performance Goals**: Dashboard loads instantly from current in-memory/local data; protected routes reject unauthorized access before rendering the layout.

## Project Structure

```text
specs/003-admin-dashboard-session/
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
