import ReplayIcon from "@mui/icons-material/Replay";
import {Button} from "@mui/material";
import {Dispatch, FunctionComponent, SetStateAction} from "react";
import {useTheme} from "@mui/material/styles";

export type ResetProps = {
    reset: boolean,
    setReset: Dispatch<SetStateAction<boolean>>,
}

export const ResetButton: FunctionComponent<ResetProps> = (props) => {
    const theme = useTheme();
    return <Button onClick={() => props.setReset(true)} sx={{color: theme.palette.primary.light}}><ReplayIcon /></Button>;
}

export default ResetButton;
