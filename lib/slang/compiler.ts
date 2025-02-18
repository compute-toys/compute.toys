// import type { ComponentType, EmbindString, GlobalSession, MainModule, Module, ProgramLayout, Session, ThreadGroupSize, VariableLayoutReflection } from './slang-wasm.js';

const playgroundSource = `
internal struct UniformInput
{
    float4 mousePosition;
    float time;
}

internal uniform UniformInput uniformInput;

// Returns the current time in milliseconds.
public float getTime()
{
    return uniformInput.time;
}

// Returns mouse position info.
// xy: mouse position (in pixels) during last button down.
// abs(zw): mouse position during last button click.
// sign(mouze.z): button is down
// sign(mouze.w): button is clicked
//
public float4 getMousePosition() { return uniformInput.mousePosition; }

// type field: 1 for format string, 2 for normal string, 3 for integer, 4 for float, 5 for double, 
struct FormattedStruct
{
    uint32_t type = 0xFFFFFFFF;
    uint32_t low = 0;
    uint32_t high = 0;
};

// This is global variable, intead of shader parameter.
internal static int g_printBufferIndex = 0;

internal RWStructuredBuffer<FormattedStruct> g_printedBuffer;

interface IPrintf
{
    uint32_t typeFlag();
    uint32_t writePrintfWords();
};

extension uint : IPrintf
{
    uint32_t typeFlag() { return 3;}
    uint32_t writePrintfWords() { return (uint32_t)this; }
}

extension int : IPrintf
{
    uint32_t typeFlag() { return 3;}
    uint32_t writePrintfWords() { return (uint32_t)this; }
}

// extension int64_t : IPrintf
// {
//     uint64_t writePrintfWords() { return (uint64_t)this; }
// }

// extension uint64_t : IPrintf
// {
//     uint64_t writePrintfWords() { return (uint64_t)this; }
// }

extension float : IPrintf
{
    uint32_t typeFlag() { return 4;}
    uint32_t writePrintfWords() { return bit_cast<uint32_t>(this); }
}

// extension double : IPrintf
// {
//     uint64_t writePrintfWords() { return bit_cast<uint64_t>(this); }
// }

extension String : IPrintf
{
    uint32_t typeFlag() { return 2;}
    uint32_t writePrintfWords() { return getStringHash(this); }
}

void handleEach<T>(T value, int index) where T :  IPrintf
{
    g_printedBuffer[index].type = value.typeFlag();
    g_printedBuffer[index].low = value.writePrintfWords();
}

public void print<each T>(String format, expand each T values) where T : IPrintf
{
    //if (format.length != 0)
    {
        g_printedBuffer[g_printBufferIndex].type = 1;
        g_printedBuffer[g_printBufferIndex].low = getStringHash(format);
        g_printBufferIndex++;
        expand(handleEach(each values, g_printBufferIndex++));

        g_printedBuffer[g_printBufferIndex++] = {};
    }
}

[OverloadRank(1)]
public void printf<each T>(String format, expand each T values) where T : IPrintf
{
    print(format, expand each values);
}

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_ZEROSAttribute
{
    int count;
};

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_BLACKAttribute
{
    int width;
    int height;
};

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_URLAttribute
{
    string url;
};

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_RANDAttribute
{
    int count;
};

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_SLIDERAttribute
{
    float default;
    float min;
    float max;
};

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_COLOR_PICKAttribute
{
    float defaultRed;
    float defaultGreen;
    float defaultBlue;
};

[__AttributeUsage(_AttributeTargets.Function)]
public struct playground_CALLAttribute
{
    int x;
    int y;
    int z;
};

[__AttributeUsage(_AttributeTargets.Function)]
public struct playground_CALL_SIZE_OFAttribute
{
    string resourceName;
};

[__AttributeUsage(_AttributeTargets.Function)]
public struct playground_CALL_ONCEAttribute
{
};
`;

