import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import PlayDisabledRounded from '@mui/icons-material/PlayDisabledRounded';
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

export const ReloadButton = () => {
    const hotReload = useAtomValue(hotReloadAtom);
    const setManualReload = useSetAtom(manualReloadAtom);

    const theme = useTheme();

    return (
        <Button
            onClick={() => {
                setManualReload(true);
            }}
            title="Recompile <Alt + Enter>"
            sx={
                hotReload
                    ? { color: theme.status.disabled }
                    : { color: theme.palette.primary.light }
            }
        >
            <PlayIcon />
        </Button>
    );
};

export default ReloadButton;
