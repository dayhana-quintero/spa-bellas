const SERVICE_IMAGE_SLUGS = [
  'depilacion',
  'dermaplaning',
  'hidratacion-profunda',
  'limpieza-facial-profunda',
  'masaje-reductor',
  'masaje-relajante',
  'peeling-quimico-superficial',
  'radiofrecuencia-facial-y-corporal',
  'spa-de-manos-y-pies',
] as const;

function normalizeServiceName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Devuelve la ruta de la imagen del servicio (public/images/img-<slug>.png)
 * si existe para ese nombre; si no, null para usar la miniatura de respaldo.
 */
export function serviceImageSrc(name: string): string | null {
  const slug = normalizeServiceName(name);
  const match = SERVICE_IMAGE_SLUGS.find(
    (candidate) => slug === candidate || slug.startsWith(`${candidate}-`),
  );
  return match ? `/images/img-${match}.png` : null;
}
