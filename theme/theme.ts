import {createTheme, styled} from '@mui/material/styles';
import Paper from "@mui/material/Paper";
import "./themeModule";

export const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.primary.darker,
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export const Frame = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.primary.darker,
    justifyContent: 'center',
    display: 'inline-flex',
    borderRadius: '4px'
}));

export const theme = createTheme({
    status: {
        danger: '#db504a',
        disabled: '#646F6C'
    },
    palette: {
        primary: {
            contrastText: '#FF6F59',
            main: '#B2b09B',
            darker: '#1e1e1e',
            light: '#43aa8b',
            dark: '#254441',
        },
        dracula: {
            background: '#282a36',
            currentLine:'#44475a',
            selection:  '#44475a',
            foreground: '#f8f8f2',
            comment:    '#6272a4',
            cyan:       '#8be9fd',
            green:      '#50fa7b',
            orange:     '#ffb86c',
            pink:       '#ff79c6',
            purple:     '#bd93f9',
            red:        '#ff5555',
            yellow:     '#f1fa8c',
        },
        background: {
            default: '#101010'
        },
        neutral: {
            main: '#AAD2E6',
            contrastText: '#F7CE5B',
        },
    },
});