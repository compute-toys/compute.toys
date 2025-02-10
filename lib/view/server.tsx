import { SupabaseClient } from '@supabase/supabase-js';
import { AuthorProfile } from 'lib/atoms/atoms';
import { getFullyQualifiedSupabaseBucketURL } from 'lib/util/urlutils';
import { Metadata } from 'next';
import { Database } from 'types/database.types';

export interface ShaderMetadata {
    id: number;
    name: string;
    description: string | null;
    thumb_url: string | null;
    visibility: Database['public']['Enums']['visibility'];
    profile: AuthorProfile;
}

export interface Shader extends ShaderMetadata {
    body: string;
}

export async function fetchShader(
    supabase: SupabaseClient<Database>,
    id: number
): Promise<Shader | null> {
    const { data, error, status } = await supabase
        .from('shader')
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
        ? getFullyQualifiedSupabaseBucketURL(shader.thumb_url)
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
