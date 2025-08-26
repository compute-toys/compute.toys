import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

export const getRainbowColor = (index: number, theme: any) => {
    const rainbow = [
        theme.palette.dracula.cyan,
        theme.palette.dracula.green,
        theme.palette.dracula.orange,
        theme.palette.dracula.pink,
        theme.palette.dracula.purple,
        theme.palette.dracula.red,
        theme.palette.dracula.yellow
    ];
    return rainbow[index % rainbow.length];
};

export const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.primary.darker,
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
}));

export const CssTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.dracula.currentLine
        },
        '&:hover fieldset': {
            borderColor: theme.palette.dracula.currentLine
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.dracula.foreground
        },
        '&.Mui-focused input': {
            color: theme.palette.dracula.foreground
        },
        '& input:disabled': {
            color: theme.status.disabled,
            WebkitTextFillColor: theme.status.disabled
        }
    }
}));