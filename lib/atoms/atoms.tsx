import {atom} from 'jotai';
import {ParseError} from "types/parseerror";
import {MutableRefObject} from "react";
import {UniformSliderRef} from "components/editor/uniformsliders";
import {UniformActiveSettings} from "lib/db/serializeshader";
import {atomWithReset} from "jotai/utils";

export const DEFAULT_SHADER = `
@compute @workgroup_size(16, 16)
fn main_image(@builtin(global_invocation_id) id: uint3) {
    // Viewport resolution (in pixels)
    let screen_size = textureDimensions(screen);

    // Prevent overdraw for workgroups on the edge of the viewport
    if (id.x >= screen_size.x || id.y >= screen_size.y) { return; }

    // Pixel coordinates (centre of pixel, origin at bottom left)
    let fragCoord = float2(float(id.x) + .5, float(screen_size.y - id.y) - .5);

    // Normalised pixel coordinates (from 0 to 1)
    let uv = fragCoord / float2(screen_size);

    // Time varying pixel colour
    var col = .5 + .5 * cos(time.elapsed + uv.xyx + float3(0.,2.,4.));

    // Convert from gamma-encoded to linear colour space
    col = pow(col, float3(2.2));

    // Output to screen (linear colour space)
    textureStore(screen, id.xy, float4(col, 1.));
}
`;

export interface AuthorProfile {
    username: string,
    avatar_url: string,
    id: string
}

export interface Texture {
    img: string,
    thumb?: string,
    url?: string,
}

export type Visibility = 'private' | 'unlisted' | 'public';

export type WgpuStatus = 'available' | 'unavailable' | 'unknown';

export const wgpuAvailabilityAtom = atom<WgpuStatus>('unknown');

export const playAtom = atom<boolean>(true);
export const resetAtom = atom<boolean>(false);
export const hotReloadAtom = atom<boolean>(false);
export const manualReloadAtom = atom<boolean>(false);
export const requestFullscreenAtom = atom<boolean>(false);
export const parseErrorAtom = atom<ParseError>({
    summary: "",
    position: {row: 0, col: 0},
    success: true
});
export const isPlayingAtom = atom<boolean>(false);
export const vimAtom = atom<boolean>(false);

export const timerAtom = atom<number>(0);
export const widthAtom = atom<number>(0);
export const heightAtom = atom<number>(0);
export const scaleAtom = atom<number>(1);

export const dbLoadedAtom = atom<boolean>(false);
export const saveColorTransitionSignalAtom = atom<string | false>(false);

export const authorProfileAtom = atomWithReset<AuthorProfile | false>(false);
export const shaderIDAtom = atomWithReset<number | false>(false);
export const codeAtom = atomWithReset<string>(DEFAULT_SHADER);
export const titleAtom = atomWithReset<string>("New Shader");
export const descriptionAtom = atomWithReset<string>("");
export const visibilityAtom = atomWithReset<Visibility>("private");
export const loadedTexturesAtom = atomWithReset<Texture[]>([{img: '/textures/blank.png'}, {img: '/textures/blank.png'}]);
export const entryPointsAtom = atomWithReset([]);
// we create a new refmap when deserializing from DB, don't need a reset
export const sliderRefMapAtom = atom<Map<string,UniformSliderRef>>(new Map<string,UniformSliderRef>());
export const sliderSerDeNeedsUpdateAtom = atomWithReset<boolean>(true);
export const sliderUpdateSignalAtom = atom<boolean>(false);
export const shaderDataUrlThumbAtom = atomWithReset<string>("");
export const float32EnabledAtom = atomWithReset<boolean>(false);
export const halfResolutionAtom = atomWithReset<boolean>(false);





