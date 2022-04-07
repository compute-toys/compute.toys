import { Palette, PaletteOptions, PaletteColor, PaletteColorOptions, SimplePaletteColorOptions, ThemeOptions, Theme } from "@mui/material/styles";
import React from "react";

declare module '@mui/material/styles' {
    export interface Theme {
        status: {
            danger: React.CSSProperties['color'];
            disabled: React.CSSProperties['color'];
        };
    }

    export interface Palette {
        neutral: Palette['primary'];
        dracula: DraculaPalette;
    }

    export interface DraculaPalette {
        background:  string;
        currentLine: string;
        selection:   string;
        foreground:  string;
        comment:     string;
        cyan:        string;
        green:       string;
        orange:      string;
        pink:        string;
        purple:      string;
        red:         string;
        yellow:      string;
    }

    export interface PaletteOptions {
        neutral: PaletteOptions['primary'];
        dracula: DraculaPalette;
    }

    export interface PaletteColor {
        darker?: string;
    }
    export interface SimplePaletteColorOptions {
        darker?: string;
    }
    export interface ThemeOptions {
        status: {
            danger: React.CSSProperties['color'];
            disabled: React.CSSProperties['color'];
        };
    }
}

