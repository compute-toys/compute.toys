'use client';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import PlayDisabledRounded from '@mui/icons-material/PlayDisabledRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { useAtomValue, useSetAtom } from 'jotai';
import { hotReloadAtom, manualReloadAtom } from 'lib/atoms/atoms';

const PlayIcon = () => {
    const hotReload = useAtomValue(hotReloadAtom);
    if (hotReload) {
        return <PlayDisabledRounded />;
    } else {
        return <PlayArrowRounded />;
    }
};

export default function ReloadButton() {
    const hotReload = useAtomValue(hotReloadAtom);
    const setManualReload = useSetAtom(manualReloadAtom);

    const theme = useTheme();

    return (
        <Button
            onClick={() => {
                setManualReload(true);
            }}
            title="Recompile <Alt + Enter>"
            sx={{
                color: theme.palette.primary[hotReload ? 'contrastText' : 'light']
            }}
        >
            <Box sx={{ transform: 'scale(1.1)' }}>
                <PlayIcon />
            </Box>
        </Button>
    );
}
