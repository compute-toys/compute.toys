import { createClient } from 'lib/supabase/server';
import { fetchShader } from 'lib/view/server';
import { notFound } from 'next/navigation';
import EmbedShader from './embed';

export const runtime = 'edge';

export default async function ViewShaderPage({ params }) {
    const supabase = await createClient();
    let { id } = await params;
    id = Number(id);
    if (Number.isNaN(id)) notFound();
    const shader = await fetchShader(supabase, id);
    if (!shader) notFound();
    return <EmbedShader id={id} shader={shader} />;
}
