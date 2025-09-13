import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createClient } from 'lib/supabase/client';
import { theme } from 'theme/theme';
import { User } from '@supabase/supabase-js';
import StandaloneEditor from 'standalone-editor/src/StandaloneEditor';
import TopBar from 'components/global/topbar';
import Footer from 'components/footer';
// import { NavigationGuardProvider } from 'next-navigation-guard';
import { ShadowCanvas } from 'standalone-editor/src/components/global/shadowcanvas';
import { WindowManagementProvider } from 'standalone-editor/src/lib/util/draggablewindowscontext';

function NewPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient();
            const { data, error } = await supabase.auth.getUser();
            setUser(error || !data?.user ? null : data.user);
        }
        loadUser();
    }, []);

    return (
        <>
            <TopBar user={user} />
            <StandaloneEditor user={user || undefined} />
            <Footer />
        </>
    );
}

function App() {
    return (
        <StrictMode>
            <WindowManagementProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <ShadowCanvas />
                    <NewPage />
                </ThemeProvider>
            </WindowManagementProvider>
        </StrictMode>
    );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<App />);