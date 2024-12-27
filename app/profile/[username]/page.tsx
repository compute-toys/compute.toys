import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from 'lib/supabase/server';
import Profile from './profile';

export const runtime = 'edge';

async function getShaders(supabase: SupabaseClient, context) {
    // context.res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

    const { username } = context.params;

    const { data: idData, error: idError } = await supabase
        .from('profile')
        .select('*')
        .eq('username', username)
        .single();

    if (idError) {
        context.res.statusCode = 404;
        return {
            notFound: true
        };
    }

    return {
        props: {
            profile: idData
        }
    };
}

export default async function ProfilePage({ params }) {
    const supabase = await createClient();
    const { props } = await getShaders(supabase, { params });
    return <Profile {...props} />;
}
