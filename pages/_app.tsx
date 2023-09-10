import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { ShadowCanvas } from 'components/global/shadowcanvas';
import { AuthProvider } from 'lib/db/authcontext';
import type { AppProps } from 'next/app';
import { theme } from 'theme/theme';
import LoginModal from '../components/global/loginmodal';
import MetaHead from '../components/global/metahead';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <MetaHead />
                <ShadowCanvas />
                <CssBaseline />
                <LoginModal />
                <Component {...pageProps} />
            </ThemeProvider>
        </AuthProvider>
    );
}
