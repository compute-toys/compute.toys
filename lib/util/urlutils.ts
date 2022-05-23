import {SUPABASE_STORAGE_BUCKET_URL_POSTFIX} from "../db/supabaseclient";

export const getFullyQualifiedSupabaseBucketURL = (bucket: string, url: string): string => {
    // e.g. https://ihjewugoxadlugnrohdd.supabase.co/storage/v1/object/public/avatar/9f8d7791-84bc-4a38-a6fa-d34bbe2b6fa10.42976325890173617.jpg
    return process.env.NEXT_PUBLIC_SUPABASE_URL + SUPABASE_STORAGE_BUCKET_URL_POSTFIX + bucket + "/" + url;
}