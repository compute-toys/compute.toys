import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from 'lib/supabase/server';
import { notFound } from 'next/navigation';
import Profile from './profile';

export const runtime = 'edge';

async function getShaders(supabase: SupabaseClient, username: string) {
    const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('username', username)
        .single();
    if (error) notFound();
    return data;
}

export default async function ProfilePage({ params }) {
    const supabase = await createClient();
    const { username } = await params;
    const profile = await getShaders(supabase, username);
    return <Profile profile={profile} />;
}
