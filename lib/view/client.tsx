'use client';
import { useSetAtom } from 'jotai';
import { ShaderActiveSettings, useResetShaderData } from 'lib/db/serializeshader';
import { fromUniformActiveSettings } from '../../standalone-editor/src/components/editor/uniformsliders';
import {
    authorProfileAtom,
    codeAtom,
    codeNeedSaveAtom,
    customTexturesAtom,
    dbLoadedAtom,
    descriptionAtom,
    float32EnabledAtom,
    languageAtom,
    loadedTexturesAtom,
    manualReloadAtom,
    shaderIDAtom,
    sliderRefMapAtom,
    sliderSerDeNeedsUpdateAtom,
    Texture,
    titleAtom,
    visibilityAtom
} from '../../standalone-editor/src/lib/atoms/atoms';
import { fixup_shader_code } from '../../standalone-editor/src/lib/util/fixup';
import { defaultTextures } from '../../standalone-editor/src/lib/util/textureutils';
import { Shader } from './server';

export function useShader(shader: Shader) {
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
    const setLanguage = useSetAtom(languageAtom);

    setDBLoaded(false);
    reset();
    setTitle(shader.name);
    setDescription(shader.description || '');
    setVisibility(shader.visibility);

    const body = JSON.parse(shader.body);
    const code = fixup_shader_code(JSON.parse(body.code));
    const uniforms = body.uniforms;
    const textures = body.textures;
    const float32Enabled = 'float32Enabled' in body ? body.float32Enabled : false;
    const language = 'language' in body ? body.language : 'wgsl';

    const shaderActiveSettings: ShaderActiveSettings = {
        code,
        uniforms,
        textures,
        float32Enabled,
        language
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
                const isNew = !existingCustomTextures.find(ect => ect.img === requiredTexture.img);
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
    setLanguage(language);
    setAuthorProfile(shader.profile);
    setShaderID(shader.id);
    setManualReload(true);
    setDBLoaded(true);
    setCodeNeedSave(false);
}
