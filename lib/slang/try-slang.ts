import pako from 'pako';
import { SlangCompiler } from './compiler';

export let compiler: SlangCompiler | null = null;
let moduleInstance: any = null;

async function fetchWithProgress(
    url: string,
    onProgress: { (loaded: number, total: number): void }
) {
    const response = await fetch(url);
    const contentLength = response.headers.get('Content-Length');

    if (!contentLength) {
        console.warn('Content-Length header is missing.');
        return new Uint8Array(await response.arrayBuffer());
    }

    let total = contentLength ? parseInt(contentLength, 10) : 8 * 1024 * 1024; // Default to 8 MB if unknown
    let buffer = new Uint8Array(total); // Initial buffer
    let position = 0; // Tracks the current position in the buffer

    if (!response.body) {
        // Probably needs to be handled properly
        throw new Error('No response body');
    }
    const reader = response.body.getReader();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Ensure buffer has enough space for the next chunk
        if (position + value.length > buffer.length) {
            // Double the buffer size
            let newBuffer = new Uint8Array(buffer.length * 2);
            newBuffer.set(buffer, 0); // Copy existing data to the new buffer
            buffer = newBuffer;
        }

        // Copy the chunk into the buffer
        buffer.set(value, position);
        position += value.length;

        if (contentLength) {
            onProgress(position, total); // Update progress if content length is known
        }
    }

    return buffer;
}

// Event when loading the WebAssembly module
type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
    ...a: Parameters<T>
) => TNewReturn;
type ConfigType = Omit<EmscriptenModule, 'instantiateWasm'> & {
    instantiateWasm: ReplaceReturnType<
        EmscriptenModule['instantiateWasm'],
        Promise<WebAssembly.Exports>
    >;
};

// Define the Module object with a callback for initialization
const moduleConfig = {
    locateFile: function (path: string) {
        if (path.endsWith('.wasm')) {
            return '/wasm/slang-wasm.wasm.gz'; // Load directly from public directory
        }
        return path;
    },
    instantiateWasm: async function (
        imports: WebAssembly.Imports,
        receiveInstance: (arg0: WebAssembly.Instance) => void
    ): Promise<WebAssembly.Exports> {
        let progressBar = document.getElementById('progress-bar');
        // Update URL to use absolute path from public directory
        const compressedData = await fetchWithProgress(
            '/wasm/slang-wasm.wasm.gz',
            (loaded, total) => {
                const progress = (loaded / total) * 100;
                if (progressBar == null) progressBar = document.getElementById('progress-bar');
                if (progressBar) progressBar.style.width = `${progress}%`;
            }
        );

        // Step 2: Decompress the gzip data
        const wasmBinary = pako.inflate(compressedData);

        // Step 3: Instantiate the WebAssembly module from the decompressed data
        const { instance } = await WebAssembly.instantiate(wasmBinary, imports);
        receiveInstance(instance);
        return instance.exports;
    }
} satisfies Partial<ConfigType> as any;

export async function createCompiler() {
    // Return existing compiler if already initialized
    if (compiler !== null) {
        return compiler;
    }

    // Create module only once
    if (!moduleInstance) {
        const createModule = (await import(/* webpackIgnore: true */ '/wasm/slang-wasm.js'))
            .default;
        moduleInstance = await createModule(moduleConfig);
    }

    let label = document.getElementById('loadingStatusLabel');
    if (label) label.innerText = 'Initializing Slang Compiler...';

    try {
        compiler = new SlangCompiler(moduleInstance);
        let result = compiler.init();
        if (result.ret) {
            console.log('Slang compiler initialized successfully.');
            window.dispatchEvent(new CustomEvent('slangLoaded', {}));
        } else {
            console.log(result.msg);
            console.log('Failed to initialize Slang Compiler.');
        }
        return compiler;
    } catch (error: any) {
        if (label) {
            label.innerText = error.toString(error);
            console.error(error);
        }
    }
}
