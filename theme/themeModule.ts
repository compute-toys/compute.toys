import {
    Palette,
    PaletteColor,
    PaletteColorOptions,
    PaletteOptions,
    SimplePaletteColorOptions,
    Theme,
    ThemeOptions
} from '@mui/material/styles';
import { CSSProperties } from 'react';

declare module '@mui/material/styles' {
    export interface Theme {
        status: {
            danger: CSSProperties['color'];
            disabled: CSSProperties['color'];
        };
    }

    export interface Palette {
        neutral: Palette['primary'];
        dracula: DraculaPalette;
    }

    export interface DraculaPalette {
        background: string;
        currentLine: string;
        selection: string;
        foreground: string;
        comment: string;
        cyan: string;
        green: string;
        orange: string;
        pink: string;
        purple: string;
        red: string;
        yellow: string;
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
            danger: CSSProperties['color'];
            disabled: CSSProperties['color'];
        };
    }
}
