import { createClient } from '@supabase/supabase-js';

export const SUPABASE_AVATAR_STORAGE_BUCKET_URL_POSTFIX = "/storage/v1/object/public/avatar/";
export const SUPABASE_STORAGE_BUCKET_URL_POSTFIX = "/storage/v1/object/public/";
export const SUPABASE_AVATAR_BUCKET_NAME = "avatar";
export const SUPABASE_SHADERTHUMB_BUCKET_NAME = "shaderthumb";
export const SUPABASE_SHADER_TABLE_NAME = "shader";
export const SUPABASE_PROFILE_TABLE_NAME = "profile";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_API_KEY
);