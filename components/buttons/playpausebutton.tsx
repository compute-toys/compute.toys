import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import {Button} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {useAtom, useAtomValue} from "jotai";
import {playAtom} from "lib/atoms/atoms";

const PlayPauseIcon = () => {
    const play = useAtomValue(playAtom);
    return play ? <PauseCircleIcon /> : <PlayCircleOutlineIcon />;
}

export const PlayPauseButton = () => {
    const [play, setPlay] = useAtom(playAtom);
    const theme = useTheme();
    return <Button onClick={() => setPlay(!play)} sx={play ? {color: theme.palette.primary.contrastText} : {color: theme.palette.primary.light}}><PlayPauseIcon /></Button>;
}

export default PlayPauseButton;
