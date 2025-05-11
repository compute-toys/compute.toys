import { ComputeEngine } from 'lib/engine';
import stdSlangShader from 'lib/shaders/std.slang';
import shadertoylibSource from 'lib/shaders/shadertoy.slang';
import * as monaco from 'monaco-editor';
import { CompletionContext } from 'types/slang-wasm';
import { getLanguageServer } from './compiler';

const userCodeURI = 'file:///user.slang';

// Register the language server features with Monaco
export async function registerSlangLanguageServer(monacoInstance: typeof monaco) {
    // Skip registration in server-side rendering
    if (typeof window === 'undefined') {
        console.log('Skipping Slang language server registration in SSR environment');
        return;
    }

    const slangd = await getLanguageServer();
    console.log('Registering Slang language server');

    // Register hover provider
    monacoInstance.languages.registerHoverProvider('slang', {
        provideHover: (model, position) => {
            if (!slangd) return null;

            const result = slangd.hover(userCodeURI, {
                line: position.lineNumber - 1,
                character: position.column - 1
            });

            if (!result) return null;

            return {
                contents: [{ value: result.contents.value.toString() }],
                range: {
                    startLineNumber: result.range.start.line + 1,
                    startColumn: result.range.start.character + 1,
                    endLineNumber: result.range.end.line + 1,
                    endColumn: result.range.end.character + 1
                }
            };
        }
    });

    // Register definition provider
    monacoInstance.languages.registerDefinitionProvider('slang', {
        provideDefinition: (model, position) => {
            if (!slangd) return null;

            const result = slangd.gotoDefinition(userCodeURI, {
                line: position.lineNumber - 1,
                character: position.column - 1
            });

            if (!result) return null;

            const locations: monaco.languages.Location[] = [];
            for (let i = 0; i < result.size(); i++) {
                const lspResult = result.get(i);
                if (!lspResult) continue;

                locations.push({
                    uri: monacoInstance.Uri.parse(lspResult.uri.toString()),
                    range: {
                        startLineNumber: lspResult.range.start.line + 1,
                        startColumn: lspResult.range.start.character + 1,
                        endLineNumber: lspResult.range.end.line + 1,
                        endColumn: lspResult.range.end.character + 1
                    }
                });
            }

            return locations;
        }
    });

    // Register completion provider
    monacoInstance.languages.registerCompletionItemProvider('slang', {
        triggerCharacters: ['.', ':', '>', '(', '<', ' ', '['],
        provideCompletionItems: (model, position, context) => {
            if (!slangd) return null;

            const lspContext: CompletionContext = {
                triggerKind: context.triggerKind,
                triggerCharacter: context.triggerCharacter || ''
            };

            const result = slangd.completion(
                userCodeURI,
                { line: position.lineNumber - 1, character: position.column - 1 },
                lspContext
            );

            if (!result) return null;

            const word = model.getWordAtPosition(position) || model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            const suggestions: monaco.languages.CompletionItem[] = [];
            for (let i = 0; i < result.size(); i++) {
                const item = result.get(i);
                if (!item) continue;

                suggestions.push({
                    label: item.label.toString(),
                    kind: item.kind,
                    detail: item.detail.toString(),
                    documentation: (item.documentation?.value || '').toString(),
                    insertText: item.label.toString(),
                    range
                });
            }

            return { suggestions };
        }
    });

    // Register signature help provider
    monacoInstance.languages.registerSignatureHelpProvider('slang', {
        signatureHelpTriggerCharacters: ['(', ','],
        signatureHelpRetriggerCharacters: [','],
        provideSignatureHelp: (model, position) => {
            if (!slangd) return null;

            const result = slangd.signatureHelp(userCodeURI, {
                line: position.lineNumber - 1,
                character: position.column - 1
            });

            if (!result) return null;

            const signatures: monaco.languages.SignatureInformation[] = [];
            for (let i = 0; i < result.signatures.size(); i++) {
                const signature = result.signatures.get(i);
                if (!signature) continue;

                const parameters: monaco.languages.ParameterInformation[] = [];
                for (let j = 0; j < signature.parameters.size(); j++) {
                    const param = signature.parameters.get(j);
                    if (!param) continue;

                    parameters.push({
                        label: [param.label[0], param.label[1]],
                        documentation: param.documentation.value.toString()
                    });
                }

                signatures.push({
                    label: signature.label.toString(),
                    documentation: signature.documentation.value.toString(),
                    parameters
                });
            }

            return {
                value: {
                    signatures,
                    activeSignature: result.activeSignature,
                    activeParameter: result.activeParameter
                },
                dispose: () => {}
            };
        }
    });

    // Register semantic tokens provider
    monacoInstance.languages.registerDocumentRangeSemanticTokensProvider('slang', {
        getLegend: () => ({
            tokenTypes: [
                'type',
                'enumMember',
                'variable',
                'parameter',
                'function',
                'property',
                'namespace',
                'keyword',
                'macro',
                'string'
            ],
            tokenModifiers: []
        }),
        provideDocumentRangeSemanticTokens: () => {
            if (!slangd) return null;

            const result = slangd.semanticTokens(userCodeURI);
            if (!result) return null;

            const rawData = new Uint32Array(result.size());
            for (let i = 0; i < result.size(); i++) {
                const value = result.get(i);
                if (value !== undefined) {
                    rawData[i] = value;
                }
            }

            return { data: rawData };
        }
    });
}

