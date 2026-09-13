---
description: "Tareas de implementacion para la PWA de gestion del spa"
---

# Tasks: Spa PWA Management

**Input**: Documentos de diseno de `specs/001-spa-pwa-management/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Se incluyen tareas de pruebas porque la Constitution y el plan exigen cobertura automatizada o verificacion documentada para criterios de aceptacion, reglas de agenda, permisos, accesibilidad e integraciones.

**Organization**: Las tareas estan agrupadas por historia de usuario para permitir implementacion y validacion incremental.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar la PWA y sus herramientas de calidad segun `plan.md`.
- [x ] T001 Inicializar el proyecto Next.js con TypeScript y App Router, configurando los scripts de desarrollo, compilación y pruebas en `package.json`.

- [x ] T002 Crear la estructura base de carpetas `src/app/public`, `src/app/admin`, `src/domain`, `src/integrations`, `src/shared`, `src/storage` y `tests`
- [x] T003 [P] Configurar formateo, linting y comprobacion de tipos en `package.json`, `tsconfig.json` y los archivos de configuracion correspondientes
- [x] T004 [P] Configurar el runner de pruebas unitarias, de integracion, E2E y los comandos asociados en `tests/` y los archivos de configuracion de pruebas
- [x] T005 [P] Configurar la estrategia PWA, manifiesto, iconos y service worker en `src/app/` y los archivos publicos del proyecto
- [x] T006 [P] Crear la configuracion de entornos y variables no sensibles en `.env.example` y `src/shared/config/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Construir contratos y servicios compartidos que bloquean todas las historias.

**Critical**: Ninguna historia de usuario puede comenzar antes de completar esta fase.

- [x] T007 Definir tipos y esquemas compartidos para clientes, servicios, citas, configuracion de disponibilidad, bloqueos, usuarios administradores, mensajes WhatsApp e insumos en `src/shared/types/`
- [ ] T008 [P] Implementar validacion de datos de entrada, normalizacion de telefono y mensajes de error seguros en `src/shared/validation/`
- [ ] T009 [P] Implementar manejo de errores, estados de carga, estados vacios y registro estructurado sin datos sensibles en `src/shared/errors/` y `src/shared/logging/`
- [ ] T010 Implementar autenticacion y autorizacion del unico rol administrador en `src/shared/auth/` y proteger las rutas de `src/app/admin/`
- [ ] T011 Implementar interfaces de repositorio y adaptador de persistencia para las entidades del modelo en `src/storage/`
- [ ] T012 Implementar acceso atomico para crear solicitudes y retener horarios, evitando doble reserva concurrente, en `src/storage/appointments/`
- [ ] T013 [P] Crear componentes UI compartidos accesibles para formularios, alertas, tablas, dialogos, botones, navegacion y foco visible en `src/shared/ui/`
- [ ] T014 [P] Configurar pruebas de accesibilidad, viewport movil/escritorio y utilidades de datos de prueba en `tests/accessibility/`, `tests/e2e/fixtures/` y `tests/helpers/`
- [ ] T015 Implementar el shell de navegacion separado para area publica y area administrativa en `src/app/` con rutas protegidas y estados de acceso denegado

**Checkpoint**: La base de la aplicacion, persistencia, autorizacion, validacion y componentes accesibles estan listas.

---

## Phase 3: User Story 1 - Consultar servicios y solicitar una cita (Priority: P1) MVP

**Goal**: Permitir que una cliente consulte servicios publicados y registre una solicitud pendiente usando un horario generado por el spa.

**Independent Test**: Con servicios, configuracion de disponibilidad y un administrador activos, una cliente puede navegar por las cinco categorias, elegir un servicio, seleccionar una fecha y un horario publicado, enviar sus datos y ver una solicitud `pendiente` con el horario retenido.

### Tests for User Story 1

