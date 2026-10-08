---
description: "Tasks for 004-reschedule-appointments (Reprogramar citas)"
---

# Tasks: Reprogramar citas (004-reschedule-appointments)

**Input**: Design documents from `/specs/004-reschedule-appointments/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Incluidos porque el spec y `quickstart.md` exigen criterios verificables (transiciones, rechazos HTTP, accesibilidad y teclado).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Base compartida de pruebas para las historias

- [x] T001 [P] Crear helper de contexto administrativo para e2e en `tests/e2e/fixtures/admin-session.ts` que añada la cookie `admin-session` con `createAdminSessionCookie()` y cierre el contexto, reutilizable por `admin-reschedule.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fundamentos compartidos que DEBEN estar listos antes de cualquier historia

**CRITICAL**: No puede empezar ninguna historia hasta completar esta fase

- [x] T002 [P] Ampliar las transiciones hacia "reprogramada" en `src/domain/appointments/appointment-state-machine.ts` (`pendiente`, `confirmada`) y en el mapa paralelo de `src/domain/appointments/admin-appointment-service.ts`, conservando el resto de transiciones
- [x] T003 [P] Añadir el parámetro opcional `excludeAppointmentId` a `getAvailableSlots` en `src/domain/spa-service.ts` para que la cita propia no cuente como ocupación (research R1)
- [x] T004 [P] Añadir la actualización condicional de la cita en `src/lib/supabase-data.ts` (`updateAppointmentScheduleIfUnchanged`: escribe fechas/estado solo si siguen `scheduledStart` y `status` esperados, y devuelve la fila actualizada o `null`)
- [x] T005 Escribir los tests unitarios de los fundamentos en `tests/unit/admin/reschedule-foundation.test.ts`: transiciones nuevas, estados terminales vetados, exclusión de la propia cita en la ocupación y actualización condicional que falla ante escritura concurrente (depende de T002, T003, T004)

**Checkpoint**: Fundamentos listos; las tres historias pueden avanzar

---

## Phase 3: User Story 1 - Administrador mueve una cita a un horario libre (Priority: P1) — MVP

**Goal**: El administrador puede abrir una cita elegible, ver horarios libres de su servicio y moverla, con revalidación en servidor y trazabilidad.

**Independent Test**: Crear una cita por la API pública, reprogramarla desde el detalle y verificar nueva fecha, estado `reprogramada`, registro en historial con la identidad de sesión y rechazos (409) que dejan la cita intacta.

### Tests for User Story 1

- [x] T006 [P] [US1] Tests unitarios del servicio de reprogramación en `tests/unit/admin/admin-reschedule-service.test.ts`: recálculo de fechas desde `date`+`slot`, rechazo por horario ocupado, solape con otra cita de la misma clienta, estado no elegible, fecha pasada y cita desactualizada (depende de T002, T003, T004)

### Implementation for User Story 1

- [x] T007 [US1] Implementar `rescheduleAppointmentForAdmin` en `src/domain/appointments/admin-reschedule-service.ts`: revalidar con exclusión de la propia cita, comprobar solape de la clienta, aplicar la escritura condicional de T004 y registrar el historial con identidad de sesión y nota automática (depende de T002, T003, T004)
- [x] T008 [P] [US1] Crear `GET /api/admin/slots` en `src/app/api/admin/slots/route.ts` con `requireAdmin`, validación de `serviceId`/`date`/`appointmentId` y respuesta `Slot[]` según [contracts/api.md](./contracts/api.md) (depende de T003)
- [x] T009 [US1] Crear `POST /api/admin/appointments/[id]/reschedule` en `src/app/api/admin/appointments/[id]/reschedule/route.ts` con sesión obligatoria, códigos 400/401/409 y mapeo de `reason` según [contracts/api.md](./contracts/api.md) (depende de T007)
- [x] T010 [P] [US1] Pasar `serviceId` y rango actual al control de estados: actualizar `src/app/admin/appointments/[appointmentId]/page.tsx` y `src/app/admin/appointments/detail-page.tsx` para que `StatusControls` reciba `serviceId` (depende de T002)
- [x] T011 [P] [US1] Crear el panel `src/app/admin/appointments/reschedule-panel.tsx` reutilizando `AppointmentSlotPicker` y `buildSlotPickerState` de `src/app/public/appointments/slot-picker.tsx`: muestra fecha actual, selector, nota opcional, confirmar/cancelar, estados de envío y mensajes de error según [contracts/ui-flows.md](./contracts/ui-flows.md) (depende de T008)
- [x] T012 [US1] Añadir el botón "Reprogramar" en `src/app/admin/appointments/status-controls.tsx`, visible solo en estados elegibles (pendiente, confirmada, reprogramacion solicitada, reprogramada), que despliega `reschedule-panel` y recarga el detalle tras el éxito (depende de T010, T011)
- [x] T013 [US1] E2E del flujo completo en `tests/e2e/admin-reschedule.spec.ts` usando el helper de T001: reprogramación exitosa (fecha nueva + estado + historial), 409 por horario ocupado, 409 por cita cambiada en otra vista, rechazo en estado terminal y 401 sin sesión (depende de T012)

