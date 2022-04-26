import type { AppProps } from 'next/app'
import {theme} from "../theme/theme";
import {CssBaseline, ThemeProvider} from "@mui/material";
import React from "react";
import { supabase } from '../lib/supabaseclient';
import {AuthProvider} from "../lib/authcontext";
import {UpdateProfile} from "../components/updateprofile";
import {ShadowCanvas} from "../components/shadowcanvas";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
        <ThemeProvider theme={theme}>
            <ShadowCanvas/>
            <CssBaseline/>
            <UpdateProfile/>
            <Component {...pageProps} />
        </ThemeProvider>
        </AuthProvider>
    )
}