import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    status: {
        danger: '#db504a',
    },
    palette: {
        primary: {
            contrastText: '#FF6F59',
            main: '#B2b09B',
            darker: '#1e1e1e',
            light: '#43aa8b',
            dark: '#254441',
        },
        background: {
            default: '#101010'
        },
        neutral: {
            main: '#64748B',
            contrastText: '#F7CE5B',
        },
    },
});