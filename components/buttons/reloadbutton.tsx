import { PlayArrowRounded, PlayDisabledRounded } from '@mui/icons-material';
import { Button } from '@mui/material';
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
