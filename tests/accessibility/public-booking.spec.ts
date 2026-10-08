import type { Locator, Page } from "@playwright/test";

import { expect, test } from "../e2e/fixtures/viewport";

const pad = (value: number) => String(value).padStart(2, "0");

/** Selecciona una fecha con horarios disponibles y elige el primero. */
async function pickAvailableSlot(page: Page): Promise<void> {
  for (let offset = 1; offset <= 14; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    await page.getByLabel("Fecha de la cita").fill(value);

    const slot = page.getByRole("button", { name: /hora\s+\d{2}:\d{2}/i }).first();
    try {
      await expect(slot).toBeVisible({ timeout: 2500 });
      await slot.click();
      return;
    } catch {
      // Ese día no tiene horarios libres: probamos con la siguiente fecha.
    }
  }

  throw new Error("No se encontraron horarios disponibles en las próximas dos semanas.");
}

/** Avanza con Tab hasta que el control indicado tenga el foco. */
async function tabUntilFocused(page: Page, control: Locator, maxTabs = 20): Promise<void> {
  for (let index = 0; index < maxTabs; index += 1) {
    const isFocused = await control.evaluate((element) => element === document.activeElement);
    if (isFocused) return;
    await page.keyboard.press("Tab");
  }

  await expect(control).toBeFocused();
}

test.describe("accesibilidad del flujo publico de reservas", () => {
  test("expone controles etiquetados y enfocado por teclado", async ({ desktopPage }) => {
    await desktopPage.goto("/public/appointments");

    await expect(
      desktopPage.getByRole("heading", { name: /solicitar cita/i, level: 1 }),
    ).toBeVisible();

    const serviceButton = desktopPage.getByRole("button", { name: /masaje relajante/i });
    const dateField = desktopPage.getByLabel("Fecha de la cita");
    const nameField = desktopPage.getByLabel("Nombre completo");
    const phoneField = desktopPage.getByLabel(/tel[eé]fono whatsapp/i);
    const notesField = desktopPage.getByLabel("Notas opcionales");
    const consentField = desktopPage.getByLabel("Acepto que el spa confirme por WhatsApp");

    await expect(serviceButton).toBeVisible();
    await serviceButton.focus();
    await expect(serviceButton).toBeFocused();

    // El foco recorre los servicios disponibles antes de llegar al selector de fecha.
    await tabUntilFocused(desktopPage, dateField);
    await tabUntilFocused(desktopPage, nameField);

    await expect(phoneField).toBeVisible();
    await expect(notesField).toBeVisible();
    await expect(consentField).toBeVisible();
    await expect(
      desktopPage.getByRole("button", { name: /enviar solicitud/i }),
    ).toBeVisible();
  });

  test("muestra un mensaje de error claro si falta el consentimiento", async ({ mobilePage }) => {
    test.setTimeout(90_000);
    await mobilePage.goto("/public/appointments");

    await mobilePage.getByRole("button", { name: /masaje relajante/i }).click();
    await pickAvailableSlot(mobilePage);
    await mobilePage.getByLabel("Nombre completo").fill("Ana Garcia");
    await mobilePage.getByLabel(/tel[eé]fono whatsapp/i).fill("5512345678");
    await mobilePage.getByRole("button", { name: /enviar solicitud/i }).click();

    await expect(
      mobilePage.getByRole("alert").filter({ hasText: /acepta la confirmación por whatsapp/i }),
    ).toHaveText(/acepta la confirmación por whatsapp para continuar/i);
  });
});