const imageMainSource = `
import user;
import playground;

RWStructuredBuffer<int>             outputBuffer;

[format("rgba8")]
WTexture2D                          outputTexture;

[shader("compute")]
[numthreads(16, 16, 1)]
void imageMain(uint3 dispatchThreadID : SV_DispatchThreadID)
{
    uint width = 0;
    uint height = 0;
    outputTexture.GetDimensions(width, height);

    float4 color = imageMain(dispatchThreadID.xy, int2(width, height));

    if (dispatchThreadID.x >= width || dispatchThreadID.y >= height)
        return;

    outputTexture.Store(dispatchThreadID.xy, color);
}
`;

const printMainSource = `
import user;
import playground;

RWStructuredBuffer<int>               outputBuffer;

[format("rgba8")]
WTexture2D                          outputTexture;

[shader("compute")]
[numthreads(1, 1, 1)]
void printMain(uint3 dispatchThreadID : SV_DispatchThreadID)
{
    printMain();
}
`;

export function isWholeProgramTarget(compileTarget: string) {
    return compileTarget == "METAL" || compileTarget == "SPIRV" || compileTarget == "WGSL";
}

export const RUNNABLE_ENTRY_POINT_NAMES = ['imageMain', 'printMain'] as const;
export type RunnableShaderType = typeof RUNNABLE_ENTRY_POINT_NAMES[number];
export type ShaderType = RunnableShaderType | null;

const RUNNABLE_ENTRY_POINT_SOURCE_MAP: { [key in RunnableShaderType]: string } = {
    'imageMain': imageMainSource,
    'printMain': printMainSource,
};

type BindingDescriptor = {
    storageTexture: {
        access: "write-only" | "read-write",
        format: GPUTextureFormat,
    }
} | {
    texture: {}
} | {
    buffer: {
        type: "uniform" | "storage"
    }
};

export type Bindings = Map<string, GPUBindGroupLayoutEntry>;

export type ReflectionBinding = {
    "kind": "uniform",
    "offset": number,
    "size": number,
} | {
    "kind": "descriptorTableSlot",
    "index": number,
};

export type ReflectionType = {
    "kind": "struct",
    "name": string,
    "fields": ReflectionParameter[]
} | {
    "kind": "vector",
    "elementCount": number,
    "elementType": ReflectionType,
} | {
    "kind": "scalar",
    "scalarType": `${"uint" | "int"}${8 | 16 | 32 | 64}` | `${"float"}${16 | 32 | 64}`,
} | {
    "kind": "resource",
    "baseShape": "structuredBuffer",
    "access"?: "readWrite",
    "resultType": ReflectionType
} | {
    "kind": "resource",
    "baseShape": "texture2D",
    "access"?: "readWrite"
};

export type ReflectionParameter = {
    "binding": ReflectionBinding,
    "name": string,
    "type": ReflectionType,
    "userAttribs"?: ReflectionUserAttribute[],
}

export type ReflectionJSON = {
    "entryPoints": ReflectionEntryPoint[],
    "parameters": ReflectionParameter[],
};

export type ReflectionEntryPoint = {
    "name": string,
    "parameters": ReflectionParameter[],
    "stage": string,
    "threadGroupSize": number[],
    "userAttribs"?: ReflectionUserAttribute[],
};

export type ReflectionUserAttribute = {
    "arguments": (number | string)[],
    "name": string,
};


export class SlangCompiler {
    static SLANG_STAGE_VERTEX = 1;
    static SLANG_STAGE_FRAGMENT = 5;
    static SLANG_STAGE_COMPUTE = 6;

    globalSlangSession: GlobalSession | null = null;

    compileTargetMap: { name: string, value: number }[] | null = null;

    slangWasmModule: MainModule;
    diagnosticsMsg;
    shaderType: ShaderType;

    spirvToolsModule: SpirvTools | null = null;

    mainModules: Map<string, { source: EmbindString }> = new Map();

