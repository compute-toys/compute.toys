import {atom} from 'jotai';
import {ParseError} from "lib/parseerror";
import {MutableRefObject} from "react";
import {UniformSliderRef} from "components/uniformsliders";
import {UniformActiveSettings} from "lib/serializeshader";

export const DEFAULT_SHADER = `
@stage(compute) @workgroup_size(16, 16)
fn main_image(@builtin(global_invocation_id) id: uint3) {
    // Viewport resolution (in pixels)
    let screen_size = uint2(textureDimensions(screen));

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
    textureStore(screen, int2(id.xy), float4(col, 1.));
}
`;

export interface AuthorProfile {
    username: string,
    avatar_url: string,
    id: string
}

export type Visibility = 'private' | 'unlisted' | 'public';

export const shaderIDAtom = atom<number | false>(false);
export const codeAtom = atom<string>(DEFAULT_SHADER);
export const titleAtom = atom<string>("New Shader");
export const descriptionAtom = atom<string>("");
export const visibilityAtom = atom<Visibility>("private");
export const playAtom = atom<boolean>(true);
export const resetAtom = atom<boolean>(false);
export const hotReloadAtom = atom<boolean>(false);
export const manualReloadAtom = atom<boolean>(false);
export const parseErrorAtom = atom<ParseError>({
    summary: "",
    position: {row: 0, col: 0},
    success: true
});
export const loadedTexturesAtom = atom<{
    img: string;
    thumb?: string;
}[]>([{img: '/textures/blank.png'}, {img: '/textures/blank.png'}]);
export const entryPointsAtom = atom([]);
export const sliderRefMapAtom = atom<Map<string,MutableRefObject<UniformSliderRef>>>(new Map<string,MutableRefObject<UniformSliderRef>>());

export const sliderSerDeArrayAtom = atom<Array<UniformActiveSettings>>([]);
export const sliderSerDeNeedsUpdateAtom = atom<boolean>(false);

export const shaderDataUrlThumbAtom = atom<string>("");

export const authorProfileAtom = atom<AuthorProfile | false>(false);