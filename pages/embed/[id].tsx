'use client';
import Editor from 'components/editor/editor';
import { useSetAtom } from 'jotai';
import { embedModeAtom } from 'lib/atoms/atoms';
import { fetchShader, useShader } from 'lib/view';

export async function getServerSideProps(context) {
    const id = Number(context.params.id);
    if (Number.isNaN(id)) return { notFound: true };
    return { props: { id, shader: await fetchShader(id) } };
}

export default function Index(props) {
    useShader(props);
    const setEmbedMode = useSetAtom(embedModeAtom);
    setEmbedMode(true);
    return (
        <div>
            <style>{`
                body { display: none; }
            `}</style>
            <Editor />
        </div>
    );
}
