import Hd from '@mui/icons-material/Hd';
import Sd from '@mui/icons-material/Sd';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { useAtom, useAtomValue } from 'jotai';
import { halfResolutionAtom } from 'lib/atoms/atoms';

const ScaleIcon = () => {
    const halfResolution = useAtomValue(halfResolutionAtom);
    return halfResolution ? <Sd /> : <Hd />;
};

export const ScaleButton = () => {
    const [halfResolution, setHalfResolution] = useAtom(halfResolutionAtom);
    const theme = useTheme();
    return (
        <Button
            onClick={() => setHalfResolution(!halfResolution)}
            sx={
                halfResolution
                    ? { color: theme.palette.primary.contrastText }
                    : { color: theme.palette.primary.light }
            }
        >
            <ScaleIcon />
        </Button>
    );
};

export default ScaleButton;