- [ ] T016 [P] [US1] Cubrir reglas de generacion de horarios por apertura, cierre, dias de atencion, duracion, buffer, citas, bloqueos, festivos, capacidad y fecha en `tests/unit/availability/availability-generator.test.ts`
- [ ] T017 [P] [US1] Cubrir validacion de telefono, campos obligatorios, notas opcionales y consentimiento de contacto en `tests/unit/appointments/appointment-request-validation.test.ts`
- [ ] T018 [P] [US1] Cubrir creacion pendiente, retencion temporal y rechazo de doble solicitud para el mismo horario en `tests/integration/appointments/appointment-request.test.ts`
- [ ] T019 [P] [US1] Cubrir el flujo publico completo, ausencia de horarios y conservacion de datos tras errores en `tests/e2e/public-booking.spec.ts`
- [ ] T020 [P] [US1] Verificar teclado, foco, etiquetas, contraste y mensajes de error del catalogo y formulario publico en `tests/accessibility/public-booking.spec.ts`

### Implementation for User Story 1

- [ ] T021 [P] [US1] Crear entidades y repositorios de servicio, categoria y configuracion de disponibilidad en `src/domain/services/` y `src/domain/availability/`
- [ ] T022 [P] [US1] Implementar la generacion de horarios exactos disponibles, excluyendo citas activas, holds, bloqueos y no laborables, en `src/domain/availability/generate-available-slots.ts`
- [ ] T023 [US1] Implementar reglas de creacion de cliente, solicitud pendiente, consentimiento y hold temporal en `src/domain/appointments/create-appointment-request.ts`
- [ ] T024 [US1] Implementar consultas publicas del catalogo y horarios disponibles en `src/domain/services/public-catalog.ts` y `src/domain/availability/availability-service.ts`
- [ ] T025 [US1] Construir la navegacion publica por categorias y detalle de servicio en `src/app/public/services/`
- [ ] T026 [US1] Construir el selector de fecha y horarios generados, incluyendo estados sin disponibilidad y sin entrada libre de hora, en `src/app/public/appointments/slot-picker.tsx`
- [ ] T027 [US1] Construir el formulario publico de solicitud con conservacion de datos, validacion accionable y expectativa de contacto por WhatsApp en `src/app/public/appointments/appointment-request-form.tsx`
- [ ] T028 [US1] Construir la confirmacion visible de solicitud pendiente y resumen de datos no sensibles en `src/app/public/appointments/appointment-request-confirmation.tsx`
- [ ] T029 [US1] Conectar catalogo, selector, formulario y persistencia mediante el flujo publico en `src/app/public/appointments/appointment-request-flow.tsx`

**Checkpoint**: La historia P1 de cliente es demostrable y testeable sin depender de las pantallas administrativas.

---

## Phase 4: User Story 2 - Gestionar citas pendientes y confirmar por WhatsApp (Priority: P1)

**Goal**: Permitir al administrador revisar solicitudes, preparar y registrar la comunicacion por WhatsApp y cambiar estados con auditoria.

**Independent Test**: Con una solicitud pendiente existente, el administrador autenticado puede verla, preparar un mensaje con los datos requeridos, registrar el resultado de comunicacion y pasarla a `confirmada`, `cancelada` o `reprogramacion solicitada` conservando el historial.

### Tests for User Story 2

- [ ] T030 [P] [US2] Cubrir transiciones validas e invalidas, expiracion de holds y auditoria de cambios en `tests/unit/appointments/appointment-state-machine.test.ts`
- [ ] T031 [P] [US2] Cubrir mensaje base, consentimiento, telefono invalido y registro manual cuando falla WhatsApp en `tests/unit/whatsapp/whatsapp-confirmation.test.ts`
- [ ] T032 [P] [US2] Cubrir autorizacion administrativa y aislamiento de datos publicos en `tests/integration/admin/admin-access.test.ts`
- [ ] T033 [P] [US2] Cubrir lista de pendientes, detalle, confirmacion, cancelacion y solicitud de reprogramacion en `tests/e2e/admin-pending-appointments.spec.ts`
- [ ] T034 [P] [US2] Verificar accesibilidad del tablero, dialogo de WhatsApp y controles de estado en `tests/accessibility/admin-appointments.spec.ts`

### Implementation for User Story 2