    constructor(module: MainModule) {
        this.slangWasmModule = module;
        this.diagnosticsMsg = "";
        this.shaderType = null;
        for (let runnableEntryPoint of RUNNABLE_ENTRY_POINT_NAMES) {
            this.mainModules.set(runnableEntryPoint, { source: RUNNABLE_ENTRY_POINT_SOURCE_MAP[runnableEntryPoint] });
        }

        module.FS.createDataFile("/", "user.slang", new DataView(new ArrayBuffer(0)), true, true, false);
        module.FS.createDataFile("/", "playground.slang", new DataView(new ArrayBuffer(0)), true, true, false);
    }

    init() {
        try {
            this.globalSlangSession = this.slangWasmModule.createGlobalSession();
            this.compileTargetMap = this.slangWasmModule.getCompileTargets();

            if (!this.globalSlangSession || !this.compileTargetMap) {
                const error = this.slangWasmModule.getLastError();
                return { ret: false, msg: (error.type + " error: " + error.message) };
            }
            else {
                return { ret: true, msg: "" };
            }
        } catch (e) {
            console.error(e);
            return { ret: false, msg: '' + e };
        }
    }

    findCompileTarget(compileTargetStr: string) {
        if (this.compileTargetMap == null)
            throw new Error("No compile targets to find");
        for (let i = 0; i < this.compileTargetMap.length; i++) {
            const target = this.compileTargetMap[i];
            if (target.name == compileTargetStr)
                return target.value;
        }
        return 0;
    }

    // In our playground, we only allow to run shaders with two entry points: renderMain and printMain
    findRunnableEntryPoint(module: Module) {
        for (let entryPointName of RUNNABLE_ENTRY_POINT_NAMES) {
            let entryPoint = module.findAndCheckEntryPoint(entryPointName, SlangCompiler.SLANG_STAGE_COMPUTE);
            if (entryPoint) {
                this.shaderType = entryPointName;
                return entryPoint;
            }
        }

        return null;
    }

    findEntryPoint(module: Module, entryPointName: string | null, stage: number) {
        if (entryPointName == null || entryPointName == "") {
            const entryPoint = this.findRunnableEntryPoint(module);
            if (!entryPoint) {
                this.diagnosticsMsg += "Warning: The current shader code is not runnable because 'imageMain' or 'printMain' functions are not found.\n";
                this.diagnosticsMsg += "Use the 'Compile' button to compile it to different targets.\n";
            }
            return entryPoint;
        }
        else {
            const entryPoint = module.findAndCheckEntryPoint(entryPointName, stage);
            if (!entryPoint) {
                const error = this.slangWasmModule.getLastError();
                console.error(error.type + " error: " + error.message);
                this.diagnosticsMsg += (error.type + " error: " + error.message);
                return null;
            }
            return entryPoint;
        }
    }

    async initSpirvTools() {
        if (!this.spirvToolsModule) {
            this.spirvToolsModule = await spirvTools();
        }
    }

    spirvDisassembly(spirvBinary: any) {
        if (!this.spirvToolsModule)
            throw new Error("Spirv tools not initialized");
        let disAsmCode = this.spirvToolsModule.dis(
            spirvBinary,
            this.spirvToolsModule.SPV_ENV_UNIVERSAL_1_3,
            this.spirvToolsModule.SPV_BINARY_TO_TEXT_OPTION_INDENT |
            this.spirvToolsModule.SPV_BINARY_TO_TEXT_OPTION_FRIENDLY_NAMES
        );


        if (disAsmCode == "Error") {
            this.diagnosticsMsg += ("SPIRV disassembly error");
            disAsmCode = "";
        }

        return disAsmCode;
    }

