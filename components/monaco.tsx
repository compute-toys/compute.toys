import Editor from '@monaco-editor/react'
import React, {useEffect, useRef} from "react";
import ReactDOM from "react-dom";


const Monaco = (props) => {
    const monacoRef = useRef<any | null>(null);
    const editorRef = useRef<any | null>(null);

    useEffect(() => {
        if(monacoRef.current && props.parseError) {
            // consider whether multi-model editing needs to be handled for some reason
            if(props.parseError.success) {
                monacoRef.current.editor.setModelMarkers(monacoRef.current.editor.getModels()[0], "owner",[]);
            } else {
                monacoRef.current.editor.setModelMarkers(monacoRef.current.editor.getModels()[0], "owner",
                    [{
                        startLineNumber: props.parseError.position.row,
                        startColumn: props.parseError.position.col,
                        endLineNumber: props.parseError.position.row,
                        endColumn: 1000, // ugly way to do this, but we don't get end from WGSL
                        message: props.parseError.summary,
                        severity: monacoRef.current.MarkerSeverity.Error
                    }]);
            }

        }
    }, [props.parseError])

    return <Editor
        height="40em" // preference
        language="cpp"   // preference
        onChange={(value, _event) => {
            props.setCode(value)
        }}
        onMount={(editor, monaco) => {
            monacoRef.current = monaco
            editorRef.current = editor
        }}
        options={props.editorOptions}
        theme="vs-dark" // preference
        value={props.code}
        width={undefined} // fit to bounding box
    />
}

export default Monaco