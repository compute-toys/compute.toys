import { SupabaseClient } from '@supabase/supabase-js';
import { AuthorProfile } from 'lib/atoms/atoms';
import { SUPABASE_SHADER_TABLE_NAME } from 'lib/db/supabaseclient';
import { Database } from 'types/database.types';

export interface Shader {
    id: number;
    name: string;
    description: string | null;
    thumb_url: string | null;
    visibility: Database['public']['Enums']['visibility'];
    body: string;
    profile: AuthorProfile;
}

export async function fetchShader(
    supabase: SupabaseClient<Database>,
    id: number
): Promise<Shader | null> {
    const { data, error, status } = await supabase
        .from(SUPABASE_SHADER_TABLE_NAME)
        .select(
            `
            id,
            name,
            description,
            thumb_url,
            visibility,
            body,
            profile:author (
                username,
                avatar_url,
                id
            )
        `
        )
        .eq('id', id)
        .single();

    if (error && status !== 406) {
        console.error(error.message);
    }

    return data as Shader;
}

// export function buildHead(shader) {
//     const image = getFullyQualifiedSupabaseBucketURL(
//         SUPABASE_SHADERTHUMB_BUCKET_NAME,
//         shader.thumb_url
//     );
//     return (
//         <Head>
//             <title>{shader.name}</title>
//             <meta property="og:type" content="image" />
//             <meta property="og:site_name" content="@compute.toys" />
//             <meta property="og:title" content={shader.name} />
//             <meta property="og:description" content={shader.description} />
//             <meta property="og:image" content={image} />
//             <meta name="twitter:card" content="summary_large_image" />
//             <meta name="twitter:site:id" content="@compute_toys" />
//             <meta name="twitter:title" content={shader.name} />
//             <meta name="twitter:description" content={shader.description} />
//             <meta name="twitter:image" content={image} />
//         </Head>
//     );
// }
