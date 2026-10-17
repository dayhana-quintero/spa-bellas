import { supabaseAdminFromEnv } from './fixtures/supabase-admin';

/**
 * La suite asume un catalogo minimo: las especificaciones de reservas publicas
 * buscan el servicio "Masaje relajante". En una base virgen (sin servicios)
 * se crea ese servicio para que las pruebas siempre puedan correr; el modo
 * --virgen del script de limpieza lo retira despues si se quiere el estado
 * recien estrenado.
 */
export default async function globalSetup(): Promise<void> {
  const supabase = supabaseAdminFromEnv();

  const { data, error } = await supabase
    .from('services')
    .select('id')
    .eq('name', 'Masaje relajante')
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo consultar el catalogo de servicios: ${error.message}`);
  }
  if (data) return;

  const { error: insertError } = await supabase.from('services').insert({
    name: 'Masaje relajante',
    category: 'Relajación',
    description: 'Sesión de masaje relajante de cuerpo completo.',
    duration_minutes: 60,
    price_display: '$85.000',
    price: 85000,
    is_active: true,
    is_bookable: true,
  });

  if (insertError) {
    throw new Error(`No se pudo crear el servicio de prueba para la suite: ${insertError.message}`);
  }

  console.log('[global-setup] Servicio "Masaje relajante" creado para la suite e2e.');
}
