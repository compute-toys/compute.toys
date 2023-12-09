import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Footer from 'components/footer';
import FavIconHead from 'components/global/faviconhead';
import LoginModal from 'components/global/loginmodal';
import { ShadowCanvas } from 'components/global/shadowcanvas';
import { AuthProvider } from 'lib/db/authcontext';
import type { AppProps } from 'next/app';
import { theme } from 'theme/theme';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <FavIconHead />
                <ShadowCanvas />
                <CssBaseline />
                <LoginModal />
                <Component {...pageProps} />
                <Footer />
            </ThemeProvider>
        </AuthProvider>
    );
}
