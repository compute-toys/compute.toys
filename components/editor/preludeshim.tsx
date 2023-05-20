import { useAtomValue } from 'jotai';
import { isSafeContext, wgputoyAtom } from 'lib/atoms/wgputoyatoms';
import { Fragment, useEffect, useState } from 'react';

/*
    We need to put this in its own component because any access to wgpu
    data must be through dynamic imports (i.e. client-side only)
    Is there a less bogus way of doing this??
 */
export default function PreludeShim(props) {
    const wgpuToy = useAtomValue(wgputoyAtom);
    const [prelude, setPrelude] = useState('');

    useEffect(() => {
        setPrelude(isSafeContext(wgpuToy) ? wgpuToy.prelude() : '');
    }, [wgpuToy]);

    return <Fragment>{prelude}</Fragment>;
}