**Checkpoint**: La US1 queda funcional y verificable de forma independiente (MVP)

---

## Phase 4: User Story 2 - Aviso al cliente con el nuevo horario (Priority: P2)

**Goal**: Tras reprogramar, el panel prepara el aviso de WhatsApp con la nueva fecha y hora y lo registra con la identidad del administrador, solo con consentimiento.

**Independent Test**: Reprogramar una cita con consentimiento y verificar que el mensaje contiene el nuevo horario, que el evento aparece en la trazabilidad con el `adminId` de la sesión, y que sin consentimiento la opción no aparece pero la reprogramación completa.

### Tests for User Story 2

- [x] T014 [P] [US2] Tests unitarios de la plantilla de aviso en `tests/unit/whatsapp/reschedule-notice.test.ts`: redacción con la nueva fecha y hora, rechazo sin consentimiento y teléfono inválido (escribirlos antes de T015 y confirmar que fallan)

### Implementation for User Story 2

- [x] T015 [US2] Implementar `prepareRescheduleNoticeMessage` en `src/integrations/whatsapp/whatsapp-confirmation.ts` con las mismas validaciones de consentimiento y teléfono que `prepareConfirmationMessage` y redacción de cambio de horario (research R6)
- [x] T016 [US2] Devolver el bloque `notice` (`available` + `messageText` cuando hay consentimiento) en la respuesta de `POST /api/admin/appointments/[id]/reschedule` en `src/app/api/admin/appointments/[id]/reschedule/route.ts` (depende de T015)
- [x] T017 [US2] Ofrecer "Preparar aviso por WhatsApp" tras el éxito en `src/app/admin/appointments/reschedule-panel.tsx`, abriendo wa.me y registrando el evento vía `POST /api/admin/appointments/[id]/communications` con la sesión real (depende de T016)
- [x] T018 [US2] Ampliar `tests/e2e/admin-reschedule.spec.ts` con el aviso: mensaje con el nuevo horario, evento en la trazabilidad con `adminId` de sesión y ausencia de la opción sin consentimiento (depende de T017)

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Historial conserva el rastro de la reprogramacion (Priority: P3)

**Goal**: Cada reprogramación queda registrada con fecha anterior, nueva fecha, administrador y momento, sin sobrescribirse, y es visible desde el detalle.

**Independent Test**: Reprogramar la misma cita dos veces y verificar dos registros distintos en el historial con la identidad de sesión, más la nueva fecha visible de inmediato en el detalle y la lista.

### Tests for User Story 3

- [x] T019 [P] [US3] Tests unitarios de auditoría en `tests/unit/admin/reschedule-audit.test.ts`: nota automática con fecha anterior → nueva, identidad real del administrador, y que dos reprogramaciones añaden dos registros sin pisarse (depende de T007)

### Implementation for User Story 3

- [x] T020 [P] [US3] Mostrar el historial de estados en el detalle administrativo: renderizar `detail.history` en `src/app/admin/appointments/[appointmentId]/page.tsx` y `src/app/admin/appointments/detail-page.tsx` con fecha anterior, nueva fecha, administrador y nota (depende de T012)
- [x] T021 [US3] Ampliar `tests/e2e/admin-reschedule.spec.ts`: tras confirmar, el detalle muestra la nueva fecha sin pasos extra y el historial de la cita encadena dos reprogramaciones con sus notas (depende de T020)

