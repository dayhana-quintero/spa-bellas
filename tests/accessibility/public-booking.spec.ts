import { expect, test } from "../e2e/fixtures/viewport";

test.describe("accesibilidad del flujo publico de reservas", () => {
  test("expone controles etiquetados y enfocado por teclado", async ({ desktopPage }) => {
    await desktopPage.goto("/public/appointments");

    await expect(
      desktopPage.getByRole("heading", { name: /solicitar cita/i, level: 1 }),
    ).toBeVisible();

    const serviceButton = desktopPage.getByRole("button", { name: /masaje relajante/i });
    const dateField = desktopPage.getByLabel("Fecha de la cita");
    const nameField = desktopPage.getByLabel("Nombre completo");
    const phoneField = desktopPage.getByLabel("Telefono WhatsApp");
    const notesField = desktopPage.getByLabel("Notas opcionales");
    const consentField = desktopPage.getByLabel("Acepto que el spa confirme por WhatsApp");
    const slotButton = desktopPage.getByRole("button", { name: "10:30" });

    await expect(serviceButton).toBeVisible();
    await serviceButton.focus();
    await expect(serviceButton).toBeFocused();

    await desktopPage.keyboard.press("Tab");
    await expect(dateField).toBeFocused();

    await desktopPage.keyboard.press("Tab");
    await expect(nameField).toBeFocused();

    await expect(phoneField).toBeVisible();
    await expect(notesField).toBeVisible();
    await expect(consentField).toBeVisible();
    await expect(slotButton).toBeVisible();
  });

  test("muestra un mensaje de error claro si falta el consentimiento", async ({ mobilePage }) => {
    await mobilePage.goto("/public/appointments");

    await mobilePage.getByRole("button", { name: /masaje relajante/i }).click();
    await mobilePage.getByLabel("Fecha de la cita").fill("2026-09-24");
    await mobilePage.getByRole("button", { name: /10:30/i }).click();
    await mobilePage.getByLabel("Nombre completo").fill("Ana Garcia");
    await mobilePage.getByLabel("Telefono WhatsApp").fill("5512345678");
    await mobilePage.getByRole("button", { name: /enviar solicitud/i }).click();

    await expect(
      mobilePage.getByText(/se requiere el consentimiento para confirmar por whatsapp/i),
    ).toBeVisible();
  });
});