import ShaderConverter from './glue';
import { createCompiler } from './try-slang';

export async function compileShader(userSource: string): Promise<string | null> {
    const compiler = await createCompiler();
    if (compiler == null) throw new Error('No compiler available');
    const compiledResult = compiler.compile(userSource, '', 'WGSL', true);
    console.log(compiler.diagnosticsMsg);

    if (!compiledResult) {
        console.log('Compilation returned empty result.');
        return null;
    }

    let [compiledCode, layout, hashedStrings, reflectionJsonObj, threadGroupSize] = compiledResult;
    let reflectionJson = reflectionJsonObj;

    const converter = new ShaderConverter();
    let convertedCode = converter.convert(reflectionJson);
    convertedCode += compiledCode
        .split('\n')
        .filter(line => !line.trim().startsWith('@binding'))
        .join('\n');

    console.log(convertedCode);

    console.log(reflectionJson);

    return convertedCode;
}
