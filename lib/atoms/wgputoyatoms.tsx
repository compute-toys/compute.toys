import {atom} from "jotai";
import {WgpuToyRenderer} from "lib/wgputoy";
import {getDimensions} from "../../types/canvasdimensions";

// just to check if the object has already been freed (ptr=0)
declare module "lib/wgputoy" {
    interface WgpuToyRenderer {
        ptr: number
    }
}

const isSSR = typeof window === "undefined";


// Using 'false' here to satisfy type checker for Jotai's function overloads
export const canvasElAtom = atom<HTMLCanvasElement | false>(false);

const canvasParentElBaseAtom = atom<HTMLElement | false>(false);

export const canvasParentElAtom = atom<HTMLElement | null, HTMLElement | null, void>(
    (get) => {let target = get(canvasParentElBaseAtom); return target ? target : null},
    (get, set, newValue) => set(canvasParentElBaseAtom, newValue ? newValue : false)
);

export const wgputoyAtom = atom<Promise<WgpuToyRenderer | false>>(async (get) => {
    // https://github.com/webpack/webpack/issues/11347
    const wasm = await import("lib/wgputoy/wgputoy_bg.wasm");
    const {create_renderer} = await import("lib/wgputoy/wgputoy_bg.js");
    if (!isSSR && get(canvasElAtom) !== false && get(canvasParentElAtom)) {
        const parentEl = get(canvasParentElAtom);
        const dim = getDimensions(parentEl.offsetWidth * window.devicePixelRatio);
        console.log("Initialising WebGPU renderer");
        return create_renderer(dim.x, dim.y, (get(canvasElAtom) as HTMLCanvasElement).id);
    } else {
        return false;
    }
});

// type predicate
export const isSafeContext = (context: WgpuToyRenderer | false): context is WgpuToyRenderer => (context !== false && context.ptr !== 0);
