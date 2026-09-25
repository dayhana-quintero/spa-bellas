import { AxeBuilder } from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Escanea la pagina actual en busca de violaciones de accesibilidad
 * usando las reglas WCAG 2.1 nivel A y AA (el estandar mas comun).
 *
 * Uso tipico dentro de un test:
 *   await page.goto('/public/appointments');
 *   await expectNoAccessibilityViolations(page);
 */
export async function expectNoAccessibilityViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations, formatViolations(results.violations)).toEqual([]);
}

/**
 * Convierte las violaciones de axe en un mensaje legible para la terminal,
 * en vez del objeto JSON crudo que axe devuelve por defecto.
 */
function formatViolations(violations: unknown[]): string {
  if (violations.length === 0) {
    return '';
  }

  return violations
    .map((violation) => {
      const v = violation as {
        id: string;
        description: string;
        helpUrl: string;
        nodes: { html: string }[];
      };

      const affectedElements = v.nodes.map((node) => `    - ${node.html}`).join('\n');

      return `\n[${v.id}] ${v.description}\n  Mas info: ${v.helpUrl}\n  Elementos afectados:\n${affectedElements}`;
    })
    .join('\n');
}