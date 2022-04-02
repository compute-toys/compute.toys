import {Button} from "@mui/material";
import {Dispatch, FunctionComponent, SetStateAction} from "react";
import {useTheme} from "@mui/material/styles";
import {PlayArrowRounded, PlayDisabledRounded} from "@mui/icons-material";

export type ReloadProps = {
    hotReload: boolean,
    setManualReload: Dispatch<SetStateAction<boolean>>
}

const PlayIcon: FunctionComponent<ReloadProps> = (props) => {
    if (props.hotReload) {
        return <PlayDisabledRounded/>;
    } else {
        return <PlayArrowRounded/>;
    }
}

export const ReloadButton: FunctionComponent<ReloadProps> = (props) => {
    const theme = useTheme();
    let style;
    if (props.hotReload) {
        style = {color: theme.status.disabled};
    } else {
        style = {color: theme.palette.primary.light};
    }
    return (
        <Button
            onClick={() => {
                props.setManualReload(true);
            }}
            sx={style}
        >
            <PlayIcon {...props}/>
        </Button>
    );
}

export default ReloadButton;
