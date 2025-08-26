'use client';
import { useAtomValue } from 'jotai';
import { heightAtom, widthAtom } from '../lib/atoms/atoms';
import { Fragment } from 'react';
import { useTheme } from '@mui/material/styles';

export default function Resolution() {
    const theme = useTheme();
    const width = useAtomValue(widthAtom);
    const height = useAtomValue(heightAtom);

    return (
        <Fragment>
            <span style={{ color: theme.palette.dracula.foreground, marginRight: '3px' }}>
                {width ? `${width}x${height}` : ''}
            </span>
        </Fragment>
    );
}
