import { SupabaseClient } from '@supabase/supabase-js';
import ShaderList from 'components/shaderlist';
import { createClient } from 'lib/supabase/server';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

const SHADERS_PER_PAGE = 12;

const getPagination = (page: number, size: number) => {
    const from = (page - 1) * size;
    const to = from + size - 1;
    return { from, to };
};

const getTotalCount = async (supabase: SupabaseClient, query: string): Promise<number> => {
    const { error, count } = await supabase
        .from('shader')
        .select('*', { count: 'exact', head: true })
        .eq('visibility', 'public')
        .ilike('name', `%${query}%`);
    if (error || count === null) return 0;
    return count;
};

async function getShaders(supabase: SupabaseClient, query: string, page: number) {
    const { from, to } = getPagination(page, SHADERS_PER_PAGE);
    const { data, error } = await supabase
        .from('shader')
        .select(
            `
            id,
            name,
            profile:author (
                id,
                username,
                avatar_url
            ),
            thumb_url
        `
        )
        .order('created_at', { ascending: false })
        .range(from, to)
        .eq('visibility', 'public')
        .ilike('name', `%${query}%`);

    const totalCount = await getTotalCount(supabase, query);
    const numPages = Math.ceil(totalCount / SHADERS_PER_PAGE);

    if (page < 1 || page > numPages || Number.isNaN(page)) notFound();

    return {
        props: {
            shaders: data ?? [],
            totalCount,
            numPages,
            error,
            page,
            query
        }
    };
}

export default async function SearchShaderListPage({ params }) {
    const supabase = await createClient();
    const { query, page } = await params;
    const { props } = await getShaders(supabase, query, Number(page));
    return <ShaderList {...props} />;
}
