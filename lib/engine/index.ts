/**
 * WGPU Compute Toy Library
 * TypeScript port of the Rust compute-toys project
 */

import { Mutex } from 'async-mutex';
import { Bindings } from './bind';
import { Blitter, ColorSpace } from './blit';
import { loadHDR } from './hdr';
import { Preprocessor, SourceMap } from './preprocessor';
import { Profiler } from './profiler';
import { countNewlines } from './utils';

// Regular expression for parsing compute shader entry points
const RE_ENTRY_POINT = /@compute[^@]*?@workgroup_size\((.*?)\)[^@]*?fn\s+(\w+)/g;
type Point = { x: number; y: number };

/**
 * Information about a compute pipeline
 */
interface ComputePipeline {
    name: string;
    workgroupSize: [number, number, number];
    workgroupCount?: [number, number, number];
    dispatchCount: number;
    passDescs: GPUComputePassDescriptor[];
    pipeline: GPUComputePipeline;
}

/**
 * Core renderer class for compute toy
 */
export class ComputeEngine {
    private static instance: ComputeEngine | null = null;

    public device: GPUDevice;

    private surface: GPUCanvasContext;
    private screenWidth: number;
    private screenHeight: number;

    private bindings: Bindings;
    private computePipelineLayout: GPUPipelineLayout;
    private lastComputePipelines?: ComputePipeline[];
    private computePipelines: ComputePipeline[] = [];
    private computeBindGroup: GPUBindGroup;
    private computeBindGroupLayout: GPUBindGroupLayout;
    private onSuccessCb?: (entryPoints: string[]) => void;
    private onUpdateCb?: (entryTimers: string[]) => void;
    private onErrorCb?: (summary: string, row: number, col: number) => void;
    private passF32: boolean = false;
    private profilerAttached: boolean = false;
    private profiler: Profiler | null = null;
    private screenBlitter: Blitter;
    //private lastStats: number = performance.now();
    // private source: SourceMap;

    private compileMutex = new Mutex();

    // static readonly STATS_PERIOD = 100;
    // static readonly ASSERTS_SIZE = 40; // NUM_ASSERT_COUNTERS * 4

    private static shaderError = false;

    /**
     * Create a new renderer instance
     */
    private constructor(device: GPUDevice) {
        this.device = device;
    }