    // If user code defines imageMain or printMain, we will know the entry point name because they're
    // already defined in our pre-built module. So we will add those one of those entry points to the
    // dropdown list. Then, we will find whether user code also defines other entry points, if it has
    // we will also add them to the dropdown list.
    findDefinedEntryPoints(shaderSource: string): string[] {
        let result: string[] = [];
        let runnable: string[] = [];
        for (let entryPointName of RUNNABLE_ENTRY_POINT_NAMES) {
            if (shaderSource.match(entryPointName)) {
                runnable.push(entryPointName);
            }
        }
        let slangSession: Session | null | undefined;
        try {
            slangSession = this.globalSlangSession?.createSession(
                this.findCompileTarget("SPIRV"));
            if (!slangSession) {
                return [];
            }
            let module: Module | null = null;
            if (runnable.length > 0) {
                slangSession.loadModuleFromSource(playgroundSource, "playground", "/playground.slang");
            }
            module = slangSession.loadModuleFromSource(shaderSource, "user", "/user.slang");
            if (!module) {
                const error = this.slangWasmModule.getLastError();
                console.error(error.type + " error: " + error.message);
                return result;
            }

            const count = module.getDefinedEntryPointCount();
            for (let i = 0; i < count; i++) {
                const entryPoint = module.getDefinedEntryPoint(i);
                result.push(entryPoint.getName());
            }
        } catch (e) {
            return [];
        }
        finally {
            if (slangSession)
                slangSession.delete();
        }
        result.push(...runnable);
        return result;
    }

    // If user entrypoint name imageMain or printMain, we will load the pre-built main modules because they
    // are defined in those modules. Otherwise, we will only need to load the user module and find the entry
    // point in the user module.
    isRunnableEntryPoint(entryPointName: string): entryPointName is RunnableShaderType {
        return RUNNABLE_ENTRY_POINT_NAMES.includes(entryPointName as any);
    }

    // Since we will not let user to change the entry point code, we can precompile the entry point module
    // and reuse it for every compilation.

    compileEntryPointModule(slangSession: Session, moduleName: string) {
        let source = this.mainModules.get(moduleName)?.source;
        if (source == undefined) {
            throw new Error(`Could not get module ${moduleName}`);
        }
        let module: Module | null = slangSession.loadModuleFromSource(source, moduleName, '/' + moduleName + '.slang');

        if (!module) {
            const error = this.slangWasmModule.getLastError();
            console.error(error.type + " error: " + error.message);
            this.diagnosticsMsg += (error.type + " error: " + error.message);
            return null;
        }

        // we use the same entry point name as module name
        let entryPoint = this.findEntryPoint(module, moduleName, SlangCompiler.SLANG_STAGE_COMPUTE);
        if (!entryPoint)
            return null;

        return { module: module, entryPoint: entryPoint };

    }

    getPrecompiledProgram(slangSession: Session, moduleName: string) {
        if (!this.isRunnableEntryPoint(moduleName))
            return null;

        let mainModule = this.compileEntryPointModule(slangSession, moduleName);

        this.shaderType = moduleName;
        return mainModule;
    }

    addActiveEntryPoints(slangSession: Session, shaderSource: string, entryPointName: string, isWholeProgram: boolean, userModule: Module, componentList: Module[]) {
        if (entryPointName == "" && !isWholeProgram) {
            this.diagnosticsMsg += ("error: No entry point specified");
            return false;
        }

        // For now, we just don't allow user to define imageMain or printMain as entry point name for simplicity
        const count = userModule.getDefinedEntryPointCount();
        for (let i = 0; i < count; i++) {
            const name = userModule.getDefinedEntryPoint(i).getName();
            if (this.isRunnableEntryPoint(name)) {
                this.diagnosticsMsg += `error: Entry point name ${name} is reserved`;
                return false;
            }
        }

        // If entry point is provided, we know for sure this is not a whole program compilation,
        // so we will just go to find the correct module to include in the compilation.
        if (entryPointName != "" && !isWholeProgram) {
            if (this.isRunnableEntryPoint(entryPointName)) {
                // we use the same entry point name as module name
                const mainProgram = this.getPrecompiledProgram(slangSession, entryPointName);
                if (!mainProgram)
                    return false;

                this.shaderType = entryPointName;

                componentList.push(mainProgram.module);
                componentList.push(mainProgram.entryPoint);
            }
            else {
                // we know the entry point is from user module
                const entryPoint = this.findEntryPoint(userModule, entryPointName, SlangCompiler.SLANG_STAGE_COMPUTE);
                if (!entryPoint)
                    return false;

                componentList.push(entryPoint);
            }
        }
        // otherwise, it's a whole program compilation, we will find all active entry points in the user code
        // and pre-built modules.
        else {
            const results = this.findDefinedEntryPoints(shaderSource);
            for (let i = 0; i < results.length; i++) {
                if (this.isRunnableEntryPoint(results[i])) {
                    const mainProgram = this.getPrecompiledProgram(slangSession, results[i]);
                    if (!mainProgram)
                        return false;
                    componentList.push(mainProgram.module);
                    componentList.push(mainProgram.entryPoint);
                    return true;
                }
                else {
                    const entryPoint = this.findEntryPoint(userModule, results[i], SlangCompiler.SLANG_STAGE_COMPUTE);
                    if (!entryPoint)
                        return false;

                    componentList.push(entryPoint);
                }
            }
        }
        return true;
    }

