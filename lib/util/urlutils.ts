const SUPABASE_STORAGE_BUCKET_URL_POSTFIX = '/storage/v1/object/public/';
const SUPABASE_AVATAR_BUCKET_NAME = 'avatar';
const SUPABASE_SHADERTHUMB_BUCKET_NAME = 'shaderthumb';

export const getFullyQualifiedSupabaseBucketURL = (
    url: string,
    avatar: boolean = false
): string => {
    // e.g. https://ihjewugoxadlugnrohdd.supabase.co/storage/v1/object/public/avatar/9f8d7791-84bc-4a38-a6fa-d34bbe2b6fa10.42976325890173617.jpg
    return (
        process.env.NEXT_PUBLIC_SUPABASE_URL +
        SUPABASE_STORAGE_BUCKET_URL_POSTFIX +
        (avatar ? SUPABASE_AVATAR_BUCKET_NAME : SUPABASE_SHADERTHUMB_BUCKET_NAME) +
        '/' +
        url
    );
};
