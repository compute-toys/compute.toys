'use client';
import WarningIcon from '@mui/icons-material/Warning';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAtom, useSetAtom } from 'jotai';
import {
    canvasElAtom,
    wgpuAvailabilityAtom,
    wgpuContextAtom,
    wgpuDeviceAtom
} from 'lib/atoms/wgputoyatoms';
import { useEffect, useRef } from 'react';
import { theme } from 'theme/theme';
import WgpuToyController from './wgputoycontroller';

export const WgpuToyWrapper = props => {
    const setCanvasEl = useSetAtom(canvasElAtom);
    const setWgpuContext = useSetAtom(wgpuContextAtom);
    const setWgpuDevice = useSetAtom(wgpuDeviceAtom);
    const [wgpuAvailability, setWgpuAvailability] = useAtom(wgpuAvailabilityAtom);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        (async () => {
            // there may be a case where we don't have the canvas *yet*
            if (canvasRef.current) {
                const context = canvasRef.current.getContext('webgpu');
                const adapter = await navigator.gpu?.requestAdapter({
                    powerPreference: 'high-performance'
                });
                const device = await adapter?.requestDevice({
                    label: 'compute.toys device with all features',
                    requiredFeatures: [...adapter.features] as GPUFeatureName[]
                });
                if (device && context) {
                    setCanvasEl(canvasRef.current);
                    setWgpuContext(context);
                    setWgpuDevice(device);
                    setWgpuAvailability('available');
                } else {
                    setWgpuAvailability('unavailable');
                }
            }
        })();
    }, []);

    return (
        <div style={props.style}>
            <canvas
                ref={canvasRef}
                id={props.bindID}
                style={
                    wgpuAvailability !== 'unavailable'
                        ? { ...props.style, backgroundColor: 'black', borderRadius: '4px' }
                        : { position: 'fixed', display: 'none' }
                }
                tabIndex={1}
            />
            {wgpuAvailability === 'unknown' ? null : wgpuAvailability === 'available' ? (
                <WgpuToyController embed={props.embed} />
            ) : (
                <Stack color={theme.palette.primary.contrastText} spacing={2} padding={7}>
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
