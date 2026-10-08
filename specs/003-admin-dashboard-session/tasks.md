---
description: "Tareas de implementacion para el dashboard administrativo y la sesion segura"
---

# Tasks: Admin Dashboard and Session Management

**Input**: Documentos de diseno de `specs/003-admin-dashboard-session/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1: Session and Access

- [x] T001 Reforzar la validacion de sesion administrativa en rutas protegidas.
- [x] T002 Definir el estado de acceso para sesion missing, expired y denied.
- [x] T003 Crear la pantalla de acceso denegado y flujo de redireccion segura.

## Phase 2: Dashboard Core

- [x] T004 Derivar resumen operativo desde citas, servicios e inventario existentes.
- [x] T005 Construir tarjetas de KPI y alertas de stock bajo.
- [x] T006 Integrar el dashboard con las rutas actuales de citas, historial e inventario.

## Phase 3: UX and Admin Flow

- [x] T007 Diseñar la vista del dashboard principal con navegacion rapida.
- [x] T008 Agregar acciones directas desde KPI a pantallas operativas.
- [x] T009 Mostrar estados de carga y error accionables en el panel.

## Phase 4: Validation

- [x] T010 Cubrir validacion de sesion y acceso denegado con pruebas unitarias.
- [x] T011 Cubrir resumen operativo del dashboard con pruebas de integracion.
- [x] T012 Cubrir accesibilidad y navegacion del dashboard administrativo.
- [x] T013 Ejecutar pruebas de compilacion, unitarias e integracion para la feature.

## Notas de validacion (2026-10-07)

- `npm run typecheck`: sin errores.
- `npm test` (vitest): 36 archivos / 76 pruebas en verde.
- `npm run build`: compilacion correcta.
- `npm run test:e2e` (Playwright): specs de e2e y accesibilidad en verde.
- Cobertura nueva: `src/proxy.ts` (bloqueo previo al render de `/admin`),
  `src/app/admin/loading.tsx` + `src/app/admin/error.tsx` (T009),
  `tests/integration/admin/dashboard-flow.test.ts` (T011),
  `tests/accessibility/admin-dashboard.spec.ts` y
  `tests/e2e/admin-route-protection.spec.ts` (T012).
