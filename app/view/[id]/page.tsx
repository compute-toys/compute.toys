import { fetchShader } from 'lib/view/server';
import ViewShader from './view';

async function getShader(context) {
    const id = Number(context.params.id);
    if (Number.isNaN(id)) return { notFound: true };
    return { props: { id, shader: await fetchShader(id) } };
}

export default async function ViewShaderPage({ params }) {
    const { props } = await getShader({ params });
    return <ViewShader {...props} />;
}
