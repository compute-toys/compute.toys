// WGSL shader for blit operations
const BLIT_SHADER = `
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) tex_coords: vec2<f32>
};

@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var out: VertexOutput;
    let x = i32(vertex_index) / 2;
    let y = i32(vertex_index) & 1;
    let tc = vec2<f32>(
        f32(x) * 2.0,
        f32(y) * 2.0
    );
    out.position = vec4<f32>(
        tc.x * 2.0 - 1.0,
        1.0 - tc.y * 2.0,
        0.0, 1.0
    );
    out.tex_coords = tc;
    return out;
}

@group(0) @binding(0) var r_color: texture_2d<f32>;
@group(0) @binding(1) var r_sampler: sampler;

fn srgb_to_linear(rgb: vec3<f32>) -> vec3<f32> {
    return select(
        pow((rgb + 0.055) * (1.0 / 1.055), vec3<f32>(2.4)),
        rgb * (1.0/12.92),
        rgb <= vec3<f32>(0.04045));
}

fn linear_to_srgb(rgb: vec3<f32>) -> vec3<f32> {
    return select(
        1.055 * pow(rgb, vec3(1.0 / 2.4)) - 0.055,
        rgb * 12.92,
        rgb <= vec3<f32>(0.0031308));
}

fn linear_to_displayp3(color: vec3f) -> vec3f {
    let linSRGB_to_linP3 = mat3x3f(
        vec3f(0.8224621, 0.0331941, 0.0170827), // Col 0
        vec3f(0.177538,  0.9668058, 0.0723974), // Col 1
        vec3f(0.0,       0.0,       0.9105199)  // Col 2
    );
    return linear_to_srgb(linSRGB_to_linP3 * color);
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return textureSample(r_color, r_sampler, in.tex_coords);
}

@fragment
fn fs_main_linear_to_srgb(in: VertexOutput) -> @location(0) vec4<f32> {
    let rgba = textureSample(r_color, r_sampler, in.tex_coords);
    return vec4<f32>(linear_to_srgb(rgba.rgb), rgba.a);
}

@fragment
fn fs_main_linear_to_displayp3(in: VertexOutput) -> @location(0) vec4<f32> {
    let rgba = textureSample(r_color, r_sampler, in.tex_coords);
    return vec4<f32>(linear_to_displayp3(rgba.rgb), rgba.a);
}

@fragment
fn fs_main_rgbe_to_linear(in: VertexOutput) -> @location(0) vec4<f32> {
    let rgbe = textureSample(r_color, r_sampler, in.tex_coords);
    return vec4<f32>(rgbe.rgb * exp2(rgbe.a * 255. - 128.), 1.);
}`;

/**
 * Represents different color space conversions
 */
export enum ColorSpace {
    Linear = 'linear',
    Rgbe = 'rgbe'
}

/**
 * Handles blitting operations between textures with color space conversion
 */
export class Blitter {
    private renderPipeline: GPURenderPipeline;
    private renderBindGroup: GPUBindGroup;
    private destFormat: GPUTextureFormat;

    private trackedTextures: GPUTexture[] = [];
    private bindGroupLayout: GPUBindGroupLayout;
    private shaderModule: GPUShaderModule;
    private sampler: GPUSampler;

