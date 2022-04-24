import type { AppProps } from 'next/app'
import {theme} from "../theme/theme";
import {CssBaseline, ThemeProvider} from "@mui/material";
import React from "react";
import { supabase } from '../lib/supabaseclient';
import {AuthProvider} from "../lib/authcontext";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider supabase={supabase}>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Component {...pageProps} />
        </ThemeProvider>
        </AuthProvider>
    )
}