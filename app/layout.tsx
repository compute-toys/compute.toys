import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Footer from 'components/footer';
import { ShadowCanvas } from 'components/global/shadowcanvas';
import TopBar from 'components/global/topbar';
import { createClient } from 'lib/supabase/server';
import { WindowManagementProvider } from 'lib/util/draggablewindowscontext';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { theme } from 'theme/theme';

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <WindowManagementProvider>
            <NavigationGuardProvider>
                <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </NavigationGuardProvider>
        </WindowManagementProvider>
    );
};

export default async function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    return (
        <html lang="en">
            <body>
                <Providers>
                    <ShadowCanvas />
                    <CssBaseline />
                    <TopBar user={error || !data?.user ? null : data.user} />
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
