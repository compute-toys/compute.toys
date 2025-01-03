'use client';
import { DynamicEditor, useShader } from 'lib/view/client';

export default function Index(props) {
    useShader(props.shader);
    return (
        <div>
            <style>{`
                body { overflow: hidden; }
            `}</style>
            <DynamicEditor embed={true} />
        </div>
    );
}
