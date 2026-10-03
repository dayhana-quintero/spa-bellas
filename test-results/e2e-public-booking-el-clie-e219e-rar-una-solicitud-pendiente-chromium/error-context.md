# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\public-booking.spec.ts >> el cliente puede consultar servicios, elegir un horario y registrar una solicitud pendiente
- Location: tests\e2e\public-booking.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /masaje relajante/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - paragraph [ref=e4]: Bellas Spa
      - heading "Solicitar cita" [level=1] [ref=e5]
      - generic [ref=e6]:
        - button "Manicura" [pressed] [ref=e9]
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]:
              - text: Fecha de la cita
              - textbox "Fecha de la cita" [ref=e13]: 2026-10-04
            - generic [ref=e14]:
              - generic [ref=e15]: Servicio
              - generic [ref=e16]: Manicura
          - paragraph [ref=e18]: No hay horarios disponibles para 2026-10-04. Prueba otra fecha o servicio.
        - generic [ref=e19]:
          - generic [ref=e20]:
            - generic [ref=e21]:
              - text: Nombre completo
              - textbox "Nombre completo" [ref=e22]
            - generic [ref=e23]:
              - text: Teléfono WhatsApp
              - textbox "Teléfono WhatsApp" [ref=e24]
          - generic [ref=e25]:
            - text: Notas opcionales
            - textbox "Notas opcionales" [ref=e26]
          - generic [ref=e27]:
            - checkbox "Acepto que el spa confirme por WhatsApp" [ref=e28]
            - text: Acepto que el spa confirme por WhatsApp
          - button "Enviar solicitud" [disabled] [ref=e29]
  - button "Open Next.js Dev Tools" [ref=e35] [cursor=pointer]
  - alert [ref=e39]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("el cliente puede consultar servicios, elegir un horario y registrar una solicitud pendiente", async ({ page }) => {
  4  |   await page.goto("/public/appointments");
  5  | 
  6  |   await expect(page.getByRole("heading", { name: /solicitar cita/i, level: 1 })).toBeVisible();
  7  | 
> 8  |   await page.getByRole("button", { name: /masaje relajante/i }).click();
     |                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  9  |   await page.getByLabel("Fecha de la cita").fill("2026-09-24");
  10 |   await page.getByRole("button", { name: /10:30/i }).click();
  11 | 
  12 |   await page.getByLabel("Nombre completo").fill("Ana García");
  13 |   await page.getByLabel("Teléfono WhatsApp").fill("5512345678");
  14 |   await page.getByLabel("Notas opcionales").fill("Necesito relajación profunda.");
  15 |   await page.getByLabel("Acepto que el spa confirme por WhatsApp").check();
  16 | 
  17 |   await page.getByRole("button", { name: /enviar solicitud/i }).click();
  18 | 
  19 |   await expect(page.getByRole("status")).toHaveText(
  20 |     "Solicitud pendiente para Ana García el 2026-09-24 a las 10:30.",
  21 |   );
  22 | });
  23 | 
```