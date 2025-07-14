'use client';
import { BufferControlRef } from 'components/editor/buffercontrols';
import { UniformSliderRef } from 'components/editor/uniformsliders';
import { atom } from 'jotai';
import { atomWithReset } from 'jotai/utils';
import type { editor } from 'monaco-editor';
import { ParseError } from 'types/parseerror';
import defaultShader from '../shaders/default.wgsl';

export interface AuthorProfile {
    username: string | null;
    avatar_url: string | null;
    id: string;
}

export interface Texture {
    img: string;
    thumb?: string;
    url?: string;
}

export const playAtom = atom<boolean>(true);
export const resetAtom = atom<boolean>(false);
export const hotReloadAtom = atom<boolean>(false);
export const manualReloadAtom = atom<boolean>(false);
export const requestFullscreenAtom = atom<boolean>(false);
export const parseErrorAtom = atom<ParseError>({
    summary: '',
    position: { row: 0, col: 0 },
    success: true
});
export const isPlayingAtom = atom<boolean>(false);
export const vimAtom = atom<boolean>(false);
export const recordingAtom = atom<boolean>(false);

export const timerAtom = atom<number>(0);
export const widthAtom = atom<number>(0);
export const heightAtom = atom<number>(0);

export const customTexturesAtom = atom<Texture[]>([]);

export const dbLoadedAtom = atom<boolean>(false);
export const saveColorTransitionSignalAtom = atom<string | false>(false);

export const codeAtom = atomWithReset<string>(defaultShader);
export const codeNeedSaveAtom = atomWithReset<boolean>(false);
export const monacoEditorAtom = atomWithReset<editor.IStandaloneCodeEditor | false>(false);

export const authorProfileAtom = atomWithReset<AuthorProfile | false>(false);
export const shaderIDAtom = atomWithReset<number | false>(false);
export const titleAtom = atomWithReset<string>('New Shader');
export const descriptionAtom = atomWithReset<string>('');

export type Visibility = 'private' | 'unlisted' | 'public';
export const visibilityAtom = atomWithReset<Visibility>('private');
export const loadedTexturesAtom = atomWithReset<Texture[]>([
    { img: '/textures/blank.png' },
    { img: '/textures/blank.png' }
]);
export const textureChannelDimensionsAtom = atomWithReset<{ width: number; height: number }[]>([
    { width: 128, height: 128 },
    { width: 128, height: 128 }
]);
export const entryPointsAtom = atomWithReset(new Array<string>());
export const entryTimersAtom = atomWithReset(new Array<number>());

export const bufferControlRefMapAtom = atom<Map<string, BufferControlRef>>(
    new Map<string, BufferControlRef>([
        ["abcdef", {
            getUUID: () => "abcdef",
            getBufferName: () => "buffer_a"
        }],
        ["ghijkl", {
            getUUID: () => "ghijkl",
            getBufferName: () => "buffer_b"
        }]
    ])
);
// we create a new refmap when deserializing from DB, don't need a reset
export const sliderRefMapAtom = atom<Map<string, UniformSliderRef>>(
    new Map<string, UniformSliderRef>()
);
export const sliderSerDeNeedsUpdateAtom = atomWithReset<boolean>(true);
export const sliderUpdateSignalAtom = atom<boolean>(false);
export const shaderDataUrlThumbAtom = atomWithReset<string>('');
export const float32EnabledAtom = atomWithReset<boolean>(false);
export const profilerEnabledAtom = atomWithReset<boolean>(true); //true for UI, changing to false
export const languageAtom = atomWithReset<string>('wgsl');
export const halfResolutionAtom = atomWithReset<boolean>(false);
