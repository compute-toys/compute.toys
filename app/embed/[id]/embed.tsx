'use client';
import Editor from 'components/editor/editor';
import { useShader } from 'lib/view/client';

export default function Index(props) {
    useShader(props.shader);
    return (
        <div>
            <style>{`
                body { overflow: hidden; }
            `}</style>
            <Editor embed={true} />
        </div>
    );
}
