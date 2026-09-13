# Feature Specification: Spa PWA Management

**Feature Branch**: `001-spa-pwa-management`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "Quiero crear la especificacion funcional de la PWA para el spa que acabamos de definir en la Constitution. Define la experiencia del cliente y del administrador, los servicios y procedimientos, el flujo completo de agendamiento de citas, estados de las citas, confirmacion mediante WhatsApp, historial e inventario de insumos. No tomes decisiones tecnicas todavia; centrate en requisitos funcionales, reglas de negocio, actores y criterios de aceptacion. Identifica tambien cualquier requisito ambiguo que debamos aclarar posteriormente."

## Clarifications

### Session 2026-08-23

- Q: Como deben elegir horario las clientes al solicitar una cita? -> A: La cliente elige un horario exacto solo entre horarios disponibles generados por configuracion del spa, citas existentes y bloqueos administrativos.
- Q: Cuando debe bloquearse un horario elegido por una clienta para evitar que otra clienta lo solicite al mismo tiempo? -> A: Al crear la solicitud pendiente, el horario queda retenido temporalmente hasta confirmacion, cancelacion o vencimiento.
- Q: Que roles administrativos debe soportar la primera version? -> A: Un solo rol administrador con acceso a citas, catalogo, historial e inventario.
- Q: Que debe pasar con una cita confirmada cuando la clienta necesita cambiar fecha u hora? -> A: La clienta debe contactar al spa por WhatsApp; el administrador registra la reprogramacion.
- Q: Como debe registrarse el consumo de insumos en la primera version? -> A: Manual: el administrador registra entradas, consumos y correcciones de insumos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar servicios y solicitar una cita (Priority: P1)

Como cliente, quiero consultar los servicios y procedimientos disponibles del spa, entender que
incluye cada uno, y solicitar una cita con mis datos de contacto para recibir confirmacion.

**Why this priority**: Sin consulta clara de servicios y solicitud de citas, la PWA no entrega el
valor principal para clientes ni genera demanda operable para el spa.

**Independent Test**: Puede probarse publicando el catalogo de servicios, completando una solicitud
de cita desde el area publica y verificando que quede registrada como pendiente de confirmacion.

**Acceptance Scenarios**:

1. **Given** que una cliente entra al area publica, **When** revisa una categoria de servicio,
   **Then** ve servicios o procedimientos con nombre, descripcion, duracion estimada y orientacion
   de precio o rango si el negocio lo define.
2. **Given** que una cliente selecciona un servicio disponible, **When** completa nombre, telefono,
   servicio, fecha y un horario exacto disponible, **Then** la solicitud queda registrada con estado
   pendiente, el horario queda retenido temporalmente y la cliente recibe una confirmacion visible
   de que el spa revisara la cita.
3. **Given** que faltan datos obligatorios o el telefono no es util para contacto, **When** la
   cliente intenta enviar la solicitud, **Then** el sistema explica que debe corregirse sin perder
   la informacion ya ingresada.
4. **Given** que una fecha no tiene horarios disponibles segun la configuracion del spa y las citas
   existentes, **When** la cliente intenta agendar para esa fecha, **Then** el sistema no permite
   elegir un horario libre manualmente y le muestra alternativas disponibles o una indicacion clara
   de que no hay disponibilidad.

---

### User Story 2 - Gestionar citas pendientes y confirmar por WhatsApp (Priority: P1)

Como administrador, quiero revisar citas pendientes, confirmar disponibilidad con la cliente por
WhatsApp y cambiar el estado de la cita para mantener la agenda actualizada.

**Why this priority**: La operacion del spa depende de convertir solicitudes pendientes en citas
confirmadas, canceladas o reprogramadas con una comunicacion clara.

**Independent Test**: Puede probarse creando una cita pendiente, abriendola en administracion,
iniciando la confirmacion por WhatsApp y cambiando su estado con registro visible.

**Acceptance Scenarios**:

1. **Given** que existen citas pendientes, **When** el administrador abre la vista de pendientes,
   **Then** ve datos de cliente, servicio, fecha solicitada, horario solicitado y estado actual.
2. **Given** que una cita pendiente tiene telefono valido, **When** el administrador elige confirmar
   por WhatsApp, **Then** el sistema prepara un mensaje claro con cliente, servicio, fecha y hora
   para que el administrador lo envie o complete la confirmacion.
3. **Given** que el administrador recibe respuesta de la cliente, **When** cambia el estado de la
   cita, **Then** el historial de la cita conserva el nuevo estado, fecha del cambio y responsable.

