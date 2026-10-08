# Requirements Checklist: Spa WhatsApp Automation

**Fecha de verificacion**: 2026-10-07

- [x] Feature scope clearly defines the WhatsApp confirmation flow.
      (`specs/002-spa-whatsapp-automation/spec.md`: user stories 1-4 y FR-001..FR-014,
      incluida la suposicion de adaptador sin API real de WhatsApp)
- [x] Pending appointment detail includes the action to prepare contact.
      (`src/app/admin/appointments/[appointmentId]/page.tsx` renderiza `StatusControls`,
      que expone el boton "Confirmar por WhatsApp"; verificado punta a punta en
      `tests/e2e/admin-whatsapp-traceability.spec.ts`)
- [x] Message generator includes service, date and time in a clear client-facing format.
      (`prepareConfirmationMessage()` en `src/integrations/whatsapp/whatsapp-confirmation.ts`
      construye "Hola {cliente}, confirmamos tu cita de {servicio} para el {fecha} a las {hora}";
      unit test en `tests/unit/whatsapp/whatsapp-confirmation.test.ts`)
- [x] Fallback manual result is available when outbound communication fails.
      (selector "Resultado manual" con nota obligatoria en
      `src/app/admin/appointments/status-controls.tsx`; unit test del resultado manual y
      apertura del formulario en `tests/accessibility/admin-appointment-detail.spec.ts`)
- [x] State changes are auditable and linked to admin identity.
      (cambios de estado: `PATCH /api/admin/appointments/[id]` exige sesion y escribe
      `changed_by_admin_id`; eventos de WhatsApp: `POST /api/admin/appointments/[id]/communications`
      guarda en `whatsapp_communications` con el `admin_id` de la sesion — antes el evento
      se perdia en localStorage con el id hardcodeado `admin-1`; e2e
      `admin-whatsapp-traceability.spec.ts` verifica la identidad real y el 401 sin sesion)
- [x] UI remains accessible and does not leak sensitive data.
      (6 escaneos axe sin violaciones en el panel — inventario, historial, dashboard
      escritorio/movil y detalle de cita: `tests/accessibility/admin-appointment-detail.spec.ts`
      cubre los controles de WhatsApp; contraste del boton corregido de `#0d9f5d` (3.42:1)
      a `#0a7d49` (5.19:1); `SUPABASE_SERVICE_ROLE_KEY` solo se lee en `src/lib/supabase.ts`,
      sin uso en componentes de cliente)
