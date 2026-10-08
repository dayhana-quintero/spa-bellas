# Feature Specification: Reschedule Appointments (Reprogramar citas)

**Feature ID**: 004-reschedule-appointments
**Feature Name**: Reprogramacion de citas a otro horario disponible desde el panel administrativo
**Created**: 2026-10-07

**Input**: User description: "Reprogramar citas: que el administrador pueda mover una cita existente a otra fecha y horario disponibles, sin perder su historial."

## Background and Problem Statement

El spa ya permite reservar citas por la web, confirmarlas o cancelarlas desde el panel, consultar el historial y preparar la confirmacion por WhatsApp. Falta el paso central del ciclo operativo: cuando una clienta necesita cambiar la hora, el administrador solo puede marcar los estados "reprogramacion solicitada" o "reprogramada" desde un desplegable; no existe ninguna accion que mueva la cita de verdad a otra fecha y horario.

En la practica esto obliga al administrador a cancelar la cita y pedir a la clienta que reserve de nuevo, perdiendo el historial, el consentimiento de WhatsApp y el contexto de la operacion. Este feature cierra ese ciclo: desde el detalle de la cita, el administrador elige un nuevo horario libre del servicio, el sistema mueve la cita con trazabilidad completa y deja listo el aviso al cliente.

## User Stories

### User story 1: Administrador mueve una cita a un horario libre (Priority: P1)

Como administrador del spa, quiero abrir una cita pendiente o confirmada, ver los horarios libres de su servicio y elegir uno nuevo para reprogramar la cita, sin cancelarla ni perder su historial.

**Why this priority**: Es el valor central del feature. Sin esta historia no hay reprogramacion real: solo un cambio manual de estado que no mueve la cita.

**Independent Test**: Crear una cita por la reserva publica, abrirla en el panel, usar la accion "Reprogramar", elegir otro horario disponible y verificar que la cita muestre la nueva fecha y hora, conserve su historial y quede en estado "reprogramada".

**Acceptance Criteria**
1. Desde el detalle de la cita existe la accion "Reprogramar" para los estados pendiente, confirmada, reprogramacion solicitada y reprogramada.
2. Al abrir la accion se muestran la fecha y hora actuales de la cita y los horarios libres de su servicio por dia, aplicando las mismas reglas de disponibilidad que la reserva publica.
3. Las fechas y horas pasadas y los horarios ya ocupados no se ofrecen como opcion.
4. Al confirmar, la cita queda con la nueva fecha y hora, el mismo servicio y la misma duracion, en estado "reprogramada" (conservandolo si ya lo estaba).
5. Si el horario deja de estar libre justo antes de confirmar, el sistema rechaza el cambio con un mensaje claro y la cita conserva su fecha original.
6. La operacion es atomica: o se aplican la nueva fecha, el estado y el registro de auditoria, o no se modifica nada.
7. Las citas en estado cancelada, vencida, completada o no asistio no ofrecen la accion de reprogramar.

---

### User story 2: Aviso al cliente con el nuevo horario (Priority: P2)

Como administrador, quiero que al reprogramar quede preparado el mensaje de WhatsApp con la nueva fecha y hora para avisar a la clienta del cambio.

**Why this priority**: Un cambio sin aviso genera ausencias. Reutiliza la maquinaria de consentimiento y mensaje del spec 002, por lo que es un incremento de valor de bajo riesgo una vez exista la historia 1.

**Independent Test**: Reprogramar una cita creada con consentimiento de WhatsApp y verificar que el mensaje preparado contiene el nuevo horario en formato legible y que el evento queda en la trazabilidad de la cita con la identidad del administrador.

**Acceptance Criteria**
1. Despues de confirmar la reprogramacion, el panel ofrece el mensaje de aviso con la nueva fecha y hora en formato claro para la clienta.
2. El aviso solo se prepara si la clienta otorgo consentimiento de WhatsApp al reservar; sin consentimiento no se ofrece y la reprogramacion igual se completa.
3. El evento de aviso queda registrado en la trazabilidad de la cita con la identidad real del administrador en sesion.
4. Si el navegador bloquea la ventana de WhatsApp, el panel informa del bloqueo y la reprogramacion no se ve afectada.

