'use client';
import WarningIcon from '@mui/icons-material/Warning';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { canvasElAtom, canvasParentElAtom, wgpuAvailabilityAtom } from 'lib/atoms/wgputoyatoms';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useState } from 'react';
import { theme } from 'theme/theme';
import { getDimensions } from 'types/canvasdimensions';
import Logo from './global/logo';

export const WgpuToyWrapper = props => {
    const setCanvasEl = useSetAtom(canvasElAtom);
    const [wgpuAvailability, setWgpuAvailability] = useAtom(wgpuAvailabilityAtom);
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
        <div style={props.style}>
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
                <Suspense>
                    <Controller onLoad={onLoad} embed={props.embed} />
                </Suspense>
            ) : wgpuAvailability === 'unknown' ? null : (
                <Stack color={theme.palette.primary.contrastText} spacing={2} padding={4}>
                    <Typography>
                        <WarningIcon />
                    </Typography>
                    <Typography>WebGPU support was not detected in your browser.</Typography>
                    <Typography>
                        For information on how to set up your browser to run WebGPU code, please see
                        the instructions linked on the <Logo /> homepage.
                    </Typography>
                </Stack>
            )}
        </div>
    );
};
