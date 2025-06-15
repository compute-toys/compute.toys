'use client';
import { useAtomValue } from 'jotai';
import { heightAtom, widthAtom } from 'lib/atoms/atoms';
import { Fragment } from 'react';
import { theme } from 'theme/theme';

export default function Resolution() {
    const width = useAtomValue(widthAtom);
    const height = useAtomValue(heightAtom);

    return (
        <Fragment>
            <span style={{ color: theme.palette.dracula.foreground }}>
                {width ? `${width}x${height}` : ''}
            </span>
        </Fragment>
    );
}
