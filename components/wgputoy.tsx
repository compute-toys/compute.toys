import Skeleton from '@mui/material/Skeleton';
import { useAtomValue, useSetAtom } from 'jotai';
import { canvasElAtom, canvasParentElAtom, wgpuAvailabilityAtom } from 'lib/atoms/wgputoyatoms';
import dynamic from 'next/dynamic';
import { Fragment, useCallback, useState } from 'react';
import { getDimensions } from 'types/canvasdimensions';

export const WgpuToyWrapper = props => {
    const setCanvasEl = useSetAtom(canvasElAtom);
    const setWgpuAvailability = useSetAtom(wgpuAvailabilityAtom);
    const [loaded, setLoaded] = useState(false);
    const canvasParentEl = useAtomValue(canvasParentElAtom);

    const canvasRef = useCallback(async canvas => {
        // there may be a case where we don't have the canvas *yet*
        if (canvas && canvas.getContext('webgpu') && 'gpu' in navigator) {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                const device = await adapter.requestDevice();
                if (device) {
                    setWgpuAvailability('available');
                    setCanvasEl(canvas);
                    setLoaded(true);
                } else {
                    setWgpuAvailability('unavailable');
                }
            } else {
                setWgpuAvailability('unavailable');
            }
        } else {
            setWgpuAvailability('unavailable');
        }
    }, []);

    const onLoad = useCallback(() => {
        setLoaded(true);
    }, []);

    const Controller = dynamic(() => import('./wgputoycontroller'), {
        ssr: false
    });

    const dim = getDimensions(canvasParentEl ? canvasParentEl.offsetWidth : 256);

    return (
        <Fragment>
            <canvas
                ref={canvasRef}
                id={props.bindID}
                style={
                    loaded
                        ? { ...props.style, ...{ outline: 'none' } }
                        : { position: 'fixed', display: 'hidden' }
                }
                tabIndex={1}
            />
            {loaded ? (
                <Controller onLoad={onLoad} />
            ) : (
                <Skeleton variant="rectangular" width={dim.x} height={dim.y} />
            )}
        </Fragment>
    );
};
