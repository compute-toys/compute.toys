import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { createClient } from 'lib/supabase/client';
import { getShadersList } from 'lib/list';
import { theme } from 'theme/theme';
import ShaderList from 'components/shaderlist';
import TopBar from 'components/global/topbar';
import Footer from 'components/footer';
import { User } from '@supabase/supabase-js';

interface ListResult {
    shaders: any[];
    numPages: number;
    currentPage: number;
}

function ListPage() {
    const [listData, setListData] = useState<ListResult | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                // Get page number from URL params
                const urlParams = new URLSearchParams(window.location.search);
                const page = urlParams.get('page') || '1';
                const pageNum = Number(page);
                
                if (isNaN(pageNum) || pageNum < 1) {
                    throw new Error('Invalid page number');
                }

                const supabase = createClient();
                
                // Load shader list
                const result = await getShadersList(supabase, pageNum);
                
                if (pageNum > result.numPages) {
                    throw new Error('Page not found');
                }
                
                // Load user data
                const { data, error: userError } = await supabase.auth.getUser();
                
                setListData(result);
                setUser(userError || !data?.user ? null : data.user);
                setLoading(false);
            } catch (err) {
                console.error('Error loading shader list:', err);
                setError(err instanceof Error ? err.message : 'Failed to load shader list');
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (error || !listData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Error: {error || 'Failed to load'}</div>
            </Box>
        );
    }

    return (
        <>
            <TopBar user={user} />
            <ShaderList {...listData} />
            <Footer />
        </>
    );
}

function App() {
    return (
        <StrictMode>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ListPage />
            </ThemeProvider>
        </StrictMode>
    );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<App />);