import { expect, test } from "@playwright/test";
import { createAdminSessionCookie } from "../../src/shared/auth/server";

test("el cliente puede consultar servicios, elegir un horario y registrar una solicitud pendiente", async ({ page }) => {
  await page.context().addCookies([{
    name: "admin-session",
    value: createAdminSessionCookie(),
    url: "http://localhost:3000",
    sameSite: "Lax",
  }]);
  await page.goto("/public/appointments");

  await expect(page.getByRole("heading", { name: /solicitar cita/i, level: 1 })).toBeVisible();

  const servicesResponse = await page.request.get("/api/public/services");
  const services = await servicesResponse.json() as Array<{ id: string; name: string }>;
  let booking: { service: { id: string; name: string }; date: string; time: string } | undefined;

  for (let offset = 1; offset <= 30 && !booking; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const dateString = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");

    for (const service of services) {
      const response = await page.request.get(`/api/public/slots?serviceId=${service.id}&date=${dateString}`);
      const slots = await response.json() as Array<{ time: string }>;
      if (slots[0]) {
        booking = { service, date: dateString, time: slots[0].time };
        break;
      }
    }
  }

  expect(booking, "Debe existir al menos un servicio y horario disponible").toBeDefined();
  await page.getByRole("button", { name: booking!.service.name, exact: true }).click();
  await page.getByLabel("Fecha de la cita").fill(booking!.date);
  await page.getByRole("button", { name: new RegExp(booking!.time) }).click();

  await page.getByLabel("Nombre completo").fill("Ana García");
  await page.getByLabel("Teléfono WhatsApp").fill("5512345678");
  await page.getByLabel("Notas opcionales").fill("Necesito relajación profunda.");
  await page.getByLabel("Acepto que el spa confirme por WhatsApp").check();

  const createdResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/public/appointments") &&
      response.request().method() === "POST",
  );

  await page.getByRole("button", { name: /enviar solicitud/i }).click();

  await expect(page.getByRole("status")).toHaveText(`Solicitud pendiente para Ana García el ${booking!.date} a las ${booking!.time}.`);

  const created = (await (await createdResponse).json()) as { id: string };
  expect(created.id).toBeTruthy();

  // Tras crear la cita se limpian la seleccion y los datos del cliente.
  await expect(page.getByLabel("Fecha de la cita")).toHaveValue("");
  await expect(page.getByLabel("Nombre completo")).toHaveValue("");
  await expect(page.getByLabel("Teléfono WhatsApp")).toHaveValue("");
  await expect(page.getByLabel("Notas opcionales")).toHaveValue("");
  await expect(page.getByLabel("Acepto que el spa confirme por WhatsApp")).not.toBeChecked();

  await page.goto(`/admin/appointments/${created.id}`);
  await expect(page.getByText("Ana García")).toBeVisible();
  await expect(page.getByRole("button", { name: "Cambiar estado a confirmada" })).toBeVisible();

  await page.getByRole("button", { name: "Cambiar estado a confirmada" }).click();

  await expect(page.getByText(/Estado:\s*confirmada/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Cambiar estado a confirmada" })).toHaveCount(0);
});
