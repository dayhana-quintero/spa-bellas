// Campos sensibles que nunca deben quedar visibles en registros o consola.
const SENSITIVE_FIELDS = new Set(['password', 'token', 'secret', 'authorization', 'phone', 'email']);

// Elimina o enmascara datos sensibles antes de registrar información de depuración.
export function sanitizeForLog<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item)) as T;
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (acc, [key, nestedValue]) => {
        // Oculta cualquier campo conocido como sensible.
        if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
          acc[key] = '[REDACTED]';
          return acc;
        }

        // Recurse sobre objetos anidados para proteger también estructuras complejas.
        if (typeof nestedValue === 'object' && nestedValue !== null) {
          acc[key] = sanitizeForLog(nestedValue);
          return acc;
        }

        acc[key] = nestedValue;
        return acc;
      },
      {},
    ) as T;
  }

  return value;
}

// Registra información útil sin filtrar datos sensibles del contexto.
export function logInfo(message: string, context?: Record<string, unknown>) {
  console.info(message, sanitizeForLog(context ?? {}));
}

// Registra errores sin exponer secretos ni identificadores privados.
export function logError(message: string, context?: Record<string, unknown>) {
  console.error(message, sanitizeForLog(context ?? {}));
}
