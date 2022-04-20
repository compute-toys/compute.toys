// based on @react-hook/size

import * as React from "react";
import useLayoutEffect from "@react-hook/passive-layout-effect";
import useResizeObserver from "@react-hook/resize-observer";
import {WritableAtom, useAtom} from "jotai";
import {useUpdateAtom} from "jotai/utils";

const useSizeAtom = <T extends HTMLElement>(
    target: T | null,
    store: WritableAtom<Size, Size>,
    options?: UseSizeOptions

) => {
    const setSize = useUpdateAtom(store)

    target ? setSize({width: target.offsetWidth, height: target.offsetHeight})
           : setSize({width: options?.initialWidth ?? 0, height: options?.initialHeight ?? 0});

    useLayoutEffect(() => {
        if (!target) return
        setSize({width: target.offsetWidth, height: target.offsetHeight});
    }, [target])

    // Where the magic happens
    useResizeObserver(target, (entry) => {
        const target = entry.target as HTMLElement
        setSize({width: target.offsetWidth, height: target.offsetHeight})
    })
}

export interface UseSizeOptions {
    // The initial width to set into state.
    // This is useful for SSR environments.
    initialWidth: number
    // The initial height to set into state.
    // This is useful for SSR environments.
    initialHeight: number
}

export interface Size {
    // The initial width to set into state.
    // This is useful for SSR environments.
    width: number
    // The initial height to set into state.
    // This is useful for SSR environments.
    height: number
}

export default useSizeAtom