---

### User story 3: Historial conserva el rastro de la reprogramacion (Priority: P3)

Como administrador, quiero que el historial de la cita conserve cuando cambio, de que fecha a que fecha y quien lo hizo, para poder responder a la clienta y auditar la operacion.

**Why this priority**: Es la garantia de confianza del feature, pero solo es verificable cuando ya existen las historias 1 y 2.

**Independent Test**: Reprogramar la misma cita dos veces y verificar que el historial muestra ambos cambios con su fecha anterior, fecha nueva, administrador y momento del cambio, sin sobrescribirse.

**Acceptance Criteria**
1. El historial de la cita muestra un registro por cada reprogramacion con la fecha anterior, la nueva fecha, el administrador responsable y el momento del cambio.
2. El detalle de la cita y la lista administrativa muestran la nueva fecha y hora inmediatamente despues de confirmar.
3. Varias reprogramaciones de la misma cita quedan todas registradas, sin sobrescribirse entre si.
4. El detalle de la cita muestra la nota automatica con el cambio de fecha junto a cualquier nota escrita por el administrador.

### Edge Cases

- El horario elegido se ocupa entre la seleccion y la confirmacion: se rechaza con mensaje y la cita conserva su fecha original.
- Otro administrador reprograma la misma cita a la vez: el segundo recibe un mensaje de conflicto y ve la cita actualizada.
- La cita cambia de estado en otra pestana (por ejemplo, se cancela) mientras se reprograma: se rechaza con mensaje y no se pierde el contexto.
- Todos los horarios de un dia estan ocupados: se muestra un estado vacio legible ("No hay horarios disponibles"), no una lista en blanco.
- La clienta ya tiene otra cita activa que se solaparia con el nuevo horario: se bloquea con mensaje.
- Se intenta elegir una fecha u hora pasada: no se ofrece entre las opciones y, si llega al servidor, se rechaza.
- El servicio de la cita dejo de estar activo: la accion no falla en rotura; informa que no hay horarios disponibles para ese servicio.
- La cita ya fue reprogramada varias veces: sigue permitido volver a reprogramarla.
- La cita esta en estado "reprogramacion solicitada": al elegir horario pasa a "reprogramada" (transicion ya existente en la maquina de estados).

## Functional Requirements

- **FR-001**: El panel MUST ofrecer la accion "Reprogramar" en el detalle de la cita para los estados pendiente, confirmada, reprogramacion solicitada y reprogramada.
- **FR-002**: El selector MUST mostrar los horarios libres del servicio de la cita por dia, aplicando las mismas reglas de disponibilidad que la reserva publica: duracion del servicio, horarios del spa y citas u holds existentes.
- **FR-003**: El sistema MUST excluir fechas y horas pasadas de las opciones ofrecidas.
- **FR-004**: El sistema MUST volver a validar la disponibilidad en el servidor en el momento de confirmar; si el horario ya no esta libre, MUST rechazar el cambio y conservar la fecha original de la cita.
- **FR-005**: El sistema MUST impedir que una misma clienta tenga dos citas activas que se solapen en el nuevo horario.
- **FR-006**: La reprogramacion MUST ser atomica: o se aplican la nueva fecha y hora, el estado y el registro de auditoria, o no se modifica nada.
- **FR-007**: Tras reprogramar, la cita MUST quedar en estado "reprogramada" (conservandolo si ya lo estaba) conservando el servicio, la clienta y la duracion originales.
- **FR-008**: El sistema MUST registrar cada reprogramacion en el historial de la cita con la fecha anterior, la nueva fecha, la identidad del administrador y el momento del cambio.
- **FR-009**: El sistema MUST agregar automaticamente una nota con el cambio de fecha y MUST permitir al administrador agregar una nota adicional.
- **FR-010**: El sistema MUST preparar el mensaje de aviso al cliente con la nueva fecha y hora cuando exista consentimiento de WhatsApp, y MUST registrarlo en la trazabilidad con la identidad del administrador. Sin consentimiento MUST omitir el aviso sin bloquear la reprogramacion.
- **FR-011**: Toda operacion de reprogramacion MUST exigir una sesion administrativa valida; sin sesion MUST responder sin autorizacion y sin modificar datos.
- **FR-012**: Las citas en estado cancelada, vencida, completada o no asistio MUST no ofrecer la accion de reprogramar, ni por interfaz ni por servidor.
- **FR-013**: El sistema MUST mostrar un mensaje accionable cuando el cambio se rechace (horario ocupado, solape con otra cita de la clienta o cita modificada en otra vista) sin perder el contexto de la cita.
- **FR-014**: La experiencia MUST ser usable con teclado y lector de pantalla, con contraste suficiente y mensajes de exito y error claros, en desktop y mobile.
- **FR-015**: La experiencia MUST no exponer informacion interna sensible (claves de servicio, identificadores de sesion o datos de otras clientas); el telefono de la clienta solo aparece en el detalle administrativo, como ocurre hoy en el resto del panel.

