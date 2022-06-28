import { useAtomValue } from "jotai";
import { timerAtom } from "lib/atoms/atoms";
import { Fragment } from "react";
import { theme } from "theme/theme";
import useAnimationFrame from "use-animation-frame";
import useInterpolation from "use-interpolation";

export default function Timer() {
    const timer = useAtomValue(timerAtom);
    const [fps, setFps] = useInterpolation();

    useAnimationFrame(e => setFps(1 / e.delta), []);

    if (timer > 0 && fps > 0) {
        return <Fragment><span style={{color: theme.palette.dracula.foreground}}>{timer.toFixed(1)}s / {fps.toFixed(1)} FPS</span></Fragment>
    }
}
