export function normalizePhone(rawPhone: string): string {
  // Conserva solo números para aceptar valores con espacios, paréntesis, guiones o signo +.
  const digits = rawPhone.replace(/\D/g, '');

  // Si la entrada está vacía, se devuelve vacío para evitar valores inválidos.
  if (!digits) {
    return '';
  }

  // Si el número ya incluye el código de país de Colombia, se mantiene.
  if (digits.startsWith('57')) {
    return `+${digits}`;
  }

  // Los números locales colombianos (10 dígitos, celular inicia en 3) se convierten a +57.
  if (digits.length === 10) {
    return `+57${digits}`;
  }

  // Números de 7-8 dígitos (local sin código de área) también asumen +57.
  if (digits.length >= 7 && digits.length < 10) {
    return `+57${digits}`;
  }

  // Cualquier otro número con indicativo (p. ej. 52..., 1..., 34...) se respeta como internacional.
  if (digits.length >= 10) {
    return `+${digits}`;
  }

  return digits;
}


