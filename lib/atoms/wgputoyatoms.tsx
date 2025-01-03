'use client';
import { atom } from 'jotai';
import { WgpuToyRenderer } from 'lib/engine';
import { getDimensions } from '../../types/canvasdimensions';

const isSSR = typeof window === 'undefined';

// Using 'false' here to satisfy type checker for Jotai's function overloads
export const canvasElAtom = atom<HTMLCanvasElement | false>(false);

const canvasParentElBaseAtom = atom<HTMLElement | false>(false);

export const canvasParentElAtom = atom<HTMLElement | null, [HTMLElement | null], void>(
    get => {
        const target = get(canvasParentElBaseAtom);
        return target ? target : null;
    },
    (get, set, newValue) => set(canvasParentElBaseAtom, newValue ? newValue : false)
);

type WgpuStatus = 'available' | 'unavailable' | 'unknown';
export const wgpuAvailabilityAtom = atom<WgpuStatus>('unknown');

export const wgputoyAtom = atom<Promise<WgpuToyRenderer | false>>(async get => {
    if (isSSR) return false;
    const canvas = get(canvasElAtom);
    if (!canvas) return false;
    const parentEl = get(canvasParentElAtom);
    if (!parentEl) return false;
    const dim = getDimensions(parentEl.offsetWidth * window.devicePixelRatio);
    return WgpuToyRenderer.create(dim.x, dim.y, canvas);
});

export const wgputoyPreludeAtom = atom<string>('');

// type predicate
export const isSafeContext = (context: WgpuToyRenderer | false): context is WgpuToyRenderer =>
    context !== false;
