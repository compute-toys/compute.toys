import { createClient } from '@supabase/supabase-js';

export const SUPABASE_AVATAR_STORAGE_BUCKET_URL_POSTFIX = "/storage/v1/object/public/avatar/";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_API_KEY
);