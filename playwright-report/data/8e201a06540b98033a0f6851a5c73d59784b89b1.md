# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\public-booking.spec.ts >> el cliente puede consultar servicios, elegir un horario y registrar una solicitud pendiente
- Location: tests\e2e\public-booking.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/10:30/i)
Expected: visible
Error: strict mode violation: getByText(/10:30/i) resolved to 2 elements:
    1) <button type="button" aria-pressed="true">10:30</button> aka getByRole('button', { name: '10:30' })
    2) <p>Solicitud pendiente para Ana García el 2026-09-24…</p> aka getByText('Solicitud pendiente para Ana')

Call log:
  - Expect "toBeVisible" getByText(/10:30/i) with timeout 5000ms
  - waiting for getByText(/10:30/i)

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - navigation "Navegación pública" [ref=e3]:
      - link "Inicio público" [ref=e4] [cursor=pointer]:
        - /url: /public
      - link "Servicios" [ref=e5] [cursor=pointer]:
        - /url: /public/services
      - link "Citas" [ref=e6] [cursor=pointer]:
        - /url: /public/appointments
  - main [ref=e7]:
    - main [ref=e8]:
      - heading "Solicitar cita" [level=1] [ref=e9]
      - button "Masaje relajante" [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]:
          - text: Fecha de la cita
          - textbox "Fecha de la cita" [ref=e14]: 2026-09-24
        - generic [ref=e15]:
          - button "09:00" [ref=e16]
          - button "09:30" [ref=e17]
          - button "10:00" [ref=e18]
          - button "10:30" [pressed] [ref=e19]
          - button "11:00" [ref=e20]
          - button "11:30" [ref=e21]
          - button "12:00" [ref=e22]
          - button "12:30" [ref=e23]
          - button "13:00" [ref=e24]
          - button "13:30" [ref=e25]
          - button "14:00" [ref=e26]
          - button "14:30" [ref=e27]
          - button "15:00" [ref=e28]
          - button "15:30" [ref=e29]
          - button "16:00" [ref=e30]
        - generic [ref=e31]:
          - text: Nombre completo
          - textbox "Nombre completo" [ref=e32]: Ana García
        - generic [ref=e33]:
          - text: Teléfono WhatsApp
          - textbox "Teléfono WhatsApp" [ref=e34]: "5512345678"
        - generic [ref=e35]:
          - text: Notas opcionales
          - textbox "Notas opcionales" [ref=e36]: Necesito relajación profunda.
        - generic [ref=e37]:
          - checkbox "Acepto que el spa confirme por WhatsApp" [checked] [ref=e38]
          - text: Acepto que el spa confirme por WhatsApp
        - button "Enviar solicitud" [active] [ref=e39]
      - paragraph [ref=e40]: Solicitud pendiente
      - paragraph [ref=e41]: Solicitud pendiente para Ana García el 2026-09-24 a las 10:30.
  - button "Open Next.js Dev Tools" [ref=e47] [cursor=pointer]
  - alert [ref=e51]
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
  8  |   await page.getByRole("button", { name: /masaje relajante/i }).click();
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
  19 |   await expect(page.getByText("Solicitud pendiente", { exact: true })).toBeVisible();
  20 |   await expect(page.getByText(/ana garcía/i)).toBeVisible();
> 21 |   await expect(page.getByText(/10:30/i)).toBeVisible();
     |                                          ^ Error: expect(locator).toBeVisible() failed
  22 | });
  23 | 
```