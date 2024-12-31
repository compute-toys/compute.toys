import { SupabaseClient } from '@supabase/supabase-js';
import { AuthorProfile } from 'lib/atoms/atoms';
import {
    SUPABASE_SHADER_TABLE_NAME,
    SUPABASE_SHADERTHUMB_BUCKET_NAME
} from 'lib/db/supabaseclient';
import { getFullyQualifiedSupabaseBucketURL } from 'lib/util/urlutils';
import { Metadata } from 'next';
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

export function buildHead(shader: Shader): Metadata {
    const images = shader.thumb_url
        ? getFullyQualifiedSupabaseBucketURL(SUPABASE_SHADERTHUMB_BUCKET_NAME, shader.thumb_url)
        : undefined;
    const title = shader.name;
    const description = shader.description ?? undefined;
    return {
        title,
        description,
        openGraph: {
            type: 'website',
            siteName: '@compute.toys',
            title,
            description,
            images
        },
        twitter: {
            card: 'summary_large_image',
            siteId: '@compute_toys',
            title,
            description,
            images
        }
    };
}
