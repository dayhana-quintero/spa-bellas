# Quickstart: Reprogramar citas (004-reschedule-appointments)

Guía de validación del feature. No contiene implementación: describe cómo ejecutar y qué esperar.

## Prerrequisitos

- Dependencias instaladas (`npm install`) y `.env.local` con las claves de Supabase (modo real; sin él, la app opera en modo local con degradación).
- Puerto `3000` libre.

## Comandos de validación

```powershell
npm run typecheck      # sin errores de tipos
npm run lint           # sin avisos
npm test               # unit + integration (vitest)
npm run build          # build de producción
npx playwright test    # e2e + accesibilidad
```

Todos deben terminar en verde antes de dar el feature por terminado.

## Escenarios manuales

### S1 — Reprogramar una cita pendiente (US1)

1. Crear una cita desde `/public/appointments` (o reutilizar una pendiente).
2. Abrir su detalle `/admin/appointments/{id}`.
3. Pulsar "Reprogramar" → elegir otro día → elegir un horario → confirmar.
4. **Esperado**: mensaje de éxito con la nueva fecha; el detalle muestra la nueva fecha y hora, estado `reprogramada`, y el historial tiene un registro con fecha anterior, nueva fecha y el administrador de la sesión.

### S2 — Rechazo por horario ocupado (FR-004)

1. Con dos citas en horarios distintos, abrir el detalle de una e intentar moverla a un horario que acaba de ocuparse con otra reserva pública.
2. **Esperado**: mensaje "Ese horario ya no está libre…", la cita conserva su fecha original y no se añade registro al historial.

### S3 — Rechazo por cita cambiada en otra pestaña (FR-006)

1. Abrir el detalle en dos pestañas. En la primera, cancelar la cita.
2. En la segunda, reprogramarla.
3. **Esperado**: 409 con el mensaje de "cambió desde otra pestaña"; nada se modifica.

### S4 — Estados vetados (FR-012)

1. Abrir el detalle de una cita cancelada y de otra completada.
2. **Esperado**: no aparece el botón "Reprogramar"; si se llama la API directamente responde `409 status-not-allowed`.

### S5 — Aviso por WhatsApp (US2)

1. Reprogramar una cita creada con consentimiento de WhatsApp.
2. **Esperado**: aparece la opción de aviso; al abrirla, el mensaje contiene el nuevo horario y la pestaña de wa.me se abre; el evento queda en la trazabilidad con el `adminId` de la sesión.
3. Repetir con una cita sin consentimiento: la opción no aparece y la reprogramación igual se completa.

### S6 — Día sin huecos y accesibilidad

1. Elegir en el selector un día lleno o no laborable.
2. **Esperado**: mensaje "No hay horarios disponibles para …", sin errores en consola.
3. Ejecutar `npx playwright test admin-appointment-detail`: **0 violaciones axe** y el flujo se completa con teclado.

### S7 — Sin sesión (FR-011)

1. En una ventana anónima, llamar `POST /api/admin/appointments/{id}/reschedule`.
2. **Esperado**: `401` y ninguna modificación en la cita.

## Verificación automática asociada

| Criterio del spec | Prueba |
|---|---|
| US1 aceptación 1–7 | `tests/e2e/admin-reschedule.spec.ts` + unit de dominio |
| US2 aceptación 1–4 | unit de plantilla de aviso + e2e de aviso |
| US3 aceptación 1–4 | e2e de historial + integration de la ruta |
| SC métricas de rechazo | integration (409 en los cuatro motivos) |
| Accesibilidad y teclado | `tests/accessibility/admin-appointment-detail.spec.ts` |
| Sesión obligatoria | integration (401 sin cookie) |

## Rollback

El feature es aditivo (dos rutas nuevas, un componente nuevo y dos transiciones de estado). Para retirarlo: eliminar la acción de la interfaz y las rutas nuevas; las citas ya reprogramadas conservan su historial sin efectos secundarios.
