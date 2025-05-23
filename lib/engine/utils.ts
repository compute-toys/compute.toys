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
 * Parse a string into a uint32, supporting both decimal and hex formats
 */
export function parseUint32(value: string, line: number): number {
    try {
        const trimmed = value.trim().replace(/u$/, ''); // Remove trailing 'u' if present

        if (trimmed.startsWith('0x')) {
            return parseInt(trimmed.slice(2), 16);
        } else {
            return parseInt(trimmed, 10);
        }
    } catch (e) {
        console.error(e);
        throw new WGSLError(`Cannot parse '${value}' as u32`, line);
    }
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
 * Evaluate a mathematical expression safely
 */
export function safeEvalMath(expression: string, lineNumber: number): string {
    // return number in original formatting
    if (/^-?(?:0x[\da-f]+|0b[01]+|\d*\.?\d+(?:e[+-]?\d+)?|\d+)$/i.test(expression)) {
        return expression;
    }

    const cleaned = expression.replace(/\s+/g, '');
    if (cleaned === '') {
        return '';
    }

    // safe math expression
    const validMathRegex = /^[0-9+\-*/%^.,()]+$/;
    const validFunctions =
        /(asin|acos|atan|atan2|asinh|acosh|atanh|sin|cos|tan|sinh|cosh|tanh|abs|min|max|round|floor|ceil|sign|pow|sqrt|log|log2|exp|exp2|fract|clamp|mix|smoothstep|step|select|radians|degrees)/g;
    let stripped = cleaned.replace(validFunctions, '');
    if (!validMathRegex.test(stripped)) {
        stripped = stripped.replace(/[0-9+\-*/%^.,()]+/g, '');
        throw new WGSLError(`Unsafe symbols '${stripped}' in expression ${expression}`, lineNumber);
    }

    const mathReplacements = {
        'asin(': 'Math.asin(',
        'acos(': 'Math.acos(',
        'atan(': 'Math.atan(',
        'atan2(': 'Math.atan2(',
        'asinh(': 'Math.asinh(',
        'acosh(': 'Math.acosh(',
        'atanh(': 'Math.atanh(',
        'sin(': 'Math.sin(',
        'cos(': 'Math.cos(',
        'tan(': 'Math.tan(',
        'sinh(': 'Math.sinh(',
        'cosh(': 'Math.cosh(',
        'tanh(': 'Math.tanh(',
        'abs(': 'Math.abs(',
        'min(': 'Math.min(',
        'max(': 'Math.max(',
        'round(': 'Math.round(',
        'floor(': 'Math.floor(',
        'ceil(': 'Math.ceil(',
        'sign(': 'Math.sign(',
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
        'select(': '((f,t,cond) => cond ? t : f)(',
        'radians(': '((x) => x * Math.PI / 180)(',
        'degrees(': '((x) => x * 180 / Math.PI)('
    };

    let result = cleaned.replaceAll('^', '**');
    result = result.replace(/\b\w+\(/g, match => mathReplacements[match] || '');

    try {
        return Function(`"use strict"; return (${result}).toString();`)();
    } catch (error) {
        throw new WGSLError(`Invalid eval '${expression}' -> '${result}' (${error})`, lineNumber);
    }
}
