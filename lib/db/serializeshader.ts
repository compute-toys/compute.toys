import {atom, Getter, useAtomValue} from "jotai";
import {
    authorProfileAtom,
    codeAtom,
    descriptionAtom, entryPointsAtom, float32EnabledAtom,
    loadedTexturesAtom, saveColorTransitionSignalAtom, shaderDataUrlThumbAtom, shaderIDAtom, sliderRefMapAtom,
    sliderSerDeNeedsUpdateAtom,
    titleAtom, visibilityAtom
} from "lib/atoms/atoms";
import {supabase, SUPABASE_SHADER_TABLE_NAME, SUPABASE_SHADERTHUMB_BUCKET_NAME} from "lib/db/supabaseclient";
import {definitions} from "types/supabase";
import {useMemo, useRef} from "react";
import {useAuth} from "lib/db/authcontext";
import {fromUniformActiveSettings, UniformSliderRef} from "components/editor/uniformsliders";
import {useResetAtom, useUpdateAtom} from "jotai/utils";
import {theme} from "theme/theme";

export interface UniformActiveSettings {
    name: string,
    value: number
}

export interface TextureActiveSettings {
    img: string,
    thumb?: string
}

export interface ShaderActiveSettings {
    code: string,
    uniforms: Array<UniformActiveSettings>,
    textures: Array<TextureActiveSettings>,
    float32Enabled?: boolean
}

export interface UpsertResult {
    id: number | null;
    needsRedirect: boolean;
    success: boolean;
    message?: string;
}

const upsertResult = (id: number | null, needsRedirect: boolean, success: boolean, message?: string) : UpsertResult => {
    return {
        id: id,
        needsRedirect: needsRedirect,
        success: success,
        message: message ?? undefined
    };
}

export type HOST_GET = (id: number) => Promise<void>;
export type HOST_UPSERT = (dataUrl: string, forceCreate: boolean) => Promise<UpsertResult>;

const getSliderActiveSettings = (sliderRefMap: Map<string,UniformSliderRef>) => {
    // convert our map of references into a plain array of objects
    return [...sliderRefMap.keys()].map((uuid) => {
        return {
            name: sliderRefMap.get(uuid).getUniform(),
            value: sliderRefMap.get(uuid).getVal()
        } as UniformActiveSettings;
    })
}

// https://github.com/pmndrs/jotai/issues/1100
// TODO: jotai has experimental features for dealing with this case, use them when they're less experimental
export const useAtomGetter = () => {
    const getter = useRef<Getter | null>(null);
    const derived = useMemo(
        () =>
            atom((get) => {
                getter.current = get;
            }),
        []
    );
    useAtomValue(derived);
    return getter.current;
};

export const useResetShaderData = () => {
    const resetAuthorProfile                = useResetAtom(authorProfileAtom);
    const resetShaderID                     = useResetAtom(shaderIDAtom);
    const resetCode                         = useResetAtom(codeAtom);
    const resetTitle                        = useResetAtom(titleAtom);
    const resetDescription                  = useResetAtom(descriptionAtom);
    const resetVisibility                   = useResetAtom(visibilityAtom);
    const resetLoadedTextures               = useResetAtom(loadedTexturesAtom);
    const resetEntryPoints                  = useResetAtom(entryPointsAtom);
    const resetSliderSerDeNeedsUpdateAtom   = useResetAtom(sliderSerDeNeedsUpdateAtom);
    const resetShaderDataUrlThumb           = useResetAtom(shaderDataUrlThumbAtom);
    const resetFloat32Enabled               = useResetAtom(float32EnabledAtom);

    const reset = () => {
        resetAuthorProfile();
        resetShaderID();
        resetCode();
        resetTitle();
        resetDescription();
        resetVisibility();
        resetLoadedTextures();
        resetEntryPoints();
        resetSliderSerDeNeedsUpdateAtom();
        resetShaderDataUrlThumb();
        resetFloat32Enabled();
    }

    return reset;
}

