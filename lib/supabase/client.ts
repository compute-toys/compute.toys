import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'types/database.types';

export function createClient(): SupabaseClient {
    // Use Vite environment variables (import.meta.env)
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }
    
    return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}
