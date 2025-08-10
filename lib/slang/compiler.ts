import memoizee from 'memoizee';
import pako from 'pako';
import { ReflectionJSON } from 'types/reflection';
import type { GlobalSession, LanguageServer, MainModule, Module } from 'types/slang-wasm';
import shadertoylibSource from '../shaders/shadertoy.slang';
import stdlibSource from '../shaders/std.slang';
import { BindingInfo, parseBindings } from './binding-parser';
import { ShaderConverter, StorageStructMemberLayout } from './glue';

export interface EnhancedReflectionJSON extends ReflectionJSON {
    bindings: Record<string, BindingInfo>;
}

export interface TextureDimensions {
    width: number;
    height: number;
}

const moduleURL = '/wasm/slang-wasm';
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

    compile(
        shaderSource: string,
        channelDimensions: TextureDimensions[],
        prelude: string
    ): [string, StorageStructMemberLayout[]] {
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
        const [glue, storageStructLayout] = converter.convert(
            enhancedReflection,
            channelDimensions
        );
        console.log(glue);
        console.log(storageStructLayout);

        const wgsl =
            glue +
            outCode
                .split('\n')
                .filter(line => !line.trim().startsWith('@binding'))
                .join('\n');

        return [wgsl, storageStructLayout];
    }
}

/**
 * Initialises both the compiler and language server.
 * This should be called before any other functions that access these resources.
 */
const initialiseSlang = memoizee(
    async (): Promise<boolean> => {
        console.log('Initialising Slang module, compiler, and language server');

        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            console.log('Not initializing Slang in SSR environment');
            return false;
        }

        const createModule = (await import(/* webpackIgnore: true */ moduleURL + '.js')).default;
        const slangModule: MainModule | null = await createModule(moduleConfig);
        if (!slangModule) {
            console.error('Failed to initialise Slang module');
            return false;
        }

        try {
            compiler = new Compiler(slangModule);
        } catch (error) {
            console.error('Failed to initialise compiler', error);
            return false;
        }

        slangd = slangModule.createLanguageServer();
        if (!slangd) {
            console.error('Failed to initialise language server');
            return false;
        }

        return true;
    },
    { promise: true }
);

/**
 * Gets the compiler instance, ensuring it's initialised first.
 */
export async function getCompiler(): Promise<Compiler> {
    if (await initialiseSlang()) {
        return compiler!;
    }
    throw new Error('Failed to initialise compiler');
}

/**
 * Gets the language server instance, ensuring it's initialised first.
 */
export async function getLanguageServer(): Promise<LanguageServer> {
    if (await initialiseSlang()) {
        return slangd!;
    }
    throw new Error('Failed to initialise language server');
}