    /**
     * Factory method to create a new renderer
     */
    public static async create(): Promise<void> {
        // Initialize WebGPU adapter and device
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });
        if (!adapter) {
            throw new Error('No appropriate GPUAdapter found');
        }

        const device = await adapter.requestDevice({
            label: `compute.toys device created at ${new Date().toLocaleTimeString()}`,
            requiredFeatures: [...adapter.features] as GPUFeatureName[]
        });

        if (ComputeEngine.instance) {
            console.log('Destroying existing engine');
            ComputeEngine.instance.device.destroy();
        }
        ComputeEngine.instance = new ComputeEngine(device);
        console.log('WebGPU engine created.');
        console.log('You can check your device features: https://webgpureport.org');
    }

    /**
     * Get the current renderer instance
     */
    public static getInstance(): ComputeEngine {
        if (!ComputeEngine.instance) {
            throw new Error('WebGPU engine not initialised');
        }
        return ComputeEngine.instance;
    }

    public setSurface(canvas: HTMLCanvasElement) {
        const context = canvas.getContext('webgpu');
        if (!context) {
            throw new Error('WebGPU not supported');
        }
        this.surface = context;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        this.surface.configure({
            device: this.device,
            format: presentationFormat,
            alphaMode: 'opaque',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            viewFormats: [presentationFormat]
        });
    }

    /**
     * Get the prelude code for Slang
     */
    public getSlangPrelude(): string {
        let prelude = 'public struct Custom {\n';
        const [customNames] = this.bindings.custom.host;
        for (const name of customNames) {
            prelude += `    public float ${name};\n`;
        }
        prelude += '};\n';
        prelude += 'public ParameterBlock<Custom> custom;\n\n';
        prelude +=
            'public static const int2 SCREEN_SIZE = int2(' +
            this.screenWidth +
            ', ' +
            this.screenHeight +
            ');\n\n';
        return prelude;
    }

    /**
     * Get the prelude code that's added to all shaders
     */
    public getPrelude(): string {
        let prelude = '';

        // Add type aliases
        for (const [alias, type] of [
            ['int', 'i32'],
            ['uint', 'u32'],
            ['float', 'f32']
        ]) {
            prelude += `alias ${alias} = ${type};\n`;
        }

        // Vector type aliases
        for (const [alias, type] of [
            ['int', 'i32'],
            ['uint', 'u32'],
            ['float', 'f32'],
            ['bool', 'bool']
        ]) {
            for (let n = 2; n < 5; n++) {
                prelude += `alias ${alias}${n} = vec${n}<${type}>;\n`;
            }
        }

        // Matrix type aliases
        for (let n = 2; n < 5; n++) {
            for (let m = 2; m < 5; m++) {
                prelude += `alias float${n}x${m} = mat${n}x${m}<f32>;\n`;
            }
        }

        // Add struct definitions
        prelude += `
struct Time {
    elapsed: f32,
    delta: f32,
    frame: u32
}
struct Mouse {
    pos: vec2i,
    zoom: f32,
    click: i32,
    start: vec2i,
    delta: vec2i
}
struct DispatchInfo {
    id: u32
}
`;

        // Add custom uniforms struct
        prelude += 'struct Custom {\n';
        const [customNames] = this.bindings.custom.host;
        for (const name of customNames) {
            prelude += `    ${name}: float,\n`;
        }
        prelude += '};\n';

        // Add user data struct
        // prelude += 'struct Data {\n';
        // for (const [key, value] of this.bindings.userData.host) {
        //     prelude += `    ${key}: array<u32,${value.length}>,\n`;
        // }
        // prelude += '};\n';

        // Add bindings
        prelude += this.bindings.toWGSL();

        // Add utility functions
        prelude += `
fn keyDown(keycode: uint) -> bool {
    return ((_keyboard[keycode / 128u][(keycode % 128u) / 32u] >> (keycode % 32u)) & 1u) == 1u;
}

fn assert(index: int, success: bool) {
    if (!success) {
        // atomicAdd(&_assert_counts[index], 1u);
    }
}

fn passStore(pass_index: int, coord: int2, value: float4) {
    textureStore(pass_out, coord, pass_index, value);
}

fn passLoad(pass_index: int, coord: int2, lod: int) -> float4 {
    return textureLoad(pass_in, coord, pass_index, lod);
}
`;

        // Add pass sampling function
        prelude += `
fn passSampleLevelBilinearRepeat(pass_index: int, uv: float2, lod: float) -> float4 {`;

        if (this.passF32) {
            // Manual bilinear filtering for f32 textures
            prelude += `
    let res = float2(textureDimensions(pass_in));
    let st = uv * res - 0.5;
    let iuv = floor(st);
    let fuv = fract(st);
    let a = textureSampleLevel(pass_in, nearest, fract((iuv + float2(0.5,0.5)) / res), pass_index, lod);
    let b = textureSampleLevel(pass_in, nearest, fract((iuv + float2(1.5,0.5)) / res), pass_index, lod);
    let c = textureSampleLevel(pass_in, nearest, fract((iuv + float2(0.5,1.5)) / res), pass_index, lod);
    let d = textureSampleLevel(pass_in, nearest, fract((iuv + float2(1.5,1.5)) / res), pass_index, lod);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);`;
        } else {
            // Hardware filtering for f16 textures
            prelude += `
    return textureSampleLevel(pass_in, bilinear, fract(uv), pass_index, lod);`;
        }
        prelude += '\n}';

        return prelude;
    }

    /**
     * Preprocess shader source code
     */
    async preprocess(shader: string): Promise<SourceMap> {
        const defines = new Map<string, string>([
            ['SCREEN_WIDTH', this.screenWidth.toString()],
            ['SCREEN_HEIGHT', this.screenHeight.toString()]
        ]);

        return new Preprocessor(defines).preprocess(shader);
    }

    /**
     * Compile preprocessed shader code
     */
    async compile(source: SourceMap): Promise<void> {
        const release = await this.compileMutex.acquire();
        const start = performance.now();
        const prelude = source.extensions + this.getPrelude();
        const preludeLines = countNewlines(prelude);
        const wgsl = prelude + source.source;

        // Parse entry points
        const entryPoints: Array<[string, [number, number, number]]> = [];
        const entryPointCode = Preprocessor.stripComments(wgsl);
        let match;

        while ((match = RE_ENTRY_POINT.exec(entryPointCode)) !== null) {
            const [, sizeStr, name] = match;
            const sizes = sizeStr.split(',').map(s => parseInt(s.trim(), 10));
            entryPoints.push([name, [sizes[0] || 1, sizes[1] || 1, sizes[2] || 1]]);
        }

        // Notify success callback
        const entryPointNames = entryPoints.map(([name]) => name);
        this.onSuccessCb?.(entryPointNames);

        // Create shader module
        const shaderModule = this.device.createShaderModule({
            label: 'Compute shader',
            code: wgsl
        });

        const compilationInfo = await shaderModule.getCompilationInfo();
        for (const message of compilationInfo.messages) {
            let row = message.lineNum;
            if (row >= preludeLines) {
                row -= preludeLines;
            }
            if (row < source.map.length) {
                row = source.map[row];
            }
            if (message.type === 'error') {
                this.onErrorCb?.(message.message, row, message.linePos);
            } else if (message.type === 'warning') {
                console.warn(message.message);
            } else {
                console.log(message.message);
            }
        }

        // Create compute pipelines
        if (this.lastComputePipelines) {
            this.computePipelines = this.lastComputePipelines;
        }
        this.lastComputePipelines = this.computePipelines;

        if (this.profilerAttached) {
            if (this.profiler) {
                await this.profiler.dispose();
            }
            this.profiler = new Profiler(entryPointNames, source.dispatchCount, this.device);
        }

        this.computePipelines = entryPoints.map(([name, workgroupSize], id) => {
            let passDescs = Array.from({ length: source.dispatchCount.get(name) || 1 }, () => ({}));
            passDescs = this.profiler?.fillPassDescriptors(passDescs, id) || passDescs;
            return {
                name,
                workgroupSize,
                workgroupCount: source.workgroupCount.get(name),
                dispatchCount: source.dispatchCount.get(name) ?? 1,
                passDescs: passDescs,
                pipeline: this.device.createComputePipeline({
                    label: `Pipeline ${name}`,
                    layout: this.computePipelineLayout,
                    compute: {
                        module: shaderModule,
                        entryPoint: name
                    }
                })
            };
        });

        // Update bindings
        // this.bindings.userData.host = source.userData;

        // this.source = source;

        console.log(`Shader compiled in ${(performance.now() - start).toFixed(2)}ms`);
        release();
    }

    /**
     * Main render function
     */
    async render(): Promise<void> {
        if (this.compileMutex.isLocked()) {
            return;
        }
        try {
            const encoder = this.device.createCommandEncoder();

            // Update bindings
            this.bindings.stage(this.device.queue);

            // Clear debug buffer periodically
            // if (this.bindings.time.host.frame % WgpuToyRenderer.STATS_PERIOD === 0) {
            //     this.device.queue.writeBuffer(
            //         this.bindings.debugBuffer.device,
            //         0,
            //         new Uint32Array(40) // NUM_ASSERT_COUNTERS * 4
            //     );

            //     if (this.bindings.time.host.frame > 0) {
            //         const mean =
            //             (performance.now() - this.lastStats) / WgpuToyRenderer.STATS_PERIOD;
            //         this.lastStats = performance.now();
            //         console.log(`${(1000 / mean).toFixed(1)} fps (${mean.toFixed(1)} ms)`);
            //     }
            // }

            // Handle shader errors
            if (ComputeEngine.shaderError) {
                ComputeEngine.shaderError = false;
                if (this.lastComputePipelines) {
                    this.computePipelines = this.lastComputePipelines;
                }
            }

            // Dispatch compute passes
            let dispatchId = 0;
            for (const pipeline of this.computePipelines) {
                const dispatchOnce =
                    pipeline.dispatchCount === 0 && this.bindings.time.host.frame === 0 ? 1 : 0;

                for (let i = 0; i < pipeline.dispatchCount + dispatchOnce; i++) {
                    const pass = encoder.beginComputePass(pipeline.passDescs[i]);

                    const workgroupCount = pipeline.workgroupCount ?? [
                        Math.ceil(this.screenWidth / pipeline.workgroupSize[0]),
                        Math.ceil(this.screenHeight / pipeline.workgroupSize[1]),
                        1
                    ];

                    // Update dispatch info
                    this.device.queue.writeBuffer(
                        this.bindings.dispatchInfo.device,
                        dispatchId * 256,
                        new Uint32Array([i])
                    );

                    pass.setPipeline(pipeline.pipeline);
                    pass.setBindGroup(0, this.computeBindGroup, [dispatchId * 256]);
                    pass.dispatchWorkgroups(...workgroupCount);
                    pass.end();

                    // Copy write texture to read texture
                    encoder.copyTextureToTexture(
                        { texture: this.bindings.texWrite.texture() },
                        { texture: this.bindings.texRead.texture() },
                        {
                            width: this.screenWidth,
                            height: this.screenHeight,
                            depthOrArrayLayers: 4
                        }
                    );

                    dispatchId++;
                }
            }

            // Blit to screen
            this.screenBlitter.blit(encoder, this.surface.getCurrentTexture().createView());

            // Submit command buffer
            this.profiler?.beforeFinish(encoder);
            this.device.queue.submit([encoder.finish()]);
            this.profiler?.afterFinish(this.onUpdateCb);

            // Update frame counter
            this.bindings.time.host.frame += 1;
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Set success callback for shader compilation
     */
    onSuccess(callback: (entryPoints: string[]) => void): void {
        this.onSuccessCb = callback;
    }
    onUpdate(callback: (entryTimers: string[]) => void): void {
        this.onUpdateCb = callback;
    }
    onError(callback: (summary: string, row: number, col: number) => void): void {
        this.onErrorCb = callback;
    }

    /**
     * Update time information
     */
    setTimeElapsed(time: number): void {
        this.bindings.time.host.elapsed = time;
    }
    setTimeDelta(delta: number): void {
        this.bindings.time.host.delta = delta;
    }

    /**
     * Update mouse state
     */
    setMousePos(p: Point): void {
        this.bindings.mouse.host.pos.x = p.x;
        this.bindings.mouse.host.pos.y = p.y;
    }
    setMouseZoom(zoom: number): void {
        this.bindings.mouse.host.zoom = zoom;
    }
    setMouseClick(click: number): void {
        this.bindings.mouse.host.click = click;
    }
    setMouseStart(s: Point): void {
        this.bindings.mouse.host.start.x = s.x;
        this.bindings.mouse.host.start.y = s.y;
    }
    setMouseDelta(dx: number, dy: number): void {
        this.bindings.mouse.host.delta.x = dx;
        this.bindings.mouse.host.delta.y = dy;
    }
    getMousePos(): Point {
        return this.bindings.mouse.host.pos;
    }

    /**
     * Update keyboard state
     */
    setKeydown(keycode: number, keydown: boolean): void {
        this.bindings.keys.host.set(keycode, keydown);
    }

    /**
     * Set custom float parameters
     */
    setCustomFloats(names: string[], values: Float32Array): void {
        this.bindings.custom.host = [names, new Float32Array(values)];
    }

    /**
     * Set pass texture format
     */
    setPassF32(passF32: boolean): void {
        this.passF32 = passF32;
        // this.reset();
    }

    /**
     * Set profiler state
     */
    async setProfilerAttached(isEnabled: boolean): Promise<void> {
        if (!isEnabled && this.profiler) {
            return new Promise<void>(resolve => {
                this.profiler?.dispose().then(() => {
                    this.profiler = null;
                    this.profilerAttached = false;
                    resolve();
                });
            });
        }
        this.profilerAttached = isEnabled;
        return Promise.resolve();
    }

    /**
     * Handle window resize
     */
    resize(width: number, height: number): void {
        this.screenWidth = Math.floor(width);
        this.screenHeight = Math.floor(height);

        // this.surface.configure(this.surfaceConfig);

        // this.reset();
    }

    /**
     * Reset renderer state
     */
    reset(): void {
        // Save old channels and custom data
        const oldChannels = this.bindings?.channels;
        const oldCustom = this.bindings?.custom;

        // Dispose old buffers and textures, preserving channels and custom data
        this.dispose({ preserveChannels: true, preserveCustom: true });

        // Create new bindings with current settings
        this.bindings = new Bindings(
            this.device,
            this.screenWidth,
            this.screenHeight,
            this.passF32
        );

        // Copy channels and custom data directly
        if (oldChannels) {
            this.bindings.channels = oldChannels;
        }
        if (oldCustom) {
            this.bindings.custom = oldCustom;
        }

        // Recreate pipeline and binding group layouts
        const layout = this.bindings.createBindGroupLayout(this.device);
        this.computePipelineLayout = this.bindings.createPipelineLayout(this.device, layout);
        this.computeBindGroup = this.bindings.createBindGroup(this.device, layout);
        this.computeBindGroupLayout = layout;

        // Recreate screen blitter
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        this.screenBlitter = new Blitter(
            this.device,
            this.bindings.texScreen.view,
            ColorSpace.Linear,
            presentationFormat,
            'linear'
        );
    }

    /**
     * Load texture into channel
     */
    async loadChannel(index: number, data: Uint8Array): Promise<{ width: number; height: number }> {
        const start = performance.now();

        // Create ImageBitmap from data
        const imageBitmap = await createImageBitmap(new Blob([data]), {
            premultiplyAlpha: 'none',
            colorSpaceConversion: 'none'
        });

        // Create initial texture
        const initialTexture = this.device.createTexture({
            size: {
                width: imageBitmap.width,
                height: imageBitmap.height,
                depthOrArrayLayers: 1
            },
            format: 'rgba8unorm-srgb',
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT
        });

        // Copy image data to texture
        this.device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: initialTexture },
            {
                width: imageBitmap.width,
                height: imageBitmap.height,
                depthOrArrayLayers: 1
            }
        );

        // Generate mipmap chain
        const blitter = new Blitter(
            this.device,
            initialTexture.createView(),
            ColorSpace.Linear,
            'rgba8unorm-srgb',
            'linear'
        );

        // Create final texture with mipmaps for channel textures
        const finalTexture = blitter.createMipmappedTexture(
            this.device,
            this.device.queue,
            imageBitmap.width,
            imageBitmap.height,
            1 + Math.floor(Math.log2(Math.max(imageBitmap.width, imageBitmap.height)))
        );

        // Update channel texture
        this.bindings.channels[index].setTexture(finalTexture);

        // Recreate bind group since we changed a texture
        this.computeBindGroup = this.bindings.createBindGroup(
            this.device,
            this.computeBindGroupLayout
        );

        // Destroy initial texture
        initialTexture.destroy();

        console.log(`Channel ${index} loaded in ${(performance.now() - start).toFixed(2)}ms`);

        // Return dimensions
        return { width: imageBitmap.width, height: imageBitmap.height };
    }

    /**
     * Load HDR texture into channel
     */
    async loadChannelHDR(
        index: number,
        data: Uint8Array
    ): Promise<{ width: number; height: number }> {
        const start = performance.now();

        // Load HDR data
        const { rgbe, width, height } = loadHDR(data);

        // Create RGBE texture
        const initialTexture = this.device.createTexture({
            size: {
                width,
                height,
                depthOrArrayLayers: 1
            },
            mipLevelCount: 1,
            sampleCount: 1,
            dimension: '2d',
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });

        // Copy RGBE data to texture
        this.device.queue.writeTexture(
            { texture: initialTexture },
            rgbe,
            {
                offset: 0,
                bytesPerRow: 4 * width,
                rowsPerImage: height
            },
            {
                width,
                height,
                depthOrArrayLayers: 1
            }
        );

        // Convert RGBE to float texture and generate mipmap chain
        const blitter = new Blitter(
            this.device,
            initialTexture.createView(),
            ColorSpace.Rgbe,
            'rgba16float',
            'linear'
        );

        const finalTexture = blitter.createMipmappedTexture(
            this.device,
            this.device.queue,
            width,
            height,
            1 + Math.floor(Math.log2(Math.max(width, height)))
        );

        // Update channel texture
        this.bindings.channels[index].setTexture(finalTexture);

        // Recreate bind group since we changed a texture
        this.computeBindGroup = this.bindings.createBindGroup(
            this.device,
            this.computeBindGroupLayout
        );

        // Destroy initial texture
        initialTexture.destroy();

        console.log(`Channel ${index} loaded in ${(performance.now() - start).toFixed(2)}ms`);

        // Return dimensions
        return { width, height };
    }

    /**
     * Cleanup method to dispose all resources
     */
    dispose(options?: { preserveChannels?: boolean; preserveCustom?: boolean }): void {
        // Destroy all buffers and textures
        this.bindings?.dispose(options);

        // Destroy the profiler
        this.profiler?.dispose();
    }
}
