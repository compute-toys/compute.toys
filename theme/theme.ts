import {createTheme, styled} from '@mui/material/styles';
import Paper from "@mui/material/Paper";
import "theme/themeModule";
import "firacode";
import {darkScrollbar, TextField} from "@mui/material";

export const theme = createTheme({
    typography: {
        fontFamily: ['Fira Code', 'monospace'].join(','),
        fontSize: 12
    },
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
        text: {
            primary: '#f8f8f2',
            secondary: '#6272a4'
        },
        background: {
            default: '#101010',
            paper: '#1e1e1e'
        },
        neutral: {
            main: '#AAD2E6',
            contrastText: '#F7CE5B',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: darkScrollbar(),
                a: {
                    color: '#f8f8f2',
                }
            },
        },
    },
});

// These MUST be declared outside component, or wrapped as a JSX.Element
// Otherwise rerender is triggered every time.
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

export const CssTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.dracula.currentLine,
        },
        '&:hover fieldset': {
            borderColor: theme.palette.dracula.currentLine,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.dracula.foreground,
        },
        '&.Mui-focused input': {
            color: theme.palette.dracula.foreground,
        },
    },
});

export const rainbow = [
    theme.palette.dracula.cyan,
    theme.palette.dracula.green,
    theme.palette.dracula.orange,
    theme.palette.dracula.pink,
    theme.palette.dracula.purple,
    theme.palette.dracula.red,
    theme.palette.dracula.yellow,
]

export const getRainbowColor = (index: number) => {
    return rainbow[index % rainbow.length];
}