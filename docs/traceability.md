# Traceability matrix

## Purpose

This document maps the functional requirements from the feature specification to the implementation and validation artifacts in the project.

## Matrix

| Requirement | Description | Implementation area | Validation evidence |
| --- | --- | --- | --- |
| FR-001 to FR-008 | Public service browsing and appointment request | Public app pages, service catalog domain, appointment domain | Public booking tests and domain validation tests |
| FR-009 to FR-018 | Admin appointment flow and status history | Admin app pages and appointment domain | Admin flow and history unit tests |
| FR-019 | Admin catalog management | Service catalog domain and admin service UI | Service catalog tests |
| FR-020 to FR-023 | Inventory management | Inventory domain and admin inventory UI | Inventory E2E and accessibility tests |
| FR-024 | Error and safe messaging | Shared validation and UI messaging | Accessibility and validation checks |
| FR-025 | Mobile and desktop accessible UX | UI components and accessibility tests | Admin inventory accessibility tests |
| FR-026 | WhatsApp consent/expectation | Appointment and integration contracts | Business rules and implementation review |
| FR-027 to FR-032 | Availability rules and scheduling constraints | Availability domain and scheduling logic | Domain tests and spec review |

## Validation mapping

### Public booking flow

- Public booking and availability behavior is enforced by the domain rules under `src/domain/appointments` and `src/domain/availability`.
- The public-facing pages are surfaced through the app routes under `src/app/public`.
- Acceptance validation is represented by the booking and service tests in the project test suite.

### Admin management flow

- Protected admin access is enforced by `src/app/admin/layout.tsx` and `src/shared/auth`.
- Administration actions are implemented through the domain services and admin screens under `src/app/admin`.
- Validation evidence includes the admin auth tests and the inventory E2E suite.

### Service catalog flow

- Admin catalog management is implemented in `src/domain/services` and the admin service UI.
- Validation: unit tests for service catalog rules and public/service catalog behavior.

### Inventory flow

- Inventory entries, movements and thresholds are handled in the inventory domain and storage layer.
- Validation: inventory E2E and accessibility tests run successfully in the current workspace.

## Release readiness note

The implementation is traceable back to the user stories and requirements in the specification. The remaining work is primarily final release documentation and polish, not missing core functionality.
