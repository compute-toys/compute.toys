/**
 * WGSL shader preprocessor implementation
 */
import { calcMathExpression, fetchInclude, parseInteger, WGSLError } from './utils';

// Regular expressions for preprocessing
const RE_COMMENT = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
const RE_WORD = /[a-zA-Z_][a-zA-Z0-9_]*/g;

const STRING_MAX_LEN = 20;
type DirectiveFunction = (tokens: string[], lineNum: number) => void | Promise<void>;

/**
 * Maps the processed shader source to original line numbers
 */
export class SourceMap {
    extensions: string = '';
    source: string = '';
    map: number[] = [0];
    workgroupCount = new Map<string, [number, number, number]>();
    dispatchCount = new Map<string, number>();
    // assertMap: number[] = [];
    // userData = new Map<string, Uint32Array>([['_dummy', new Uint32Array([0])]]);

    /**
     * Add a line to the source map
     */
    pushLine(line: string, lineNumber: number) {
        this.source += line + '\n';
        this.map.push(lineNumber);
    }
}

/**
 * Handles WGSL preprocessing including includes, defines, etc.
 */
export class Preprocessor {
    private defines: Map<string, string>;
    private ifdefStack: boolean[];
    private source: SourceMap;
    private storageCount: number;
    private specialStrings: boolean;
    // private assertCount: number;

    constructor(defines: Map<string, string>) {
        this.defines = new Map(defines);
        this.defines.set('STRING_MAX_LEN', STRING_MAX_LEN.toString());
        this.ifdefStack = [];
        this.source = new SourceMap();
        this.storageCount = 0;
        this.specialStrings = false;
        // this.assertCount = 0;
    }

    /**
     * Strip comments from WGSL source
     */
    static stripComments(source: string): string {
        return source.replace(RE_COMMENT, '');
    }

    private replaceDefines(source: string): string {
        return source.replace(RE_WORD, match => this.defines.get(match) ?? match);
    }

