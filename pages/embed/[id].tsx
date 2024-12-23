'use client';
import { DynamicEditor, fetchShader, useShader } from 'lib/view';

// export const runtime = 'experimental-edge';

export async function getServerSideProps(context) {
    const id = Number(context.params.id);
    if (Number.isNaN(id)) return { notFound: true };
    return { props: { id, shader: await fetchShader(id) } };
}

export default function Index(props) {
    useShader(props);
    return (
        <div>
            <style>{`
                body { overflow: hidden; }
            `}</style>
            <DynamicEditor embed={true} />
        </div>
    );
}
