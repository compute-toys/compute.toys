'use client';
import Editor from 'components/editor/editor';
import { useShader } from 'lib/view/client';

export default function Index(props) {
    useShader(props.shader);
    return (
        <div>
            <Editor user={props.user} />
        </div>
    );
}
