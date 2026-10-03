---
description: "Tareas de implementacion para la integracion de WhatsApp del spa"
---

# Tasks: Spa WhatsApp Automation

**Input**: Documentos de diseno de `specs/002-spa-whatsapp-automation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1: Shared Infrastructure

- [x] T001 Definir el adaptador de WhatsApp y el canal seguro para mensajes de confirmacion.
- [x] T002 Extender la abstraccion de historial de citas para registrar intentos de comunicacion.
- [x] T003 Crear el formulario y detalle de estado para vista administrativa de confirmacion por WhatsApp.

## Phase 2: Core Domain

- [x] T004 Implementar generacion de mensaje base con datos de cliente, servicio, fecha y horario.
- [x] T005 Implementar validacion de telefono, consentimiento y errores accionables.
- [x] T006 Implementar registro de evento de comunicacion y fallbacks manuales.
- [x] T007 Integrar la comunicacion con la maquina de estados de citas y el historial.

## Phase 3: UI and Admin Flow

- [x] T008 Construir la accion de WhatsApp desde el detalle de cita pendiente.
- [x] T009 Construir el editor de mensaje y resultado manual.
- [x] T010 Mostrar la linea de tiempo de estados y mensajes asociados en la vista de detalle.

## Phase 4: Validation

- [x] T011 Cubrir validacion de mensaje, telefono y consentimineto con pruebas unitarias.
- [x] T012 Cubrir flujo de confirmacion exitosa y fallback manual con pruebas de integracion.
- [x] T013 Cubrir comportamiento accesible y de error en la pantalla administrativa.
- [x] T014 Ejecutar pruebas de compilacion, unitarias e integracion para la feature.
