/**
 * WGSL shader preprocessor implementation
 */
import { calcMathExpression, fetchInclude, parseInteger, WGSLError } from './utils';

// Regular expressions for preprocessing
const RE_COMMENT = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
const RE_WORD = /[a-zA-Z_][a-zA-Z0-9_]*/g;

const STRING_MAX_LEN = 20;
type DirectiveFunction = (tokens: string[], lineNum: number) => void | Promise<void>;

export interface StorageBufferBindingInfo {
    binding: number;
    offset: number; // for storage buffers packed into a single buffer (as used for slang)
    size: number;
}

/**
 * Maps the processed shader source to original line numbers
 */
export class SourceMap {
    extensions: string = '';
    source: string = '';
    map: number[] = [0];
    storageBuffers = new Map<string, StorageBufferBindingInfo>();
    workgroupCount = new Map<string, [number, number, number]>();
    dispatchCount = new Map<string, number>();
    pipelinesOrder = new Array(0);
    pipelinesOnceOrder = new Array(0);
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
    private specialStrings: boolean;
    // private assertCount: number;

    constructor(defines: Map<string, string>) {
        this.defines = new Map(defines);
        this.defines.set('STRING_MAX_LEN', STRING_MAX_LEN.toString());
        this.ifdefStack = [];
        this.source = new SourceMap();
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

    computeEquations = function (str, eqlmt) {
        //remove comments
        str = str.replace(/\/\/.*|\/\*.*?\*\//g, '');
        // 1. Validate: Allow only digits, whitespace, and specific operators
        if (/[^0-9+\-*/%&|^~()<>\s]/.test(str)) return new Array<number>(0);
        // 2. Tokenize
        const tokens = str.match(/\d+|<<|>>|[+\-*/%&|^~()]/g);
        if (!tokens) return new Array<number>(0);
        // 3. Solver Function (Shunting-yard with Unary support)
        const solve = eqTokens => {
            if (!eqTokens.length) return 0;
            const ops = {
                'u-': a => -a,
                '~': a => ~a,
                '*': (a, b) => a * b,
                '/': (a, b) => (a / b) | 0,
                '%': (a, b) => a % b,
                '+': (a, b) => a + b,
                '-': (a, b) => a - b,
                '<<': (a, b) => a << b,
                '>>': (a, b) => a >> b,
                '&': (a, b) => a & b,
                '^': (a, b) => a ^ b,
                '|': (a, b) => a | b
            };
            const prec = {
                'u-': 6,
                '~': 6,
                '*': 5,
                '/': 5,
                '%': 5,
                '+': 4,
                '-': 4,
                '<<': 3,
                '>>': 3,
                '&': 2,
                '^': 1,
                '|': 0
            };
            const values = new Array(0);
            const opStack = new Array(0);
            let expectOp = true; // Used strictly inside solve for Unary detection
            const applyOp = () => {
                const op = opStack.pop();
                const fn = ops[op];
                if (op === 'u-' || op === '~') {
                    values.push(fn(values.pop()));
                } else {
                    const b = values.pop();
                    const a = values.pop();
                    values.push(fn(a, b));
                }
            };
            for (const token of eqTokens) {
                if (/\d/.test(token)) {
                    values.push(parseInt(token, 10));
                    expectOp = false;
                } else if (token === '(') {
                    opStack.push(token);
                    expectOp = true;
                } else if (token === ')') {
                    while (opStack.length && opStack[opStack.length - 1] !== '(') applyOp();
                    opStack.pop();
                    expectOp = false;
                } else {
                    let currentOp = token;
                    // Detect Unary Minus
                    if (expectOp && token === '-') currentOp = 'u-';

                    while (
                        opStack.length &&
                        opStack[opStack.length - 1] !== '(' &&
                        prec[opStack[opStack.length - 1]] >= prec[currentOp]
                    ) {
                        // Right-associative unary ops do not pop equal precedence
                        if (currentOp === 'u-' || currentOp === '~') break;
                        applyOp();
                    }
                    opStack.push(currentOp);
                    expectOp = true;
                }
            }
            while (opStack.length) applyOp();
            return values[0];
        };
        // 4. Split tokens into individual equations
        const results = new Array<number>(0);
        let currentEq = new Array(0);
        let expectOperand = true; // Tracks if the previous token ended an expression
        for (const t of tokens) {
            const isNum = /^\d+$/.test(t);
            const isOpen = t === '(';
            const isUnaryPrefix = t === '~'; // ~ is always start of a value, unlike -
            // Split condition: We don't expect an operand (we just finished a value),
            // but the current token starts a new value (Number, Open Paren, or ~).
            // Note: '-' is not a split trigger because "5 - 2" is valid binary math.
            if (!expectOperand && (isNum || isOpen || isUnaryPrefix)) {
                results.push(solve(currentEq));
                if (results.length === eqlmt) return results;
                currentEq = new Array(0);
                expectOperand = true; // Reset state for new equation
            }
            currentEq.push(t);
            // Update state
            if (isNum || t === ')') {
                expectOperand = false; // We have a value
            } else {
                expectOperand = true; // We have an operator or '('
            }
        }
        if (currentEq.length) results.push(solve(currentEq));
        //console.log(str);
        //console.log(results);
        return results;
    };
    private handle_workgroup_count(tokens: string[], lineNum: number): void {
        const line = tokens.join(' ');
        const startsWith = /^\s*#workgroup_count\b/.test(line);
        let match = line.match(/^\s*#workgroup_count\s+(\S+)\s+(.+)$/);
        if (match) {
            const rs = this.computeEquations(match[2], 3);
            if (rs.length === 0 || !rs.every(n => n > 0)) match = null;
            if (rs.length === 1) rs.push(1);
            if (rs.length === 2) rs.push(1);
            if (match) this.source.workgroupCount.set(match[1], [rs[0], rs[1], rs[2]]);
        }
        if (!match && startsWith) throw new WGSLError('Invalid #workgroup_count syntax', lineNum);
    }

    private handle_dispatch_once(tokens: string[], lineNum: number): void {
        if (tokens.length !== 2) {
            throw new WGSLError('Invalid #dispatch_count syntax', lineNum);
        }
        const name = tokens[1];
        this.source.dispatchCount.set(name, 0); // store 0 instead of undefined
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
        if (this.source.storageBuffers.size >= 2) {
            throw new WGSLError('Only two storage buffers are currently supported', lineNum);
        }
        const [, name, ...types] = tokens;
        if (this.source.storageBuffers.has(name)) {
            throw new WGSLError('Storage buffer ' + name + ' has already been declared', lineNum);
        }
        const type = types.join(' ');
        const binding = this.source.storageBuffers.size;
        this.source.pushLine(
            `@group(0) @binding(${binding}) var<storage,read_write> ${name}: ${type};`,
            lineNum
        );
        this.source.storageBuffers.set(name, {
            binding: binding,
            offset: 0,
            size: 128 << 20 // 128MiB
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private handle_repeat(tokens: string[], lineNum: number): void {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private handle_pipeline(tokens: string[], lineNum: number): void {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private handle_pipeline_once(tokens: string[], lineNum: number): void {}
    // extract #pipeline #pipeline_once and apply #repeat to them
    private handle_pipelines(shader: string): void {
        const match1 = shader.match(/^\s*#pipeline\s+(.+)$/m);
        const match2 = shader.match(/^\s*#pipeline_once\s+(.+)$/m);
        if (!match1 && !match2) return;
        const lines = shader.split(/\r?\n/);
        const dcLineIndex = lines.findIndex(line => /^\s*#dispatch_count\b/.test(line));
        const doLineIndex = lines.findIndex(line => /^\s*#dispatch_once\b/.test(line));
        if (match1 && dcLineIndex !== -1) {
            throw new WGSLError("can't have both #dispatch_count and #pipeline", dcLineIndex);
        }
        if (match2 && dcLineIndex !== -1) {
            throw new WGSLError("can't have both #dispatch_count and #pipeline_once", dcLineIndex);
        }
        if (match2 && doLineIndex !== -1) {
            throw new WGSLError("can't have both #dispatch_once and #pipeline_once", doLineIndex);
        }
        let myPipeline = '';
        let myPipelineO = '';
        if (match1) myPipeline = match1[1].replace(/\/\/.*|\/\*.*?\*\//g, ''); //remove comments
        if (match2) myPipelineO = match2[1].replace(/\/\/.*|\/\*.*?\*\//g, ''); //remove comments
        const rules = new Array(0);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            //regex #repeat (keyword) (count) (text)
            const startsWith = /^\s*#repeat\b/.test(line);
            const match = line.match(/^\s*#repeat\s+(\S+)\s+(\d+)\s+(.+)$/);
            if (match) {
                const keyword = match[1];
                const count = parseInt(match[2], 10);
                const text = match[3];
                rules.push({
                    keyword: keyword,
                    replacement: Array(count).fill(text).join(' ')
                });
            }
            if (!match && startsWith) throw new WGSLError('invalid #repeat format', i);
        }
        if (myPipeline.length !== 0) {
            for (const rule of rules) {
                myPipeline = myPipeline.split(rule.keyword).join(rule.replacement);
            }
            this.source.pipelinesOrder = myPipeline.trim().split(/\s+/);
        }
        if (myPipelineO.length !== 0) {
            for (const rule of rules) {
                myPipelineO = myPipelineO.split(rule.keyword).join(rule.replacement);
            }
            this.source.pipelinesOnceOrder = myPipelineO.trim().split(/\s+/);
        }
        if (match1 && this.source.pipelinesOrder.length === 0) {
            const lineIndex = lines.findIndex(line => /^\s*#pipeline\b/.test(line));
            throw new WGSLError('#pipeline is empty or has invalid names', lineIndex);
        }
        if (match2 && this.source.pipelinesOnceOrder.length === 0) {
            const lineIndex = lines.findIndex(line => /^\s*#pipeline_once\b/.test(line));
            throw new WGSLError('#pipeline_once is empty or has invalid names', lineIndex);
        }
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
        this.handle_pipelines(shader);
        const lines = shader.split('\n');
        for (let i = 0; i < lines.length; i++) {
            await this.processLine(lines[i], i + 1);
        }
        return this.source;
    }
}
