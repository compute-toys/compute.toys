import { useAtomValue } from "jotai";
import { timerAtom } from "lib/atoms/atoms";
import { Fragment } from "react";
import { theme } from "theme/theme";

export default function Timer() {
    const timer = useAtomValue(timerAtom);
    return <Fragment><span style={{color: theme.palette.dracula.foreground}}>{timer.toFixed(1)}s</span></Fragment>
}
