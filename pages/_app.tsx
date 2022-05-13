import type { AppProps } from 'next/app'
import {theme} from "theme/theme";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {AuthProvider} from "lib/authcontext";
import {ShadowCanvas} from "components/shadowcanvas";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
        <ThemeProvider theme={theme}>
            <ShadowCanvas/>
            <CssBaseline/>
            <Component {...pageProps} />
        </ThemeProvider>
        </AuthProvider>
    )
}