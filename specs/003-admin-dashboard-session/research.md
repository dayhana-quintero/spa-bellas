# Research: Admin Dashboard and Session Management

## Decision Summary

This feature should build on the existing signed-cookie admin session and the domain-first data model. The dashboard is not a separate persistence layer; it should read from the same store used for appointments, services, and inventory, while route protection remains the security boundary.

## Key findings

1. The project already has session-aware admin routing via cookies, so the dashboard feature should augment that flow instead of creating a parallel auth model.
2. The current app has business data for appointments and inventory, so summary cards should be derived from those domain sources rather than duplicated in a separate store.
3. The dashboard should support low-friction admin decisions by linking to established flows instead of creating redundant screens.
4. Security should be enforced at route boundaries, while UX can still show helpful error states to the user.

## Decision Details

### Session model
The admin session remains a short-lived, signed server-side token with a minimal user identity. This keeps the MVP simple and avoids introducing a user table prematurely.

### Dashboard KPIs
The first dashboard version should show:
- pending appointments
- confirmed appointments
- expired or blocked appointments
- active services
- low-stock products

### Navigation model
The dashboard should act as the landing view after login and offer direct navigation to:
- pending appointments
- appointment history
- inventory list
- service catalog

### Access strategy
Routes remain protected by server checks before page rendering. Any invalid session leads to redirect or access-denied state without leaking admin data.

## Deferred decisions

- Multi-user roles and RBAC can be introduced after the dashboard exists.
- A real database-backed session store is optional for MVP and should be added only if the product requires multi-user persistence.
