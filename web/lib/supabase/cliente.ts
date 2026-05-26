import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para LECTURA pública del catálogo (RLS lectura pública).
 * Usa la publishable key (no la service_role). Sin persistencia de sesión: el
 * catálogo no requiere auth. La escritura del catálogo se hace fuera de la app.
 *
 * Si faltan las variables (`NEXT_PUBLIC_SUPABASE_URL` / `..._PUBLISHABLE_KEY`),
 * `supabase` es null y la capa de datos cae al dataset estático de respaldo.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const clavePublica = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigurado: boolean = Boolean(url && clavePublica);

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(url as string, clavePublica as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
