import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import {Fab} from "@mui/material";
import {Dispatch, FunctionComponent, SetStateAction} from "react";

export type PlayPauseProps = {
    play: boolean,
    setPlay: Dispatch<SetStateAction<boolean>>
}

export const PlayPauseButton: FunctionComponent<PlayPauseProps> = (props) => {
    if (props.play) {
        return <Fab onClick={() => props.setPlay(false)}><PauseCircleIcon /></Fab>;
    } else {
        return <Fab onClick={() => props.setPlay(true)}><PlayCircleOutlineIcon /></Fab>;
    }
}

export default PlayPauseButton;