    constructor(
        device: GPUDevice,
        src: GPUTextureView,
        srcSpace: ColorSpace,
        destFormat: GPUTextureFormat,
        filter: GPUFilterMode,
        fragmentEntry?: string
    ) {
        this.destFormat = destFormat;

        // Create shader module
        this.shaderModule = device.createShaderModule({
            label: 'Blit Shader',
            code: BLIT_SHADER
        });

        // Create bind group layout
        this.bindGroupLayout = device.createBindGroupLayout({
            label: 'Blit Bind Group Layout',
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'float',
                        viewDimension: '2d',
                        multisampled: false
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: filter === 'linear' ? 'filtering' : 'non-filtering'
                    }
                }
            ]
        });

        // Create pipeline layout
        const pipelineLayout = device.createPipelineLayout({
            label: 'Blit Pipeline Layout',
            bindGroupLayouts: [this.bindGroupLayout]
        });

        // Create sampler
        this.sampler = device.createSampler({
            minFilter: filter,
            magFilter: filter
        });

        // Create bind group
        this.renderBindGroup = device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: src
                },
                {
                    binding: 1,
                    resource: this.sampler
                }
            ]
        });

        // Determine fragment shader entry point based on color space conversion
        if (fragmentEntry === undefined) {
            fragmentEntry = this.getFragmentEntry(srcSpace, destFormat);
        }

        // Create render pipeline
        this.renderPipeline = device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: this.shaderModule,
                entryPoint: 'vs_main'
            },
            fragment: {
                module: this.shaderModule,
                entryPoint: fragmentEntry,
                targets: [
                    {
                        format: destFormat
                    }
                ]
            },
            primitive: {
                topology: 'triangle-list'
            }
        });
    }

    /**
     * Determine the appropriate fragment shader entry point based on color space conversion
     */
    private getFragmentEntry(srcSpace: ColorSpace, destFormat: GPUTextureFormat): string {
        if (srcSpace === ColorSpace.Linear) {
            // Handle sRGB conversion cases
            if (destFormat === 'bgra8unorm' || destFormat === 'rgba8unorm') {
                return 'fs_main_linear_to_srgb';
            }
            if (
                destFormat === 'bgra8unorm-srgb' ||
                destFormat === 'rgba8unorm-srgb' ||
                destFormat === 'rgba16float'
            ) {
                return 'fs_main';
            }
        }
        if (srcSpace === ColorSpace.Rgbe && destFormat === 'rgba16float') {
            return 'fs_main_rgbe_to_linear';
        }
        throw new Error(`Unsupported color space conversion: ${srcSpace} to ${destFormat}`);
    }

    /**
     * Perform the blit operation
     */
    blit(encoder: GPUCommandEncoder, view: GPUTextureView) {
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: view,
                    clearValue: { r: 0, g: 1, b: 0, a: 1 },
                    loadOp: 'clear',
                    storeOp: 'store'
                }
            ]
        });

        renderPass.setPipeline(this.renderPipeline);
        renderPass.setBindGroup(0, this.renderBindGroup);
        renderPass.draw(3, 1, 0, 0);
        renderPass.end();
    }

    /**
     * Create a new texture with mipmaps
     */
    createMipmappedTexture(
        device: GPUDevice,
        queue: GPUQueue,
        width: number,
        height: number,
        mipLevelCount: number
    ): GPUTexture {
        const texture = device.createTexture({
            size: {
                width,
                height,
                depthOrArrayLayers: 1
            },
            mipLevelCount,
            sampleCount: 1,
            dimension: '2d',
            format: this.destFormat,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
        });

        const encoder = device.createCommandEncoder();

        // Generate mipmap chain
        const views: GPUTextureView[] = Array.from({ length: mipLevelCount }, (_, i) =>
            texture.createView({
                baseMipLevel: i,
                mipLevelCount: 1
            })
        );

        // Blit to first mip level
        this.blit(encoder, views[0]);

        // Generate remaining mip levels
        const blittersToDispose: Blitter[] = [];
        for (let targetMip = 1; targetMip < mipLevelCount; targetMip++) {
            const prevLevelBlitter = new Blitter(
                device,
                views[targetMip - 1],
                ColorSpace.Linear,
                this.destFormat,
                'linear'
            );
            blittersToDispose.push(prevLevelBlitter);
            prevLevelBlitter.blit(encoder, views[targetMip]);
        }

        queue.submit([encoder.finish()]);

        // Track the final texture for disposal
        this.trackedTextures.push(texture);
        // Dispose all temporary blitters
        queue.onSubmittedWorkDone().then(() => {
            for (const blitter of blittersToDispose) {
                blitter.dispose();
            }
        });

        return texture;
    }

    // This method is used after mipmap generation
    private dispose(): void {
        // Destroy textures
        for (const texture of this.trackedTextures) {
            texture.destroy();
        }
        this.trackedTextures = [];

        // Clear references
        this.renderPipeline = null as any;
        this.renderBindGroup = null as any;
        this.bindGroupLayout = null as any;
        this.shaderModule = null as any;
        this.sampler = null as any;
    }
}
