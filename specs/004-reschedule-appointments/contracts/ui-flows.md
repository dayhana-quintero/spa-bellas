# UI Flows: Reschedule Appointments (Reprogramar citas)

## Flow 1 — Reprogramar una cita (US1, P1)

Actor: administrador con sesión válida.

1. Abrir el detalle de una cita (`/admin/appointments/{id}`).
2. Si el estado es elegible, pulsar **"Reprogramar"** en el bloque de acciones.
3. El panel muestra la fecha y hora actuales y despliega el selector: campo de fecha + rejilla de horarios libres del servicio.
4. Elegir día → se cargan los horarios de ese día bajo demanda.
5. Elegir horario (rejilla con `aria-pressed`, mismo estilo que la reserva pública).
6. (Opcional) Escribir una nota del motivo del cambio.
7. Pulsar **"Confirmar reprogramación"**.
8. Resultado:
   - Éxito: mensaje de confirmación con la nueva fecha y hora, el detalle recarga mostrando la nueva fecha y el estado "reprogramada".
   - Rechazo: mensaje de error visible junto al panel; el selector conserva el día elegido y la cita mantiene su fecha original.
9. **"Cancelar"** cierra el panel sin ningún cambio en la cita.

## Flow 2 — Aviso al cliente (US2, P2)

1. Tras confirmar, el panel ofrece **"Preparar aviso por WhatsApp"** (solo con consentimiento).
2. Al pulsarlo se abre la pestaña de WhatsApp con el mensaje del nuevo horario.
3. El evento queda registrado en la trazabilidad de la cita con la identidad de la sesión.
4. Sin consentimiento, la opción no aparece y la reprogramación ya se completó.
5. Si el navegador bloquea la pestaña, se informa del bloqueo y el resultado de la reprogramación no cambia.

## Flow 3 — Historial (US3, P3)

1. Tras el cambio, el detalle y la lista administrativa muestran la nueva fecha sin pasos extra.
2. El historial de la cita presenta un registro por cada reprogramación con fecha anterior, nueva fecha, administrador y momento.
3. Reprogramaciones repetidas añaden registros; ninguna sobreescribe la anterior.

## Interface States

| Estado | Comportamiento |
|---|---|
| Cerrado | Solo se ve el botón "Reprogramar" (si el estado es elegible). |
| Abierto | Selector con fecha actual, rejilla de horarios, nota y acciones confirmar/cancelar. |
| Cargando horarios | La rejilla espera; los mensajes vacíos del selector ("No hay horarios disponibles para …") se muestran igual que en la reserva pública. |
| Enviando | El botón de confirmación queda deshabilitado para evitar dobles envíos. |
| Éxito | Mensaje de estado con la nueva fecha y hora; el detalle se recarga. |
| Error | Mensaje junto al panel con la causa concreta y el día elegido conservado. |

## Accessibility Requirements

- El panel completo es operable con teclado: foco visible, orden lógico y cierre con Cancelar.
- El selector mantiene etiquetas visibles para fecha y horarios y `aria-pressed` en la hora elegida.
- Mensajes de éxito y error visibles para lector de pantalla (región de estado, mismo patrón que `status-controls`).
- Contraste AA en todos los textos y botones nuevos (verificado con axe en `tests/accessibility/admin-appointment-detail.spec.ts`).
- Disponible en desktop y mobile sin pérdida de funcionalidad.

## Error Messages (español, para el administrador)

| Causa | Mensaje |
|---|---|
| Horario ocupado | "Ese horario ya no está libre. Elige otro." |
| Solape con otra cita de la clienta | "La clienta ya tiene otra cita que se cruza con ese horario." |
| Cita cambiada en otra vista | "La cita cambió desde otra pestaña. Revisa su estado antes de reprogramar." |
| Estado no elegible | "Esta cita ya no se puede reprogramar." |
| Fecha u hora pasada | "Elige una fecha y hora futuras." |
| Sin sesión | "No autorizado." (la ruta redirige al login como el resto del panel) |
