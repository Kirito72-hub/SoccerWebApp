import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client with realtime configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    },
    auth: {
        persistSession: false // We're using localStorage manually
    }
});

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    const configured = Boolean(supabaseUrl && supabaseAnonKey);
    if (!configured) {
        console.warn('[Supabase] Not configured - missing URL or anon key');
    } else {
        console.log('[Supabase] ✅ Configured:', { url: supabaseUrl.substring(0, 30) + '...' });
    }
    return configured;
};
