/**
 * Utility functions and types for the compute toy library
 */

/**
 * Custom error for WGSL shader compilation and runtime errors
 */
export class WGSLError extends Error {
    line: number;
    column: number;

    constructor(message: string, line: number = 0, column: number = 0) {
        super(message);
        this.name = 'WGSLError';
        this.line = line;
        this.column = column;
    }

    /**
     * Format error message with line and column information
     */
    toString(): string {
        return `${this.name} at line ${this.line}, column ${this.column}: ${this.message}`;
    }
}

/**
 * Parse a string into a integer in decimal and hex formats
 */
export function parseInteger(value: string, line: number): number {
    const result = parseInt(value.replace(/[iu]$/, ''));
    if (isNaN(result)) {
        throw new WGSLError(`Cannot parse '${value}' as integer`, line);
    }
    return result;
}

// Cache for fetched includes
const includeCache = new Map<string, Promise<string | null>>();

/**
 * Fetch and cache shader include files
 */
export async function fetchInclude(name: string): Promise<string | null> {
    const cached = includeCache.get(name);
    if (cached) {
        return cached;
    }

    const fetchPromise = (async () => {
        try {
            const url = `https://compute-toys.github.io/include/${name}.wgsl`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Failed to fetch include ${name}: ${response.statusText}`);
                return null;
            }

            return await response.text();
        } catch (error) {
            console.error(`Error fetching include ${name}:`, error);
            return null;
        }
    })();

    // Store in cache even if it fails - we don't want to retry failed fetches
    includeCache.set(name, fetchPromise);
    return fetchPromise;
}

/**
 * Helper to ensure shader error line numbers are correct
 */
export function countNewlines(text: string): number {
    return (text.match(/\n/g) || []).length;
}

/**
 * Calculate a mathematical expression safely with int/float support
 */
export function calcMathExpression(expression: string, lineNumber: number): string {
    const VALID_EXPRESSIONS = /^[+\-*/%(,)]*$/;
    const BOOL_FUNCTIONS = /(^|&&|\|\||<<|>>)/g;
    const INTEGER_FUNCTIONS = /(select|abs|min|max|sign)/g;
    const FLOAT_FUNCTIONS =
        /(asin|acos|atan|atan2|asinh|acosh|atanh|sin|cos|tan|sinh|cosh|tanh|round|floor|ceil|pow|sqrt|log|log2|exp|exp2|fract|clamp|mix|smoothstep|radians|degrees)/g;
    const FLOATS = /[+-]?(?=\d*[.eE])(?=\.?\d)\d*\.?\d*(?:[eE][+-]?\d+)?/g;
    const INTEGERS = /(0[xX][0-9a-fA-F]+[iu]?|[0-9]+[iu]?)/g;

    let result = expression.replace(/\s+/g, '');
    if (result === '') {
        return '';
    }

    // safety check for eval vulnerabilities (https://jsfuck.com/, https://aem1k.com/five/)
    let stripped = result
        .replace(BOOL_FUNCTIONS, '')
        .replace(FLOAT_FUNCTIONS, '')
        .replace(INTEGER_FUNCTIONS, '')
        .replace(FLOATS, '')
        .replace(INTEGERS, '');
    if (!VALID_EXPRESSIONS.test(stripped)) {
        stripped = stripped.replace(/[+\-*/%(,)]+/g, '');
        throw new WGSLError(
            `Unsupported symbols '${stripped}' in expression ${expression}`,
            lineNumber
        );
    }

    // convert to bigint if there are no any floating point numbers or float functions
    let isAbstractInteger = false;
    if (
        (!FLOATS.test(expression) && !FLOAT_FUNCTIONS.test(expression)) ||
        BOOL_FUNCTIONS.test(expression)
    ) {
        result = result.replace(INTEGERS, match => `${parseInt(match)}n`);
        isAbstractInteger = true;
    }

    const mathReplacements = {
        'select(': '((f,t,cond) => cond ? t : f)(',
        'abs(': '((x) => Math.abs(Number(x)))(',
        'min(': '((x,y) => Math.min(Number(x),Number(y)))(',
        'max(': '((x,y) => Math.max(Number(x),Number(y)))(',
        'sign(': '((x) => Math.sign(Number(x)))(',
        'sin(': 'Math.sin(',
        'cos(': 'Math.cos(',
        'tan(': 'Math.tan(',
        'sinh(': 'Math.sinh(',
        'cosh(': 'Math.cosh(',
        'tanh(': 'Math.tanh(',
        'asin(': 'Math.asin(',
        'acos(': 'Math.acos(',
        'atan(': 'Math.atan(',
        'atan2(': 'Math.atan2(',
        'asinh(': 'Math.asinh(',
        'acosh(': 'Math.acosh(',
        'atanh(': 'Math.atanh(',
        'round(': 'Math.round(',
        'floor(': 'Math.floor(',
        'ceil(': 'Math.ceil(',
        'pow(': 'Math.pow(',
        'sqrt(': 'Math.sqrt(',
        'log(': 'Math.log(',
        'log2(': 'Math.log2(',
        'exp(': 'Math.exp(',
        'exp2(': 'Math.pow(2,',
        'fract(': '((x) => x - Math.floor(x))(',
        'clamp(': '((x,min,max) => Math.min(Math.max(x,min),max))(',
        'mix(': '((x,y,a) => x*(1-a) + y*a)(',
        'smoothstep(':
            '((e0,e1,x) => { let t = Math.min(Math.max((x-e0)/(e1-e0),0),1); return t*t*(3-2*t); })(',
        'step(': '((edge,x) => x < edge ? 0 : 1)(',
        'radians(': '((x) => x * Math.PI / 180)(',
        'degrees(': '((x) => x * 180 / Math.PI)('
    };

    result = result.replaceAll('^', '**');
    result = result.replace(/\b\w+\(/g, match => mathReplacements[match] || '');

    try {
        result = Function(`'use strict'; return (${result}).toString();`)();
        return !isAbstractInteger && /^[-+]?\d+$/.test(result) ? `${result}.0` : result;
    } catch (error) {
        throw new WGSLError(`Invalid eval '${expression}' -> '${result}' (${error})`, lineNumber);
    }
}
