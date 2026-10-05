# Admin panel sidebar isolation and dashboard redesign

The change fixes a UX bug where sidebar nav items were incorrectly going active/inactive during dashboard navigation, and simultaneously applies a new visual design to the appointments dashboard page. The root cause was that `useSearchParams` wasn't being used in the sidebar — links like `/admin?status=cancelada` couldn't be distinguished from `/admin` without reading query params. The fix wraps the sidebar's active-state logic in `useSearchParams` + `Suspense`, and introduces sub-layouts for `login` and `access-denied` so the parent `AdminLayout` (which renders the sidebar) is bypassed for those routes. `page.tsx` is restructured to be a pure content region — no wrapper `<aside>`, no outer flex — delegating layout to the parent.

Watch for: **confirmed** — `page.tsx` still fetches `pendingCount` independently from the layout, running the same DB query twice per request. **confirmed** — the `LogoutButton` is rendered twice inside `page.tsx` (once in the footer, and it's already in the sidebar). **possible** — the filter bar's "Fecha" input is hardcoded `readOnly` with a placeholder value, so date filtering is non-functional.

**Verdict**: NEEDS_CHANGES

---

## High-level view

The sidebar's `isActive()` now parses both pathname and search params to determine which nav link is highlighted. The `/admin` root link is active when `status` is absent or `'pendiente'`; explicit status links match only when both pathname and status align. This correctly handles all four nav links without ambiguity.

The `Suspense` wrapper around `AdminSidebarInner` is mandatory because `useSearchParams` suspends in RSC-heavy trees. The boundary uses `fallback={null}`, which means the sidebar flashes invisible on hard navigation — acceptable for an admin tool, but worth noting.

The sub-layouts for `login` and `access-denied` are minimal pass-throughs that short-circuit the parent `AdminLayout`. This prevents the sidebar from rendering on those routes at the Next.js layout level, which is cleaner than the previous pathname-guard in the sidebar itself — though that guard is still present as a secondary defense.

`page.tsx` correctly omits any outer shell (`<aside>`, flex wrapper) and starts directly at `<main>`. The visual redesign matches the brief: outer card `rounded-[28px] bg-[#f7f2ef]`, two-column appointment grid, per-appointment action buttons. The data is live — `listAppointmentsForAdmin` is called with the resolved `status` param from `searchParams`.

---

<details>
<summary>Issues (4)</summary>

1. **Double `pendingCount` query** — `AdminLayout` fetches `listAppointmentsForAdmin({ status: 'pendiente' })` to populate the sidebar badge, and `page.tsx` fetches it again independently (line `const pendingCount = (await listAppointmentsForAdmin({ status: 'pendiente' })).length`). The variable is never read in `page.tsx`'s JSX — it's dead code that runs a full DB query. Delete the line.

2. **Duplicate `LogoutButton`** — `page.tsx` renders `<LogoutButton />` in a footer `<div>` at the bottom of `<main>` (confirmed, last ~6 lines of the JSX). The sidebar already renders `<LogoutButton />` in its own footer area. The user will see two logout buttons on every dashboard screen. Remove the one in `page.tsx`.

3. **Date filter non-functional** — The "Fecha" input in the filter bar is `type="text"` with a hardcoded `value="dd/mm/aaaa"` and `readOnly`. It submits no useful value and the server-side filtering in `page.tsx` has no `date` param handler. Either wire it up (change to `type="date"`, give it a `name`, and handle it in `searchParams`) or remove it from the form to avoid misleading operators.

4. **Sidebar flash on hard navigation** — `<Suspense fallback={null}>` around the sidebar means the 256px sidebar column is absent from the initial render until `useSearchParams` resolves client-side, causing a visible layout shift. A width-preserving skeleton would prevent the reflow.

</details>

<details>
<summary>Details</summary>

### Dead `pendingCount` query in `page.tsx`

`AdminLayout` calls `listAppointmentsForAdmin({ status: 'pendiente' })` and passes the count to `AdminSidebar`. `page.tsx` makes an identical call:

```ts
const pendingCount = (await listAppointmentsForAdmin({ status: 'pendiente' })).length;
```

The variable is never referenced in `page.tsx`'s JSX. `getAdminDashboardSummary()` already provides `summary.pendingAppointments` for the KPI card. The fetch is dead code that still runs a full DB query on every page render. Delete the line.

### `Suspense` fallback causes sidebar flash

`AdminSidebar` wraps `AdminSidebarInner` in `<Suspense fallback={null}>`. On hard navigation, the sidebar is absent from the initial HTML until the client resolves `useSearchParams`, causing a visible layout shift where the 256px sidebar column disappears and reappears. A skeleton or a width-preserving placeholder would prevent the reflow, but for an internal admin tool this is low priority.

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `admin-sidebar.tsx` | Rewritten to use `useSearchParams`; `isActive()` reads both pathname and status param; wrapped in `Suspense` |
| `layout.tsx` | Now an async Server Component; fetches `pendingCount` and passes it to `AdminSidebar` |
| `login/layout.tsx` | New minimal pass-through layout to bypass `AdminLayout` for the login route |
| `access-denied/layout.tsx` | New minimal pass-through layout to bypass `AdminLayout` for the access-denied route |
| `page.tsx` | Full redesign: new visual card layout, two-column appointment grid, status badge, filter bar, KPI metrics, low-stock alert; no sidebar wrapper |

Full diff: `git diff main -- src/app/admin/`

</details>
