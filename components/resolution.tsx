import { useAtomValue } from 'jotai';
import { heightAtom, scaleAtom, widthAtom } from 'lib/atoms/atoms';
import { Fragment } from 'react';
import { theme } from 'theme/theme';

export default function Resolution() {
    const width = useAtomValue(widthAtom);
    const height = useAtomValue(heightAtom);
    const scale = useAtomValue(scaleAtom);

    if (width > 0 && height > 0) {
        return (
            <Fragment>
                <span style={{ color: theme.palette.dracula.foreground }}>
                    {Math.floor(width * scale)}x{Math.floor(height * scale)}
                </span>
            </Fragment>
        );
    }
    return null;
}
