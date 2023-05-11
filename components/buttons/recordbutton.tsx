import {Button, SvgIcon} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import { recordingAtom} from "lib/atoms/atoms";
import { RadioButtonChecked, RadioButtonUnchecked } from "@mui/icons-material";
import { useAtom } from "jotai";

export const RecordButton = () => {
    const [recording, setRecording] = useAtom(recordingAtom);

    const theme = useTheme();

    return (
        <Button
            onClick={() => {
                setRecording(!recording);
            }}
            title={'Record video'}
            sx={{color: recording ? theme.palette.primary.contrastText : theme.palette.primary.light}}
        >
            {
                recording ? 
                <RadioButtonChecked/> :
                <SvgIcon style={{transform: "scale(0.9)"}}>
                    <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M6.68,10.21H5.92v1.7h.76a1,1,0,0,0,.67-.22.76.76,0,0,0,.25-.61.8.8,0,0,0-.25-.64A.94.94,0,0,0,6.68,10.21Z" transform="translate(-2 -2)"/><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM7.57,15.46l-1-2.41H5.92v2.41H4.62V9.07H6.68a2.7,2.7,0,0,1,1.18.24,1.8,1.8,0,0,1,.77.67,1.86,1.86,0,0,1,.28,1,2.1,2.1,0,0,1-.3,1.11,1.88,1.88,0,0,1-.82.71L9,15.46Zm6.37-5.27H11.29v1.44h2.34v1.12H11.29v1.59h2.65v1.12H10V9.07h3.94Zm5.14,4.44a1.8,1.8,0,0,1-.74.68,2.76,2.76,0,0,1-2.25,0,1.83,1.83,0,0,1-.75-.68,1.92,1.92,0,0,1-.26-1V10.91a1.92,1.92,0,0,1,.26-1,1.81,1.81,0,0,1,.75-.67,2.66,2.66,0,0,1,2.25,0,1.78,1.78,0,0,1,.74.67,1.84,1.84,0,0,1,.27,1H18a.79.79,0,0,0-.22-.59.86.86,0,0,0-.61-.2.9.9,0,0,0-.61.2.79.79,0,0,0-.21.59v2.71a.8.8,0,0,0,.21.59.9.9,0,0,0,.61.2.86.86,0,0,0,.61-.2.81.81,0,0,0,.22-.59h1.31A1.84,1.84,0,0,1,19.08,14.63Z" transform="translate(-2 -2)"/>
                    </svg>
                </SvgIcon>
            }
        </Button>
    );
}

export default RecordButton;