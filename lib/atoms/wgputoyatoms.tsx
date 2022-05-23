import {atom} from "jotai";
import {init_wgpu, WgpuContext, WgpuToyRenderer} from "lib/wgputoy";
import {Size} from "types/size";

const isSSR = typeof window === "undefined";


// Using 'false' here to satisfy type checker for Jotai's function overloads
export const canvasElAtom = atom<HTMLCanvasElement | false>(false);

const canvasParentElBaseAtom = atom<HTMLElement | false>(false);

export const canvasParentElAtom = atom<HTMLElement | null, HTMLElement | null, void>(
    (get) => {let target = get(canvasParentElBaseAtom); return target ? target : null},
    (get, set, newValue) => set(canvasParentElBaseAtom, newValue ? newValue : false)
);

export const canvasParentSizeAtom = atom<Size>({width: 0, height: 0});

export const wgputoyInitAtom = atom<Promise<WgpuContext | false>>(async (get) => {
    if (!isSSR && get(canvasElAtom) !== false) {
        return init_wgpu((get(canvasElAtom) as HTMLCanvasElement).id)
    } else {
        return false;
    }
});

export const wgputoyAtom = atom<WgpuToyRenderer | false>((get) => {
    if (!isSSR && get(wgputoyInitAtom) !== false) {
        return new WgpuToyRenderer(get(wgputoyInitAtom) as WgpuContext);
    } else {
        return false;
    }
});

export const safeContext = (context: WgpuToyRenderer | false, callback: (context: WgpuToyRenderer) => void) => {
    if (context !== false) {
        callback(context as WgpuToyRenderer);
    }
};

export const safeContextWithCanvas = (context: WgpuToyRenderer | false, canvas: HTMLCanvasElement | false, callback: (context: WgpuToyRenderer, canvas: HTMLCanvasElement) => void) => {
    if (context !== false && canvas !== false) {
        callback(context as WgpuToyRenderer, canvas as HTMLCanvasElement);
    }
};