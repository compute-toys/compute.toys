import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from 'theme/theme';
import LoginComponent from 'components/auth/login';

function App() {
    return (
        <StrictMode>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <LoginComponent />
            </ThemeProvider>
        </StrictMode>
    );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<App />);