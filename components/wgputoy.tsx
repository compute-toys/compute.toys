import {Fragment, useCallback, useState} from "react";
import {useUpdateAtom} from "jotai/utils";
import {canvasElAtom, canvasParentElAtom} from "lib/atoms/wgputoyatoms";
import dynamic from "next/dynamic";
import {useAtomValue} from "jotai";
import {Skeleton} from "@mui/material";
import {getDimensions} from "types/canvasdimensions";
import {wgpuAvailabilityAtom} from "lib/atoms/atoms";

export const WgpuToyWrapper = (props) => {
    const setCanvasEl = useUpdateAtom(canvasElAtom);
    const setWgpuAvailability = useUpdateAtom(wgpuAvailabilityAtom);
    const [loaded, setLoaded] = useState(false);
    const canvasParentEl = useAtomValue(canvasParentElAtom);

    const canvasRef = useCallback(canvas => {
        if ("gpu" in navigator) {
            if (canvas) {
                setWgpuAvailability('available');
                setCanvasEl(canvas);
            }
        } else {
            setWgpuAvailability('unavailable');
        }
    }, []);

    const onLoad = useCallback(() => {
        setLoaded(true);
    }, []);

    // TODO: Nominally want to use lazy/Suspense here, but it's broken
    const Controller = dynamic(() => import('./wgputoycontroller'), {ssr: false});

    const dim = getDimensions(canvasParentEl ? canvasParentEl.offsetWidth : 256);

    return (
        <Fragment>
            <canvas
                ref={canvasRef}
                id={props.bindID}
                style={loaded ? props.style : {position: "fixed", display: "hidden"}}
            />
            {loaded ? null : <Skeleton variant="rectangular"
                                 width={dim.x}
                                 height={dim.y}/>}
            <Controller onLoad={onLoad}/>
        </Fragment>
    );
};