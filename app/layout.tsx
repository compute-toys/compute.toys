import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Footer from 'components/footer';
import FavIconHead from 'components/global/faviconhead';
import LoginModal from 'components/global/loginmodal';
import { ShadowCanvas } from 'components/global/shadowcanvas';
import { AuthProvider } from 'lib/db/authcontext';
import { WindowManagementProvider } from 'lib/util/draggablewindowscontext';
import { theme } from 'theme/theme';

export default function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <WindowManagementProvider>
                        <ThemeProvider theme={theme}>
                            <FavIconHead />
                            <ShadowCanvas />
                            <CssBaseline />
                            <LoginModal />
                            {children}
                            <Footer />
                        </ThemeProvider>
                    </WindowManagementProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
