'use client';
import { useShader } from 'lib/view/client';
import dynamic from 'next/dynamic';

// Dynamically import the Editor component with SSR disabled
const Editor = dynamic(() => import('components/editor/editor'), { ssr: false });

export default function Index(props) {
    useShader(props.shader);
    return (
        <div>
            <Editor user={props.user} />
        </div>
    );
}
