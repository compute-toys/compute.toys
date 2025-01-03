'use client';
import WarningIcon from '@mui/icons-material/Warning';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Controller from 'components/wgputoycontroller';
import { useAtom, useSetAtom } from 'jotai';
import { canvasElAtom, wgpuAvailabilityAtom } from 'lib/atoms/wgputoyatoms';
import { Suspense, useCallback, useState } from 'react';
import { theme } from 'theme/theme';

export const WgpuToyWrapper = props => {
    const setCanvasEl = useSetAtom(canvasElAtom);
    const [wgpuAvailability, setWgpuAvailability] = useAtom(wgpuAvailabilityAtom);
    const [loaded, setLoaded] = useState(false);

    const canvasRef = useCallback(canvas => {
        (async () => {
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
        })();
    }, []);

    const onLoad = useCallback(() => {
        setLoaded(true);
    }, []);

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
                        <a
                            href="https://github.com/gpuweb/gpuweb/wiki/Implementation-Status"
                            style={{ textDecoration: 'underline' }}
                        >
                            Click here
                        </a>{' '}
                        for further information about supported browsers.
                    </Typography>
                </Stack>
            )}
        </div>
    );
};
