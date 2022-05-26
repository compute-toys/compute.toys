import {Fragment, useEffect, useState} from "react";
import {useAtomValue} from "jotai";
import {wgputoyAtom} from "lib/atoms/wgputoyatoms";
import {WgpuToyRenderer} from "lib/wgputoy";

/*
    We need to put this in its own component because any access to wgpu
    data must be through dynamic imports (i.e. client-side only)
    Is there a less bogus way of doing this??
 */
export default function PreludeShim(props) {
    const wgpuToy = useAtomValue(wgputoyAtom);
    const [prelude, setPrelude] = useState("");

    useEffect(() => {
        setPrelude(wgpuToy !== false ? (wgpuToy as WgpuToyRenderer).prelude() : "")
    }, [wgpuToy])

    return <Fragment>{prelude}</Fragment>;
}