**Checkpoint**: Las tres historias funcionan de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Calidad transversal exigida por el spec (accesibilidad, validación completa)

- [x] T022 [P] Ampliar `tests/accessibility/admin-appointment-detail.spec.ts` con el panel de reprogramación abierto: axe sin violaciones, etiquetas del selector visibles y flujo completo con teclado (depende de T012)
- [x] T023 Ejecutar la validación completa de `specs/004-reschedule-appointments/quickstart.md` (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npx playwright test`) y corregir cualquier regresión (depende de T013, T018, T021, T022)
- [x] T024 Revisar que la interfaz nueva no expone claves, identificadores de sesión ni datos de otras clientas (FR-015) en `src/app/admin/appointments/reschedule-panel.tsx` y que los mensajes de rechazo usan el texto de `specs/004-reschedule-appointments/contracts/ui-flows.md` (depende de T023)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; empieza de inmediato
- **Foundational (Phase 2)**: Depende de Setup — **bloquea todas las historias**
- **User Story 1 (Phase 3)**: Depende de Foundational — sin dependencias de otras historias
- **User Story 2 (Phase 4)**: Depende de Foundational; necesita la ruta de US1 (T009) para su respuesta `notice` y su e2e
- **User Story 3 (Phase 5)**: Depende de Foundational; necesita el servicio de US1 (T007) y el panel (T012) para observar resultados
- **Polish (Phase 6)**: Depende de las historias elegidas; T023 es la puerta final

### User Story Dependencies

- **US1 (P1)**: Puede arrancar al terminar Foundational; es el MVP
- **US2 (P2)**: Arranca tras Foundational; se integra con la ruta de US1 pero es verificable por su cuenta (consentimiento on/off)
- **US3 (P3)**: Arranca tras Foundational; verificable con dos reprogramaciones seguidas

### Within Each User Story

- Tests primero (deben fallar antes de implementar)
- Servicio de dominio → rutas API → interfaz → e2e
- Historia completa antes de pasar a la siguiente prioridad

### Parallel Opportunities

- T001 ∥ T002 ∥ T003 ∥ T004 (fase inicial, archivos distintos)
- Dentro de US1: T006 ∥ (T007→T008) ∥ T010 → T011
- T014 ∥ T015 (archivo de test distinto al de implementación)
- T019 ∥ T020
- T022 en paralelo con la ampliación del e2e de US3

---

## Parallel Example: User Story 1

```text
# Lanzar juntos (archivos distintos):
Task T006: "Tests unitarios del servicio de reprogramación en tests/unit/admin/admin-reschedule-service.test.ts"
Task T010: "Pasar serviceId al control de estados en src/app/admin/appointments/[appointmentId]/page.tsx"

# Después, en cadena:
Task T007 (servicio) -> T008/T009 (rutas) -> T011 (panel) -> T012 (botón) -> T013 (e2e)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRITICAL — bloquea todo)
3. Completar Phase 3: User Story 1
4. **PARAR Y VALIDAR**: probar la US1 con `npx playwright test admin-reschedule`
5. Demo: reprogramar una cita real de punta a punta

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → validar en solitario → MVP entregable
3. US2 → validar aviso con/sin consentimiento → sin romper US1
4. US3 → validar historial con doble reprogramación → sin romper US1/US2
5. Polish → gates completos en verde

### Validation Gates (cada entrega)

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright test
```

---

## Notes

- `[P]` = archivos distintos y sin dependencias entre tareas incompletas
- `[Story]` vincula la tarea con la historia del spec para trazabilidad
- Cada historia es comprobable de forma independiente (ver "Independent Test")
- Verificar que los tests fallan antes de implementar
- Commitear tras cada tarea o grupo lógico (sin incluir el trabajo de PWA no relacionado que vive en el árbol: `src/app/install-app-button.tsx`, `src/app/manifest.ts`, `src/app/public/page.tsx`)
- Detenerse en cada checkpoint para validar la historia
