import { expect, test } from "../e2e/fixtures/viewport";

test.describe("accesibilidad de la landing principal", () => {
  test("expone navegación y contenido principal en escritorio", async ({ desktopPage }) => {
    await desktopPage.goto("/");

    await expect(
      desktopPage.getByRole("navigation", { name: /navegación principal/i }),
    ).toBeVisible();
    await expect(desktopPage.getByRole("main")).toBeVisible();
    await expect(
      desktopPage.getByRole("heading", {
        name: /cuidado de spa pensado para tu bienestar/i,
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      desktopPage.getByRole("link", { name: /ver servicios/i }),
    ).toBeVisible();
  });

  test("mantiene una estructura legible en móvil", async ({ mobilePage }) => {
    await mobilePage.goto("/");

    await expect(mobilePage.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(mobilePage.getByRole("main")).toBeVisible();
    await expect(
      mobilePage.getByRole("link", { name: /agendar cita/i }),
    ).toBeVisible();
  });
});
