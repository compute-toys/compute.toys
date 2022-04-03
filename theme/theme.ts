import {createTheme, styled} from '@mui/material/styles';
import Paper from "@mui/material/Paper";

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
        background: {
            default: '#101010'
        },
        neutral: {
            main: '#AAD2E6',
            contrastText: '#F7CE5B',
        },
    },
});