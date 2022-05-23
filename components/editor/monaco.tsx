import Editor from '@monaco-editor/react'
import {useEffect, useRef} from "react";
import {wgslLanguageDef, wgslConfiguration} from 'public/grammars/wgsl'
import {defineMonacoTheme} from "theme/monacotheme";
import {useAtom} from "jotai";
import {codeAtom, parseErrorAtom} from "lib/atoms/atoms";


const Monaco = (props) => {
    const [code, setCode] = useAtom(codeAtom);
    const [parseError, setParseError] = useAtom(parseErrorAtom);

    const monacoRef = useRef<any | null>(null);
    const editorRef = useRef<any | null>(null);

    useEffect(() => {
        if(monacoRef.current && parseError) {
            // consider whether multi-model editing needs to be handled for some reason
            if(parseError.success) {
                monacoRef.current.editor.setModelMarkers(monacoRef.current.editor.getModels()[0], "owner",[]);
            } else {
                monacoRef.current.editor.setModelMarkers(monacoRef.current.editor.getModels()[0], "owner",
                    [{
                        startLineNumber: parseError.position.row,
                        startColumn: parseError.position.col,
                        endLineNumber: parseError.position.row,
                        endColumn: 1000, // ugly way to do this, but we don't get end from WGSL
                        message: parseError.summary,
                        severity: monacoRef.current.MarkerSeverity.Error
                    }]);
            }

        }
    }, [parseError]);

    const editorWillMount = monaco => {
        if (!monaco.languages.getLanguages().some(({ id }) => id === 'wgsl')) {
            monaco.languages.register({ id: 'wgsl' });
            monaco.languages.setMonarchTokensProvider('wgsl', wgslLanguageDef());
            monaco.languages.setLanguageConfiguration('wgsl', wgslConfiguration());
            defineMonacoTheme(monaco, 'global');
        }
    }

    // height fills the screen with room for texture picker
    return <Editor
        height="calc(100vh - 270px)" // preference
        language="wgsl"
        onChange={(value, _event) => {
            setCode(value)
        }}
        beforeMount={editorWillMount}
        onMount={(editor, monaco) => {
            monacoRef.current = monaco;
            editorRef.current = editor;

            // https://github.com/microsoft/monaco-editor/issues/392
            document.fonts.ready.then(() => monaco.editor.remeasureFonts());
        }}
        options={props.editorOptions}
        theme='global' // preference
        value={code}
        width={undefined} // fit to bounding box
    />
}

export default Monaco