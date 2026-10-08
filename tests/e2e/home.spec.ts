import { expect, test } from "@playwright/test";

test("la página principal carga correctamente", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /bellas/i, level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: /navegación principal/i })).toBeVisible();
});
