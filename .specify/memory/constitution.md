<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- I. Spec-Driven Delivery -> I. Entrega Guiada por Especificaciones
- II. User-Centered SPA Experience -> II. Experiencia PWA Centrada en Clientes y Administracion
- III. Testable Quality Gates -> III. Calidad Verificable y Pruebas
- IV. Maintainable Architecture -> IV. Arquitectura Mantenible
- V. Security, Privacy, and Accessibility -> V. Seguridad, Privacidad y Accesibilidad
Added sections:
- VI. Uso Responsable de IA en el Desarrollo
- Dominio, Producto y Restricciones Tecnicas
- Flujo de Desarrollo y Revision
Removed sections:
- Product and Technical Constraints
- Development Workflow
Follow-up TODOs:
- None
-->
# proyecto-spa Constitution

## Core Principles

### I. Entrega Guiada por Especificaciones
Todo trabajo funcional DEBE iniciar con una especificacion aprobada en Spec Kit antes de crear
tareas de implementacion. Cada especificacion DEBE describir valor para clientes o administradores,
criterios de aceptacion, reglas de negocio, restricciones de privacidad y condiciones medibles de
exito. Las decisiones de implementacion DEBEN poder rastrearse hasta la especificacion, el plan y
las tareas aprobadas.

Razon: La PWA gestionara citas, datos de clientes, servicios del spa e insumos; la trazabilidad evita
que cambios no documentados se conviertan en comportamiento de producto.

### II. Experiencia PWA Centrada en Clientes y Administracion
La PWA DEBE ofrecer un area publica donde clientes consulten servicios y procedimientos de unas,
alisados, tratamientos capilares, limpieza facial y diseno de cejas, y puedan agendar citas con
friccion minima. El area administrativa DEBE permitir gestionar citas pendientes, canceladas,
historial de citas e insumos con estados visibles, filtros utiles y acciones reversibles cuando el
dominio lo permita.

La experiencia DEBE ser responsive, instalable como PWA cuando el plan tecnico lo incluya, y
coherente en navegacion, estados de carga, errores recuperables y confirmaciones. Las pantallas
administrativas DEBEN priorizar lectura rapida, densidad moderada y acciones claras sobre estilos
decorativos.

Razon: Clientes necesitan agendar con confianza y el equipo del spa necesita operar citas e insumos
sin ambiguedad durante jornadas de trabajo.

### III. Calidad Verificable y Pruebas
Cada funcionalidad implementada DEBE incluir pruebas automatizadas o verificacion documentada que
cubra sus criterios de aceptacion. La logica de agenda, cambios de estado de citas, formularios,
validaciones, transformaciones de datos, permisos administrativos e integraciones con WhatsApp DEBEN
tener cobertura automatizada cuando la pila tecnica lo permita.

Antes de entregar cambios, el implementador DEBE ejecutar las verificaciones disponibles o registrar
por que no se ejecutaron, que riesgo queda y como se mitigara. Los defectos de regresion en flujos
de agendamiento, administracion o accesibilidad DEBEN bloquear la entrega hasta que exista una
correccion o una excepcion aprobada.

Razon: Los errores en agenda y administracion afectan directamente la operacion del spa y la
confianza de los clientes.

### IV. Arquitectura Mantenible
El codigo DEBE organizarse por responsabilidades claras: interfaz publica, administracion, dominio de
citas, catalogo de servicios, insumos, integraciones y persistencia. Los componentes DEBEN mantener
contratos explicitos mediante tipos, esquemas o validaciones acordes a la pila tecnica. La logica de
negocio no DEBE quedar acoplada a detalles visuales ni a proveedores externos como WhatsApp.

Las dependencias nuevas DEBEN justificar su proposito, costo de mantenimiento y alternativa de
reemplazo. Las abstracciones DEBEN reducir duplicacion real, aislar dependencias volatiles o aclarar
contratos compartidos; no DEBEN agregarse por especulacion.

Razon: Una PWA de gestion crece por flujos y roles; separar dominio, UI e integraciones reduce
regresiones y facilita evolucionar el producto.

### V. Seguridad, Privacidad y Accesibilidad
La aplicacion DEBE proteger datos personales de clientes, informacion de citas, historial y datos
administrativos por defecto. Los secretos, tokens, credenciales y configuraciones sensibles NO DEBEN
ser versionados ni expuestos al cliente. Las operaciones administrativas DEBEN requerir autorizacion
explicita y no DEBEN estar disponibles desde flujos publicos.

