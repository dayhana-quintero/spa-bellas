export function normalizePhone(rawPhone: string): string {
  // Conserva solo números para aceptar valores con espacios, paréntesis, guiones o signo +.
  const digits = rawPhone.replace(/\D/g, '');

  // Si la entrada está vacía, se devuelve vacío para evitar valores inválidos.
  if (!digits) {
    return '';
  }

  // Si el número ya incluye el código de país de México, se mantiene en formato internacional.
  if (digits.startsWith('52')) {
    return `+${digits}`;
  }

  // Los números locales de 10 dígitos se convierten a +52 + número local.
  if (digits.length === 10) {
    return `+52${digits}`;
  }

  // Los números de 11 dígitos que empiezan con 1 suelen incluir el prefijo local ya incorporado.
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+52${digits.slice(1)}`;
  }

  // Cualquier otro número de longitud media se deja en formato internacional para mantener consistencia.
  if (digits.length >= 8) {
    return `+${digits}`;
  }

  return digits;
}


