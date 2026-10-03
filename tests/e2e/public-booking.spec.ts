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

  await page.getByRole("button", { name: /enviar solicitud/i }).click();

  await expect(page.getByRole("status")).toHaveText(`Solicitud pendiente para Ana García el ${booking!.date} a las ${booking!.time}.`);

  await page.goto("/admin");
  await expect(page.getByText("Ana García")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar cita" }).click();
  await expect(page).toHaveURL(/\/admin\?status=confirmada/);
  await expect(page.getByText("Ana García")).toBeVisible();
  await expect(page.getByText("Confirmada", { exact: true })).toBeVisible();
});
