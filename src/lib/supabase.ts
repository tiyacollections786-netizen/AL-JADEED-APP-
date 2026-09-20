import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export interface SupabaseConfig {
  url?: string;
  anonKey?: string;
}

/**
 * Resolves the Supabase URL using static property accesses required for Vite AST replacement.
 */
export function getSupabaseUrl(customConfig?: SupabaseConfig): string {
  if (customConfig?.url && customConfig.url.trim().length > 0) {
    return customConfig.url.trim();
  }

  // 1. Literal import.meta.env accesses (statically replaced by Vite at build time)
  try {
    const metaNext = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
    if (metaNext && typeof metaNext === 'string' && metaNext.trim().length > 0) {
      return metaNext.trim();
    }
    const metaVite = import.meta.env.VITE_SUPABASE_URL;
    if (metaVite && typeof metaVite === 'string' && metaVite.trim().length > 0) {
      return metaVite.trim();
    }
    const metaRaw = (import.meta.env as any).SUPABASE_URL;
    if (metaRaw && typeof metaRaw === 'string' && metaRaw.trim().length > 0) {
      return metaRaw.trim();
    }
  } catch {
    // Ignore in non-vite environments
  }

  // 2. process.env accesses (statically defined via vite.config.ts define or Node.js)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const pNext = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (pNext && typeof pNext === 'string' && pNext.trim().length > 0) {
        return pNext.trim();
      }
      const pVite = process.env.VITE_SUPABASE_URL;
      if (pVite && typeof pVite === 'string' && pVite.trim().length > 0) {
        return pVite.trim();
      }
      const pRaw = process.env.SUPABASE_URL;
      if (pRaw && typeof pRaw === 'string' && pRaw.trim().length > 0) {
        return pRaw.trim();
      }
    }
  } catch {
    // Ignore
  }

  return '';
}

/**
 * Resolves the Supabase Anon Key using static property accesses required for Vite AST replacement.
 */
export function getSupabaseAnonKey(customConfig?: SupabaseConfig): string {
  if (customConfig?.anonKey && customConfig.anonKey.trim().length > 0) {
    return customConfig.anonKey.trim();
  }

  // 1. Literal import.meta.env accesses (statically replaced by Vite at build time)
  try {
    const metaNext = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (metaNext && typeof metaNext === 'string' && metaNext.trim().length > 0) {
      return metaNext.trim();
    }
    const metaVite = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (metaVite && typeof metaVite === 'string' && metaVite.trim().length > 0) {
      return metaVite.trim();
    }
    const metaRaw = (import.meta.env as any).SUPABASE_ANON_KEY;
    if (metaRaw && typeof metaRaw === 'string' && metaRaw.trim().length > 0) {
      return metaRaw.trim();
    }
  } catch {
    // Ignore in non-vite environments
  }

  // 2. process.env accesses (statically defined via vite.config.ts define or Node.js)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const pNext = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (pNext && typeof pNext === 'string' && pNext.trim().length > 0) {
        return pNext.trim();
      }
      const pVite = process.env.VITE_SUPABASE_ANON_KEY;
      if (pVite && typeof pVite === 'string' && pVite.trim().length > 0) {
        return pVite.trim();
      }
      const pRaw = process.env.SUPABASE_ANON_KEY;
      if (pRaw && typeof pRaw === 'string' && pRaw.trim().length > 0) {
        return pRaw.trim();
      }
    }
  } catch {
    // Ignore
  }

  return '';
}

/**
 * Gets or initializes the Supabase client safely with lazy initialization.
 * Reads environment variables configured in Vercel (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * or Vite environment variables without using service_role keys.
 */
export function getSupabase(customConfig?: SupabaseConfig): SupabaseClient | null {
  const url = getSupabaseUrl(customConfig);
  const anonKey = getSupabaseAnonKey(customConfig);

  if (!url || !anonKey) {
    console.warn('[Supabase Config] Missing credentials. URL present:', !!url, 'AnonKey present:', !!anonKey);
    return null;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseClient;
  } catch (err) {
    console.error('[Supabase Init Error]', err);
    return null;
  }
}

/**
 * Tests connection to a Supabase project URL and Key.
 */
export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> {
  const targetUrl = url || getSupabaseUrl();
  const targetKey = anonKey || getSupabaseAnonKey();

  if (!targetUrl || !targetKey) {
    return { success: false, message: 'Supabase URL and Anon Key are required.' };
  }

  try {
    const client = createClient(targetUrl, targetKey);
    const { error, status } = await client.from('users').select('id').limit(1);

    if (!error) {
      return { success: true, message: 'Connected to Supabase! public.users table is ready.' };
    }

    if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
      return {
        success: true,
        message: 'Connected to Supabase! Tables need to be created using the SQL Editor.',
      };
    }

    if (status === 401) {
      return { success: false, message: 'Invalid API Key. Please verify in Supabase Project Settings.' };
    }

    return { success: true, message: `Connected to Supabase (${error.message || status})` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error connecting to Supabase.' };
  }
}
