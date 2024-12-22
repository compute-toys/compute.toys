/**
 * WGPU Compute Toy Library
 * TypeScript port of the Rust compute-toys project
 */

import { Bindings } from './bind';
import { Blitter, ColorSpace } from './blit';
import { WgpuContext } from './context';
import { Preprocessor, SourceMap } from './preprocessor';
import { WGSLError, countNewlines } from './utils';

// Regular expression for parsing compute shader entry points
const RE_ENTRY_POINT = /@compute[^@]*?@workgroup_size\((.*?)\)[^@]*?fn\s+(\w+)/g;

/**
 * Information about a compute pipeline
 */
interface ComputePipeline {
    name: string;
    workgroupSize: [number, number, number];
    workgroupCount?: [number, number, number];
    dispatchOnce: boolean;
    dispatchCount: number;
    pipeline: GPUComputePipeline;
}

/**
 * Core renderer class for compute toy
 */
export class WgpuToyRenderer {
    private wgpu: WgpuContext;
    private screenWidth: number;
    private screenHeight: number;
    private bindings: Bindings;
    private computePipelineLayout: GPUPipelineLayout;
    private lastComputePipelines?: ComputePipeline[];
    private computePipelines: ComputePipeline[] = [];
    private computeBindGroup: GPUBindGroup;
    private computeBindGroupLayout: GPUBindGroupLayout;
    private onSuccessCb?: (entryPoints: string[]) => void;
    private passF32: boolean;
    private screenBlitter: Blitter;
    private querySet?: GPUQuerySet;
    private lastStats: number = performance.now();
    private source: SourceMap;

    static readonly STATS_PERIOD = 100;
    static readonly ASSERTS_SIZE = 40; // NUM_ASSERT_COUNTERS * 4

    private static shaderError = false;

    /**
     * Create a new renderer instance
     */
    constructor(wgpu: WgpuContext) {
        this.wgpu = wgpu;
        this.screenWidth = wgpu.width;
        this.screenHeight = wgpu.height;
        this.passF32 = false;

        // Initialize bindings
        this.bindings = new Bindings(this.wgpu, this.screenWidth, this.screenHeight, this.passF32);

        // Set up pipeline and bind group layouts
        this.computeBindGroupLayout = this.bindings.createBindGroupLayout(wgpu.device);
        this.computePipelineLayout = this.bindings.createPipelineLayout(
            wgpu.device,
            this.computeBindGroupLayout
        );
        this.computeBindGroup = this.bindings.createBindGroup(
            wgpu.device,
            this.computeBindGroupLayout
        );

        // Set up screen blitting
        this.screenBlitter = new Blitter(
            wgpu.device,
            this.bindings.texScreen.view,
            ColorSpace.Linear,
            wgpu.surfaceConfig.format,
            'nearest'
        );

        this.source = new SourceMap();
    }

