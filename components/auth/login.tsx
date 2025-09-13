import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CssTextField, Item } from 'theme/theme';
import { createClient } from 'lib/supabase/client';

export default function LoginComponent() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/list.html?page=1`
                }
            });

            if (error) {
                setMessage(`Error: ${error.message}`);
            } else {
                setMessage('Check your email for a login link!');
            }
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Item sx={{ color: 'white' }}>
                <Typography>Enter your email address</Typography>
                <Stack direction="row" justifyContent={'center'} sx={{ marginTop: '10px' }}>
                    <form onSubmit={handleLogin}>
                        <CssTextField 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            disabled={loading}
                        />
                        <br />
                        <Button type="submit" sx={{ marginTop: '10px' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Login / Sign up'}
                        </Button>
                        {message && (
                            <Typography sx={{ marginTop: '10px', fontSize: '0.9rem' }}>
                                {message}
                            </Typography>
                        )}
                    </form>
                </Stack>
            </Item>
        </Box>
    );
}