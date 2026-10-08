# Phase 0 Research: Reprogramar citas (004-reschedule-appointments)

**Fecha**: 2026-10-07
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

No quedan `NEEDS CLARIFICATION` en el Technical Context. Cada decisión se documenta con alternativas descartadas.

## R1. Motor de disponibilidad: reutilizar y excluir la propia cita

**Decision**: Reutilizar `getAvailableSlots(serviceId, date)` de `src/domain/spa-service.ts` como única fuente de horarios, añadiéndole un parámetro opcional `excludeAppointmentId` que descarta la ocurrencia actual de la cita que se está reprogramando al contar ocupación y capacidad.

**Rationale**:
- El motor ya aplica todas las reglas del negocio: horarios de apertura, días no laborables y bloques del admin, duración del servicio + buffer, capacidad del spa (`spaCapacity`), estados que bloquean y holds vencidos.
- Sin excluir la propia cita, un movimiento que se solape parcialmente con su horario actual (p. ej. mover una cita de 10:00 a 10:30) sería rechazado por su propia ocupación cuando la capacidad es 1: la regla central del feature quedaría inservible en el caso de uso más común.

**Alternativas consideradas**:
- *Endpoint público sin exclusión*: no sirve porque la cita actual se cuenta a sí misma; además mezclaría lógica de administración en un endpoint anónimo.
- *Escribir un calendario propio para el panel*: duplicaría reglas de horarios y bloques, violando el principio de arquitectura mantenible del proyecto.
- *Excluir en el cliente*: inseguro; el servidor debe revalidar (FR-004).

## R2. Confirmación: actualización condicional en servidor

**Decision**: La confirmación ocurre en `POST /api/admin/appointments/[id]/reschedule`. El servidor (1) exige sesión, (2) recalcular fecha y hora a partir de `date` + `slot` enviados (nunca confía en rangos del cliente), (3) revalida disponibilidad con `excludeAppointmentId`, (4) comprueba solape con otras citas de la misma clienta, (5) comprueba que la cita siga con la fecha y el estado esperados, y (6) aplica el cambio con una escritura condicional sobre esos mismos valores. Si cualquier paso falla, responde `409`/`400` y no modifica nada.

**Rationale**:
- Satisface FR-004, FR-005 y FR-006 (atómica) en un solo punto de control.
- El paso (5) detecta que otro administrador movió o canceló la cita en otra pestaña (edge case del spec) sin necesidad de bloqueos persistentes.
- Recalcular en servidor evita que un cliente malicioso o desactualizado envíe un rango arbitrario.

**Alternativas consideradas**:
- *Releer y luego escribir sin condición*: clásica carrera perdida; el segundo admin pisaría al primero.
- *Bloqueo por slot como en `createAppointmentIfSlotAvailable`*: sirve solo dentro de un proceso; con dos pestañas o despliegue serverless no protege nada.
- *Revalidar solo en la interfaz*: viola FR-004 explícitamente.

## R3. Persistencia: Supabase primero, almacén local como degradación

**Decision**: El servicio de dominio `rescheduleAppointmentForAdmin` consulta y escribe en Supabase (`appointments` + `appointment_status_history`) y, si no hay cliente admin o la consulta falla, degrada al almacén local con `console.error`, igual que ya hacen `changeAppointmentStatusForAdmin` y el historial.

**Rationale**: es el patrón ya establecido y probado en el proyecto; mantiene el modo local (sin `.env.local`) operable para pruebas unitarias y demos.

**Alternativas consideradas**: solo local (perdería la fuente viva); solo Supabase (rompería los tests unitarios y el modo sin claves).

## R4. Máquina de estados: habilitar `pendiente → reprogramada` y `confirmada → reprogramada`

**Decision**: Ampliar `allowedTransitions` en `src/domain/appointments/appointment-state-machine.ts` y el mapa paralelo de `admin-appointment-service.ts` (el que alimenta el desplegable) con las dos transiciones nuevas. `reprogramación solicitada → reprogramada` ya existe y `reprogramada → reprogramada` no es una transición: si la cita ya está reprogramada solo se cambian las fechas y se registra la nota, sin pasar por la máquina.

**Rationale**: el spec exige que una cita movida quede en estado `reprogramada`; hoy ese estado solo es alcanzable desde `reprogramación solicitada`. Son dos mapas distintos en el código: tocar solo uno dejaría el desplegable fuera de sincronía.

