import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from 'lib/supabase/server';
import ShaderList from './list';

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

async function getShaders(supabase: SupabaseClient, context) {
    // context.res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

    const { from, to } = getPagination(context.params.page, SHADERS_PER_PAGE);
    const { data, error } = await supabase
        .from('shader')
        .select(
            `
            id,
            name,
            profile:author (
                username,
                avatar_url
            ),
            thumb_url
        `
        )
        .order('created_at', { ascending: false })
        .range(from, to)
        .eq('visibility', 'public');

    const totalCount = await getTotalCount(supabase);
    const numPages = Math.ceil(totalCount / SHADERS_PER_PAGE);
    const page = Number(context.params.page);

    if (page < 1 || page > numPages) return { notFound: true };

    return {
        props: {
            shaders: data ?? [],
            totalCount,
            numPages,
            error,
            page
        }
    };
}

export default async function ShaderListPage({ params }) {
    const supabase = await createClient();
    const { props } = await getShaders(supabase, { params });
    return <ShaderList {...props} />;
}
