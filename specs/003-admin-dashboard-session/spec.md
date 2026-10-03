# Feature Specification: Admin Dashboard and Session Management

**Feature ID**: 003-admin-dashboard-session
**Feature Name**: Dashboard administrativo con sesion segura de usuario y vista operativa central
**Created**: 2026-10-02

## Background and Problem Statement

El spa ya cuenta con flujo publico, reservas, administracion de servicios e inventario, y un panel de citas pendientes. Sin embargo, la experiencia administrativa sigue fragmentada: no existe un dashboard central que resuma la operacion del dia, ni una sesion de usuario consistente para identificar quien accede y que permisos tiene.

El siguiente paso es cerrar ese gap para que el administrador pueda entrar al panel con una sesion segura, ver resumenes operativos, acceder al flujo de actividad y tomar decisiones sin perder contexto.

## User Stories

### User story 1: Administrador accede al panel central
Como administrador del spa, quiero entrar a un dashboard unico para ver rapidamente el estado general del negocio y decidir donde intervenir.

**Acceptance Criteria**
1. El administrador puede iniciar sesion con credenciales validas.
2. El sistema identifica la sesion con un usuario activo y una expiracion segura.
3. Si la sesion no es valida, la aplicacion redirige a una pantalla de acceso y deniega el panel.

### User story 2: Dashboard resume actividad operativa
Como administrador, quiero ver indicadores clave del dia para tomar decisiones sin consultar varias pantallas.

**Acceptance Criteria**
1. El dashboard muestra citas pendientes, confirmadas y vencidas.
2. El resumen incluye servicios activos y stock bajo con prioridad de atencion.
3. La informacion presenta estados legibles y una lectura rapida del contexto operativo.

### User story 3: Usuario administrativo mantiene sesion segura
Como administrador, quiero que la sesion permanezca segura y protegida para evitar accesos no autorizados.

**Acceptance Criteria**
1. La sesion tiene expiracion y limpieza cuando finaliza el tiempo.
2. El sistema valida la identidad antes de mostrar la vista administrativa.
3. Si la sesion falla, la app bloquea las rutas protegidas y elimina la informacion invalida.

### User story 4: Dashboard conecta con operaciones existentes
Como administrador, quiero que el panel central apunte a las tareas que ya existen en la app para no duplicar flujo.

**Acceptance Criteria**
1. Cada KPI o tarjeta del dashboard lleva a la pantalla detallada correspondiente.
2. El panel se integra con citas pendientes, historial, inventario y agenda.
3. La navegacion sigue el mismo modelo de la app y no rompe el flujo actual.

## Functional Requirements

- **FR-001**: El sistema MUST proteger rutas administrativas con una sesion valida antes de renderizar el dashboard.
- **FR-002**: El sistema MUST permitir el inicio de sesion del administrador con validacion por codigo o credencial segura.
- **FR-003**: El dashboard MUST mostrar un resumen operativo de citas, servicios y stock.
- **FR-004**: El sistema MUST distinguir entre usuario no autenticado, sesion expirada y acceso denegado.
- **FR-005**: El dashboard MUST enlazar con citas pendientes, historial, inventario y otras vistas relevantes.
- **FR-006**: La sesion MUST tener expiracion y limpieza segura en el navegador o servidor.
- **FR-007**: Cada accion administrativa MUST conservar el actor responsable en el flujo de auditoria.
- **FR-008**: La experiencia MUST ser usable en desktop y mobile con lectura clara y foco visible.
- **FR-009**: El dashboard MUST mostrar mensajes de error accionables si falla la carga de datos o la sesion.
- **FR-010**: La funcionalidad MUST mantenerse compatible con la arquitectura local-first actual y permitir evolucionar a una base de datos real.

## Assumptions and Ambiguities

- La primera version del dashboard es una capa de resumen operacional para la administracion, no un analisis avanzado de negocio.
- La sesion puede continuar siendo cookie firmada del lado del servidor en la version actual de MVP.
- El sistema puede usar datos ya existentes de servicios, inventario y citas sin introducir un nuevo almacenamiento paralelo.
- El siguiente paso puede incluir rol de usuario completo y mas de un administrador, pero no es obligatorio para la primera version.

## Success Metrics

- Un administrador puede entrar al dashboard y entender el estado del negocio en menos de 30 segundos.
- La sesion protegida evita acceso no autorizado a las rutas administrativas.
- El dashboard reduce la cantidad de pasos necesarios para acudir al estado de citas, inventario y operacion del dia.
