import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hosting-neutral Supabase client: points ONLY to the project selected by its owner.
// A harmless invalid host keeps installable preview/demo mode working before setup.
export const backendConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);
const backendUrl = import.meta.env.VITE_SUPABASE_URL || 'https://unconfigured.invalid';
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'unconfigured-preview-key';

export const supabase = createClient<Database>(backendUrl, publicKey, {
  auth: {
    storage: typeof window === 'undefined' ? undefined : window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
