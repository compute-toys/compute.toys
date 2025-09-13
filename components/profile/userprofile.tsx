import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { createClient } from 'lib/supabase/client';

interface UserProfile {
    id: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
}

interface UserProfileComponentProps {
    userId?: string;
}

export default function UserProfileComponent({ userId }: UserProfileComponentProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProfile() {
            if (!userId) {
                setError('No user ID provided');
                setLoading(false);
                return;
            }

            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('profile')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) {
                    throw error;
                }

                setProfile(data);
                setLoading(false);
            } catch (err) {
                console.error('Error loading profile:', err);
                setError(err instanceof Error ? err.message : 'Failed to load profile');
                setLoading(false);
            }
        }

        loadProfile();
    }, [userId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (error || !profile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography>Error: {error || 'Profile not found'}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                {profile.username || `User ${profile.id}`}
            </Typography>
            {profile.bio && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                    {profile.bio}
                </Typography>
            )}
        </Box>
    );
}