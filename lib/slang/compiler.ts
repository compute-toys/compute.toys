import pako from 'pako';
import { ReflectionJSON } from 'types/reflection';
import type { GlobalSession, LanguageServer, MainModule, Module } from 'types/slang-wasm';
import shadertoylibSource from '../shaders/shadertoy.slang';
import stdlibSource from '../shaders/std.slang';
import { BindingInfo, parseBindings } from './binding-parser';
import ShaderConverter from './glue';

export interface EnhancedReflectionJSON extends ReflectionJSON {
    bindings: Record<string, BindingInfo>;
}

export interface TextureDimensions {
    width: number;
    height: number;
}

const moduleURL = 'https://compute-toys.github.io/slang-playground/wasm/slang-wasm';
const moduleConfig = {
    instantiateWasm: async (
        imports: WebAssembly.Imports,
        receiveInstance: (instance: WebAssembly.Instance) => void
    ) => {
        const response = await fetch(moduleURL + '.wasm.gz');
        const compressedData = new Uint8Array(await response.arrayBuffer());
        const wasmBinary = pako.inflate(compressedData);
        const { instance } = await WebAssembly.instantiate(wasmBinary, imports);
        receiveInstance(instance);
        return instance.exports;
    }
};

let compiler: Compiler | null = null;
let slangd: LanguageServer | null = null;
let initializationPromise: Promise<boolean> | null = null;
let isInitialized = false;
let initializationError: Error | null = null;

class Compiler {
    private static SLANG_STAGE_COMPUTE = 6;
    private globalSession: GlobalSession;
    private wgslTarget: number;

    constructor(private mainModule: MainModule) {
        // Create empty files that will be populated later
        ['user.slang', 'std.slang', 'shadertoy.slang'].forEach(file => {
            mainModule.FS.createDataFile(
                '/',
                file,
                new DataView(new ArrayBuffer(0)),
                true,
                true,
                false
            );
        });

        const globalSession = mainModule.createGlobalSession();
        if (!globalSession) throw mainModule.getLastError();
        this.globalSession = globalSession;

        const target = mainModule.getCompileTargets()?.find(t => t.name === 'WGSL');
        if (!target) throw mainModule.getLastError();
        this.wgslTarget = target.value;
    }

    compile(shaderSource: string, channelDimensions: TextureDimensions[], prelude: string): string {
        const session = this.globalSession.createSession(this.wgslTarget);
        if (!session) throw this.mainModule.getLastError();

        const components: Module[] = [];

        const stdlib = session.loadModuleFromSource(stdlibSource + prelude, 'std', '/std.slang');
        if (!stdlib) throw this.mainModule.getLastError();
        components.push(stdlib);

        const shadertoylib = session.loadModuleFromSource(
            shadertoylibSource,
            'shadertoy',
            '/shadertoy.slang'
        );
        if (!shadertoylib) throw this.mainModule.getLastError();
        components.push(shadertoylib);

        const userModule = session.loadModuleFromSource(shaderSource, 'user', '/user.slang');
        if (!userModule) throw this.mainModule.getLastError();
        components.push(userModule);

        // Add entry points
        const count = userModule.getDefinedEntryPointCount();
        for (let i = 0; i < count; i++) {
            const name = userModule.getDefinedEntryPoint(i).getName();
            const entryPoint = userModule.findAndCheckEntryPoint(
                name,
                Compiler.SLANG_STAGE_COMPUTE
            );
            if (!entryPoint) throw this.mainModule.getLastError();
            components.push(entryPoint);
        }

        // Create and link program
        const program = session.createCompositeComponentType(components);
        const linkedProgram = program.link();
        const outCode = linkedProgram.getTargetCode(0);
        if (!outCode) throw this.mainModule.getLastError();
        console.log(outCode);

        // Get reflection data
        const layout = linkedProgram.getLayout(0);
        const reflectionJson: ReflectionJSON = layout?.toJsonObject();

        session.delete();

        const bindingInfo = parseBindings(outCode);
        const enhancedReflection: EnhancedReflectionJSON = {
            ...reflectionJson,
            bindings: bindingInfo
        };
        console.log('Enhanced reflection:', enhancedReflection);

        const converter = new ShaderConverter();
        const glue = converter.convert(enhancedReflection, channelDimensions);
        console.log(glue);

        return (
            glue +
            outCode
                .split('\n')
                .filter(line => !line.trim().startsWith('@binding'))
                .join('\n')
        );
    }
}

/**
 * Starts the initialization process in the background.
 * This function returns immediately and doesn't block the UI.
 */
export function startSlangInitialization(): void {
    if (initializationPromise || isInitialized) {
        return; // Already started or completed
    }

    console.log('Starting Slang initialization in background...');

    initializationPromise = (async (): Promise<boolean> => {
        try {
            // Check if we're in a browser environment
            if (typeof window === 'undefined') {
                console.log('Not initializing Slang in SSR environment');
                return false;
            }

            const createModule = (await import(/* webpackIgnore: true */ moduleURL + '.js'))
                .default;
            const slangModule: MainModule | null = await createModule(moduleConfig);
            if (!slangModule) {
                throw new Error('Failed to initialise Slang module');
            }

            try {
                compiler = new Compiler(slangModule);
            } catch (error) {
                throw new Error(`Failed to initialise compiler: ${error}`);
            }

            slangd = slangModule.createLanguageServer();
            if (!slangd) {
                throw new Error('Failed to initialise language server');
            }

            isInitialized = true;
            console.log('Slang initialization completed successfully');
            return true;
        } catch (error) {
            initializationError = error instanceof Error ? error : new Error(String(error));
            console.error('Slang initialization failed:', error);
            throw error;
        }
    })();
}

/**
 * Checks if Slang is ready to use.
 */
export function isSlangReady(): boolean {
    return isInitialized && compiler !== null && slangd !== null;
}

/**
 * Gets the current initialization status.
 */
export function getSlangStatus(): {
    isReady: boolean;
    isInitializing: boolean;
    error: Error | null;
} {
    return {
        isReady: isSlangReady(),
        isInitializing: initializationPromise !== null && !isInitialized,
        error: initializationError
    };
}

/**
 * Waits for Slang to be ready, with optional timeout.
 */
export async function waitForSlang(timeoutMs: number = 30000): Promise<boolean> {
    if (isSlangReady()) {
        return true;
    }

    if (!initializationPromise) {
        startSlangInitialization();
    }

    if (!initializationPromise) {
        return false;
    }

    try {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Slang initialization timeout')), timeoutMs);
        });

        await Promise.race([initializationPromise, timeoutPromise]);
        return isSlangReady();
    } catch (error) {
        console.error('Error waiting for Slang:', error);
        return false;
    }
}

/**
 * Gets the compiler instance, ensuring it's initialised first.
 * This function will wait for initialization to complete.
 */
export async function getCompiler(): Promise<Compiler> {
    if (isSlangReady()) {
        return compiler!;
    }

    if (!initializationPromise) {
        startSlangInitialization();
    }

    if (await waitForSlang()) {
        return compiler!;
    }

    throw new Error('Failed to initialise compiler');
}

/**
 * Gets the language server instance, ensuring it's initialised first.
 * This function will wait for initialization to complete.
 */
export async function getLanguageServer(): Promise<LanguageServer> {
    if (isSlangReady()) {
        return slangd!;
    }

    if (!initializationPromise) {
        startSlangInitialization();
    }

    if (await waitForSlang()) {
        return slangd!;
    }

    throw new Error('Failed to initialise language server');
}

// Start initialization immediately when the module is loaded
if (typeof window !== 'undefined') {
    startSlangInitialization();
}