// Combined function to update Slang document and diagnostics
export async function updateSlangDocumentAndDiagnostics(
    content: string,
    model: monaco.editor.ITextModel,
    monacoInstance: typeof monaco
) {
    // Skip in server-side rendering
    if (typeof window === 'undefined') {
        console.log('Skipping Slang document and diagnostics update in SSR environment');
        return;
    }

    console.log('Updating Slang document and diagnostics');
    try {
        // Get language server instance
        const slangd = await getLanguageServer();

        // Update document content
        console.log('Updating Slang document with content length:', content.length);
        slangd.didCloseTextDocument(userCodeURI);

        let prelude = '';
        try {
            const engine = ComputeEngine.getInstance();
            if (engine) {
                prelude = engine.getSlangPrelude();
            }
        } catch (error) {
            console.error('Error getting Slang prelude:', error);
        }

        slangd.didOpenTextDocument('file:///std.slang', stdSlangShader + prelude);
        slangd.didOpenTextDocument('file:///shadertoy.slang', shadertoylibSource);
        slangd.didOpenTextDocument(userCodeURI, content);

        // Get diagnostics
        console.log('Getting diagnostics for:', userCodeURI);
        const diagnostics = slangd.getDiagnostics(userCodeURI);
        if (diagnostics === undefined) {
            throw new Error('Unable to get diagnostics');
        }

        console.log(
            'Diagnostics result:',
            diagnostics ? `Found ${diagnostics.size()} diagnostics` : 'No diagnostics returned'
        );

        // Update Monaco editor markers with diagnostics
        if (monacoInstance && model) {
            const markers: monaco.editor.IMarkerData[] = [];

            // Map severity levels to Monaco marker severities
            const severityMap = [
                monaco.MarkerSeverity.Error, // Default for index 0
                monaco.MarkerSeverity.Error,
                monaco.MarkerSeverity.Warning,
                monaco.MarkerSeverity.Info,
                monaco.MarkerSeverity.Hint
            ];

            for (let i = 0; i < diagnostics.size(); i++) {
                const diagnostic = diagnostics.get(i);
                if (!diagnostic) continue;

                markers.push({
                    severity: severityMap[diagnostic.severity] || monaco.MarkerSeverity.Error,
                    message: diagnostic.message.toString(),
                    startLineNumber: diagnostic.range.start.line + 1,
                    startColumn: diagnostic.range.start.character + 1,
                    endLineNumber: diagnostic.range.end.line + 1,
                    endColumn: diagnostic.range.end.character + 1
                });
            }

            console.log(`Setting ${markers.length} markers on model`);
            monacoInstance.editor.setModelMarkers(model, 'slang', markers);
        }
    } catch (error) {
        console.error('Error updating Slang document or diagnostics:', error);
    }
}
