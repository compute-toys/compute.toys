import type { AppProps } from 'next/app'
import {theme} from "theme/theme";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {AuthProvider} from "lib/authcontext";
import {ShadowCanvas} from "components/shadowcanvas";
import LoginModal from "../components/loginmodal";
import FavIconHead from "../components/faviconhead";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
        <ThemeProvider theme={theme}>
            <FavIconHead/>
            <ShadowCanvas/>
            <CssBaseline/>
            <LoginModal/>
            <Component {...pageProps} />
        </ThemeProvider>
        </AuthProvider>
    )
}