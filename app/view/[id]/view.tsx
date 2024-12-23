'use client';
import { DynamicEditor, useShader } from 'lib/view/client';

export default function Index(props) {
    useShader(props);
    return (
        <div>
            {/* {props.shader ? buildHead(props.shader) : null} */}
            <DynamicEditor />
        </div>
    );
}
