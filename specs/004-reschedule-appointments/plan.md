# Implementation Plan: Reschedule Appointments (Reprogramar citas)

**Branch**: `004-reschedule-appointments` | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-reschedule-appointments/spec.md`

## Summary

Añade la capacidad, hoy inexistente, de mover una cita existente a otro horario libre desde el detalle administrativo. El flujo reutiliza el motor de disponibilidad de la reserva pública (aprendido a excluir la propia cita para no rechazarse a sí misma), revalida en el servidor con actualización condicional, registra el cambio en el historial con la identidad del administrador, deja la cita en estado "reprogramada" y prepara el aviso por WhatsApp con el nuevo horario cuando hay consentimiento.

## Technical Context

**Language/Version**: TypeScript sobre la app Next.js App Router existente.

**Primary Dependencies**: motor de disponibilidad `getAvailableSlots`, máquina de estados de citas (`appointment-state-machine.ts`), guardia de sesión `requireAdmin`, plantilla de mensaje y registro de comunicación de WhatsApp del spec 002, componentes `slot-picker` y `status-controls`.

**Storage**: Supabase como fuente viva (appointments, appointment_status_history, whatsapp_communications) con degradación al almacén local cuando no hay cliente admin, siguiendo el mismo patrón que `changeAppointmentStatusForAdmin`.

**Testing**: unit de dominio (revalidación, solapes, transiciones, plantilla de aviso), integration de rutas API (sesión, rechazos, actualización condicional), e2e del flujo completo y accesibilidad del selector.

**Target Platform**: Pantallas administrativas desktop y mobile dentro de la misma PWA.

**Project Type**: Web application / extensión del panel administrativo.

**Performance Goals**: El selector carga los horarios por día bajo demanda; la confirmación responde en el mismo rango que las acciones actuales del panel y nunca deja la cita a medias.

**Constraints**: Cero dobles reservas (revalidación obligatoria en servidor), operación atómica, mensajes de rechazo comprensibles, flujo usable con teclado y contraste AA.

**Scale/Scope**: Una nueva acción en el detalle de cita, dos rutas API de administración y una plantilla de aviso; sin cambios en la reserva pública, en la autenticación ni en el esquema existente de citas.

## Constitution Check (previo a Phase 0)

- Entrega guiada por especificaciones: PASS (spec 004 con checklist de calidad 16/16).
- Experiencia centrada en clientes y administración: PASS (flujo administrativo de 4 interacciones; la reserva pública no cambia).
- Calidad verificable y pruebas: PASS (cada FR se cubre con pruebas; gates de typecheck, lint, unit, build y e2e).
- Arquitectura mantenible: PASS (reutiliza el motor de disponibilidad, la máquina de estados y el patrón de sesión existentes; sin almacenamiento paralelo).
- Seguridad, privacidad y accesibilidad: PASS (sesión obligatoria en toda operación, sin exposición de datos sensibles, teclado y contraste AA).
- Uso responsable de IA: PASS (artefactos versionados en el repo; sin datos personales de clientas en la documentación).

Sin violaciones: `Complexity Tracking` queda vacío.

## Project Structure

### Documentation (this feature)

```text
specs/004-reschedule-appointments/
|-- plan.md              # Este archivo
|-- research.md          # Phase 0
|-- data-model.md        # Phase 1
|-- quickstart.md        # Phase 1
|-- contracts/
|   |-- domain-rules.md
|   |-- ui-flows.md
|   `-- api.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md             # Phase 2 ($speckit-tasks, no creado por $speckit-plan)
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- admin/appointments/
|   |   |-- [appointmentId]/page.tsx        # pasa serviceId y rango actual al control
|   |   |-- status-controls.tsx             # + boton "Reprogramar" (solo estados validos)
|   |   `-- reschedule-panel.tsx            # NUEVO: selector de fecha/horario, nota y confirmacion
|   `-- api/admin/
|       |-- slots/route.ts                  # NUEVO: horarios libres excluyendo la propia cita
|       `-- appointments/[id]/reschedule/route.ts   # NUEVO: confirmacion (POST)
|-- domain/
|   |-- appointments/appointment-state-machine.ts   # + transiciones a "reprogramada"
|   |-- appointments/admin-appointment-service.ts   # + transiciones del desplegable
|   |-- appointments/admin-reschedule-service.ts    # NUEVO: revalidacion + aplicacion atomica
|   `-- spa-service.ts                      # getAvailableSlots acepta excluir una cita
|-- integrations/whatsapp/whatsapp-confirmation.ts  # + plantilla de aviso de reprogramacion
`-- lib/supabase-data.ts                    # + actualizacion condicional de la cita

tests/
|-- unit/                                   # dominio, plantilla y transiciones
|-- integration/                            # rutas API: sesion, rechazos, condicion
|-- e2e/                                    # flujo completo de reprogramacion
`-- accessibility/                          # selector en el detalle de cita
```

**Structure Decision**: se conserva la app única Next.js. El feature añade piezas dentro de las capas ya existentes (dominio, rutas API de administración y componentes del detalle) siguiendo la organización actual; no se crean proyectos ni carpetas de primer nivel nuevas.

## Phase 0 Research

Ver [research.md](./research.md).

## Phase 1 Design

Ver [data-model.md](./data-model.md), [contracts/domain-rules.md](./contracts/domain-rules.md), [contracts/ui-flows.md](./contracts/ui-flows.md), [contracts/api.md](./contracts/api.md) y [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- Spec-driven delivery: PASS (los 15 FR del spec tienen regla o contrato que los cubre).
- User-centered flow: PASS (selector reutiliza la UI de la reserva pública; mensajes de error accionables).
- Testable quality gates: PASS (ver `quickstart.md`; sin criterios ambiguos).
- Maintainable architecture: PASS (un solo motor de disponibilidad compartido; sin duplicar reglas de horarios).
- Security and privacy: PASS (sesión obligatoria en ambas rutas; sin claves ni datos de otras clientas en la UI).
- Responsible AI usage: PASS (decisiones documentadas en `research.md` con alternativas descartadas).
