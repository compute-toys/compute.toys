import ReplayIcon from "@mui/icons-material/Replay";
import {Button} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {useAtom} from "jotai";
import {resetAtom} from "../lib/atoms";
import {useUpdateAtom} from "jotai/utils";

export const ResetButton = () => {
    const setReset = useUpdateAtom(resetAtom);

    const theme = useTheme();
    return <Button onClick={() => setReset(true)} sx={{color: theme.palette.primary.light}}><ReplayIcon /></Button>;
}

export default ResetButton;