---

### User Story 3 - Consultar y administrar historial de citas (Priority: P2)

Como administrador, quiero consultar historial de citas por cliente, servicio, fecha y estado para
hacer seguimiento de atenciones, cancelaciones y decisiones operativas.

**Why this priority**: El historial permite continuidad en la atencion y control operativo, aunque
puede construirse despues del flujo basico de agenda.

**Independent Test**: Puede probarse registrando citas con diferentes estados y verificando que el
administrador pueda encontrarlas y revisar su informacion historica.

**Acceptance Scenarios**:

1. **Given** que existen citas pasadas y canceladas, **When** el administrador filtra por rango de
   fechas o estado, **Then** ve una lista consistente con los criterios aplicados.
2. **Given** que el administrador abre una cita historica, **When** revisa su detalle, **Then** ve
   cliente, servicio, fecha, estado final y cambios de estado registrados.

---

### User Story 4 - Gestionar inventario de insumos (Priority: P2)

Como administrador, quiero registrar y actualizar insumos usados por el spa para conocer existencias,
detectar faltantes y apoyar la planeacion de compras.

**Why this priority**: Los insumos afectan la capacidad de prestar servicios, pero no bloquean el
primer ciclo de solicitud y confirmacion de citas.

**Independent Test**: Puede probarse creando insumos, modificando existencias y verificando que el
administrador pueda identificar productos con nivel bajo.

**Acceptance Scenarios**:

1. **Given** que el administrador registra un insumo, **When** ingresa nombre, unidad de medida,
   cantidad disponible y umbral minimo, **Then** el insumo queda disponible para consulta y control.
2. **Given** que un insumo cae por debajo del umbral minimo, **When** el administrador consulta el
   inventario, **Then** el sistema lo destaca como insumo que requiere atencion.
3. **Given** que el spa usa o recibe insumos, **When** el administrador registra una entrada,
   consumo o correccion, **Then** la cantidad disponible se actualiza y el movimiento queda
   conservado para consulta.

---

### User Story 5 - Mantener informacion del catalogo de servicios (Priority: P3)

Como administrador, quiero mantener el catalogo de servicios y procedimientos para que la informacion
publica sea correcta y util para clientes.

**Why this priority**: El catalogo sostiene la experiencia publica, pero puede iniciar con datos
cargados manualmente mientras se prioriza el agendamiento.

**Independent Test**: Puede probarse creando o actualizando servicios y verificando que el area
publica refleje la informacion aprobada.

**Acceptance Scenarios**:

1. **Given** que el administrador edita un servicio, **When** actualiza descripcion, categoria,
   duracion o precio orientativo, **Then** el area publica muestra la informacion vigente.
2. **Given** que un servicio deja de ofrecerse temporalmente, **When** el administrador lo marca como
   no disponible, **Then** las clientes no pueden solicitar nuevas citas para ese servicio.

### Edge Cases

- Una cliente intenta solicitar una cita para un servicio marcado como no disponible.
- Dos clientes solicitan el mismo horario antes de que el administrador confirme disponibilidad.
- Una solicitud pendiente vence sin confirmacion administrativa y el horario debe volver a estar
  disponible.
- El administrador intenta confirmar una cita sin telefono valido para WhatsApp.
- Una cliente solicita una fecha u horario fuera del horario de atencion definido.
- Una cliente intenta escribir o seleccionar un horario que no aparece como disponible.
- Una cita ya confirmada necesita cancelarse o reprogramarse.
- Una clienta intenta cambiar una cita confirmada desde el area publica.
- El enlace o accion de WhatsApp no puede completarse y el administrador necesita registrar el
  resultado manualmente.
- Un insumo queda con cantidad negativa por error de captura.
- El administrador consulta historial sin resultados para los filtros elegidos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ofrecer un area publica accesible sin inicio de sesion para consultar
  categorias de servicios del spa.
- **FR-002**: El sistema MUST mostrar al menos las categorias unas, alisados, tratamientos
  capilares, limpieza facial y diseno de cejas.
- **FR-003**: Cada servicio o procedimiento publicado MUST incluir nombre, categoria, descripcion,
  disponibilidad para agenda y duracion estimada cuando el negocio la haya definido.
- **FR-004**: La cliente MUST poder iniciar una solicitud de cita desde un servicio o procedimiento
  disponible.