### Key Entities

- **Cita (Appointment)**: fecha y hora de inicio y fin, estado, servicio, clienta y consentimiento de WhatsApp. La reprogramacion actualiza fecha y hora, y derivadamente el estado.
- **Horario disponible (Slot)**: propuesta de fecha, hora y servicio calculada a partir de la disponibilidad; se deriva de las citas existentes y los horarios del spa, y no se persiste por separado.
- **Registro de cambio de estado (Status history)**: estado anterior, estado nuevo, identidad del administrador, momento del cambio y nota; es donde queda el rastro de la reprogramacion.
- **Evento de comunicacion (WhatsApp record)**: mensaje preparado, resultado, nota y administrador responsable; alimenta la trazabilidad del aviso al cliente.

## Scope

**In scope**
- Reprogramacion individual de una cita desde el detalle administrativo.
- Selector de horarios libres con las reglas de disponibilidad existentes.
- Auditoria del cambio y preparacion del aviso por WhatsApp con consentimiento.

**Out of scope**
- Solicitar reprogramacion desde la web del cliente (el estado "reprogramacion solicitada" sigue gestionandose manualmente desde el panel).
- Envio automatico de mensajes por WhatsApp (sin API de envio, igual que en el spec 002).
- Reprogramacion masiva de varias citas a la vez.
- Cambiar de servicio, duracion o clienta al reprogramar.
- Reasignar la cita a otro recurso o estilista (el modelo actual no maneja recursos).

## Success Metrics

- Un administrador puede reprogramar una cita en menos de 60 segundos y en no mas de 4 interacciones: abrir la accion, elegir dia, elegir horario y confirmar.
- El 100% de las reprogramaciones exitosas muestran la nueva fecha y hora en el detalle y en la lista administrativas inmediatamente despues de confirmar.
- El sistema no permite ninguna doble reserva: el 100% de los intentos se revalida en el servidor antes de aplicarse.
- El 100% de las reprogramaciones dejan registro con fecha anterior, fecha nueva, administrador y momento del cambio.
- El 100% de los intentos rechazados muestran un mensaje comprensible; cero fallos silenciosos.
- El flujo se completa usando solo teclado y pasa las verificaciones automaticas de accesibilidad del proyecto sin violaciones.

## Assumptions and Ambiguities

- El alcance es solo administrativo: la clienta no puede pedir el cambio desde la web en esta version.
- La duracion de la cita es la del servicio contratado y no cambia al reprogramar; el precio y el servicio se conservan.
- Se reutilizan las mismas reglas de disponibilidad que la reserva publica; no se crea un calendario paralelo.
- El aviso por WhatsApp se prepara manualmente para que el administrador lo envie, igual que en el spec 002, porque no hay canal de envio automatico.
- Se permite reprogramar la misma cita varias veces; cada movimiento queda en el historial.
- Las citas de servicios hoy inactivos no se bloquean por esa razon, solo informan que no hay horarios disponibles.
- La "reprogramacion solicitada" se sigue marcando a mano desde el panel; este feature no automatiza ese flujo.
- La regla "reprogramada desde pendiente o confirmada" requiere habilitar esas transiciones en la maquina de estados actual, que hoy solo permite llegar a "reprogramada" desde "reprogramacion solicitada"; el resto de las transiciones se conserva igual.
