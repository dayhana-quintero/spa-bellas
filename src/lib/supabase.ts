import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
      supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
      supabaseAnonKey &&
      supabaseAnonKey !== 'tu-anon-key',
  );
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function getSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function assertSupabaseReady() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase no está configurado. Completa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.',
    );
  }

  return getSupabaseClient();
}
