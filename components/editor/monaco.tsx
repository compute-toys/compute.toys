import Editor from '@monaco-editor/react'
import {useEffect, useState, useRef} from "react";
import {wgslLanguageDef, wgslConfiguration} from 'public/grammars/wgsl'
import {defineMonacoTheme} from "theme/monacotheme";
import {useAtom, useAtomValue} from "jotai";
import {codeAtom,  dbLoadedAtom,  isPlayingAtom,  manualReloadAtom,  parseErrorAtom, playAtom, resetAtom, vimAtom} from "lib/atoms/atoms";
import { useSetAtom } from 'jotai';
import { useTransientAtom } from 'jotai-game';

declare type Monaco = typeof import('monaco-editor');

const Monaco = (props) => {
    const [code, setCode] = useAtom(codeAtom);
    const parseError = useAtomValue(parseErrorAtom);
    const [codeHasBeenModifiedAtLeastOnce, setCodeHasBeenModifiedAtLeastOnce] = useState(false)
    const dbLoaded = useAtomValue(dbLoadedAtom);
    const [isPlaying, setIsPlaying] = useTransientAtom(isPlayingAtom);
    const setPlay = useSetAtom(playAtom);
    const setManualReload = useSetAtom(manualReloadAtom);
    const setReset = useSetAtom(resetAtom);
    const vim = useAtomValue(vimAtom)
    const [vimContext, setVimContext] = useState(undefined)
    const [editor, setEditor] = useState(undefined)

    const monacoRef = useRef<Monaco | null>(null);
    

    useEffect(() => {
        const monaco = monacoRef.current;
        if(monaco && parseError) {
            // consider whether multi-model editing needs to be handled for some reason
            const model = monaco.editor.getModels()[0];
            let line = parseError.position.row;
            if(parseError.success) {
                monaco.editor.setModelMarkers(model, "owner", []);
            } else if (0 < line && line < model.getLineCount()) {
                if (parseError.position.col == model.getLineMaxColumn(line)) {
                    // naga emits some weird positions
                    line += 1;
                }
                monaco.editor.setModelMarkers(model, "owner",
                    [{
                        startLineNumber: line,
                        startColumn: model.getLineFirstNonWhitespaceColumn(line),
                        endLineNumber: line,
                        endColumn: model.getLineMaxColumn(line),
                        message: parseError.summary,
                        severity: monaco.MarkerSeverity.Error
                    }]);
            } else {
                monaco.editor.setModelMarkers(model, "owner",
                    [{
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: model.getLineCount(),
                        endColumn: model.getLineMaxColumn(model.getLineCount()),
                        message: parseError.summary,
                        severity: monaco.MarkerSeverity.Error
                    }]);
            }

        }
    }, [parseError]);

    const editorWillMount = (monaco: Monaco) => {
        if (!monaco.languages.getLanguages().some(({ id }) => id === 'wgsl')) {
            monaco.languages.register({ id: 'wgsl' });
            monaco.languages.setMonarchTokensProvider('wgsl', wgslLanguageDef);
            monaco.languages.setLanguageConfiguration('wgsl', wgslConfiguration);
            monaco.languages.registerHoverProvider('wgsl', {
                async provideHover(model, position) {
                    const n = position.lineNumber;
                    const line = model.getLineContent(n).split(' ');
                    if (line[0] === '#include') {
                        let name = line[1].slice(1, -1);
                        if (line[1].charAt(0) == '<') name = 'std/' + name;
                        let resp = await fetch(`https://compute-toys.github.io/include/${name}.wgsl`);
                        if (resp.status !== 200) return;
                        let text = await resp.text();
                        return {
                            range: new monacoRef.current.Range(n, 1, n, model.getLineMaxColumn(n)),
                            contents: [
                                { value: '**SOURCE**' },
                                { value: '```wgsl\n' + text + '\n```' }
                            ]
                        };
                    }
                }
            });
            defineMonacoTheme(monaco, 'global');
        }
    }

    useEffect(() => {
        setCodeHasBeenModifiedAtLeastOnce(false)
    },[dbLoaded])
    

    useEffect(() => {
        const alertOnAttemptedTabClose = (e)=>{ 
            if(codeHasBeenModifiedAtLeastOnce) {
                e.preventDefault();
            }
        }
        window.addEventListener('beforeunload', alertOnAttemptedTabClose)
        return () => {
            window.removeEventListener('beforeunload', alertOnAttemptedTabClose)
        }
    });

    useEffect(()=>{
        if(vim){
            // @ts-ignore
            window.require.config({
                paths: {
                    "monaco-vim": "https://unpkg.com/monaco-vim/dist/monaco-vim"
                }
            });
            // @ts-ignore
            window.require(["monaco-vim"], function (MonacoVim) {
                const statusNode = document.querySelector(".vim-status");
                setVimContext ( MonacoVim.initVimMode(editor, statusNode) );
            });
        } else {
            if(vimContext){
                vimContext.dispose()
            }
        }
    }, [vim])
      
    // height fills the screen with room for texture picker
    return <Editor
        height="calc(100vh - 270px)" // preference
        language="wgsl"
        onChange={(value, _event) => {
            setCode(value)
            setCodeHasBeenModifiedAtLeastOnce(true)
        }}
        beforeMount={editorWillMount}
        onMount={(_editor, monaco: Monaco) => {
            monacoRef.current = monaco;
            setEditor(_editor)
            // Compile shortcut
            _editor.addCommand( monaco.KeyMod.Alt | monaco.KeyCode.Enter, () => {
                setManualReload(true)
            })
            // Play/Pause shortcut
            _editor.addCommand( monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow, () => {
                setPlay(!isPlaying())
            })
            // Rewind shortcut
            _editor.addCommand( monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow, () => {
                setReset(true)
            })
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