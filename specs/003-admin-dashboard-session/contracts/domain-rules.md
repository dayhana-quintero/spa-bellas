# Domain Rules: Admin Dashboard and Session Management

## Session Rules

- A protected admin route must validate session identity before rendering.
- A session without a valid admin user is denied and redirected.
- Expired sessions must be rejected and cleared.

## Dashboard Rules

- Summary cards must reflect live store data, not cached UI-only values.
- Pending findings should come from the appointment state machine.
- Low-stock alerts should be based on the minimum threshold and current quantity.
- Dashboard data must not expose sensitive client details beyond the operational summary.

## Audit Rules

- All admin actions should retain the responsible admin actor.
- The dashboard may summarize events, but not replace exact appointment history.
- User access failures should be traceable for support and debugging.
