import { expect, test } from "@playwright/test";

test("el cliente puede consultar servicios, elegir un horario y registrar una solicitud pendiente", async ({ page }) => {
  await page.goto("/public/appointments");

  await expect(page.getByRole("heading", { name: /solicitar cita/i, level: 1 })).toBeVisible();

  await page.getByRole("button", { name: /masaje relajante/i }).click();
  await page.getByLabel("Fecha de la cita").fill("2026-09-24");
  await page.getByRole("button", { name: /10:30/i }).click();

  await page.getByLabel("Nombre completo").fill("Ana García");
  await page.getByLabel("Teléfono WhatsApp").fill("5512345678");
  await page.getByLabel("Notas opcionales").fill("Necesito relajación profunda.");
  await page.getByLabel("Acepto que el spa confirme por WhatsApp").check();

  await page.getByRole("button", { name: /enviar solicitud/i }).click();

  await expect(page.getByRole("status")).toHaveText(
    "Solicitud pendiente para Ana García el 2026-09-24 a las 10:30.",
  );
});
