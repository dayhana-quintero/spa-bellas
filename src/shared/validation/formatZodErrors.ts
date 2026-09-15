import { z } from 'zod';

// Convierte el texto crudo de Zod en un mensaje breve y amigable para formularios.
function normalizeMessage(message: string): string {
  // Los mensajes de Zod son verbosos; aquí se simplifican los errores comunes de longitud y requeridos.
  const clean = message
    .replace(/Too small: expected string to have >=?/gi, 'al menos')
    .replace(/Too small: expected number to be >=?/gi, 'al menos')
    .replace(/Expected.*?to be/, 'debe ser')
    .replace(/\s+/g, ' ')
    .trim();

  // Mantiene el mínimo numérico en un formato natural para la retroalimentación del formulario.
  if (clean.includes('>=') && clean.includes('characters')) {
    const match = clean.match(/(\d+)/);
    if (match) {
      return `al menos ${match[1]} caracteres`;
    }
  }

  // Lo mismo aplica para arreglos o colecciones.
  if (clean.includes('>=') && clean.includes('items')) {
    const match = clean.match(/(\d+)/);
    if (match) {
      return `al menos ${match[1]} elementos`;
    }
  }

  // Mantiene un mensaje seguro para campos obligatorios.
  if (clean.includes('Required')) {
    return 'Este campo es obligatorio';
  }

  return clean;
}

// Convierte la lista de errores de Zod en un objeto indexado por campo para el estado de validación del UI.
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const path = issue.path.length > 0 ? issue.path.map(String).join('.') : 'form';
    acc[path] = normalizeMessage(issue.message);
    return acc;
  }, {});
}
