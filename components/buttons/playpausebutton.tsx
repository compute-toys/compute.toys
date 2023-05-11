import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import {Button} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {useAtom, useAtomValue} from "jotai";
import {pauseTimeWhileStillRenderingAtom, playAtom} from "lib/atoms/atoms";
import { useEffect, useState } from "react";

const PlayPauseIcon = () => {
    const play = useAtomValue(playAtom);
    return play ? <PauseCircleIcon /> : <PlayCircleOutlineIcon />;
}

export const PlayPauseButton = () => {
    const [play, setPlay] = useAtom(playAtom);
    const [pauseTimeWhileStillRendering, setPauseTimeWhileStillRendering] = useAtom(pauseTimeWhileStillRenderingAtom);
    const [ctrlKeyDown, setCtrlKeyDown] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const listenForCtrlKeyPress = (e)=>{ 
            if(e.code === "ControlLeft" || e.metaKey){ // will this work on mac?
                setCtrlKeyDown(true);
            }
        }
        const listenForCtrlKeyUnpress = (e)=>{ 
            if(e.code === "ControlLeft" || e.metaKey){ // will this work on mac?
                setCtrlKeyDown(false);
            }
        }
        window.addEventListener('keydown', listenForCtrlKeyPress)
        window.addEventListener('keyup', listenForCtrlKeyUnpress)
        return () => {
            window.removeEventListener('keydown', listenForCtrlKeyPress)
            window.removeEventListener('keyup', listenForCtrlKeyUnpress)
        }
    });

    return <Button 
        onClick={() => { 
            if(ctrlKeyDown && play === true){
                setPauseTimeWhileStillRendering(true)
            }
            setPlay(!play);
        }}
        title={'Play/Pause <Ctrl + Alt + Up> \nPause Time, but keep rendering <Ctrl + Click>'}
        sx={play ? {color: theme.palette.primary.contrastText} : 
            pauseTimeWhileStillRendering ? {color: "orange"} : 
            {color: theme.palette.primary.light}}><PlayPauseIcon />
        </Button>;
}

export default PlayPauseButton;
