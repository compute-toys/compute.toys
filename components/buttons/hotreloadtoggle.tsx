import { AcUnit, LocalFireDepartment } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { useAtom, useAtomValue } from 'jotai';
import { hotReloadAtom } from 'lib/atoms/atoms';

const HotColdIcon = () => {
    const hotReload = useAtomValue(hotReloadAtom);
    if (hotReload) {
        return <LocalFireDepartment />; // flame
    } else {
        return <AcUnit />; // snowflake
    }
};

export const HotReloadToggle = () => {
    const [hotReload, setHotReload] = useAtom(hotReloadAtom);

    const theme = useTheme();

    return (
        <Button
            onClick={() => {
                setHotReload(!hotReload);
            }}
            sx={hotReload ? { color: theme.status.danger } : { color: theme.palette.neutral.main }}
        >
            <HotColdIcon />
        </Button>
    );
};

export default HotReloadToggle;
