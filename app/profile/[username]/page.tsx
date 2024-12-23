import { supabase } from 'lib/db/supabaseclient';
import Profile from './profile';

export async function getShaders(context) {
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
    const { props } = await getShaders({ params });
    return <Profile {...props} />;
}
