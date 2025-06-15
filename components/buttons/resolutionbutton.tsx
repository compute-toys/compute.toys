'use client';
import Hd from '@mui/icons-material/Hd';
import Sd from '@mui/icons-material/Sd';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Resolution from 'components/resolution';
import { useAtom, useAtomValue } from 'jotai';
import { halfResolutionAtom } from 'lib/atoms/atoms';

const ScaleIcon = () => {
    const halfResolution = useAtomValue(halfResolutionAtom);
    return halfResolution ? <Sd /> : <Hd />;
};

export default function ResolutionButton() {
    const [halfResolution, setHalfResolution] = useAtom(halfResolutionAtom);
    const theme = useTheme();

    // Define styles outside the return for better readability
    const buttonStyles = {
        padding: '2px',
        minWidth: 0,
        color: halfResolution ? theme.palette.primary.contrastText : theme.palette.primary.light,
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)'
        }
    };

    return (
        <Button
            onClick={() => setHalfResolution(!halfResolution)}
            sx={buttonStyles}
            aria-label={halfResolution ? 'Full resolution' : 'Half resolution'}
            style={{ textTransform: 'none' }}
        >
            <Resolution />
            <ScaleIcon />
        </Button>
    );
}
