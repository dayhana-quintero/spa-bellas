# Quickstart: Admin Dashboard and Session Management

## Scenario 1: Admin logs in and sees dashboard

1. Open the admin route.
2. Enter a valid admin code or credentials.
3. Verify the dashboard loads with a summary section.
4. Confirm the page shows pending, confirmed and operational metrics.

## Scenario 2: Invalid session is rejected

1. Open the admin area with no valid session.
2. Verify the app redirects to access denied or login route.
3. Confirm no dashboard data is rendered.

## Scenario 3: Expired session is cleaned up

1. Use an expired or invalid cookie/session.
2. Verify the route denies access.
3. Confirm the auth state is cleared from the browser or server response.

## Scenario 4: Dashboard navigation links work

1. Open dashboard overview.
2. Click to pending appointments or inventory sections.
3. Verify the user lands on the correct operational screen.

## Scenario 5: Inventory alerts show priority order

1. Seed an item below threshold.
2. Open the dashboard.
3. Confirm the item appears in the alert list with the proper relevance level.