    /**
     * Factory method to create a new renderer
     */
    static async create(
        width: number,
        height: number,
        canvas: HTMLCanvasElement
    ): Promise<WgpuToyRenderer> {
        const wgpu = await WgpuContext.init(width, height, canvas);
        return new WgpuToyRenderer(wgpu);
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
struct Time { frame: uint, elapsed: float, delta: float }
struct Mouse { pos: uint2, click: int }
struct DispatchInfo { id: uint }
`;

        // Add custom uniforms struct
        prelude += 'struct Custom {\n';
        const [customNames] = this.bindings.custom.host;
        for (const name of customNames) {
            prelude += `    ${name}: float,\n`;
        }
        prelude += '};\n';

        // Add user data struct
        prelude += 'struct Data {\n';
        for (const [key, value] of this.bindings.userData.host) {
            prelude += `    ${key}: array<u32,${value.length}>,\n`;
        }
        prelude += '};\n';

        // Add bindings
        prelude += this.bindings.toWGSL();

        // Add utility functions
        prelude += `
fn keyDown(keycode: uint) -> bool {
    return ((_keyboard[keycode / 128u][(keycode % 128u) / 32u] >> (keycode % 32u)) & 1u) == 1u;
}

fn assert(index: int, success: bool) {
    if (!success) {
        atomicAdd(&_assert_counts[index], 1u);
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
    async preprocess(shader: string): Promise<SourceMap | undefined> {
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
        const start = performance.now();
        const prelude = source.extensions + this.getPrelude();
        const preludeLines = countNewlines(prelude);

        // Set up error handling
        this.wgpu.device.onuncapturederror = (ev: GPUUncapturedErrorEvent): void => {
            const error = ev.error;
            const message = error.message;

            // Extract line and column from error message
            const match = message.match(/:(\d+):(\d+)\s*(.*)/);
            if (match) {
                const [, rawLine, column, summary] = match;
                let line = parseInt(rawLine, 10);

                // Adjust line number for prelude
                if (line >= preludeLines) {
                    line -= preludeLines;
                }

                // Map to original source line
                if (line < source.map.length) {
                    line = source.map[line];
                }

                const error = new WGSLError(summary, line, parseInt(column, 10));
                console.error(error.toString());
                WgpuToyRenderer.shaderError = true;
            } else {
                console.error(message);
            }
        };

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

        console.log(wgsl);

        // Create shader module
        const shaderModule = this.wgpu.device.createShaderModule({
            label: 'Compute shader',
            code: wgsl
        });

        // Create compute pipelines
        if (this.lastComputePipelines) {
            this.computePipelines = this.lastComputePipelines;
        }
        this.lastComputePipelines = this.computePipelines;

        this.computePipelines = entryPoints.map(([name, workgroupSize]) => ({
            name,
            workgroupSize,
            workgroupCount: source.workgroupCount.get(name),
            dispatchOnce: source.dispatchOnce.get(name) ?? false,
            dispatchCount: source.dispatchCount.get(name) ?? 1,
            pipeline: this.wgpu.device.createComputePipeline({
                label: `Pipeline ${name}`,
                layout: this.computePipelineLayout,
                compute: {
                    module: shaderModule,
                    entryPoint: name
                }
            })
        }));

        // Update bindings
        this.bindings.userData.host = source.userData;

        console.log(`Shader compiled in ${(performance.now() - start).toFixed(2)}ms`);
        this.source = source;
    }

    /**
     * Main render function
     */
    async render(): Promise<void> {
        try {
            const textureView = this.wgpu.surface.getCurrentTexture().createView();

            const encoder = this.wgpu.device.createCommandEncoder();

            // Update bindings
            this.bindings.stage(this.wgpu.queue);

            // Clear debug buffer periodically
            if (this.bindings.time.host.frame % WgpuToyRenderer.STATS_PERIOD === 0) {
                this.wgpu.queue.writeBuffer(
                    this.bindings.debugBuffer.device,
                    0,
                    new Uint32Array(40) // NUM_ASSERT_COUNTERS * 4
                );

                if (this.bindings.time.host.frame > 0) {
                    const mean =
                        (performance.now() - this.lastStats) / WgpuToyRenderer.STATS_PERIOD;
                    this.lastStats = performance.now();
                    console.log(`${(1000 / mean).toFixed(1)} fps (${mean.toFixed(1)} ms)`);
                }
            }

            // Handle shader errors
            if (WgpuToyRenderer.shaderError) {
                WgpuToyRenderer.shaderError = false;
                if (this.lastComputePipelines) {
                    this.computePipelines = this.lastComputePipelines;
                }
            }

            // Dispatch compute passes
            // let dispatchCounter = 0;
            for (const pipeline of this.computePipelines) {
                if (!pipeline.dispatchOnce || this.bindings.time.host.frame === 0) {
                    for (let i = 0; i < pipeline.dispatchCount; i++) {
                        const pass = encoder.beginComputePass();

                        const workgroupCount = pipeline.workgroupCount ?? [
                            Math.ceil(this.screenWidth / pipeline.workgroupSize[0]),
                            Math.ceil(this.screenHeight / pipeline.workgroupSize[1]),
                            1
                        ];

                        // Update dispatch info
                        // this.wgpu.queue.writeBuffer(
                        //     this.bindings.dispatchInfo.buffer(),
                        //     dispatchCounter * 256,
                        //     new Uint32Array([i])
                        // );

                        pass.setPipeline(pipeline.pipeline);
                        pass.setBindGroup(0, this.computeBindGroup); //, [dispatchCounter * 256]);
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

                        // dispatchCounter++;
                    }
                }
            }

            // Blit to screen
            this.screenBlitter.blit(encoder, textureView);

            // Submit command buffer
            this.wgpu.queue.submit([encoder.finish()]);

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
    setMousePos(x: number, y: number): void {
        const mouse = this.bindings.mouse.host;
        if (mouse.click === 1) {
            mouse.pos = [Math.floor(x * this.screenWidth), Math.floor(y * this.screenHeight)];
            this.bindings.mouse.host = mouse;
        }
    }

    setMouseClick(click: boolean): void {
        const mouse = this.bindings.mouse.host;
        mouse.click = click ? 1 : 0;
        this.bindings.mouse.host = mouse;
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
        this.reset();
    }

    /**
     * Handle window resize
     */
    resize(width: number, height: number, scale: number): void {
        this.screenWidth = Math.floor(width * scale);
        this.screenHeight = Math.floor(height * scale);

        this.wgpu.width = this.screenWidth;
        this.wgpu.height = this.screenHeight;
        this.wgpu.surface.configure(this.wgpu.surfaceConfig);

        this.reset();
    }

    /**
     * Reset renderer state
     */
    reset(): void {
        // Create new bindings with current settings
        const newBindings = new Bindings(
            this.wgpu,
            this.screenWidth,
            this.screenHeight,
            this.passF32
        );

        // Copy over dynamic state
        newBindings.custom = this.bindings.custom;
        newBindings.userData = this.bindings.userData;
        newBindings.channels = this.bindings.channels;

        // Clean up old bindings
        // this.bindings.destroy();
        this.bindings = newBindings;

        // Recreate pipeline and binding group layouts
        const layout = this.bindings.createBindGroupLayout(this.wgpu.device);
        this.computePipelineLayout = this.bindings.createPipelineLayout(this.wgpu.device, layout);
        this.computeBindGroup = this.bindings.createBindGroup(this.wgpu.device, layout);
        this.computeBindGroupLayout = layout;

        // Recreate screen blitter
        this.screenBlitter = new Blitter(
            this.wgpu.device,
            this.bindings.texScreen.view,
            ColorSpace.Linear,
            this.wgpu.surfaceConfig.format,
            'linear'
        );
    }

    /**
     * Load texture into channel
     */
    async loadChannel(index: number, data: Uint8Array): Promise<void> {
        const start = performance.now();

        try {
            // Create ImageBitmap from data
            const blob = new Blob([data], { type: 'image/png' });
            const imageBitmap = await createImageBitmap(blob);

            // Create texture
            const texture = this.wgpu.device.createTexture({
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
            this.wgpu.device.queue.copyExternalImageToTexture(
                { source: imageBitmap },
                { texture },
                {
                    width: imageBitmap.width,
                    height: imageBitmap.height,
                    depthOrArrayLayers: 1
                }
            );

            // Update channel texture
            this.bindings.channels[index].setTexture(texture);

            // Recreate bind group since we changed a texture
            this.computeBindGroup = this.bindings.createBindGroup(
                this.wgpu.device,
                this.computeBindGroupLayout
            );

            console.log(`Channel ${index} loaded in ${(performance.now() - start).toFixed(2)}ms`);
        } catch (error) {
            console.error(`Error loading channel ${index}:`, error);
        }
    }

    /**
     * Load HDR texture into channel
     */
    async loadChannelHDR(index: number, data: Uint8Array): Promise<void> {
        // TODO: Implement HDR loading
        console.log('HDR loading not implemented', index, data);
    }
}
