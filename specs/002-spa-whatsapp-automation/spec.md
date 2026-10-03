# Feature Specification: Spa WhatsApp Automation

**Feature ID**: 002-spa-whatsapp-automation
**Feature Name**: Integracion completa de WhatsApp para confirmacion de citas y seguimiento operativo
**Created**: 2026-10-02

## Background and Problem Statement

El spa ya permite a clientes solicitar citas desde la web y al administrador consultar el historial y administrar citas. Falta cerrar el ciclo operativo que convierte una solicitud pendiente en una cita confirmada o reprogramada usando WhatsApp y manteniendo trazabilidad completa.

La experiencia debe permitir al administrador abrir la conversación con la cliente, preparar un mensaje con los datos necesarios, confirmar o rechazar el contacto, registrar un fallback manual y conservar el historial de cada cambio de estado y cada intento de comunicación.

## User Stories

### User story 1: Administrador prepara confirmacion por WhatsApp

Como administrador del spa, quiero revisar una cita pendiente y preparar un mensaje de confirmacion con los datos de la cliente para poder cerrar la operacion de forma rapida y clara.

**Acceptance Criteria**
1. El administrador puede abrir desde una cita pendiente la accion de WhatsApp.
2. El sistema genera un mensaje base con nombre de cliente, servicio, fecha, hora y una instruccion clara para confirmar o responder.
3. El administrador puede editar el mensaje antes de enviarlo.
4. El sistema conserva la fecha, el estado previo y el resultado de la comunicacion.

### User story 2: Administrador maneja contacto fallido o manual

Como administrador, quiero registrar manualmente el resultado del contacto si WhatsApp no se completa para evitar perder trazabilidad operativa.

**Acceptance Criteria**
1. Si la accion de WhatsApp falla, el sistema ofrece un fallback manual.
2. El administrador puede registrar si la cliente respondio, si rechazo la cita, si pidio reprogramacion o si no hubo respuesta.
3. El cambio de estado queda registrado con responsable y nota.

### User story 3: Cliente recibe confirmacion clara

Como cliente del spa, quiero recibir una confirmacion clara por WhatsApp para saber si mi solicitud queda confirmada o requiere respuesta.

**Acceptance Criteria**
1. El mensaje incluye nombre, servicio, fecha, horario y accion esperada.
2. El mensaje evita revelar datos sensibles innecesarios.
3. Si la cliente responde, el sistema permite al administrador actualizar el estado sin contradicciones.

### User story 4: Trazabilidad completa de la operacion

Como administrador del spa, quiero revisar el historial de cada cita y cada intent de contacto para poder auditar decisiones y responder a dudas de clientes.

**Acceptance Criteria**
1. Cada cambio de estado genera un registro inmutable con fecha, anterior, nuevo y administrador responsable.
2. Cada intento de WhatsApp queda asociado a la cita.
3. El historial permite diferenciar confirmacion automatica, confirmacion manual y reprogramacion solicitada.

## Functional Requirements

- **FR-001**: El sistema MUST ofrecer a partir de una cita pendiente la accion de confirmacion por WhatsApp.
- **FR-002**: El sistema MUST preparar un mensaje base que incluya cliente, servicio, fecha, hora y una instruccion clara para responder.
- **FR-003**: El administrador MUST poder editar el mensaje antes de enviarlo.
- **FR-004**: El sistema MUST validar que el telefono de contacto sea utilizable antes de preparar el mensaje.
- **FR-005**: Si el envio por WhatsApp no puede completarse, el sistema MUST ofrecer fallback manual.
- **FR-006**: El administrador MUST poder registrar un resultado de comunicacion: confirmada, cancelada, reprogramacion solicitada o sin respuesta.
- **FR-007**: Cada resultado de contacto MUST registrarse junto con la fecha, el administrador responsable y una nota opcional.
- **FR-008**: El sistema MUST mantener un historial inmutable de cambios de estado y eventos de WhatsApp por cita.
- **FR-009**: El administrador MUST poder cambiar una cita pendiente a confirmada, cancelada o reprogramacion solicitada con auditoria.
- **FR-010**: La operacion MUST conservar el enlace de la cita con el servicio, la cliente y el horario retenido.
- **FR-011**: El sistema MUST mostrar mensajes de error accionables y sin datos sensibles si falla la comunicacion o el telefono es invalido.
- **FR-012**: La experiencia MUST ser usable en mobile y desktop con foco visible y lectura clara.
- **FR-013**: El sistema MUST evitar que una cita confirme o se reprograma sin registrar primero la accion administrativa y la nota asociada.
- **FR-014**: El proceso MUST permitir auditoria de confirmaciones tales como: enviada, entregada, no entregada, contestada, manual, rechazada o vencida.

## Assumptions and Ambiguities

- La primera version no depende de una API real de WhatsApp; requiere un adaptador seguro y un fallback manual.
- Las fases futuras pueden reemplazar el adaptador por una integracion real de WhatsApp Business, pero la regla de negocio y la auditoria no cambian.
- El parking de cita retenida y la expiracion de solicitudes pendientes siguen siendo responsabilidad del dominio de citas y no del mensaje de WhatsApp.

## Success Metrics

- Un administrador puede preparar y cerrar una cita pendiente en menos de 2 minutos.
- El historial de una cita permite reconstruir cada accion y cambio de estado.
- El proceso no requiere revelar secretos ni expone informacion sensible a clientes ajenos.
