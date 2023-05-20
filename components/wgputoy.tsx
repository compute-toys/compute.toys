import Skeleton from '@mui/material/Skeleton';
import { useAtomValue, useSetAtom } from 'jotai';
import { wgpuAvailabilityAtom } from 'lib/atoms/atoms';
import { canvasElAtom, canvasParentElAtom } from 'lib/atoms/wgputoyatoms';
import dynamic from 'next/dynamic';
import { Fragment, useCallback, useState } from 'react';
import { getDimensions } from 'types/canvasdimensions';

export const WgpuToyWrapper = props => {
    const setCanvasEl = useSetAtom(canvasElAtom);
    const setWgpuAvailability = useSetAtom(wgpuAvailabilityAtom);
    const [loaded, setLoaded] = useState(false);
    const canvasParentEl = useAtomValue(canvasParentElAtom);

    const canvasRef = useCallback(canvas => {
        if ('gpu' in navigator) {
            if (canvas) {
                if (canvas.getContext('webgpu')) {
                    setWgpuAvailability('available');
                    setCanvasEl(canvas);
                } else {
                    setWgpuAvailability('unavailable');
                }
            }
            // there may be a case where we don't have the canvas *yet*
            // but will get it on a subsequent callback, so no else{} here
        } else {
            setWgpuAvailability('unavailable');
        }
    }, []);

    const onLoad = useCallback(() => {
        setLoaded(true);
    }, []);

    // TODO: Nominally want to use lazy/Suspense here, but it's broken
    const Controller = dynamic(() => import('./wgputoycontroller'), {
        ssr: false
    });

    const dim = getDimensions(canvasParentEl ? canvasParentEl.offsetWidth : 256);

    return (
        <Fragment>
            <canvas
                ref={canvasRef}
                id={props.bindID}
                style={loaded ? {...props.style, ...{ outline: 'none' } } : { position: 'fixed', display: 'hidden' }}
                tabIndex={1}
            />
            {loaded ? null : <Skeleton variant="rectangular" width={dim.x} height={dim.y} />}
            <Controller onLoad={onLoad} />
        </Fragment>
    );
};