- [ ] T035 [P] [US2] Implementar la maquina de estados, transiciones permitidas y registro inmutable de historial en `src/domain/appointments/appointment-state-machine.ts`
- [ ] T036 [P] [US2] Implementar expiracion de solicitudes pendientes y liberacion de holds en `src/domain/appointments/expire-pending-appointments.ts`
- [ ] T037 [US2] Implementar servicio administrativo de consulta y actualizacion de citas en `src/domain/appointments/admin-appointment-service.ts`
- [ ] T038 [US2] Implementar contrato de preparacion de mensajes, resultado de comunicacion y fallback manual en `src/integrations/whatsapp/whatsapp-confirmation.ts`
- [ ] T039 [US2] Implementar adaptador aislado para abrir WhatsApp sin exponer secretos y registrar resultado en `src/integrations/whatsapp/whatsapp-adapter.ts`
- [ ] T040 [US2] Construir lista administrativa de citas pendientes con estado de hold, datos de contacto minimizados y acciones disponibles en `src/app/admin/appointments/pending/`
- [ ] T041 [US2] Construir detalle administrativo de cita con historial de estados, notas y accion de WhatsApp en `src/app/admin/appointments/detail/`
- [ ] T042 [US2] Construir controles de cambio de estado y formulario de resultado manual en `src/app/admin/appointments/status-controls/`
- [ ] T043 [US2] Ejecutar y conectar la tarea de expiracion de holds con la consulta de disponibilidad en `src/domain/appointments/appointment-expiration-job.ts`

**Checkpoint**: La operacion P1 de confirmacion y actualizacion de citas funciona con WhatsApp opcional y fallback manual.

---

## Phase 5: User Story 3 - Consultar y administrar historial de citas (Priority: P2)

**Goal**: Permitir al administrador localizar citas por filtros y revisar su detalle historico y trazabilidad.

**Independent Test**: Con citas en multiples estados y fechas, el administrador puede aplicar filtros por estado, rango, cliente y servicio, ver resultados o estado vacio y abrir el detalle con estado final, notas e historial.

### Tests for User Story 3

- [ ] T044 [P] [US3] Cubrir combinacion de filtros, ordenamiento, paginacion o carga incremental y estado vacio en `tests/unit/appointments/appointment-history-query.test.ts`
- [ ] T045 [P] [US3] Cubrir filtros y detalle historico desde la interfaz administrativa en `tests/e2e/admin-appointment-history.spec.ts`
- [ ] T046 [P] [US3] Verificar lectura accesible de filtros, resultados, tablas y detalle historico en `tests/accessibility/admin-history.spec.ts`

### Implementation for User Story 3

- [ ] T047 [US3] Implementar consulta de historial por estado, rango de fechas, cliente y servicio, incluyendo resultados vacios, en `src/domain/appointments/appointment-history-service.ts`
- [ ] T048 [US3] Implementar mapeo de filtros y paginacion sobre el repositorio de citas en `src/storage/appointments/appointment-history-repository.ts`
- [ ] T049 [US3] Construir controles accesibles de filtros y lista de historial en `src/app/admin/appointments/history/`
- [ ] T050 [US3] Construir vista de detalle historico con estado final, notas, datos de servicio y linea de tiempo de estados en `src/app/admin/appointments/history/appointment-history-detail.tsx`

**Checkpoint**: El administrador puede consultar el historial operativo sin perder la trazabilidad de una cita.

---

## Phase 6: User Story 4 - Gestionar inventario de insumos (Priority: P2)

**Goal**: Permitir crear insumos, registrar movimientos manuales, controlar niveles minimos y conservar el historial.

**Independent Test**: El administrador puede crear un insumo, registrar entradas, consumos y correcciones, ver la cantidad actual, detectar bajo stock y recibir bloqueo ante stock negativo no exceptuado.

### Tests for User Story 4

- [ ] T051 [P] [US4] Cubrir calculo de stock, umbral minimo, movimientos positivos, correcciones y excepcion explicita a stock negativo en `tests/unit/inventory/inventory-rules.test.ts`
- [ ] T052 [P] [US4] Cubrir persistencia y auditoria de movimientos con administrador, fecha, motivo y tipo en `tests/integration/inventory/inventory-movements.test.ts`
- [ ] T053 [P] [US4] Cubrir alta de insumo, movimiento, alerta de bajo stock y validacion de cantidad en `tests/e2e/admin-inventory.spec.ts`
- [ ] T054 [P] [US4] Verificar accesibilidad de tabla, formulario, alertas y estado vacio del inventario en `tests/accessibility/admin-inventory.spec.ts`

### Implementation for User Story 4

