'use client';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { useSetAtom } from 'jotai';
import { requestFullscreenAtom } from '../../lib/atoms/atoms';

export default function FullscreenButton() {
    const setRequestFullscreen = useSetAtom(requestFullscreenAtom);

    const theme = useTheme();

    return (
        <Button
            onClick={() => setRequestFullscreen(true)}
            sx={{
                color: theme.palette.dracula.cyan,
                minWidth: 0,
                padding: '2px'
            }}
        >
            <FullscreenIcon />
        </Button>
    );
}
