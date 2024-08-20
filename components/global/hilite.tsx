import { useTheme } from '@mui/material/styles';

export const HiLite = props => {
    const theme = useTheme();
    return <span style={{ color: theme.palette.primary.contrastText }}>{props.children}</span>;
};
