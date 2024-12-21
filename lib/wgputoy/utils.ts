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
        const trimmed = value.trim().replace(/u$/, '');  // Remove trailing 'u' if present

        if (trimmed.startsWith('0x')) {
            return parseInt(trimmed.slice(2), 16);
        } else {
            return parseInt(trimmed, 10);
        }
    } catch (e) {
        throw new WGSLError(`Cannot parse '${value}' as u32`, line);
    }
}

// Cache for fetched includes
const includeCache = new Map<string, Promise<string>>();

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
 * Set custom error handlers and logging for debugging
 */
export function setupErrorHandlers(): void {
    // Set up error boundary
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });

    // Log WebGPU errors if device is lost
    // navigator.gpu?.addEventListener?.('devicelost', (event) => {
    //     console.error('WebGPU device was lost:', event);
    // });
}

/**
 * Helper function to measure execution time of async operations
 */
export async function measureTime<T>(
    name: string,
    fn: () => Promise<T>
): Promise<T> {
    const start = performance.now();
    try {
        const result = await fn();
        const elapsed = performance.now() - start;
        console.log(`${name} took ${elapsed.toFixed(2)}ms`);
        return result;
    } catch (error) {
        const elapsed = performance.now() - start;
        console.error(`${name} failed after ${elapsed.toFixed(2)}ms:`, error);
        throw error;
    }
}

/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

/**
 * Helper to ensure shader error line numbers are correct
 */
export function countNewlines(text: string): number {
    return (text.match(/\n/g) || []).length;
}

/**
 * Assert function that throws WGSLError
 */
export function assert(condition: boolean, message: string, line: number = 0): asserts condition {
    if (!condition) {
        throw new WGSLError(message, line);
    }
}