# Requirements Quality Checklist: Reprogramar citas

**Purpose**: Revision de calidad de los requisitos del spec 004 antes de pasar a clarificacion y planificacion.
**Created**: 2026-10-07
**Feature**: [spec.md](../spec.md)

**Note**: Esta lista se genera a partir del template `.specify/templates/checklist-template.md` con items propios del feature.
**Review Ownership**: Artefacto de revision dirigido por el revisor. Marca un item `[x]` solo cuando el criterio de calidad esta satisfecho.
**Marker Semantics**: `[x]` significa que el criterio fue revisado y satisfecho en terminos de calidad de requisitos; no significa que la implementacion este completa.

## Claridad y alcance

- [x] CHK001 El alcance esta delimitado: se separa explicitamente lo que entra y lo que queda fuera.
      (Seccion `Scope` con 5 puntos "In scope" y 5 "Out of scope"; lo fuera de alcance cubre
      solicitud desde el cliente, envio automatico de WhatsApp, reprogramacion masiva,
      cambio de servicio/duracion y reasignacion de recurso.)
- [x] CHK002 Las historias de usuario estan priorizadas y cada una es independientemente testable.
      (US1 P1, US2 P2, US3 P3; cada una con "Why this priority" e "Independent Test"
      que describe la prueba aislada, p. ej. US3 verificable con dos reprogramaciones seguidas.)
- [x] CHK003 Cada historia de usuario tiene criterios de aceptacion verificables.
      (US1: 7 criterios, US2: 4, US3: 4; todos binarios, p. ej. "sin consentimiento no se
      ofrece el aviso y la reprogramacion igual se completa".)
- [x] CHK004 Los casos limite operativos estan cubiertos (concurrencia, validacion en servidor, estados terminales y dias sin huecos).
      (Seccion `Edge Cases` con 8 escenarios: doble reserva por carrera, conflicto entre
      administradores, cambio de estado en otra pestana, dia sin huecos, solape de la clienta,
      fecha pasada, servicio inactivo y reprogramaciones repetidas.)

## Requisitos

- [x] CHK005 Cada FR es unico y univoco, sin ambiguedades ni terminos vagos ("si es posible", "apropiado", "etc.").
      (15 FR sin terminos vagos ni duplicados; grep de "etc./apropiad/si es posible" sin
      coincidencias. Cada FR cubre unica: accion, disponibilidad, exclusion de pasados,
      revalidacion en servidor, solape, atomicidad, estado final, auditoria, notas,
      aviso, sesion, estados terminales, errores, accesibilidad y privacidad.)
- [x] CHK006 No quedan marcadores [NEEDS CLARIFICATION] sin resolver en el spec.
      (Busqueda de "NEEDS CLARIFICATION" en `spec.md`: sin resultados; las decisiones por
      defecto estan documentadas en `Assumptions and Ambiguities`.)
- [x] CHK007 Los requisitos describen comportamiento, no detalles de implementacion (tecnologia, base de datos, librerias, rutas).
      (Ningun FR menciona rutas, tablas, librerias ni codigos HTTP; habla de "el panel",
      "el sistema" y "el selector". El unico vocabulario tecnico es "holds", concepto de
      dominio ya existente en la reserva publica.)
- [x] CHK008 Las reglas de negocio citadas son coherentes con el dominio existente o explicitan el cambio necesario.
      (Regla de estado "reprogramada" explicitada en `Assumptions`: requiere habilitar la
      transicion desde pendiente/confirmada, hoy no permitida en `appointment-state-machine.ts`;
      consentimiento y aviso reutilizan el modelo del spec 002.)

## Datos, trazabilidad y seguridad

- [x] CHK009 Las entidades clave del feature y sus relaciones estan definidas.
      (Seccion `Key Entities`: Cita, Horario disponible (derivado, no persistido),
      Registro de cambio de estado y Evento de comunicacion, con su relacion de alimentacion.)
- [x] CHK010 Cada cambio sobre una cita queda ligado a la identidad del administrador responsable.
      (FR-008 exige fecha anterior, nueva fecha, identidad y momento; US3 AC1 y SC-004 lo
      refuerzan con "100% de las reprogramaciones dejan registro".)
- [x] CHK011 Toda operacion exige sesion administrativa y el spec define el comportamiento sin sesion.
      (FR-011: sin sesion se responde sin autorizacion y sin modificar datos; coherente con
      el guardia de sesion del spec 003.)
- [x] CHK012 El spec no expone datos sensibles en la experiencia de usuario.
      (FR-015 anadido durante la revision: prohibido exponer claves, identificadores de
      sesion o datos de otras clientas; el telefono solo en el detalle administrativo.)

## Errores y calidad

- [x] CHK013 El comportamiento ante errores esta definido (rechazos, conflictos y atomicidad de la operacion).
      (FR-004 revalida en servidor, FR-006 atomicidad total, FR-013 mensajes accionables
      para los tres rechazos posibles; US1 AC5 y AC6 verifican que la cita conserva su fecha.)
- [x] CHK014 Los criterios de exito son medibles (numero o condicion binaria verificable).
      (6 metricas: <60s y <=4 interacciones, 100% de cambios visibles de inmediato,
      0 dobles reservas, 100% con auditoria, 100% de mensajes de rechazo, teclado solo.)
- [x] CHK015 Se definen criterios de accesibilidad y usabilidad verificables.
      (FR-014: teclado, lector de pantalla, contraste y mensajes claros en desktop y mobile;
      SC final: flujo completo con teclado y escaneos automaticos sin violaciones.)

## Consistencia

- [x] CHK016 El spec es coherente con los specs 001, 002 y 003 (sesion, consentimiento, historial) sin duplicar su alcance.
      (Sesion = spec 003; consentimiento, mensaje y trazabilidad WhatsApp = spec 002 pero
      reutilizados, con envio automatico explicitamente fuera de alcance; historial de la
      cita = capa ya existente. "Out of scope" evita duplicar el flujo de solicitud del
      cliente y el de confirmacion.)

## Notes

- Marca los items `[x]` solo despues de revisar el spec; deja en [ ] los que requieran correccion o clarificacion.
- `$speckit-implement` usa este estado como puerta de entrada y no debe modificar los marcadores.
- Hallazgos o correcciones se anotan en linea junto al item.
- Revision realizada el 2026-10-07 durante `$speckit-specify`; unica correccion aplicada al spec:
  alta de FR-015 (privacidad) y aclaracion de la transicion de estado en `Assumptions`.