    getBindingDescriptor(index: number, programReflection: ProgramLayout, parameter: VariableLayoutReflection): BindingDescriptor | null {
        const globalLayout = programReflection.getGlobalParamsTypeLayout();

        if (globalLayout == null) {
            throw new Error("Could not get layout");
        }

        const bindingType = globalLayout.getDescriptorSetDescriptorRangeType(0, index);

        // Special case.. TODO: Remove this as soon as the reflection API properly reports write-only textures.
        if (parameter.getName() == "outputTexture") {
            return { storageTexture: { access: "write-only", format: "rgba8unorm" } };
        }

        if (bindingType == this.slangWasmModule.BindingType.Texture) {
            return { texture: {} };
        }
        else if (bindingType == this.slangWasmModule.BindingType.MutableTexture) {
            return { storageTexture: { access: "read-write", format: "r32float" } };
        }
        else if (bindingType == this.slangWasmModule.BindingType.ConstantBuffer) {
            return { buffer: { type: 'uniform' } };
        }
        else if (bindingType == this.slangWasmModule.BindingType.MutableTypedBuffer) {
            return { buffer: { type: 'storage' } };
        }
        else if (bindingType == this.slangWasmModule.BindingType.MutableRawBuffer) {
            return { buffer: { type: 'storage' } };
        }
        return null;
    }

    getResourceBindings(linkedProgram: ComponentType): Bindings {
        const reflection: ProgramLayout | null = linkedProgram.getLayout(0); // assume target-index = 0

        if (reflection == null) {
            throw new Error("Could not get reflection!");
        }

        const count = reflection.getParameterCount();

        let resourceDescriptors = new Map();
        for (let i = 0; i < count; i++) {
            const parameter = reflection.getParameterByIndex(i);
            if (parameter == null) {
                throw new Error("Invalid state!");
            }
            const name = parameter.getName();
            let binding = {
                binding: parameter.getBindingIndex(),
                visibility: GPUShaderStage.COMPUTE,
            };

            const resourceInfo = this.getBindingDescriptor(parameter.getBindingIndex(), reflection, parameter);

            // extend binding with resourceInfo
            if (resourceInfo)
                Object.assign(binding, resourceInfo);

            resourceDescriptors.set(name, binding);
        }

        return resourceDescriptors;
    }

    loadModule(slangSession: Session, moduleName: string, source: string, componentTypeList: Module[]) {
        let module: Module | null = slangSession.loadModuleFromSource(source, moduleName, "/" + moduleName + ".slang");
        if (!module) {
            const error = this.slangWasmModule.getLastError();
            console.error(error.type + " error: " + error.message);
            this.diagnosticsMsg += (error.type + " error: " + error.message);
            return false;
        }
        componentTypeList.push(module);
        return true;
    }

