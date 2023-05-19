import ReplayIcon from "@mui/icons-material/Replay";
import {Button} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {resetAtom} from "lib/atoms/atoms";
import {useSetAtom} from "jotai";

export const ResetButton = () => {
    const setReset = useSetAtom(resetAtom);

    const theme = useTheme();
    return (
        <Button 
            title='Reset <Ctrl + Alt + Down>' 
            onClick={() => setReset(true)} 
            sx={{color: theme.palette.primary.light}}>
                <ReplayIcon />
        </Button>
    );
}

export default ResetButton;
