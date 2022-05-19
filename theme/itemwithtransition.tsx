import {PaperProps} from "@mui/material/Paper";
import {useAtom, WritableAtom} from "jotai";
import {Item, theme} from "./theme";

export interface ItemWithTransitionSignalProps extends PaperProps {
    transitionAtom: WritableAtom<string | false, string | false>
}

export const ItemWithTransitionSignal = (props: ItemWithTransitionSignalProps) => {
    const [transition, setTransition] = useAtom(props.transitionAtom);
    console.log("transitioning: " + transition);
    if (transition) {
        setTimeout( function() { setTransition(false); }, 100);
    }
    const transitionColor = transition ? transition : theme.palette.primary.darker;
    return (
        <Item sx={{...props.sx, transition: "background-color 0.1s ease-out", backgroundColor: transitionColor}}>{props.children}</Item>
    )
    /*return (
        <Item
            sx={transition ?
                {...props.sx, transition: "color 0.5s ease-out", color: transition}
                :
                {...props.sx, transition: "color 0.5s ease-out", color: theme.palette.text.secondary}}>{props.children}</Item>
    )*/
}