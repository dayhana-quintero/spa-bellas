# Requirements Checklist: Admin Dashboard and Session Management

## Functional
- [ ] Protected admin routes require a valid session.
- [ ] Dashboard shows operational summary cards.
- [ ] Access-denied and expired-session states are handled.
- [ ] Navigation cards link to present admin flows.
- [ ] Inventory and appointment summaries come from live data.

## Security
- [ ] No dashboard renders when session is invalid.
- [ ] Session expiration is enforced.
- [ ] Sensitive data is minimized in summary views.

## UX
- [ ] Layout is readable on mobile and desktop.
- [ ] Focus states remain visible.
- [ ] Error states are clear and actionable.

## Validation
- [ ] Unit tests cover session logic and summary calculations.
- [ ] Integration tests cover route protection.
- [ ] Accessibility checks cover dashboard cards and actions.
