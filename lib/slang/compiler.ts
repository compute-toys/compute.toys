import pako from 'pako';
import { ReflectionJSON } from 'types/reflection';
import type { GlobalSession, MainModule, Module } from 'types/slang-wasm';
import stdlibSource from '../shaders/std.slang';
import ShaderConverter from './glue';

let compiler: Compiler | null = null;

class Compiler {
    private static SLANG_STAGE_COMPUTE = 6;
    private globalSession: GlobalSession;
    private wgslTarget: number;

    constructor(private mainModule: MainModule) {
        // Create empty files that will be populated later
        ['user.slang', 'std.slang'].forEach(file => {
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

    compile(shaderSource: string): string {
        const session = this.globalSession.createSession(this.wgslTarget);
        if (!session) throw this.mainModule.getLastError();

        const components: Module[] = [];

        const stdlib = session.loadModuleFromSource(stdlibSource, 'std', '/std.slang');
        if (!stdlib) throw this.mainModule.getLastError();
        components.push(stdlib);

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
        console.log(reflectionJson);

        session.delete();

        const converter = new ShaderConverter();
        const glue = converter.convert(reflectionJson);
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

export async function getCompiler() {
    if (compiler === null) {
        const url = 'https://compute-toys.github.io/slang-playground/wasm/slang-wasm';
        const moduleConfig = {
            instantiateWasm: async (
                imports: WebAssembly.Imports,
                receiveInstance: (instance: WebAssembly.Instance) => void
            ) => {
                const response = await fetch(url + '.wasm.gz');
                const compressedData = new Uint8Array(await response.arrayBuffer());
                const wasmBinary = pako.inflate(compressedData);
                const { instance } = await WebAssembly.instantiate(wasmBinary, imports);
                receiveInstance(instance);
                return instance.exports;
            }
        };

        // @ts-ignore
        const createModule = (await import(/* webpackIgnore: true */ url + '.js')).default;
        const moduleInstance = await createModule(moduleConfig);
        compiler = new Compiler(moduleInstance);
    }
    return compiler;
}