    compile(shaderSource: string, entryPointName: string, compileTargetStr: string, noWebGPU: boolean): null | [string, Bindings, any, ReflectionJSON, { [key: string]: ThreadGroupSize }] {
        this.diagnosticsMsg = "";

        let shouldLinkPlaygroundModule = RUNNABLE_ENTRY_POINT_NAMES.some((entry_point) => shaderSource.match(entry_point) != null);

        const compileTarget = this.findCompileTarget(compileTargetStr);
        let isWholeProgram = isWholeProgramTarget(compileTargetStr);

        if (!compileTarget) {
            this.diagnosticsMsg = "unknown compile target: " + compileTargetStr;
            return null;
        }

        try {
            if (this.globalSlangSession == null) {
                throw new Error("Slang session not available. Maybe the compiler hasn't been initialized yet?");
            }
            let slangSession = this.globalSlangSession.createSession(compileTarget);
            if (!slangSession) {
                let error = this.slangWasmModule.getLastError();
                console.error(error.type + " error: " + error.message);
                this.diagnosticsMsg += (error.type + " error: " + error.message);
                return null;
            }

            let components: Module[] = [];

            let userModuleIndex = 0;
            if (shouldLinkPlaygroundModule) {
                if (!this.loadModule(slangSession, "playground", playgroundSource, components))
                    return null;
                userModuleIndex++;
            }
            if (!this.loadModule(slangSession, "user", shaderSource, components))
                return null;
            if (this.addActiveEntryPoints(slangSession, shaderSource, entryPointName, isWholeProgram, components[userModuleIndex], components) == false)
                return null;
            let program: ComponentType = slangSession.createCompositeComponentType(components);
            let linkedProgram: ComponentType = program.link();
            let hashedStrings = linkedProgram.loadStrings();

            let outCode: string;
            if (compileTargetStr == "SPIRV") {
                const spirvCode = linkedProgram.getTargetCodeBlob(
                    0 /* targetIndex */
                );
                outCode = this.spirvDisassembly(spirvCode);
            }
            else {
                if (isWholeProgram)
                    outCode = linkedProgram.getTargetCode(0);
                else
                    outCode = linkedProgram.getEntryPointCode(
                        0 /* entryPointIndex */, 0 /* targetIndex */);
            }

            let bindings = noWebGPU?new Map():this.getResourceBindings(linkedProgram);

            let reflectionJson: ReflectionJSON = linkedProgram.getLayout(0)?.toJsonObject();

            // remove incorrect uniform bindings
            let has_uniform_been_binded = false;
            for(let parameterReflection of reflectionJson.parameters) {
                if (parameterReflection.binding.kind != "uniform") continue;
                
                if(!has_uniform_been_binded) {
                    has_uniform_been_binded = true;
                } else {
                    bindings.delete(parameterReflection.name);
                }
            }

            // Also read the shader work-group sizes.
            let threadGroupSize: { [key: string]: ThreadGroupSize } = {};
            const layout = linkedProgram.getLayout(0);
            if (layout) {
                const entryPoints = this.findDefinedEntryPoints(shaderSource);
                for (const name of entryPoints) {
                    const entryPointReflection = layout.findEntryPointByName(name);
                    threadGroupSize[name] = entryPointReflection ? entryPointReflection.getComputeThreadGroupSize() :
                        { x: 1, y: 1, z: 1 } as ThreadGroupSize;
                }
            }

            if (outCode == "") {
                let error = this.slangWasmModule.getLastError();
                console.error(error.type + " error: " + error.message);
                this.diagnosticsMsg += (error.type + " error: " + error.message);
                return null;
            }

            if (slangSession)
                slangSession.delete();
            if (!outCode || outCode == "")
                return null;

            return [outCode, bindings, hashedStrings, reflectionJson, threadGroupSize];
        } catch (e) {
            console.error(e);
            // typescript is missing the type for WebAssembly.Exception
            if (typeof e === 'object' && e !== null && e.constructor.name === 'Exception') {
                this.diagnosticsMsg += "Slang internal error occurred.\n";
            } else if (e instanceof Error) {
                this.diagnosticsMsg += e.message;
            }
            return null;
        }
    }
};
