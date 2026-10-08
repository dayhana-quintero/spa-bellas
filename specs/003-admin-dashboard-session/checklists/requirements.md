# Requirements Checklist: Admin Dashboard and Session Management

**Fecha de verificacion**: 2026-10-07

## Functional
- [x] Protected admin routes require a valid session.
      (`src/proxy.ts` bloquea `/admin/:path*` antes del render; `admin/layout.tsx` y
      `admin/page.tsx` revalidan; verificado en `tests/e2e/admin-route-protection.spec.ts`)
- [x] Dashboard shows operational summary cards.
      (5 tarjetas KPI en `src/app/admin/page.tsx` + alertas de stock bajo)
- [x] Access-denied and expired-session states are handled.
      (`/admin/access-denied?reason=...` y `/admin/login?reason=expired`,
      cobiertos por `tests/unit/admin/route-access.test.ts`)
- [x] Navigation cards link to present admin flows.
      (citas pendientes, historial, servicios, inventario; click verificado en
      `tests/accessibility/admin-dashboard.spec.ts`)
- [x] Inventory and appointment summaries come from live data.
      (`getAdminDashboardSummary()` consulta citas, servicios e inventario remotos
      y degrada al almacenamiento local si no hay Supabase)

## Security
- [x] No dashboard renders when session is invalid.
      (el proxy redirige antes de que se serialicen datos RSC al cliente)
- [x] Session expiration is enforced.
      (firma + `expiresAt` validados en `src/shared/auth/server.ts`)
- [x] Sensitive data is minimized in summary views.
      (el resumen expone solo conteos, umbrales y nombres operativos)

## UX
- [x] Layout is readable on mobile and desktop.
      (escaneos axe en escritorio y movil: `tests/accessibility/admin-dashboard.spec.ts`)
- [x] Focus states remain visible.
      (recorrido de teclado verificado en `tests/accessibility/public-booking.spec.ts`)
- [x] Error states are clear and actionable.
      (`src/app/admin/error.tsx` con reintento e `src/app/admin/loading.tsx`)

## Validation
- [x] Unit tests cover session logic and summary calculations.
      (`tests/unit/admin/route-access.test.ts`, `tests/unit/shared/admin-session-cookie.test.ts`,
      `tests/unit/admin/dashboard-summary.test.ts`)
- [x] Integration tests cover route protection.
      (`tests/integration/admin/dashboard-flow.test.ts`,
      `tests/e2e/admin-route-protection.spec.ts`)
- [x] Accessibility checks cover dashboard cards and actions.
      (`tests/accessibility/admin-dashboard.spec.ts`, 3 escaneos axe sin violaciones)