export default function useShaderSerDe(): [HOST_GET, HOST_UPSERT] {

    const atomGetter = useAtomGetter();

    const {user} = useAuth();

    /*
        We DO NOT want to use getters here, even though
        it would be much more convenient to do so. If we did,
        putting this function (useShaderSerde) anywhere in our
        component tree would cause rerenders on all child
        components in our tree whenever any of the values
        we need to serialize change. Instead, we use a hack
        to read the atoms imperatively when they are needed.
     */
    const setCode = useUpdateAtom(codeAtom);
    const setLoadedTextures = useUpdateAtom(loadedTexturesAtom);
    const setSliderSerDeNeedsUpdate = useUpdateAtom(sliderSerDeNeedsUpdateAtom);
    const setSliderRefMap = useUpdateAtom(sliderRefMapAtom);
    const setTitle = useUpdateAtom(titleAtom);
    const setDescription = useUpdateAtom(descriptionAtom);
    const setVisibility = useUpdateAtom(visibilityAtom);
    const setAuthorProfile = useUpdateAtom(authorProfileAtom);
    const setSaveColorTransitionSignal = useUpdateAtom(saveColorTransitionSignalAtom);
    const setFloat32Enabled = useUpdateAtom(float32EnabledAtom);

    const get = async (id: number) => {
        try {
            let {data, error, status} = await supabase
                .from<definitions["shader"]>(SUPABASE_SHADER_TABLE_NAME)
                .select(`
                    name,
                    description,
                    visibility,
                    body,
                    profile:author (
                        username,
                        avatar_url,
                        id
                    )
                        
                `)
                .eq("id", id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                const shader = data;
                // set page title
                document.title = shader.name;
                setTitle(shader.name);
                setDescription(shader.description);
                setVisibility(shader.visibility);

                const body = JSON.parse(shader.body);
                const float32Enabled = 'float32Enabled' in body ? body.float32Enabled : false;

                const shaderActiveSettings: ShaderActiveSettings = {
                    code: JSON.parse(body.code),
                    uniforms: body.uniforms,
                    textures: body.textures,
                    float32Enabled: float32Enabled
                }

                setCode(shaderActiveSettings.code);
                setLoadedTextures(shaderActiveSettings.textures);
                setSliderRefMap(fromUniformActiveSettings(shaderActiveSettings.uniforms));
                // need to inform the slider component of a change so it can get a count of all the enabled sliders
                setSliderSerDeNeedsUpdate(true);
                setFloat32Enabled(float32Enabled);
                // Typescript can't infer type of joined table
                // @ts-ignore
                setAuthorProfile(shader.profile)
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const uploadThumb = async (id: number, dataUrl: string) => {
        const fileExt = "jpg";
        const fileName = `${user!.id}/${id}.${fileExt}`;

        // convert to a format that the API likes by stripping the header
        // TODO: make this less brittle
        const buf = Buffer.from(dataUrl.replace('data:image/jpeg;base64,', ''), 'base64');
        let { error: uploadError } = await supabase.storage
            .from(SUPABASE_SHADERTHUMB_BUCKET_NAME)
            .upload(fileName, buf,
                {contentType: 'image/jpeg', upsert: true});

        if (uploadError) {
            throw uploadError
        }

        let { error: updateError } = await supabase.from('shader').update({
            thumb_url: fileName,
        }).eq('id', id)

        if (updateError) {
            throw updateError
        }
    }

    const create = async (dataUrl: string) => {
        try {
            let {data, error, status} = await supabase
                .from<definitions["shader"]>(SUPABASE_SHADER_TABLE_NAME)
                .insert([{
                    name: atomGetter(titleAtom),
                    description: atomGetter(descriptionAtom),
                    visibility: atomGetter(visibilityAtom),
                    body: JSON.stringify({
                        code: JSON.stringify(atomGetter(codeAtom)),
                        uniforms: getSliderActiveSettings(atomGetter(sliderRefMapAtom)),
                        textures: atomGetter(loadedTexturesAtom),
                        float32Enabled: atomGetter(float32EnabledAtom)
                    })
                }]).single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                await uploadThumb(data["id"], dataUrl);
                setSaveColorTransitionSignal(theme.palette.dracula.green)
                return upsertResult(data["id"], true, true);
            } else {
                setSaveColorTransitionSignal(theme.palette.dracula.red)
                return upsertResult(null, false, false, "No data returned on creation");
            }

        } catch (error) {
            alert(error.message);
            setSaveColorTransitionSignal(theme.palette.dracula.red)
            return upsertResult(null, false, false, error.message);
        }
    };

    const update = async (id: number, dataUrl: string) => {
        try {
            // TODO: let supabase know we don't need the record
            let {data, error, status} = await supabase
                .from<definitions["shader"]>(SUPABASE_SHADER_TABLE_NAME)
                .update({
                    name: atomGetter(titleAtom),
                    description: atomGetter(descriptionAtom),
                    visibility: atomGetter(visibilityAtom),
                    body: JSON.stringify({
                        code: JSON.stringify(atomGetter(codeAtom)),
                        uniforms: getSliderActiveSettings(atomGetter(sliderRefMapAtom)),
                        textures: atomGetter(loadedTexturesAtom),
                        float32Enabled: atomGetter(float32EnabledAtom)
                    })
                })
                .eq('id', id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            await uploadThumb(id, dataUrl);
            setSaveColorTransitionSignal(theme.palette.dracula.green)
            return upsertResult(id, false, true);
        } catch (error) {
            alert(error.message);
            setSaveColorTransitionSignal(theme.palette.dracula.red)
            return upsertResult(id, false, false, error.message);
        }
    };

    const upsert = async (dataUrl: string, forceCreate: boolean) => {
        if (atomGetter(shaderIDAtom) && !forceCreate) {
            return update(atomGetter(shaderIDAtom) as number, dataUrl);
        } else {
            return create(dataUrl);
        }
    }

    return [get, upsert];
}