- **FR-005**: La solicitud de cita MUST capturar nombre de cliente, telefono de contacto, servicio
  solicitado, fecha, horario exacto disponible y notas opcionales.
- **FR-006**: El sistema MUST validar datos obligatorios antes de crear una solicitud de cita.
- **FR-007**: Toda solicitud nueva MUST crearse con estado "pendiente".
- **FR-007a**: Toda solicitud pendiente MUST retener temporalmente el horario seleccionado para
  impedir nuevas solicitudes sobre el mismo horario hasta que sea confirmada, cancelada o vencida.
- **FR-008**: El sistema MUST presentar a la cliente una confirmacion visible despues de registrar
  una solicitud, indicando que la cita queda pendiente de confirmacion por el spa.
- **FR-009**: El area administrativa MUST estar separada del area publica y requerir acceso de un
  unico rol administrador en la primera version.
- **FR-010**: El administrador MUST poder ver citas pendientes con datos suficientes para decidir si
  confirma, cancela o reprograma.
- **FR-011**: El administrador MUST poder cambiar el estado de una cita entre pendiente, confirmada,
  cancelada, reprogramacion solicitada, reprogramada, completada y no asistio.
- **FR-012**: Cada cambio de estado de una cita MUST conservar fecha del cambio, estado anterior,
  estado nuevo y administrador responsable del cambio.
- **FR-013**: El sistema MUST permitir iniciar una confirmacion por WhatsApp para citas con telefono
  valido.
- **FR-014**: La confirmacion por WhatsApp MUST incluir un mensaje base con nombre de cliente,
  servicio, fecha, hora y una instruccion clara para confirmar o responder.
- **FR-015**: Si la accion de WhatsApp no se completa, el administrador MUST poder registrar el
  resultado de la comunicacion manualmente.
- **FR-016**: El administrador MUST poder filtrar citas por estado, rango de fechas, cliente y
  servicio.
- **FR-017**: El sistema MUST mantener historial de citas incluyendo citas pendientes, confirmadas,
  canceladas, completadas y no asistidas.
- **FR-018**: El administrador MUST poder consultar el detalle de una cita historica con datos de
  cliente, servicio, fecha, estado final, notas y cambios de estado.
- **FR-019**: El administrador MUST poder crear, editar, activar y desactivar servicios o
  procedimientos del catalogo.
- **FR-020**: El administrador MUST poder registrar insumos con nombre, categoria opcional, unidad de
  medida, cantidad disponible y umbral minimo.
- **FR-021**: El administrador MUST poder ajustar cantidades de insumos registrando incrementos,
  consumos o correcciones.
- **FR-022**: El sistema MUST destacar insumos cuya cantidad disponible sea igual o inferior al
  umbral minimo definido.
- **FR-023**: El sistema MUST impedir cantidades negativas de insumos salvo que exista una excepcion
  registrada por el administrador.
- **FR-024**: Las pantallas publicas y administrativas MUST presentar mensajes de error claros,
  accionables y sin revelar informacion sensible.
- **FR-025**: La experiencia MUST permitir completar las tareas principales en pantallas moviles y de
  escritorio con lectura clara, controles accesibles y foco visible.
- **FR-026**: El sistema MUST registrar consentimiento o expectativa clara de contacto por WhatsApp
  antes de usar el telefono de la cliente para confirmar una cita.
- **FR-027**: El sistema MUST generar horarios disponibles a partir de la configuracion del spa,
  citas existentes y bloqueos administrativos; la cliente MUST NOT poder solicitar horarios libres
  que no esten publicados como disponibles.
- **FR-028**: La configuracion de disponibilidad MUST considerar horario de apertura y cierre, dias
  de atencion, duracion de cada servicio, tiempo entre citas, horarios ocupados, bloqueos del
  administrador, dias festivos o no laborables, capacidad del spa y disponibilidad de profesionales
  cuando esa capacidad se active.
- **FR-029**: El sistema MUST liberar automaticamente el horario retenido cuando una solicitud
  pendiente venza sin confirmacion administrativa.
- **FR-030**: La primera version MUST NOT permitir que la clienta reprograme una cita confirmada
  desde el area publica; el sistema MUST indicar que debe contactar al spa por WhatsApp.
- **FR-031**: El administrador MUST poder registrar una reprogramacion solicitada por WhatsApp,
  elegir un nuevo horario disponible y conservar la trazabilidad del horario anterior.
