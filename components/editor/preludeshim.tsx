import { useAtomValue } from 'jotai';
import { wgpuAvailabilityAtom, wgputoyAtom } from 'lib/atoms/wgputoyatoms';
import { Fragment, useEffect, useState } from 'react';

/*
    We need to put this in its own component because any access to wgpu
    data must be through dynamic imports (i.e. client-side only)
 */
export default function PreludeShim() {
    const wgpuAvailability = useAtomValue(wgpuAvailabilityAtom);
    const [prelude, setPrelude] = useState('');

    const wgpuToy = useAtomValue(wgputoyAtom);
    useEffect(() => {
        if (wgpuAvailability === 'available' && wgpuToy) {
            setPrelude(wgpuToy.prelude());
        }
    }, [wgpuToy]);

    return <Fragment>{prelude}</Fragment>;
}