- [ ] T055 [P] [US4] Implementar entidades, reglas de stock y movimientos `entrada`, `consumo` y `correccion` en `src/domain/inventory/`
- [ ] T056 [US4] Implementar servicio administrativo de insumos, umbral bajo y excepcion documentada en `src/domain/inventory/inventory-service.ts`
- [ ] T057 [US4] Implementar repositorios de insumos y movimientos con auditoria en `src/storage/inventory/`
- [ ] T058 [US4] Construir vista administrativa de inventario con indicador de bajo stock y estado vacio en `src/app/admin/inventory/inventory-page.tsx`
- [ ] T059 [US4] Construir formularios de alta y edicion de insumos con unidad, cantidad y umbral minimo en `src/app/admin/inventory/supply-form.tsx`
- [ ] T060 [US4] Construir formulario de movimiento manual, validacion de stock y consulta de movimientos en `src/app/admin/inventory/inventory-movement-form.tsx`

**Checkpoint**: El administrador puede controlar existencias y justificar cada ajuste sin que el stock negativo ocurra accidentalmente.

---

## Phase 7: User Story 5 - Mantener informacion del catalogo de servicios (Priority: P3)

**Goal**: Permitir al administrador mantener servicios publicados, duracion, disponibilidad y orientacion de precio sin romper la agenda.

**Independent Test**: El administrador puede crear o editar un servicio, activar o desactivar su publicacion y verificar que el area publica muestre la version vigente y bloquee nuevas solicitudes para servicios inactivos o no agendables.

### Tests for User Story 5

- [ ] T061 [P] [US5] Cubrir validacion de duracion requerida para disponibilidad, activacion, desactivacion y servicios no agendables en `tests/unit/services/service-catalog-rules.test.ts`
- [ ] T062 [P] [US5] Cubrir reflejo del catalogo aprobado en el flujo publico y bloqueo de nuevas solicitudes para servicios inactivos en `tests/e2e/admin-service-catalog.spec.ts`
- [ ] T063 [P] [US5] Verificar accesibilidad del editor de servicios y sus estados de guardado y error en `tests/accessibility/admin-service-catalog.spec.ts`

### Implementation for User Story 5

- [ ] T064 [P] [US5] Implementar reglas de catalogo, categorias requeridas, duracion, disponibilidad y estado publicable en `src/domain/services/service-catalog-rules.ts`
- [ ] T065 [US5] Implementar servicio administrativo CRUD de servicios y procedimientos en `src/domain/services/admin-service-catalog.ts`
- [ ] T066 [US5] Implementar persistencia de catalogo y version vigente para lectura publica en `src/storage/services/`
- [ ] T067 [US5] Construir lista y editor administrativo de servicios con activar/desactivar y validacion de duracion en `src/app/admin/services/`
- [ ] T068 [US5] Conectar la lectura publica y la generacion de horarios con el catalogo activo y agendable en `src/app/public/services/` y `src/domain/availability/`

**Checkpoint**: El catalogo administrativo controla de forma consistente lo que la cliente ve y puede agendar.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verificar el producto completo contra la Constitution, los contratos y el quickstart.