- **FR-032**: La primera version MUST gestionar consumo de insumos mediante movimientos manuales
  registrados por el administrador; el sistema MUST NOT descontar insumos automaticamente al
  completar una cita.

### Key Entities *(include if feature involves data)*

- **Cliente**: Persona que consulta servicios y solicita citas; incluye nombre, telefono de contacto,
  consentimiento o expectativa de contacto, y notas relevantes para la cita.
- **Servicio o Procedimiento**: Oferta del spa visible al publico; pertenece a una categoria,
  describe el procedimiento, puede estar disponible o no disponible y puede tener duracion o precio
  orientativo.
- **Cita**: Solicitud o reserva de atencion; relaciona cliente, servicio, fecha, horario, estado,
  notas, origen de solicitud, retencion temporal del horario y registros de cambio.
- **Configuracion de Disponibilidad**: Reglas operativas que determinan los horarios elegibles para
  agendar, incluyendo dias de atencion, apertura, cierre, duracion de servicios, tiempos entre citas,
  bloqueos, festivos, capacidad y disponibilidad de profesionales cuando aplique.
- **Estado de Cita**: Situacion operativa de una cita: pendiente, confirmada, cancelada,
  reprogramacion solicitada, reprogramada, completada o no asistio.
- **Registro de Estado**: Evento historico que documenta un cambio de estado con fecha, responsable,
  estado anterior, estado nuevo y nota opcional.
- **Mensaje de Confirmacion**: Comunicacion preparada para WhatsApp con datos minimos de la cita y
  texto de confirmacion.
- **Insumo**: Producto o material usado por el spa; incluye nombre, unidad de medida, cantidad
  disponible, umbral minimo y movimientos de ajuste.
- **Movimiento de Insumo**: Entrada, consumo o correccion manual de inventario con cantidad, motivo,
  fecha y administrador responsable.
- **Administrador**: Usuario autorizado en la primera version para gestionar citas, historial,
  servicios e insumos desde un unico rol administrativo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% de clientes de prueba pueden encontrar un servicio y enviar una solicitud de cita
  valida en menos de 3 minutos sin asistencia.
- **SC-002**: 95% de solicitudes de cita validas quedan visibles para el administrador como
  pendientes inmediatamente despues de ser registradas.
- **SC-003**: El administrador puede revisar una cita pendiente, iniciar confirmacion por WhatsApp y
  registrar un cambio de estado en menos de 2 minutos.
- **SC-004**: El historial permite encontrar citas por estado y rango de fechas con resultados
  comprensibles para el administrador en el 100% de pruebas de aceptacion.
- **SC-005**: El inventario permite identificar todos los insumos en nivel bajo durante una revision
  administrativa sin calculos manuales.
- **SC-006**: 100% de flujos principales de cliente y administrador muestran errores comprensibles
  cuando faltan datos obligatorios o una accion no puede completarse.
- **SC-007**: Las tareas principales de consulta, solicitud de cita, gestion de estado e inventario
  pueden completarse en pantalla movil y de escritorio durante pruebas de aceptacion.

## Clarifications for Next Phase

- Definir si los precios se muestran como valores exactos, rangos, "desde", o se omiten del area
  publica.
- Definir si una version futura requiere permisos separados para recepcion, profesionales,
  inventario y propietario.
- Definir valores concretos de horario laboral, dias no disponibles, anticipacion minima para
  agendar, tiempo entre citas, capacidad inicial del spa y limite de reprogramaciones.
- Definir cuanto tiempo dura la retencion temporal de una solicitud pendiente antes de vencer.
- Definir si una version futura permitira reprogramacion directa por parte de clientes.
- Definir si una version futura descontara insumos automaticamente por servicio completado.
- Definir el texto legal o consentimiento exacto para contacto por WhatsApp y tratamiento de datos
  personales.

## Assumptions

- La primera version cubre solicitud y confirmacion de citas, no pago en linea.
- Las citas creadas por clientes quedan pendientes hasta que el administrador confirme o cambie su
  estado.
- WhatsApp se usa como canal de confirmacion asistido por el administrador; la especificacion no
  presupone automatizacion completa de conversaciones.
- El historial de citas se conserva para consulta administrativa y continuidad de atencion.
- Los insumos se gestionan manualmente desde el area administrativa y no son visibles para clientes.
- Los servicios del catalogo pueden iniciar cargados con datos definidos por el negocio y luego ser
  mantenidos por el administrador.
- La PWA debe ser usable por clientes desde telefono movil y por administradores desde movil o
  escritorio.
