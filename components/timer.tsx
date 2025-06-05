'use client';
import Box from '@mui/material/Box';
import { useAtomValue } from 'jotai';
import { useTransientAtom } from 'jotai-game';
import { isPlayingAtom, timerAtom } from 'lib/atoms/atoms';
import { useRef, useState } from 'react';
import { theme } from 'theme/theme';
import useAnimationFrame from 'use-animation-frame';

export default function Timer() {
    const timer = useAtomValue(timerAtom);
    const [isPlaying] = useTransientAtom(isPlayingAtom);
    const frames = useRef(0);
    const secs = useRef(0);
    const [fps, setFps] = useState(0);

    useAnimationFrame(e => {
        if (isPlaying()) {
            frames.current += 1;
            secs.current += e.delta;
            if (secs.current > 0.5) {
                setFps(frames.current / secs.current);
                frames.current = 0;
                secs.current = 0;
            }
        }
    });

    return (
        <Box
            style={{
                color: theme.palette.dracula.foreground,
                lineHeight: '22px',
                paddingLeft: '3px',
                textAlign: 'left'
            }}
        >
            <Box>{fps.toFixed(1)}&nbsp;FPS</Box>
            <Box>{timer.toFixed(1)}s</Box>
        </Box>
    );
}
