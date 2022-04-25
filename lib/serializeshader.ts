import {useAtom} from "jotai";
import {
    codeAtom,
    descriptionAtom,
    loadedTexturesAtom,
    sliderSerDeArrayAtom, sliderSerDeNeedsUpdateAtom,
    titleAtom, visibilityAtom
} from "./atoms";
import {supabase} from "./supabaseclient";
import {definitions} from "../types/supabase";

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

export type HOST_GET = (id: number) => Promise<void>;
export type HOST_CREATE = () => Promise<number | null>;
export type HOST_UPDATE = (id: number) => Promise<void>;

export default function useShaderSerDe(): [HOST_GET, HOST_CREATE, HOST_UPDATE] {
    const [code, setCode] = useAtom(codeAtom);
    const [loadedTextures, setLoadedTextures] = useAtom(loadedTexturesAtom);
    const [sliderSerDeArray, setSliderSerDeArray] = useAtom(sliderSerDeArrayAtom);
    const [sliderSerDeNeedsUpdate, setSliderSerDeNeedsUpdateAtom] = useAtom(sliderSerDeNeedsUpdateAtom);
    const [title, setTitle] = useAtom(titleAtom);
    const [description, setDescription] = useAtom(descriptionAtom);
    const [visibility, setVisibility] = useAtom(visibilityAtom);

    const get = async (id: number) => {
        try {
            let {data, error, status} = await supabase
                .from<definitions["shader"]>('shader')
                .select('*')
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
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const create = async () => {
        try {
            let {data, error, status} = await supabase
                .from<definitions["shader"]>('shader')
                .insert([{
                    name: title,
                    description: description,
                    visibility: visibility,
                    body: JSON.stringify({
                        code: JSON.stringify(code),
                        uniforms: sliderSerDeArray,
                        textures: loadedTextures
                    })
                }]).single();

            if (error && status !== 406) {
                throw error;
            }
            if (data) {
                return data["id"];
            } else {
                return null;
            }

        } catch (error) {
            alert(error.message);
            return null;
        }
    };

    const update = async (id: number) => {
        try {
            // TODO: let supabase know we don't need the record
            let {data, error, status} = await supabase
                .from<definitions["shader"]>('shader')
                .update({
                    name: title,
                    description: description,
                    visibility: visibility,
                    body: JSON.stringify({
                        code: JSON.stringify(code),
                        uniforms: sliderSerDeArray,
                        textures: loadedTextures
                    })
                })
                .eq('id', id)
                .single();

            if (error && status !== 406) {
                throw error;
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return [get, create, update];
};