- [ ] T069 [P] Ejecutar auditoria de permisos, secretos, minimizacion de datos y mensajes WhatsApp en `src/shared/auth/`, `src/integrations/whatsapp/` y `docs/security-review.md`
- [ ] T070 [P] Completar estados de carga, error, exito, expiracion y recuperacion en las superficies publicas y administrativas bajo `src/app/`
- [ ] T071 [P] Ejecutar pruebas responsive y de accesibilidad sobre los flujos criticos en `tests/accessibility/` y `tests/e2e/`
- [ ] T072 [P] Revisar rendimiento de carga e interaccion frente a las metas del plan y documentar resultados en `docs/performance-review.md`
- [ ] T073 Verificar los ocho escenarios de `specs/001-spa-pwa-management/quickstart.md` y registrar evidencia en `docs/validation/quickstart-results.md`
- [ ] T074 Revisar trazabilidad FR-001 a FR-032, criterios de aceptacion y reglas de `contracts/` frente a la implementacion en `docs/traceability.md`
- [ ] T075 Ejecutar lint, comprobacion de tipos, pruebas unitarias, integracion, E2E y accesibilidad; documentar comandos, resultados y riesgos pendientes en `docs/release-checklist.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias externas; T001-T006 pueden iniciarse en paralelo cuando no compartan archivos.
- **Foundational (Phase 2)**: Depende de Phase 1 y bloquea todas las historias.
- **US1 (Phase 3)**: Depende de Phase 2; es el MVP funcional inicial.
- **US2 (Phase 4)**: Depende de Phase 2 y de los contratos de citas de US1 para operar solicitudes creadas por clientes.
- **US3 (Phase 5)**: Depende de Phase 2 y de la entidad/historial de citas; puede iniciar tras T035 y T037.
- **US4 (Phase 6)**: Depende de Phase 2; es independiente del dominio de citas y puede desarrollarse en paralelo con US3.
- **US5 (Phase 7)**: Depende de Phase 2 y debe integrarse con catalogo y disponibilidad de US1; puede comenzar tras T021 y T024.
- **Polish (Phase 8)**: Depende de las historias que se incluyan en la entrega.

### User Story Dependencies

- **US1 (P1)**: Phase 2 -> US1; no depende de otra historia.
- **US2 (P1)**: Phase 2 -> US2; usa la solicitud y el hold definidos en US1, pero sus reglas se prueban de forma aislada.
- **US3 (P2)**: Phase 2 + historial de citas de US2; no cambia el flujo de agendamiento.
- **US4 (P2)**: Phase 2 -> US4; completamente independiente de citas.
- **US5 (P3)**: Phase 2 + contratos de catalogo y disponibilidad usados por US1.

### Within Each User Story

- Las pruebas deben escribirse antes o junto a la implementacion y fallar ante la ausencia de comportamiento.
- Modelos, esquemas y reglas preceden a servicios; servicios preceden a pantallas e integraciones.
- Una historia se considera completa solo cuando su prueba independiente y su checkpoint pasan.

### Parallel Opportunities

- En Phase 1: T003-T006 pueden ejecutarse en paralelo si se coordinan archivos de configuracion.
- En Phase 2: T008, T009, T013 y T014 son paralelizables; T010-T012 requieren el contrato compartido de T007.
- En US1: T016-T020 son pruebas paralelizables; T021 y T022 pueden avanzar en paralelo; T025-T028 pueden dividirse por pantalla una vez listos los servicios.
- En US2: T030-T034 son pruebas paralelizables; T035, T036 y T038 pueden dividirse por modulo; T040-T042 pueden avanzar en paralelo tras los servicios.
- US3 y US4 pueden ejecutarse en paralelo despues de Foundation.
- US5 puede avanzar en paralelo con US3/US4 despues de estabilizar catalogo y disponibilidad.

## Parallel Example: MVP (US1)

```text
T016 availability-generator.test.ts
T017 appointment-request-validation.test.ts
T018 appointment-request.test.ts
T019 public-booking.spec.ts
T020 public-booking.spec.ts (accessibility)

T021 entidades y repositorios de servicios/disponibilidad
T022 generate-available-slots.ts

T025 navegacion publica
T026 selector de slots
T027 formulario de solicitud
T028 confirmacion visible
```

## Implementation Strategy

### MVP First (US1 + soporte minimo)

1. Completar Phase 1 y Phase 2.
2. Completar US1 con catalogo inicial, disponibilidad generada, solicitud pendiente y hold temporal.
3. Completar US2 minimo para que el administrador confirme, cancele o solicite reprogramacion y registre WhatsApp.
4. Ejecutar los escenarios 1 a 5 del quickstart y detenerse para validar el flujo operativo principal.

### Incremental Delivery

1. Agregar US3 para historial y trazabilidad consultable.
2. Agregar US4 para inventario manual y alertas de bajo stock.
3. Agregar US5 para mantenimiento del catalogo.
4. Completar Phase 8 antes de una entrega productiva.

### Scope Notes

- La configuracion concreta de horarios, dias, buffers, capacidad, duracion de holds, festivos y profesionales debe quedar parametrizable; no se deben inventar valores de negocio en las tareas.
- La reprogramacion publica de citas confirmadas y la deduccion automatica de insumos quedan fuera de esta primera implementacion, conforme a las aclaraciones de `spec.md`.

