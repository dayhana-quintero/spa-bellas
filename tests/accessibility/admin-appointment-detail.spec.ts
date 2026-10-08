import { expect, test } from '../e2e/fixtures/viewport';

import { createAdminSessionCookie } from '../../src/shared/auth/server';
import { createPendingAppointment } from '../e2e/fixtures/appointments';
import { expectNoAccessibilityViolations } from '../helpers/accessibility';

test.describe('accesibilidad del detalle de cita', () => {
  test('expone los controles de WhatsApp y de cambio de estado sin errores de accesibilidad', async ({
    desktopPage,
  }) => {
    await desktopPage.context().addCookies([
      {
        name: 'admin-session',
        value: createAdminSessionCookie(),
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    const appointmentId = await createPendingAppointment(desktopPage);
    await desktopPage.goto(`/admin/appointments/${appointmentId}`);

    await expect(
      desktopPage.getByRole('button', { name: /confirmar por whatsapp/i }),
    ).toBeVisible();
    await expect(
      desktopPage.getByRole('button', { name: /registrar resultado manual/i }),
    ).toBeVisible();
    await expect(
      desktopPage.getByRole('button', { name: /cambiar estado a/i }).first(),
    ).toBeVisible();

    await expectNoAccessibilityViolations(desktopPage);

    // El fallback manual se puede abrir y expone campos etiquetados.
    await desktopPage.getByRole('button', { name: /registrar resultado manual/i }).click();
    await expect(desktopPage.getByLabel('Resultado manual')).toBeVisible();
    await expect(desktopPage.getByLabel('Nota')).toBeVisible();

    await expectNoAccessibilityViolations(desktopPage);
  });

  test('el panel de reprogramacion expone etiquetas visibles y se opera completo con teclado', async ({
    desktopPage,
  }) => {
    await desktopPage.context().addCookies([
      {
        name: 'admin-session',
        value: createAdminSessionCookie(),
        url: 'http://localhost:3000',
        sameSite: 'Lax',
      },
    ]);

    const appointmentId = await createPendingAppointment(desktopPage);
    const detail = (await (
      await desktopPage.request.get(`/api/admin/appointments/${appointmentId}`)
    ).json()) as {
      appointment: { serviceId: string; scheduledStart: string };
    };

    const currentStart = new Date(detail.appointment.scheduledStart);
    const dateKey = `${currentStart.getFullYear()}-${String(currentStart.getMonth() + 1).padStart(2, '0')}-${String(currentStart.getDate()).padStart(2, '0')}`;

    // Horario libre elegido contra el endpoint administrativo (excluye la propia
    // cita): si el dia de la cita quedo lleno por ejecuciones previas, se avanza
    // hasta encontrar un dia con hueco antes de abrir el panel.
    let targetDayKey = dateKey;
    let slots: Array<{ time: string }> = [];
    for (let offset = 0; offset < 10 && slots.length === 0; offset += 1) {
      const candidate = new Date(currentStart);
      candidate.setDate(candidate.getDate() + offset);
      targetDayKey = `${candidate.getFullYear()}-${String(candidate.getMonth() + 1).padStart(2, '0')}-${String(candidate.getDate()).padStart(2, '0')}`;
      const slotsResponse = await desktopPage.request.get(
        `/api/admin/slots?serviceId=${encodeURIComponent(detail.appointment.serviceId)}&date=${targetDayKey}&appointmentId=${appointmentId}`,
      );
      expect(
        slotsResponse.ok(),
        `Los horarios administrativos deben responder (status ${slotsResponse.status()})`,
      ).toBeTruthy();
      slots = (await slotsResponse.json()) as Array<{ time: string }>;
    }
    expect(slots[0], 'Debe haber al menos un horario libre en los proximos dias').toBeTruthy();

    await desktopPage.goto(`/admin/appointments/${appointmentId}`);

    // 1. Abrir el panel con la tecla Enter.
    const rescheduleButton = desktopPage.getByRole('button', { name: 'Reprogramar', exact: true });
    await rescheduleButton.focus();
    await expect(rescheduleButton).toBeFocused();
    await desktopPage.keyboard.press('Enter');

    const panel = desktopPage.getByRole('region', { name: 'Reprogramar cita' });
    await expect(panel).toBeVisible();

    // 2. Las etiquetas del selector se ven y el panel escanea sin violaciones.
    const dateInput = panel.getByLabel('Fecha de la cita');
    await expect(dateInput).toBeVisible();
    await expect(dateInput).toHaveValue(dateKey);
    const noteInput = panel.getByLabel('Nota (opcional)');
    await expect(noteInput).toBeVisible();
    await expectNoAccessibilityViolations(desktopPage);

    // 3. Fecha enfocable con el teclado y ajustada al dia con horarios libres.
    await dateInput.focus();
    await expect(dateInput).toBeFocused();
    if (targetDayKey !== dateKey) {
      await dateInput.fill(targetDayKey);
    }

    // 4. Elegir horario con Enter (aria-pressed refleja la seleccion).
    const slotButton = panel.locator('button', { hasText: slots[0]?.time ?? '' });
    await expect(slotButton).toBeVisible({ timeout: 10_000 });
    await slotButton.focus();
    await expect(slotButton).toBeFocused();
    await desktopPage.keyboard.press('Enter');
    await expect(slotButton).toHaveAttribute('aria-pressed', 'true');

    // 5. Nota de la auditoria escrita con teclado.
    await noteInput.focus();
    await desktopPage.keyboard.type('Cambio de horario con teclado');

    // 6. Confirmar con Enter: el aviso de exito aparece y se ofrece el aviso.
    const confirmButton = panel.getByRole('button', { name: 'Confirmar reprogramacion' });
    await confirmButton.focus();
    await expect(confirmButton).toBeFocused();
    await desktopPage.keyboard.press('Enter');

    const statusRegion = panel.getByRole('status');
    await expect(statusRegion).toContainText('Cita reprogramada');
    await expect(
      panel.getByRole('button', { name: 'Preparar aviso por WhatsApp' }),
    ).toBeVisible();

    // El estado de exito tambien escanea limpio.
    await expectNoAccessibilityViolations(desktopPage);
  });
});