**Alternativas consideradas**: *dejar la cita en su estado anterior* (contradice FR-007); *nuevo estado `movida`* (amplía el vocabulario de estados ya acordado en 002).

## R5. Interfaz: acción en `status-controls` + panel con el `slot-picker` existente

**Decision**: Añadir el botón "Reprogramar" en `status-controls.tsx` (visible solo en estados elegibles, FR-001/FR-012) que despliega un `reschedule-panel.tsx` con el componente `AppointmentSlotPicker` reutilizado (misma fecha, mismo grid de horarios, mismos estados vacíos) contra `GET /api/admin/slots`. Tras confirmar, se recarga el detalle como ya hacen el resto de acciones.

**Rationale**:
- Reutiliza la UI probada de la reserva pública, incluido `buildSlotPickerState` con sus mensajes ("No hay horarios disponibles para …"), lo que cubre el edge case de día sin huecos sin código nuevo.
- El detalle de cita recibe hoy `serviceName` pero no `serviceId`: hay que pasar `serviceId` desde `getAppointmentDetailsForAdmin` para poder pedir horarios.

**Alternativas consideradas**: *página independiente `/admin/appointments/[id]/reschedule`* (más saltos de navegación, rompe el objetivo de <60 s y 4 interacciones); *selector inline sin panel* (dificulta cancelar sin cambios, edge case del spec).

## R6. Aviso por WhatsApp: plantilla propia de reprogramación

**Decision**: Añadir `prepareRescheduleNoticeMessage()` en `whatsapp-confirmation.ts` con el mismo contrato de validación que `prepareConfirmationMessage` (consentimiento obligatorio, teléfono normalizado, fecha `medium` + hora `short`) pero con redacción de cambio de horario ("Tu cita de … pasa a …"). El registro del evento se hace con `recordAppointmentCommunicationForAdmin`, que ya escribe en Supabase con el `admin_id` de la sesión (verificado en el spec 002).

**Rationale**: FR-010 pide un aviso con la nueva fecha; reutilizar la plantilla de confirmación mandaría "confirmamos tu cita" después de un cambio, lo que confundiría a la clienta. El consentimiento y la trazabilidad vienen gratis del flujo ya auditado.

**Alternativas consideradas**: *reenviar la plantilla de confirmación* (redacción incorrecta); *aviso automático* (fuera de alcance por decisión del spec, no hay canal de envío).

## R7. Solape de la misma clienta

**Decision**: Regla de dominio aparte de la capacidad: listar las citas activas de la clienta (estados que bloquean) del día elegido y rechazar si su rango se cruza con el nuevo horario. Se ejecuta en servidor junto a la revalidación.

**Rationale**: el motor de capacidad controla cuántas citas caben a la vez, no quiénes; una clienta con dos citas simultáneas es un error operativo que la capacidad por sí sola no detecta (y con `spaCapacity > 1` pasaría desapercibido).

**Alternativas consideradas**: *confiar solo en la capacidad* (deja el hueco); *impedir en la interfaz únicamente* (no verificable en servidor, FR-005).

## R8. Estrategia de pruebas

**Decision**:
- **unit**: transiciones nuevas (y que los estados terminales siguen vetados), revalidación con cita propia excluida, solape de clienta, plantilla de aviso (consentimiento y formato), recálculo de fecha+slot.
- **integration**: `POST .../reschedule` sin sesión → 401; horario ocupado → 409 sin cambios; carrera entre dos escrituras → el segundo recibe 409 y conserva su fecha; `GET /api/admin/slots` excluye la propia cita.
- **e2e**: reprogramar una cita real creada por la API pública, verificar nueva fecha, estado `reprogramada`, registro en historial con la identidad de sesión y aparición del aviso.
- **accessibility**: selector abierto en el detalle, axe sin violaciones y foco/teclado operables.

**Rationale**: cubre 1:1 los criterios de aceptación de las tres historias del spec y los gates del proyecto (typecheck, lint, unit, build, e2e).

**Alternativas consideradas**: solo e2e (lento y no aísla rechazos); solo unit (no prueba la sesión real ni la escritura condicional).

## NEEDS CLARIFICATION restantes

Ninguno.
