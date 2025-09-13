import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { createClient } from 'lib/supabase/client';
import { theme } from 'theme/theme';
import { User } from '@supabase/supabase-js';
import UserProfileComponent from 'components/profile/userprofile';
import TopBar from 'components/global/topbar';
import Footer from 'components/footer';

function UserIdPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient();
            const { data, error } = await supabase.auth.getUser();
            setUser(error || !data?.user ? null : data.user);
            setLoading(false);
        }
        loadUser();
    }, []);

    // Get user ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (!id) {
        return <div>Invalid user ID</div>;
    }

    return (
        <>
            <TopBar user={user} />
            <UserProfileComponent userId={id} />
            <Footer />
        </>
    );
}

function App() {
    return (
        <StrictMode>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <UserIdPage />
            </ThemeProvider>
        </StrictMode>
    );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<App />);