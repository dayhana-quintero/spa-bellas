import { expect, test } from "@playwright/test";

test("la página principal carga correctamente", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByText("To get started, edit the page.tsx file."),
  ).toBeVisible();
});
