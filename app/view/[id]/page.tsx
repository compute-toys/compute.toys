import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from 'lib/supabase/server';
import { buildHead, fetchShader } from 'lib/view/server';
import { notFound } from 'next/navigation';
import { Database } from 'types/database.types';
import ViewShader from './view';

export const runtime = 'edge';

async function getShader(supabase: SupabaseClient<Database>, { id }) {
    id = Number(id);
    if (Number.isNaN(id)) notFound();
    const shader = await fetchShader(supabase, id);
    if (!shader) notFound();
    return shader;
}

export async function generateMetadata({ params }) {
    const supabase = await createClient();
    const shader = await getShader(supabase, await params);
    return buildHead(shader);
}

export default async function ViewShaderPage({ params }) {
    const supabase = await createClient();
    const shader = await getShader(supabase, await params);
    const { data, error } = await supabase.auth.getUser();
    return <ViewShader shader={shader} user={error || !data?.user ? null : data.user} />;
}
