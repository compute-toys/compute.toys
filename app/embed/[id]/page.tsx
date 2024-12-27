import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from 'lib/supabase/server';
import { fetchShader } from 'lib/view/server';
import EmbedShader from './embed';

export const runtime = 'edge';

async function getShader(supabase: SupabaseClient, context) {
    const id = Number(context.params.id);
    if (Number.isNaN(id)) return { notFound: true };
    return { props: { id, shader: await fetchShader(supabase, id) } };
}

export default async function ViewShaderPage({ params }) {
    const supabase = await createClient();
    const { props } = await getShader(supabase, { params });
    return <EmbedShader {...props} />;
}
