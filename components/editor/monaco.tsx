'use client';
import Editor from '@monaco-editor/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTransientAtom } from 'jotai-game';
import {
    codeAtom,
    codeNeedSaveAtom,
    isPlayingAtom,
    manualReloadAtom,
    monacoEditorAtom,
    parseErrorAtom,
    playAtom,
    recordingAtom,
    resetAtom,
    vimAtom
} from 'lib/atoms/atoms';
import SingletonRouter, { Router } from 'next/router';
import { wgslConfiguration, wgslLanguageDef } from 'public/grammars/wgsl';
import { useEffect, useRef, useState } from 'react';
import { defineMonacoTheme } from 'theme/monacotheme';

declare type Monaco = typeof import('monaco-editor');

const Monaco = props => {
    const [code, setCode] = useAtom(codeAtom);
    const [isRecording, setRecording] = useTransientAtom(recordingAtom);
    const codeNeedSave = useAtomValue(codeNeedSaveAtom);
    const setCodeNeedSave = useSetAtom(codeNeedSaveAtom);
    const parseError = useAtomValue(parseErrorAtom);
    const [isPlaying] = useTransientAtom(isPlayingAtom);
    const setPlay = useSetAtom(playAtom);
    const setManualReload = useSetAtom(manualReloadAtom);
    const setReset = useSetAtom(resetAtom);
    const vim = useAtomValue(vimAtom);
    const [vimContext, setVimContext] = useState(undefined);
    const [editor, setEditor] = useAtom(monacoEditorAtom);

    const monacoRef = useRef<Monaco | null>(null);

    useEffect(() => {
        const monaco = monacoRef.current;
        if (monaco && parseError) {
            // consider whether multi-model editing needs to be handled for some reason
            const model = monaco.editor.getModels()[0];
            let line = parseError.position.row;
            if (parseError.success) {
                monaco.editor.setModelMarkers(model, 'owner', []);
            } else if (0 < line && line < model.getLineCount()) {
                if (parseError.position.col === model.getLineMaxColumn(line)) {
                    // naga emits some weird positions
                    line += 1;
                }
                monaco.editor.setModelMarkers(model, 'owner', [
                    {
                        startLineNumber: line,
                        startColumn: model.getLineFirstNonWhitespaceColumn(line),
                        endLineNumber: line,
                        endColumn: model.getLineMaxColumn(line),
                        message: parseError.summary,
                        severity: monaco.MarkerSeverity.Error
                    }
                ]);
            } else {
                monaco.editor.setModelMarkers(model, 'owner', [
                    {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: model.getLineCount(),
                        endColumn: model.getLineMaxColumn(model.getLineCount()),
                        message: parseError.summary,
                        severity: monaco.MarkerSeverity.Error
                    }
                ]);
            }
            document.getElementById('editor-canvas').style.border = !parseError.success
                ? '4px solid #ff6f59'
                : '';
        }
    }, [parseError]);

    const editorWillMount = (monaco: Monaco) => {
        if (!monaco.languages.getLanguages().some(({ id }) => id === 'wgsl')) {
            monaco.languages.register({ id: 'wgsl' });
        }
        monaco.languages.setMonarchTokensProvider('wgsl', wgslLanguageDef);
        monaco.languages.setLanguageConfiguration('wgsl', wgslConfiguration);
        monaco.languages.registerHoverProvider('wgsl', {
            async provideHover(model, position) {
                const n = position.lineNumber;
                const line = model.getLineContent(n).split(' ');
                if (line[0] === '#include') {
                    let name = line[1].slice(1, -1);
                    if (line[1].charAt(0) === '<') name = 'std/' + name;
                    const resp = await fetch(`https://compute-toys.github.io/include/${name}.wgsl`);
                    if (resp.status !== 200) return null;
                    const text = await resp.text();
                    return {
                        range: new monacoRef.current.Range(n, 1, n, model.getLineMaxColumn(n)),
                        contents: [{ value: '**SOURCE**' }, { value: '```wgsl\n' + text + '\n```' }]
                    };
                }
                return null;
            }
        });
        defineMonacoTheme(monaco, 'global');
    };

    useEffect(() => {
        const message = 'You have unsaved changes. Do you really want to leave?';

        // unsaved changes with reload/undo
        const beforeunload = (e: Event) => {
            if (codeNeedSave) {
                e.preventDefault();
                return message;
            }
        };

        // unsaved changes with route change
        // next.js hack: https://github.com/vercel/next.js/discussions/32231#discussioncomment-1766710
        // @ts-expect-error change is private
        SingletonRouter.router.change = (...args) => {
            if (codeNeedSave && !confirm(message)) {
                return new Promise(resolve => resolve(false));
            } else {
                // @ts-expect-error change is private
                return Router.prototype.change.apply(SingletonRouter.router, args);
            }
        };

        window.addEventListener('beforeunload', beforeunload);
        return () => {
            window.removeEventListener('beforeunload', beforeunload);
            // @ts-expect-error change is private
            delete SingletonRouter.router.change;
        };
    }, [codeNeedSave]);

    useEffect(() => {
        if (vim) {
            // @ts-expect-error Property 'config' does not exist on type 'NodeRequire'
            window.require.config({
                paths: {
                    'monaco-vim': 'https://unpkg.com/monaco-vim/dist/monaco-vim'
                }
            });
            // @ts-expect-error Expected 1 arguments, but got 2
            window.require(['monaco-vim'], MonacoVim => {
                const statusNode = document.querySelector('.vim-status');
                setVimContext(MonacoVim.initVimMode(editor, statusNode));
            });
        } else {
            if (vimContext) {
                vimContext.dispose();
            }
        }
    }, [vim]);

    // height fills the screen with room for texture picker
    return (
        <Editor
            height="calc(100vh - 270px)" // preference
            language="wgsl"
            onChange={value => {
                setCode(value);
                setCodeNeedSave(true);
            }}
            beforeMount={editorWillMount}
            onMount={(_editor, monaco: Monaco) => {
                monacoRef.current = monaco;
                setEditor(_editor);
                // Compile shortcut
                _editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.Enter, () => {
                    setManualReload(true);
                });
                // Play/Pause shortcut
                _editor.addCommand(
                    monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow,
                    () => {
                        setPlay(!isPlaying());
                    }
                );
                // Record shortcut
                _editor.addCommand(
                    monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR,
                    () => {
                        setRecording(!isRecording());
                    }
                );
                // Rewind shortcut
                _editor.addCommand(
                    monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow,
                    () => {
                        setReset(true);
                    }
                );
                // https://github.com/microsoft/monaco-editor/issues/392
                document.fonts.ready.then(() => monaco.editor.remeasureFonts());
            }}
            options={props.editorOptions}
            theme="global" // preference
            value={code}
            width={undefined} // fit to bounding box
        />
    );
};

export default Monaco;
