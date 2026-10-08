import { expect, test } from "../e2e/fixtures/viewport";

test.describe("accesibilidad de la landing principal", () => {
  test("expone navegacion y contenido principal en escritorio", async ({ desktopPage }) => {
    await desktopPage.goto("/");

    await expect(
      desktopPage.getByRole("navigation", { name: /navegaci[oó]n principal/i }),
    ).toBeVisible();
    await expect(desktopPage.getByRole("main")).toBeVisible();
    await expect(
      desktopPage.getByRole("heading", {
        name: /bellas/i,
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      desktopPage.getByRole("link", { name: /solicitar cita/i }).first(),
    ).toBeVisible();
  });

  test("mantiene una estructura legible en movil", async ({ mobilePage }) => {
    await mobilePage.goto("/");

    await expect(mobilePage.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(mobilePage.getByRole("main")).toBeVisible();
    await expect(
      mobilePage.getByRole("link", { name: /solicitar cita/i }).first(),
    ).toBeVisible();
  });
});