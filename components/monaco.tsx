import Editor from '@monaco-editor/react'
import React, {useEffect, useRef} from "react";
import {wgslLanguageDef, wgslConfiguration} from '../public/grammars/wgsl'
import {defineMonacoTheme} from "./monacotheme";

import { Octokit } from "@octokit/rest";


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
    }, [props.parseError]);

    const editorWillMount = monaco => {
        if (!monaco.languages.getLanguages().some(({ id }) => id === 'wgsl')) {
            monaco.languages.register({ id: 'wgsl' });
            monaco.languages.setMonarchTokensProvider('wgsl', wgslLanguageDef());
            monaco.languages.setLanguageConfiguration('wgsl', wgslConfiguration());
            defineMonacoTheme(monaco, 'global');
        }
    }

    return <Editor
        height="40em" // preference
        language="wgsl"
        onChange={(value, _event) => {
            props.setCode(value)
        }}
        beforeMount={editorWillMount}
        onMount={(editor, monaco) => {
            monacoRef.current = monaco;
            editorRef.current = editor;

            // https://github.com/microsoft/monaco-editor/issues/392
            document.fonts.ready.then(() => monaco.editor.remeasureFonts());

            const octokit = new Octokit();
            octokit.rest.gists.get({
                gist_id: '435e9bb5c60ef892df53ce2233bae197'
            }).then(r => {
                const files = Object.keys(r.data.files);
                const content = r.data.files[files[0]].content;
                props.setCode(content);
                props.setManualReload(true);
            });
        }}
        options={props.editorOptions}
        theme='global' // preference
        value={props.code}
        width={undefined} // fit to bounding box
    />
}

export default Monaco