El uso de WhatsApp para confirmar citas DEBE respetar consentimiento, minimizacion de datos y
mensajes claros. La PWA DEBE cumplir expectativas basicas de accesibilidad: estructura semantica,
navegacion por teclado, foco visible, contraste suficiente, etiquetas en formularios y errores
comprensibles.

Razon: La seguridad y la accesibilidad son requisitos del producto, no tareas de pulido posteriores.

### VI. Uso Responsable de IA en el Desarrollo
Las herramientas de IA PUEDEN apoyar especificacion, diseno, implementacion, pruebas y revision,
pero sus resultados DEBEN ser revisados por una persona antes de aceptarse. Codigo, textos,
decisiones tecnicas o datos generados por IA DEBEN validarse contra la especificacion, esta
constitucion, requisitos de seguridad y comportamiento observable.

No DEBEN compartirse con herramientas de IA secretos, credenciales, datos reales de clientes,
historiales privados ni informacion sensible del negocio. Cuando IA proponga dependencias,
arquitectura, reglas de seguridad o pruebas, el implementador DEBE verificar fuentes, compatibilidad
con el proyecto y riesgos antes de aplicar cambios.

Razon: La IA acelera el desarrollo, pero no reemplaza la responsabilidad tecnica sobre privacidad,
seguridad, mantenibilidad y exactitud del producto.

## Dominio, Producto y Restricciones Tecnicas

El producto es una PWA para un spa de belleza con dos superficies principales: area publica para
clientes y area administrativa para operacion interna. El area publica DEBE permitir consultar
servicios y procedimientos, revisar informacion necesaria para decidir, y solicitar o agendar citas.
El area administrativa DEBE gestionar citas pendientes, canceladas, historial de citas e insumos.

El administrador DEBE poder cambiar estados de citas segun reglas de negocio definidas en la
especificacion. Las confirmaciones por WhatsApp DEBEN implementarse como una integracion aislada,
con mensajes auditables en pruebas o registros adecuados y sin bloquear la gestion de citas si el
proveedor externo falla.

Los planes tecnicos DEBEN identificar pila frontend, estrategia PWA, modelo de rutas, manejo de
estado, persistencia, contratos de datos, permisos, estrategia de respaldo o recuperacion cuando
aplique, y destino de despliegue. Los cambios sensibles a rendimiento DEBEN definir expectativas
medibles de carga, latencia de interaccion o estabilidad visual.

## Flujo de Desarrollo y Revision

El trabajo DEBE seguir la secuencia de Spec Kit: constitucion, especificacion, aclaracion cuando
haga falta, plan, tareas, implementacion, y analisis o convergencia cuando existan brechas. Cada
plan DEBE incluir una revision explicita de cumplimiento con esta constitucion antes de aceptar
tareas de implementacion.

Cada cambio DEBE revisarse contra la especificacion aprobada, esta constitucion y la lista de tareas
vigente. Las desviaciones de alcance DEBEN registrarse como cambios en el artefacto correspondiente
antes de considerarse aceptadas. La entrega DEBE incluir evidencia de pruebas, verificaciones
manuales relevantes y riesgos pendientes.

## Governance

Esta constitucion prevalece sobre practicas informales, plantillas, planes y tareas que entren en
conflicto con ella. Las enmiendas requieren una justificacion documentada, un resumen de principios
o secciones afectadas y un cambio explicito de version semantica. Las enmiendas aprobadas DEBEN
escribirse en este archivo antes de que otros artefactos de Spec Kit dependan de la nueva regla.

El versionado sigue semver para gobernanza:

- MAJOR: eliminaciones o redefiniciones incompatibles de principios.
- MINOR: principios nuevos, secciones nuevas o ampliaciones materiales de requisitos.
- PATCH: aclaraciones, correcciones de redaccion y refinamientos no semanticos.

La revision de cumplimiento es obligatoria durante planificacion, generacion de tareas, revision de
implementacion y entrega final. Si una funcionalidad no puede cumplir, el plan DEBE documentar el
conflicto, la mitigacion y la enmienda constitucional necesaria para que la excepcion sea valida.

**Version**: 1.1.0 | **Ratified**: 2026-08-23 | **Last Amended**: 2026-08-23
