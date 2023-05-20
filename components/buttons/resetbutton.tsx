import ReplayIcon from '@mui/icons-material/Replay';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSetAtom } from 'jotai';
import { resetAtom } from 'lib/atoms/atoms';

export const ResetButton = () => {
    const setReset = useSetAtom(resetAtom);

    const theme = useTheme();
    return (
        <Button
            title="Reset <Ctrl + Alt + Down>"
            onClick={() => setReset(true)}
            sx={{ color: theme.palette.primary.light }}
        >
            <ReplayIcon />
        </Button>
    );
};

export default ResetButton;
