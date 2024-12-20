import { fromUniformActiveSettings } from 'components/editor/uniformsliders';
import { useSetAtom } from 'jotai';
import { SUPABASE_SHADERTHUMB_BUCKET_NAME } from 'lib/db/supabaseclient';
import { getFullyQualifiedSupabaseBucketURL } from 'lib/util/urlutils';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { definitions } from 'types/supabase';
import {
    authorProfileAtom,
    codeAtom,
    codeNeedSaveAtom,
    customTexturesAtom,
    dbLoadedAtom,
    descriptionAtom,
    float32EnabledAtom,
    loadedTexturesAtom,
    manualReloadAtom,
    shaderIDAtom,
    sliderRefMapAtom,
    sliderSerDeNeedsUpdateAtom,
    Texture,
    titleAtom,
    visibilityAtom
} from './atoms/atoms';
import { ShaderActiveSettings, useResetShaderData } from './db/serializeshader';
import { supabase, SUPABASE_SHADER_TABLE_NAME } from './db/supabaseclient';
import { fixup_shader_code } from './util/fixup';
import { defaultTextures } from './util/textureutils';

export async function fetchShader(id: number) {
    const { data, error, status } = await supabase
        .from<definitions['shader']>(SUPABASE_SHADER_TABLE_NAME)
        .select(
            `
            name,
            description,
            thumb_url,
            visibility,
            body,
            profile:author (
                username,
                avatar_url,
                id
            )
        `
        )
        .eq('id', id)
        .single();

    if (error && status !== 406) {
        console.error(error.message);
    }

    return data;
}

export function buildHead(shader) {
    const image = getFullyQualifiedSupabaseBucketURL(
        SUPABASE_SHADERTHUMB_BUCKET_NAME,
        shader.thumb_url
    );
    return (
        <Head>
            <title>{shader.name}</title>
            <meta property="og:type" content="image" />
            <meta property="og:site_name" content="@compute.toys" />
            <meta property="og:title" content={shader.name} />
            <meta property="og:description" content={shader.description} />
            <meta property="og:image" content={image} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site:id" content="@compute_toys" />
            <meta name="twitter:title" content={shader.name} />
            <meta name="twitter:description" content={shader.description} />
            <meta name="twitter:image" content={image} />
        </Head>
    );
}

export function useShader(props) {
    const reset = useResetShaderData();
    const setManualReload = useSetAtom(manualReloadAtom);
    const setShaderID = useSetAtom(shaderIDAtom);
    const setDBLoaded = useSetAtom(dbLoadedAtom);
    const setCodeNeedSave = useSetAtom(codeNeedSaveAtom);

    const setCode = useSetAtom(codeAtom);
    const setLoadedTextures = useSetAtom(loadedTexturesAtom);
    const setCustomTextures = useSetAtom(customTexturesAtom);
    const setSliderSerDeNeedsUpdate = useSetAtom(sliderSerDeNeedsUpdateAtom);
    const setSliderRefMap = useSetAtom(sliderRefMapAtom);
    const setTitle = useSetAtom(titleAtom);
    const setDescription = useSetAtom(descriptionAtom);
    const setVisibility = useSetAtom(visibilityAtom);
    const setAuthorProfile = useSetAtom(authorProfileAtom);
    const setFloat32Enabled = useSetAtom(float32EnabledAtom);

    const router = useRouter();

    const loadShader = shader => {
        if (!shader) router.push('/404');

        setDBLoaded(false);
        reset();
        setTitle(shader.name);
        setDescription(shader.description);
        setVisibility(shader.visibility);

        const body = JSON.parse(shader.body);
        const float32Enabled = 'float32Enabled' in body ? body.float32Enabled : false;

        const shaderActiveSettings: ShaderActiveSettings = {
            code: fixup_shader_code(JSON.parse(body.code)),
            uniforms: body.uniforms,
            textures: body.textures,
            float32Enabled: float32Enabled
        };
        setCode(shaderActiveSettings.code);
        setLoadedTextures(shaderActiveSettings.textures);
        // see if the shaders requires any textures that aren't part of the default set
        // if it does, check if that custom texture is already in the custom texture list
        // and if it's not, add it to the list
        setCustomTextures(existingCustomTextures => {
            const newCustomTextures: Texture[] = [];
            for (const requiredTexture of shaderActiveSettings.textures) {
                const isDefault = defaultTextures.find(dt => dt.img === requiredTexture.img);

                if (!isDefault) {
                    const isNew = !existingCustomTextures.find(
                        ect => ect.img === requiredTexture.img
                    );
                    if (isNew) {
                        newCustomTextures.push({ img: requiredTexture.img });
                    }
                }
            }

            return [...existingCustomTextures, ...newCustomTextures];
        });
        setSliderRefMap(fromUniformActiveSettings(shaderActiveSettings.uniforms));
        // need to inform the slider component of a change so it can get a count of all the enabled sliders
        setSliderSerDeNeedsUpdate(true);
        setFloat32Enabled(float32Enabled);
        setAuthorProfile(shader.profile);
        setShaderID(props.id);
        setManualReload(true);
        setDBLoaded(true);
        setCodeNeedSave(false);
    };

    useEffect(() => {
        if (props.shader) {
            // public/unlisted shaders are fetched server-side
            loadShader(props.shader);
        } else if (router.isReady) {
            // private shaders need to be fetched client-side
            fetchShader(props.id).then(loadShader);
        }
    }, [router.isReady]);
}

export const DynamicEditor = dynamic(() => import('components/editor/editor'), { ssr: false });
