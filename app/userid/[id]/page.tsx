import { createClient } from 'lib/supabase/server';
import { notFound } from 'next/navigation';
import Profile from './profile';

export const runtime = 'edge';

export default async function ProfilePage({ params }) {
    const supabase = await createClient();
    const { id } = await params;
    const { data, error } = await supabase.from('profile').select('*').eq('id', id).single();
    if (error) notFound();
    return (
        <Profile
            avatar_url={data.avatar_url}
            about={data.about}
            username={data.username}
            id={data.id}
        />
    );
}
