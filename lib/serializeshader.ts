import {atom, Getter, useAtom, useAtomValue} from "jotai";
import {
    authorProfileAtom,
    codeAtom,
    descriptionAtom,
    loadedTexturesAtom, shaderIDAtom, sliderRefMapAtom,
    sliderSerDeArrayAtom, sliderSerDeNeedsUpdateAtom,
    titleAtom, visibilityAtom
} from "lib/atoms";
import {supabase, SUPABASE_SHADER_TABLE_NAME, SUPABASE_SHADERTHUMB_BUCKET_NAME} from "lib/supabaseclient";
import {definitions} from "types/supabase";
import {MutableRefObject, useMemo, useRef} from "react";
import {useAuth} from "lib/authcontext";
import {UniformSliderRef} from "components/uniformsliders";
import {useUpdateAtom} from "jotai/utils";

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
    textures: Array<TextureActiveSettings>
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
export type HOST_UPSERT = (dataUrl: string) => Promise<UpsertResult>;

const getSliderActiveSettings = (sliderRefMap: Map<string,MutableRefObject<UniformSliderRef>>) => {
    // convert our map of references into a plain array of objects
    return [...sliderRefMap.keys()].map((uuid) => {
        return {
            name: sliderRefMap[uuid].current.getUniform(),
            value: sliderRefMap[uuid].current.getVal()
        } as UniformActiveSettings;
    })
}

// https://github.com/pmndrs/jotai/issues/1100
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

export default function useShaderSerDe(): [HOST_GET, HOST_UPSERT] {

    const atomGetter = useAtomGetter();

    const {user} = useAuth();


    /*
        // the router is responsible for setting shader ID
    const shaderID = useAtomValue(shaderIDAtom);
    const [code, setCode] = useAtom(codeAtom);
    const [loadedTextures, setLoadedTextures] = useAtom(loadedTexturesAtom);
    const sliderRefMap = useAtomValue(sliderRefMapAtom);
    const [sliderSerDeArray, setSliderSerDeArray] = useAtom(sliderSerDeArrayAtom);
    const [sliderSerDeNeedsUpdate, setSliderSerDeNeedsUpdateAtom] = useAtom(sliderSerDeNeedsUpdateAtom);
    const [title, setTitle] = useAtom(titleAtom);
    const [description, setDescription] = useAtom(descriptionAtom);
    const [visibility, setVisibility] = useAtom(visibilityAtom);
    const [authorProfile, setAuthorProfile] = useAtom(authorProfileAtom);*/

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
    const setSliderSerDeArray = useUpdateAtom(sliderSerDeArrayAtom);
    const setSliderSerDeNeedsUpdateAtom = useUpdateAtom(sliderSerDeNeedsUpdateAtom);
    const setTitle = useUpdateAtom(titleAtom);
    const setDescription = useUpdateAtom(descriptionAtom);
    const setVisibility = useUpdateAtom(visibilityAtom);
    const setAuthorProfile = useUpdateAtom(authorProfileAtom);

    const get = async (id: number) => {
        try {
            let {data, error, status} = await supabase
                .from<definitions["shader"]>(SUPABASE_SHADER_TABLE_NAME)
                .select(`
                    name,
                    description,
                    visibility,
                    body,
                    profile (
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
                setTitle(shader.name);
                setDescription(shader.description);
                setVisibility(shader.visibility);

                const body = JSON.parse(shader.body);

                const shaderActiveSettings: ShaderActiveSettings = {
                    code: JSON.parse(body.code),
                    uniforms: body.uniforms,
                    textures: body.textures
                }

                setCode(shaderActiveSettings.code);
                setLoadedTextures(shaderActiveSettings.textures);
                setSliderSerDeArray(shaderActiveSettings.uniforms);
                setSliderSerDeNeedsUpdateAtom(true);
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
                        textures: atomGetter(loadedTexturesAtom)
                    })
                }]).single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                await uploadThumb(data["id"], dataUrl);
                return upsertResult(data["id"], true, true);
            } else {
                return upsertResult(null, false, false, "No data returned on creation");
            }

        } catch (error) {
            alert(error.message);
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
                        textures: atomGetter(loadedTexturesAtom)
                    })
                })
                .eq('id', id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            await uploadThumb(id, dataUrl);
            return upsertResult(id, false, true);
        } catch (error) {
            alert(error.message);
            return upsertResult(id, false, false, error.message);
        }
    };

    const upsert = async (dataUrl: string) => {
        if (atomGetter(shaderIDAtom)) {
            return update(atomGetter(shaderIDAtom) as number, dataUrl);
        } else {
            return create(dataUrl);
        }
    }

    return [get, upsert];
}