import {atom} from "jotai";
import {init_wgpu, WgpuContext, WgpuToyRenderer} from "lib/wgputoy";
import {Size} from "types/size";
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

//export const canvasParentSizeAtom = atom<Size>({width: 0, height: 0});

export const wgputoyInitAtom = atom<Promise<WgpuContext | false>>(async (get) => {
    if (!isSSR && get(canvasElAtom) !== false && get(canvasParentElAtom)) {
        const parentEl = get(canvasParentElAtom);
        const dim = getDimensions(parentEl.offsetWidth * window.devicePixelRatio);
        console.log("Initialising WebGPU");
        return init_wgpu(dim.x, dim.y, (get(canvasElAtom) as HTMLCanvasElement).id);
    } else {
        return false;
    }
});

export const wgputoyAtom = atom<WgpuToyRenderer | false>((get) => {
    if (!isSSR && get(wgputoyInitAtom) !== false) {
        console.log("Creating renderer");
        return new WgpuToyRenderer(get(wgputoyInitAtom) as WgpuContext);
    } else {
        return false;
    }
});

// type predicate
export const isSafeContext = (context: WgpuToyRenderer | false): context is WgpuToyRenderer => (context !== false && context.ptr !== 0);
