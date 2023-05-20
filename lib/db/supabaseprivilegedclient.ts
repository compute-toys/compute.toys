import { createClient } from '@supabase/supabase-js';

export const supabasePrivileged =
    typeof window === 'undefined'
        ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_API_KEY)
        : undefined;