    private async processLine(lineOrig: string, lineNum: number): Promise<void> {
        // Substitute defines
        let line = this.replaceDefines(lineOrig);

        // Handle enable directives
        if (line.trimStart().startsWith('enable')) {
            line = line.replace(RE_COMMENT, '');
            this.source.extensions += line + '\n';
            return;
        }

        // Handle preprocessor directives
        if (line.trimStart().startsWith('#')) {
            line = line.replace(RE_COMMENT, '');
            const tokens = line.trim().split(/\s+/);
            const directive = tokens[0].slice(1);

            const handle = 'handle_' + directive;

            if (!(handle in this)) {
                throw new WGSLError('Unrecognized preprocessor directive', lineNum);
            }

            if (directive === 'include') {
                await (this[handle] as DirectiveFunction).call(this, tokens, lineNum);
            } else if (
                directive === 'define' ||
                directive === 'calcdefine' ||
                directive === 'ifdef' ||
                directive === 'ifndef'
            ) {
                const tokensOrig = lineOrig.replace(RE_COMMENT, '').trim().split(' ');
                (this[handle] as DirectiveFunction).call(this, tokensOrig, lineNum);
            } else {
                (this[handle] as DirectiveFunction).call(this, tokens, lineNum);
            }

            return;
        }

        // Handle string literals if enabled
        if (this.specialStrings) {
            let error: WGSLError | null = null;
            line = line.replace(/"((?:[^\\"]|\\.)*)"/g, match => {
                try {
                    const unescaped = JSON.parse(match) as string;
                    const chars = Array.from(unescaped).map(c => c.charCodeAt(0));

                    if (chars.length > STRING_MAX_LEN) {
                        error = new WGSLError(
                            `String literals cannot be longer than ${STRING_MAX_LEN} characters`,
                            lineNum
                        );
                        return match;
                    }

                    // Pad array to fixed length
                    const len = chars.length;
                    while (chars.length < STRING_MAX_LEN) {
                        chars.push(0);
                    }

                    return `String(${len}, array<u32,${STRING_MAX_LEN}>(${chars
                        .map(c => `0x${c.toString(16).padStart(4, '0')}`)
                        .join(', ')}))`;
                } catch (e) {
                    console.error(e);
                    return match;
                }
            });

            if (error) {
                throw error;
            }
        }

        if (this.ifdefStack.every(x => x)) {
            this.source.pushLine(line, lineNum);
        }
    }

    private async handle_include(tokens: string[], lineNum: number): Promise<void> {
        if (tokens.length !== 2) {
            throw new WGSLError('Invalid #include syntax', lineNum);
        }

        const nameMatcher = tokens[1].match(/"(.*)"/) || tokens[1].match(/<(.*)>/);
        if (!nameMatcher) {
            throw new WGSLError('Path must be enclosed in quotes or chevrons', lineNum);
        }

        const name = nameMatcher[1];
        if (/<.*>/.test(tokens[1]) && name === 'string') {
            this.specialStrings = true;
        }

        const includePath = /<.*>/.test(tokens[1]) ? `std/${name}` : name;
        const includeContent = await fetchInclude(includePath);

        if (!includeContent) {
            throw new WGSLError(`Cannot find include ${tokens[1]}`, lineNum);
        }

        for (const includeLine of includeContent.split('\n')) {
            await this.processLine(includeLine, lineNum);
        }
    }

    private handle_workgroup_count(tokens: string[], lineNum: number): void {
        if (tokens.length !== 5) {
            throw new WGSLError('Invalid #workgroup_count syntax', lineNum);
        }

        const [, name, x, y, z] = tokens;
        this.source.workgroupCount.set(name, [
            parseInteger(x, lineNum),
            parseInteger(y, lineNum),
            parseInteger(z, lineNum)
        ]);
    }

    private handle_dispatch_once(tokens: string[], lineNum: number): void {
        if (tokens.length !== 2) {
            throw new WGSLError('Invalid #dispatch_count syntax', lineNum);
        }
        const name = tokens[1];
        this.source.dispatchOnce.set(name, 0); // store 0 instead of undefined
    }

    private handle_dispatch_count(tokens: string[], lineNum: number): void {
        if (tokens.length !== 3) {
            throw new WGSLError('Invalid #dispatch_count syntax', lineNum);
        }
        const [, name, count] = tokens;
        this.source.dispatchCount.set(name, parseInteger(count, lineNum));
    }

    private handle_define(tokens: string[], lineNum: number): void {
        const name = tokens[1];
        if (!name) {
            throw new WGSLError('Invalid #define syntax', lineNum);
        }
        if (this.defines.has(name)) {
            throw new WGSLError(`Cannot redefine ${name}. Use #calcdefine.`, lineNum);
        }
        const value = this.replaceDefines(tokens.slice(2).join(' '));
        this.defines.set(name, value);
    }

    private handle_calcdefine(tokens: string[], lineNum: number): void {
        const name = tokens[1];
        if (!name) {
            throw new WGSLError('Invalid #calcdefine syntax', lineNum);
        }
        let expr = this.replaceDefines(tokens.slice(2).join(''));
        expr = calcMathExpression(expr, lineNum);
        if (this.defines.has(name)) {
            this.defines.delete(name);
        }
        this.defines.set(name, expr);
    }

    private handle_if(tokens: string[], lineNum: number): void {
        if (tokens.length < 2) {
            throw new WGSLError('Invalid #if syntax', lineNum);
        }
        const result = calcMathExpression(tokens.slice(1).join(''), lineNum);
        this.ifdefStack.push(result !== '' && result !== '0' && result !== '0.0');
    }

    private handle_ifdef(tokens: string[], lineNum: number): void {
        if (tokens.length < 2) {
            throw new WGSLError('Invalid #ifdef syntax', lineNum);
        }
        const name = tokens[1];
        this.ifdefStack.push(this.defines.has(name));
    }

    private handle_ifndef(tokens: string[], lineNum: number): void {
        if (tokens.length < 2) {
            throw new WGSLError('Invalid #ifndef syntax', lineNum);
        }
        const name = tokens[1];
        this.ifdefStack.push(!this.defines.has(name));
    }

    private handle_else(tokens: string[], lineNum: number): void {
        const len = this.ifdefStack.length;
        if (len === 0) {
            throw new WGSLError('Unexpected #else without #ifdef or #ifndef', lineNum);
        }
        this.ifdefStack[len - 1] = !this.ifdefStack[len - 1];
    }

    private handle_endif(tokens: string[], lineNum: number): void {
        if (this.ifdefStack.length === 0) {
            throw new WGSLError('Unexpected #endif without #ifdef or #ifndef', lineNum);
        }
        this.ifdefStack.pop();
    }

    private handle_storage(tokens: string[], lineNum: number): void {
        if (this.storageCount >= 2) {
            throw new WGSLError('Only two storage buffers are currently supported', lineNum);
        }
        const [, name, ...types] = tokens;
        const type = types.join(' ');
        this.source.pushLine(
            `@group(0) @binding(${this.storageCount}) var<storage,read_write> ${name}: ${type};`,
            lineNum
        );
        this.storageCount++;
    }

    /*
    private handle_assert(tokens: string[], lineNum: number): void {
        if (this.assertCount >= NUM_ASSERT_COUNTERS) {
            throw new WGSLError(
                `A maximum of ${NUM_ASSERT_COUNTERS} assertions are currently supported`,
                lineNum
            );
        }

        const predicate = tokens.slice(1).join(' ');
        this.source.pushLine(`assert(${this.assertCount}, ${predicate});`, lineNum);
        this.source.assertMap.push(lineNum);
        this.assertCount++;
    }

    private handle_data(tokens: string[], lineNum: number): void {
        if (tokens.length < 4 || tokens[2] !== 'u32') {
            throw new WGSLError('Invalid #data syntax', lineNum);
        }

        const name = tokens[1];
        const dataStr = tokens.slice(3).join('');
        const data = new Uint32Array(dataStr.split(',').map(s => parseInteger(s, lineNum)));

        const existing = this.source.userData.get(name);
        if (existing) {
            // Append to existing data
            const combined = new Uint32Array(existing.length + data.length);
            combined.set(existing);
            combined.set(data, existing.length);
            this.source.userData.set(name, combined);
        } else {
            this.source.userData.set(name, data);
        }
    }
    */

    /**
     * Process complete shader source
     */
    async preprocess(shader: string): Promise<SourceMap> {
        const lines = shader.split('\n');
        for (let i = 0; i < lines.length; i++) {
            await this.processLine(lines[i], i + 1);
        }
        return this.source;
    }
}
