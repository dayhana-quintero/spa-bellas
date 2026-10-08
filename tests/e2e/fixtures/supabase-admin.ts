import { existsSync, readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente administrativo de Supabase para los tests que necesitan tocar datos
 * que la API no expone (p. ej. retirar el consentimiento de WhatsApp).
 * Lee las claves del mismo archivo de entorno que usa la aplicacion.
 */
export function supabaseAdminFromEnv(): SupabaseClient {
  const envPath = ['.env.local', '.env'].find((candidate) => existsSync(candidate));
  if (!envPath) {
    throw new Error('No se encontro archivo de entorno con las claves de Supabase para los tests.');
  }

  const env = Object.fromEntries(
    readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno local.');
  }

  return createClient(url, serviceKey);
}
