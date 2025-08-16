import ShaderList from 'components/shaderlist';
import { getShadersList } from 'lib/list';
import { createClient } from 'lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ShaderListPage({ params }) {
    const supabase = await createClient();
    const { page } = await params;
    const result = await getShadersList(supabase, Number(page));

    if (Number(page) < 1 || Number(page) > result.numPages || Number.isNaN(Number(page))) {
        notFound();
    }

    return <ShaderList {...result} />;
}
