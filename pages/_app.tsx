import type { AppProps } from 'next/app'
import {theme} from "../theme/theme";
import {CssBaseline, ThemeProvider} from "@mui/material";
import React from "react";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Component {...pageProps} />
        </ThemeProvider>
    )
}