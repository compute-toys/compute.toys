import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { ShadowCanvas } from 'components/global/shadowcanvas';
import { AuthProvider } from 'lib/db/authcontext';
import type { AppProps } from 'next/app';
import { theme } from 'theme/theme';
import FavIconHead from '../components/global/faviconhead';
import LoginModal from '../components/global/loginmodal';
import NoWgpuModal from '../components/global/nowgpumodal';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <FavIconHead />
                <ShadowCanvas />
                <CssBaseline />
                <LoginModal />
                <NoWgpuModal />
                <Component {...pageProps} />
            </ThemeProvider>
        </AuthProvider>
    );
}
