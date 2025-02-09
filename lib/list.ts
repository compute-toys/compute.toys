import { SupabaseClient } from '@supabase/supabase-js';
import { ShaderMetadata } from './view/server';

const SHADERS_PER_PAGE = 12;

const getPagination = (page: number, size: number) => {
    const from = (page - 1) * size;
    const to = from + size - 1;
    return { from, to };
};

const getTotalCount = async (supabase: SupabaseClient): Promise<number> => {
    const { error, count } = await supabase
        .from('shader')
        .select('*', { count: 'exact', head: true })
        .eq('visibility', 'public');
    if (error || count === null) return 0;
    return count;
};

export async function getShadersList(supabase: SupabaseClient, page: number) {
    const { from, to } = getPagination(page, SHADERS_PER_PAGE);
    const { data, error } = await supabase
        .from('shader')
        .select(
            `
            id,
            name,
            description,
            thumb_url,
            visibility,
            profile:author (
                username,
                avatar_url,
                id
            )
        `
        )
        .order('created_at', { ascending: false })
        .range(from, to)
        .eq('visibility', 'public')
        .returns<ShaderMetadata[]>();

    const totalCount = await getTotalCount(supabase);
    const numPages = Math.ceil(totalCount / SHADERS_PER_PAGE);

    return {
        shaders: data ?? [],
        totalCount,
        numPages,
        error,
        page
    };
}
