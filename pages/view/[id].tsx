import Editor from 'components/editor/editor';
import { fromUniformActiveSettings } from 'components/editor/uniformsliders';
import { useSetAtom } from 'jotai';
import {
    authorProfileAtom,
    codeAtom,
    dbLoadedAtom,
    descriptionAtom,
    float32EnabledAtom,
    loadedTexturesAtom,
    manualReloadAtom,
    shaderIDAtom,
    sliderRefMapAtom,
    sliderSerDeNeedsUpdateAtom,
    titleAtom,
    visibilityAtom
} from 'lib/atoms/atoms';
import { ShaderActiveSettings, useResetShaderData } from 'lib/db/serializeshader';
import {
    supabase,
    SUPABASE_SHADERTHUMB_BUCKET_NAME,
    SUPABASE_SHADER_TABLE_NAME
} from 'lib/db/supabaseclient';
import { fixup_shader_code } from 'lib/util/fixup';
import { getFullyQualifiedSupabaseBucketURL } from 'lib/util/urlutils';
import Error from 'next/error';
import Head from 'next/head';
import { definitions } from 'types/supabase';

export async function getServerSideProps(context) {
    const id = Number(context.params.id);
    if (Number.isNaN(id)) return { props: { id: null, shader: null } };

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

    return { props: { id, shader: data } };
}

export default function Index(props) {
    const reset = useResetShaderData();
    const setManualReload = useSetAtom(manualReloadAtom);
    const setShaderID = useSetAtom(shaderIDAtom);
    const setDBLoaded = useSetAtom(dbLoadedAtom);

    const setCode = useSetAtom(codeAtom);
    const setLoadedTextures = useSetAtom(loadedTexturesAtom);
    const setSliderSerDeNeedsUpdate = useSetAtom(sliderSerDeNeedsUpdateAtom);
    const setSliderRefMap = useSetAtom(sliderRefMapAtom);
    const setTitle = useSetAtom(titleAtom);
    const setDescription = useSetAtom(descriptionAtom);
    const setVisibility = useSetAtom(visibilityAtom);
    const setAuthorProfile = useSetAtom(authorProfileAtom);
    const setFloat32Enabled = useSetAtom(float32EnabledAtom);

    if (!props.id || !props.shader) return <Error statusCode={404} />;

    const shader = props.shader;
    const image = getFullyQualifiedSupabaseBucketURL(
        SUPABASE_SHADERTHUMB_BUCKET_NAME,
        shader.thumb_url
    );
    const head = (
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
    setSliderRefMap(fromUniformActiveSettings(shaderActiveSettings.uniforms));
    // need to inform the slider component of a change so it can get a count of all the enabled sliders
    setSliderSerDeNeedsUpdate(true);
    setFloat32Enabled(float32Enabled);
    setAuthorProfile(shader.profile);
    setShaderID(props.id);
    setManualReload(true);
    setDBLoaded(true);

    return (
        <div>
            {head}
            <Editor />
        </div>
    );
}
