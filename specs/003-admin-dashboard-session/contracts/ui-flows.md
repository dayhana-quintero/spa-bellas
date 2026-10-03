# UI Flows: Admin Dashboard and Session Management

## Flow 1: Admin login and dashboard entry

1. User opens the admin route.
2. System checks for valid session cookie.
3. If valid, dashboard loads.
4. If invalid, route redirects to access denied or login screen.

## Flow 2: Summary review

1. Dashboard loads summary cards.
2. User scans metrics for pending, confirmed, low stock and services.
3. User selects a card to open the relevant operational page.

## Flow 3: Access denied

1. Session is absent or expired.
2. System shows the access-denied state.
3. User is sent back to the secure entry point.

## Flow 4: Quick navigation

1. User clicks a dashboard action.
2. App navigates to pending appointments, inventory or service view.
3. User continues in the same admin context without losing authorization.
