import { createClient } from 'lib/supabase/server';
import NewShader from './new';

export const runtime = 'edge';

export default async function NewShaderPage() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    return <NewShader user={error || !data?.user ? null : data.user} />;
}
