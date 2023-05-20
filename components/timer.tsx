import { Box } from '@mui/material';
import { useAtomValue } from 'jotai';
import { useTransientAtom } from 'jotai-game';
import { isPlayingAtom, timerAtom } from 'lib/atoms/atoms';
import { Fragment, useRef, useState } from 'react';
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

    if (timer > 0 && fps > 0) {
        return (
            <Fragment>
                <Box marginTop="7px" marginLeft="1.3rem">
                    <span
                        style={{
                            color: theme.palette.dracula.foreground,
                            lineHeight: '25px',
                            display: 'inline-block'
                        }}
                    >
                        {timer.toFixed(1)}s / {fps.toFixed(1)} FPS
                    </span>
                </Box>
            </Fragment>
        );
    }
    return null;
}
