import Editor from 'components/editor/editor';
import { useDBRouter } from 'lib/db/dbrouter';
import {
    supabase,
    SUPABASE_SHADERTHUMB_BUCKET_NAME,
    SUPABASE_SHADER_TABLE_NAME
} from 'lib/db/supabaseclient';
import { getFullyQualifiedSupabaseBucketURL } from 'lib/util/urlutils';
// import dynamic from 'next/dynamic';
import Head from 'next/head';
import { definitions } from 'types/supabase';

export async function getServerSideProps(context) {
    const { data, error } = await supabase
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
        .eq('id', context.params.id)
        .single();

    return {
        props: {
            shader: data,
            error: error,
            id: context.params.id
        }
    };
}

export default function Index(props) {
    let head = null;
    if (props && props.shader) {
        const image = getFullyQualifiedSupabaseBucketURL(
            SUPABASE_SHADERTHUMB_BUCKET_NAME,
            props.shader.thumb_url
        );
        head = (
            <Head>
                <title>{props.shader.name}</title>
                <meta property="og:type" content="image" />
                <meta property="og:site_name" content="@compute.toys" />
                <meta property="og:title" content={props.shader.name} />
                <meta property="og:description" content={props.shader.description} />
                <meta property="og:image" content={image} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site:id" content="@compute_toys" />
                <meta name="twitter:title" content={props.shader.name} />
                <meta name="twitter:description" content={props.shader.description} />
                <meta name="twitter:image" content={image} />
            </Head>
        );
    }

    // const Editor = dynamic(() => import('components/editor/editor'), { ssr: false });
    useDBRouter();
    return (
        <div>
            {head}
            <Editor />
        </div>
    );
}
