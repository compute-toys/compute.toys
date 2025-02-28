import * as monaco from 'monaco-editor';
import { CompletionContext } from 'types/slang-wasm';
import { getLanguageServer } from './compiler';

const userCodeURI = 'file:///user.slang';

// Debug function to inspect the language server
export async function debugSlangServer() {
    try {
        const slangd = await getLanguageServer();
        console.log('Language server object:', slangd);
        console.log(
            'Available methods:',
            Object.getOwnPropertyNames(Object.getPrototypeOf(slangd))
        );

        const diagnostics = slangd.getDiagnostics(userCodeURI);
        if (!diagnostics) {
            throw new Error('No diagnostics found');
        }

        console.log('Diagnostics for user.slang:', diagnostics);
        console.log('Diagnostics size:', diagnostics.size());

        for (let i = 0; i < diagnostics.size(); i++) {
            const diagnostic = diagnostics.get(i);
            if (diagnostic) {
                console.log(`Diagnostic ${i}:`, {
                    severity: diagnostic.severity,
                    message: diagnostic.message.toString(),
                    range: diagnostic.range,
                    code: diagnostic.code?.toString()
                });
            }
        }

        return diagnostics;
    } catch (error) {
        console.error('Error in debugSlangServer:', error);
        return null;
    }
}

// Helper function to translate severity levels
function translateSeverity(severity: number): monaco.MarkerSeverity {
    switch (severity) {
        case 1:
            return monaco.MarkerSeverity.Error;
        case 2:
            return monaco.MarkerSeverity.Warning;
        case 3:
            return monaco.MarkerSeverity.Info;
        case 4:
            return monaco.MarkerSeverity.Hint;
        default:
            return monaco.MarkerSeverity.Error;
    }
}

// Get diagnostics from the Slang language server
async function getSlangDiagnostics() {
    try {
        const slangd = await getLanguageServer();
        console.log('Getting diagnostics for:', userCodeURI);

        const diagnostics = slangd.getDiagnostics(userCodeURI);
        console.log(
            'Diagnostics result:',
            diagnostics ? `Found ${diagnostics.size()} diagnostics` : 'No diagnostics returned'
        );

        return diagnostics;
    } catch (error) {
        console.error('Error getting Slang diagnostics:', error);
        return null;
    }
}

// Update Monaco editor markers with Slang diagnostics
export async function updateSlangDiagnostics(
    monacoInstance: typeof monaco,
    model: monaco.editor.ITextModel
) {
    try {
        console.log('Updating Slang diagnostics for model:', model.uri.toString());

        const diagnostics = await getSlangDiagnostics();

        if (!diagnostics) {
            console.log('Clearing markers due to no diagnostics');
            monacoInstance.editor.setModelMarkers(model, 'slang', []);
            return;
        }

        const markers: monaco.editor.IMarkerData[] = [];

        for (let i = 0; i < diagnostics.size(); i++) {
            const diagnostic = diagnostics.get(i);
            if (!diagnostic) continue;

            markers.push({
                severity: translateSeverity(diagnostic.severity),
                message: diagnostic.message.toString(),
                startLineNumber: diagnostic.range.start.line + 1,
                startColumn: diagnostic.range.start.character + 1,
                endLineNumber: diagnostic.range.end.line + 1,
                endColumn: diagnostic.range.end.character + 1
            });
        }

        console.log(`Setting ${markers.length} markers on model`);
        monacoInstance.editor.setModelMarkers(model, 'slang', markers);
    } catch (error) {
        console.error('Error updating Slang diagnostics:', error);
    }
}

// Update the document content in the language server
export async function updateSlangDocument(content: string) {
    try {
        const slangd = await getLanguageServer();
        console.log('Updating Slang document with content length:', content.length);

        // Close and reopen the document with new content
        slangd.didCloseTextDocument(userCodeURI);
        slangd.didOpenTextDocument(userCodeURI, content);

        // Force a parse by requesting hover information
        slangd.hover(userCodeURI, { line: 0, character: 0 });

        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 100));

        const diagnostics = slangd.getDiagnostics(userCodeURI);
        console.log(
            'Diagnostics after update:',
            diagnostics ? `Found ${diagnostics.size()} diagnostics` : 'No diagnostics returned'
        );

        return diagnostics;
    } catch (error) {
        console.error('Error updating Slang document:', error);
        return null;
    }
}

// Register the language server features with Monaco
export async function registerSlangLanguageServer(monacoInstance: typeof monaco) {
    const slangd = await getLanguageServer();
    console.log('Registering Slang language server');

    // Initialize with empty documents
    slangd.didOpenTextDocument(userCodeURI, '');

    // Check initial diagnostics
    const initialDiagnostics = slangd.getDiagnostics(userCodeURI);
    console.log(
        'Initial diagnostics:',
        initialDiagnostics ? `Found ${initialDiagnostics.size()} diagnostics` : 'No diagnostics'
    );

    // Set up diagnostics checking
    monacoInstance.languages.onLanguage('slang', () => {
        console.log('Slang language loaded, setting up diagnostics');

        const diagnosticsInterval = setInterval(() => {
            monacoInstance.editor
                .getModels()
                .filter(model => model.getLanguageId() === 'slang')
                .forEach(model =>
                    updateSlangDiagnostics(monacoInstance, model).catch(console.error)
                );
        }, 2000);

        return { dispose: () => clearInterval(diagnosticsInterval) };
    });

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
