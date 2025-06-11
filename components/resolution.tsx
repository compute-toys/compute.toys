'use client';
import { useAtomValue } from 'jotai';
import { heightAtom, scaleAtom, widthAtom } from 'lib/atoms/atoms';
import { theme } from 'theme/theme';

export default function Resolution() {
    const width = useAtomValue(widthAtom);
    const height = useAtomValue(heightAtom);
    const scale = useAtomValue(scaleAtom);

    return (
        <span
            style={{
                color: theme.palette.dracula.foreground,
                paddingTop: '1px',
                paddingRight: '2px',
                lineHeight: '10px',
                textTransform: 'none'
            }}
        >
            {width ? `${Math.floor(width * scale)}x${Math.floor(height * scale)}` : ''}
        </span>
    );
}
