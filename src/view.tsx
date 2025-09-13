import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { createClient } from 'lib/supabase/client';
import { fetchShader } from 'lib/view/server';
import { theme } from 'theme/theme';
import { User } from '@supabase/supabase-js';
import { Shader } from 'lib/view/server';
// import { NavigationGuardProvider } from 'next-navigation-guard';
import { ShadowCanvas } from 'standalone-editor/src/components/global/shadowcanvas';
import { WindowManagementProvider } from 'standalone-editor/src/lib/util/draggablewindowscontext';

// Import the standalone editor
import StandaloneEditor from 'standalone-editor/src/StandaloneEditor';
import { ShaderData } from 'standalone-editor/src/types';

function convertShaderToStandaloneFormat(shader: Shader): ShaderData {
    const body = JSON.parse(shader.body);
    return {
        id: shader.id,
        name: shader.name,
        description: shader.description || '',
        code: JSON.parse(body.code),
        uniforms: body.uniforms || [],
        textures: body.textures || [{ img: '/textures/blank.png' }, { img: '/textures/blank.png' }],
        float32Enabled: body.float32Enabled || false,
        language: body.language || 'wgsl',
        visibility: shader.visibility,
        profile: shader.profile,
        needsSave: false
    };
}

function ViewPage() {
    const [shader, setShader] = useState<Shader | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                // Get shader ID from URL params
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');
                
                if (!id || isNaN(Number(id))) {
                    throw new Error('Invalid shader ID');
                }

                const supabase = createClient();
                
                // Load shader data
                const shaderData = await fetchShader(supabase, Number(id));
                if (!shaderData) {
                    throw new Error('Shader not found');
                }
                
                // Load user data
                const { data, error: userError } = await supabase.auth.getUser();
                
                setShader(shaderData);
                setUser(userError || !data?.user ? null : data.user);
                setLoading(false);
            } catch (err) {
                console.error('Error loading shader:', err);
                setError(err instanceof Error ? err.message : 'Failed to load shader');
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

    if (error || !shader) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Error: {error || 'Shader not found'}</div>
            </Box>
        );
    }

    const convertedShaderData = convertShaderToStandaloneFormat(shader);

    return (
        <StandaloneEditor 
            shaderData={convertedShaderData}
            user={user || undefined}
        />
    );
}

function App() {
    return (
        <StrictMode>
            <WindowManagementProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <ShadowCanvas />
                    <ViewPage />
                </ThemeProvider>
            </WindowManagementProvider>
        </StrictMode>
    );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<App />);