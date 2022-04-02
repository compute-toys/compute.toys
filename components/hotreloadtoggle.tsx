import {Button, ToggleButton} from "@mui/material";
import {Dispatch, FunctionComponent, SetStateAction} from "react";
import {useTheme} from "@mui/material/styles";
import {AcUnit, LocalFireDepartment} from "@mui/icons-material";

export type HotReloadProps = {
    hotReload: boolean,
    setHotReload: Dispatch<SetStateAction<boolean>>,
}

const HotColdIcon: FunctionComponent<HotReloadProps> = (props) => {
    if (props.hotReload) {
        return <LocalFireDepartment/>; // flame
    } else {
        return <AcUnit/>; // snowflake
    }
}

export const HotReloadToggle: FunctionComponent<HotReloadProps> = (props) => {
    const theme = useTheme();
    let style;
    if (props.hotReload) {
        style = {color: theme.status.danger};
    } else {
        style = {color: theme.palette.neutral.main};
    }
    return (
        <Button
            onClick={() => {
                props.setHotReload(!props.hotReload);
            }}
            sx={style}
        >
            <HotColdIcon {...props}/>
        </Button>
    );
}

export default HotReloadToggle;
