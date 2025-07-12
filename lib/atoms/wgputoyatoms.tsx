'use client';
import { atom } from 'jotai';

// Using 'false' here to satisfy type checker for Jotai's function overloads
export const canvasElAtom = atom<HTMLCanvasElement | false>(false);
export const wgpuContextAtom = atom<GPUCanvasContext | false>(false);
export const wgpuDeviceAtom = atom<GPUDevice | false>(false);

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

export const wgputoyPreludeAtom = atom<string>('');
