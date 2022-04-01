import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import {Button, Fab} from "@mui/material";
import {Dispatch, FunctionComponent, SetStateAction} from "react";
import {Theme, useTheme} from "@mui/material/styles";

export type PlayPauseProps = {
    play: boolean,
    setPlay: Dispatch<SetStateAction<boolean>>,
}

export const PlayPauseButton: FunctionComponent<PlayPauseProps> = (props) => {
    const theme = useTheme();
    if (props.play) {
        return <Button onClick={() => props.setPlay(false)} sx={{color: theme.palette.primary.contrastText}}><PauseCircleIcon /></Button>;
    } else {
        return <Button onClick={() => props.setPlay(true)} sx={{color: theme.palette.primary.light}}><PlayCircleOutlineIcon /></Button>;
    }
}

export default PlayPauseButton;
