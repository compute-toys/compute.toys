/**
 * Core WebGPU context management for compute shader toy
 */

export class WgpuContext {
    device: GPUDevice;
    queue: GPUQueue;
    surface: GPUCanvasContext;
    surfaceConfig: GPUCanvasConfiguration;
    width: number;
    height: number;

    constructor(
        device: GPUDevice,
        queue: GPUQueue,
        surface: GPUCanvasContext,
        surfaceConfig: GPUCanvasConfiguration,
        width: number,
        height: number
    ) {
        this.device = device;
        this.queue = queue;
        this.surface = surface;
        this.surfaceConfig = surfaceConfig;
        this.width = width;
        this.height = height;
    }

    /**
     * Initialize WebGPU context for a canvas element
     */
    static async init(
        width: number,
        height: number,
        canvas: HTMLCanvasElement
    ): Promise<WgpuContext> {
        const context = canvas.getContext('webgpu');
        if (!context) {
            throw new Error('WebGPU not supported');
        }

        // Initialize WebGPU adapter and device
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });
        if (!adapter) {
            throw new Error('No appropriate GPUAdapter found');
        }

        // Log adapter capabilities
        console.info('Adapter features:', adapter.features);
        console.info('Adapter limits:', adapter.limits);

        const device = await adapter.requestDevice({
            label: 'Compute Toy GPU Device'
            // requiredFeatures: [...adapter.features],
        });

        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        // Configure the swap chain
        const config: GPUCanvasConfiguration = {
            device,
            format: presentationFormat,
            alphaMode: 'opaque',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            viewFormats: [
                presentationFormat
                // Add SRGB/non-SRGB variants as needed
                // presentationFormat === 'bgra8unorm' ? 'bgra8unorm-srgb' : 'bgra8unorm',
                // presentationFormat === 'rgba8unorm' ? 'rgba8unorm-srgb' : 'rgba8unorm'
            ].filter((format): format is GPUTextureFormat => !!format)
        };

        context.configure(config);

        return new WgpuContext(device, device.queue, context, config, width, height);
    }

    /**
     * Helper to find preferred framebuffer format
     */
    static getPreferredFramebufferFormat(formats: GPUTextureFormat[]): GPUTextureFormat {
        // Prefer RGBA8 or BGRA8 formats
        for (const format of formats) {
            if (format === 'rgba8unorm' || format === 'bgra8unorm') {
                return format;
            }
        }
        // Fall back to first available format
        return formats[0];
    }

    /**
     * Reconfigure the surface with new dimensions
     */
    reconfigure(width: number, height: number) {
        // this.surfaceConfig = {
        //     ...this.surfaceConfig,
        //     width,
        //     height
        // };
        // this.surface.configure(this.surfaceConfig);
        this.width = width;
        this.height = height;
    }

    // /**
    //  * Clean up resources
    //  */
    // destroy() {
    //     this.device.destroy();
    // }
}

// // Error type for WebGPU context errors
// export class WgpuContextError extends Error {
//     constructor(message: string) {
//         super(message);
//         this.name = 'WgpuContextError';
//     }
// }
