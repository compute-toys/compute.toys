import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Footer from 'components/footer';
import { ShadowCanvas } from 'components/global/shadowcanvas';
import TopBar from 'components/global/topbar';
import { createClient } from 'lib/supabase/server';
import { WindowManagementProvider } from 'lib/util/draggablewindowscontext';
import { NavigationGuardProvider } from 'next-navigation-guard';
import PlausibleProvider from 'next-plausible';
import { theme } from 'theme/theme';

const originTrialTokens = [
    // subgroups compute.toys
    'Av+MJ5j8ubFN+wgLBmJQwejnyZoFn/KokLv+PL8I22Q1UW0WiuTTovXEeUbU5LeRXAX5Lz+A931YjkHoEkgYPw4AAABweyJvcmlnaW4iOiJodHRwczovL2NvbXB1dGUudG95czo0NDMiLCJmZWF0dXJlIjoiV2ViR1BVU3ViZ3JvdXBzRmVhdHVyZXMiLCJleHBpcnkiOjE3NDQ3NjE1OTksImlzU3ViZG9tYWluIjp0cnVlfQ==',
    // subgroups localhost:3000
    'AsZgfZD/vWRALun4XVG5Kw3uoM3GqntRnKxuXzP0DiQneMCGEeivIJoItiL3qNZ1/FldAnuFR+yyQ1QYvTUUvQcAAABaeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiV2ViR1BVU3ViZ3JvdXBzRmVhdHVyZXMiLCJleHBpcnkiOjE3NDQ3NjE1OTl9'
];

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
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />
                {originTrialTokens.map((token, index) => (
                    <meta key={index} httpEquiv="origin-trial" content={token} />
                ))}
                <PlausibleProvider domain="compute.toys" />
            </head>
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
