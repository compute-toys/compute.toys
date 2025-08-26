'use client';
import Editor from '@monaco-editor/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTransientAtom } from 'jotai-game';
import {
    codeAtom,
    codeNeedSaveAtom,
    isPlayingAtom,
    languageAtom,
    manualReloadAtom,
    monacoEditorAtom,
    parseErrorAtom,
    playAtom,
    recordingAtom,
    resetAtom,
    vimAtom
} from '../../lib/atoms/atoms';
import { canvasElAtom } from '../../lib/atoms/wgputoyatoms';
import { useTheme } from '@mui/material/styles';
import { slangConfiguration, slangLanguageDef } from '../../lib/grammars/slang';
import { wgslConfiguration, wgslLanguageDef } from '../../lib/grammars/wgsl';
import {
    registerSlangLanguageServer,
    updateSlangDocumentAndDiagnostics
} from '../../lib/slang/language-server';
import { debounce } from '../../lib/util/debounce';
import { editor as MonacoEditor } from 'monaco-editor';
import { useNavigationGuard } from 'next-navigation-guard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { defineMonacoTheme } from '../../theme/monacotheme';

declare type Monaco = typeof import('monaco-editor');

interface VimMode {
    dispose: () => void;
}

const Monaco = props => {
    const [code, setCode] = useAtom(codeAtom);
    const [isRecording, setRecording] = useTransientAtom(recordingAtom);
    const [codeNeedSave, setCodeNeedSave] = useAtom(codeNeedSaveAtom);
    const parseError = useAtomValue(parseErrorAtom);
    const [isPlaying] = useTransientAtom(isPlayingAtom);
    const setPlay = useSetAtom(playAtom);
    const setManualReload = useSetAtom(manualReloadAtom);
    const setReset = useSetAtom(resetAtom);
    const vim = useAtomValue(vimAtom);
    const [vimContext, setVimContext] = useState<VimMode | undefined>(undefined);
    const [editor, setEditor] = useAtom(monacoEditorAtom);
    const language = useAtomValue(languageAtom);
    const canvasEl = useAtomValue(canvasElAtom);
    const theme = useTheme();

    const monacoRef = useRef<Monaco | null>(null);

    // Create a reference to store the immediate update function
    const immediateUpdateRef = useRef<
        ((content: string, model: MonacoEditor.ITextModel, monaco: Monaco) => void) | null
    >(null);

    // Create a debounced version of updateSlangDocumentAndDiagnostics
    const debouncedUpdateSlang = useCallback(
        debounce((content: string, model: MonacoEditor.ITextModel, monaco: Monaco) => {
            if (language === 'slang') {
                console.log('Debounced update of Slang document and diagnostics');
                updateSlangDocumentAndDiagnostics(content, model, monaco);
            }
        }, 500),
        [language]
    );

    // Store the immediate update function in a ref for use in event handlers
    useEffect(() => {
        immediateUpdateRef.current = (
            content: string,
            model: MonacoEditor.ITextModel,
            monaco: Monaco
        ) => {
            if (language === 'slang') {
                console.log('Immediate update of Slang document and diagnostics');
                updateSlangDocumentAndDiagnostics(content, model, monaco);
            }
        };
    }, [language]);

    // Handle WGSL parse errors
    useEffect(() => {
        const monaco = monacoRef.current;
        if (monaco && parseError && language === 'wgsl') {
            // consider whether multi-model editing needs to be handled for some reason
            const model = monaco.editor.getModels()[0];
            if (!model) return;

            let line = parseError.position.row;
            if (parseError.success) {
                monaco.editor.setModelMarkers(model, 'wgsl', []);
            } else if (0 < line && line < model.getLineCount()) {
                if (parseError.position.col === model.getLineMaxColumn(line)) {
                    // naga emits some weird positions
                    line += 1;
                }
                monaco.editor.setModelMarkers(model, 'wgsl', [
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
                monaco.editor.setModelMarkers(model, 'wgsl', [
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
            if (canvasEl) {
                canvasEl.style.border = !parseError.success
                    ? '4px solid #ff6f59'
                    : '';
            }
        }
    }, [parseError, language, canvasEl]);

    const editorWillMount = async (monaco: Monaco) => {
        // Register WGSL language
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
                        range: new monacoRef.current!.Range(n, 1, n, model.getLineMaxColumn(n)),
                        contents: [{ value: '**SOURCE**' }, { value: '```wgsl\n' + text + '\n```' }]
                    };
                }
                return null;
            }
        });

        // Register Slang language
        if (!monaco.languages.getLanguages().some(({ id }) => id === 'slang')) {
            monaco.languages.register({ id: 'slang' });
        }
        monaco.languages.setLanguageConfiguration('slang', slangConfiguration);
        monaco.languages.setMonarchTokensProvider('slang', slangLanguageDef);

        // Define Monaco theme
        defineMonacoTheme(monaco, 'global', theme);
    };

    useNavigationGuard({
        enabled: codeNeedSave,
        confirm: () => window.confirm('You have unsaved changes that will be lost.')
    });

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

    // Update Slang document and diagnostics when code changes
    useEffect(() => {
        if (!code || !editor || !monacoRef.current) return;

        const model = editor.getModel();
        if (!model) return;

        const currentLanguage = model.getLanguageId();

        if (currentLanguage === 'slang') {
            // Use the debounced update function instead of calling directly
            debouncedUpdateSlang(code, model, monacoRef.current);
        }
    }, [code, editor, debouncedUpdateSlang]);

    // Add a useEffect to initialize the Slang language server when the component mounts
    useEffect(() => {
        const monaco = monacoRef.current;
        if (!monaco) return;

        // Register Slang language and server
        const initSlang = async () => {
            console.log('Initializing Slang language and server');
            try {
                await registerSlangLanguageServer(monaco);
                console.log('Slang language and server initialized successfully');
            } catch (error) {
                console.error('Error initializing Slang:', error);
            }
        };

        initSlang();
    }, [monacoRef.current]);

    // Update model language when language atom changes
    useEffect(() => {
        if (editor && editor.getModel() && monacoRef.current) {
            monacoRef.current.editor.setModelLanguage(editor.getModel()!, language);

            // Clear markers when switching languages
            monacoRef.current.editor.setModelMarkers(editor.getModel()!, 'wgsl', []);
            monacoRef.current.editor.setModelMarkers(editor.getModel()!, 'slang', []);

            // Update diagnostics if switching to Slang
            if (language === 'slang') {
                const currentContent = editor.getModel()!.getValue();
                if (currentContent) {
                    console.log('Switching to Slang, updating document and diagnostics');
                    // Use the debounced update function for consistency
                    debouncedUpdateSlang(currentContent, editor.getModel()!, monacoRef.current);
                }
            }
        }
    }, [language, editor, debouncedUpdateSlang]);

    // height fills the screen with room for texture picker
    return (
        <Editor
            height="calc(100vh - 270px)" // preference
            language={language}
            onChange={value => {
                setCode(value!);
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

                // https://github.com/suren-atoyan/monaco-react/issues/733
                const handleMouseEvent = (e: MonacoEditor.IEditorMouseEvent) => {
                    const type = e['changedTouches']
                        ? MonacoEditor.MouseTargetType.UNKNOWN // iOS
                        : MonacoEditor.MouseTargetType.CONTENT_EMPTY; // Mac
                    if (e?.target?.type === type) {
                        setTimeout(() => {
                            const selection = _editor.getSelection();
                            const isSelectionEmpty =
                                selection &&
                                selection.startLineNumber === selection.endLineNumber &&
                                selection.startColumn === selection.endColumn;
                            if (isSelectionEmpty) {
                                const line = _editor.getPosition()?.lineNumber || 1;
                                const column =
                                    (_editor.getModel()?.getLineContent(line).length || 0) + 1;
                                _editor.setSelection(
                                    new monaco.Selection(line, column, line, column)
                                );
                            }
                        }, 12);
                    }
                };
                const handleTouchEvent = e => {
                    e.preventDefault();
                    const touch = e.changedTouches[0];
                    const mouseEvent = new MouseEvent('mouseup', {
                        bubbles: true,
                        cancelable: true,
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        buttons: 1
                    });
                    domNode!.dispatchEvent(mouseEvent);
                };
                const domNode = _editor.getDomNode();
                _editor.onMouseDown(handleMouseEvent);
                _editor.onMouseUp(handleMouseEvent);
                domNode!.addEventListener('touchstart', handleTouchEvent, { passive: false });
                domNode!.addEventListener('touchend', handleTouchEvent, { passive: false });
            }}
            options={props.editorOptions}
            theme="global" // preference
            value={code}
            width={undefined} // fit to bounding box
        />
    );
};

export default Monaco;
