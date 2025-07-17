// Constants
const NUM_KEYCODES = 256;
const MAX_CUSTOM_PARAMS = 32;
// export const NUM_ASSERT_COUNTERS = 10;
// const USER_DATA_BYTES = 4096;
const OFFSET_ALIGNMENT = 256;

// Core data structures
class Time {
    elapsed: number;
    delta: number;
    frame: number;

    constructor(elapsed: number = 0, delta: number = 0, frame: number = 0) {
        this.elapsed = elapsed;
        this.delta = delta;
        this.frame = frame;
    }

    toBuffer(): Uint8Array {
        const buffer = new Uint8Array(12);
        const view = new DataView(buffer.buffer);

        view.setFloat32(0, this.elapsed, true); // true for little-endian
        view.setFloat32(4, this.delta, true);
        view.setUint32(8, this.frame, true);

        return buffer;
    }
}

type Point = { x: number; y: number };

class Mouse {
    pos: Point;
    zoom: number;
    click: number;
    start: Point;
    delta: Point;

    constructor(pos: Point, zoom: number, click: number, start: Point, delta: Point) {
        this.pos = pos;
        this.zoom = zoom;
        this.click = click;
        this.start = start;
        this.delta = delta;
    }

    toBuffer(): Uint8Array {
        const buffer = new Uint8Array(32);
        const view = new DataView(buffer.buffer);
        view.setInt32(0, this.pos.x, true);
        view.setInt32(4, this.pos.y, true);
        view.setFloat32(8, this.zoom, true);
        view.setInt32(12, this.click, true);
        view.setInt32(16, this.start.x, true);
        view.setInt32(20, this.start.y, true);
        view.setInt32(24, this.delta.x, true);
        view.setInt32(28, this.delta.y, true);
        return buffer;
    }
}

class BitArray {
    private bits: Uint8Array;

    constructor(size: number) {
        this.bits = new Uint8Array(Math.ceil(size / 8));
    }

    toBuffer(): Uint8Array {
        return this.bits;
    }

    get(index: number): boolean {
        const byteIndex = Math.floor(index / 8);
        const bitIndex = index % 8;
        return (this.bits[byteIndex] & (1 << bitIndex)) !== 0;
    }

    set(index: number, value: boolean): void {
        const byteIndex = Math.floor(index / 8);
        const bitIndex = index % 8;
        if (value) {
            this.bits[byteIndex] |= 1 << bitIndex;
        } else {
            this.bits[byteIndex] &= ~(1 << bitIndex);
        }
    }
}

interface Binding {
    getLayoutEntry(binding: number): GPUBindGroupLayoutEntry;
    binding(): GPUBindingResource;
    toWGSL(): string;
}

class BufferBinding<H> implements Binding {
    host: H;
    device: GPUBuffer;
    layout: GPUBufferBindingLayout;
    bindingSize?: GPUSize64;
    decl: string;

    constructor(params: {
        host: H;
        device: GPUBuffer;
        layout: GPUBufferBindingLayout;
        bindingSize?: GPUSize64;
        decl: string;
    }) {
        this.host = params.host;
        this.device = params.device;
        this.layout = params.layout;
        this.bindingSize = params.bindingSize;
        this.decl = params.decl;
    }

    getLayoutEntry(binding: number): GPUBindGroupLayoutEntry {
        return {
            binding,
            visibility: GPUShaderStage.COMPUTE,
            buffer: this.layout
        };
    }

    binding(): GPUBufferBinding {
        return { buffer: this.device, offset: 0, size: this.bindingSize };
    }

    toWGSL(): string {
        return this.decl;
    }
}

class TextureBinding implements Binding {
    device: GPUTexture;
    view: GPUTextureView;
    layout: GPUTextureBindingLayout;
    decl: string;

    constructor(params: {
        device: GPUTexture;
        view: GPUTextureView;
        layout: GPUTextureBindingLayout;
        decl: string;
    }) {
        this.device = params.device;
        this.view = params.view;
        this.layout = params.layout;
        this.decl = params.decl;
    }

    getLayoutEntry(binding: number): GPUBindGroupLayoutEntry {
        return {
            binding,
            visibility: GPUShaderStage.COMPUTE,
            texture: this.layout
        };
    }

    binding(): GPUTextureView {
        return this.view;
    }

    toWGSL(): string {
        return this.decl;
    }

    texture(): GPUTexture {
        return this.device;
    }

    setTexture(texture: GPUTexture): void {
        this.device = texture;
        this.view = texture.createView();
    }
}

class StorageTextureBinding implements Binding {
    device: GPUTexture;
    view: GPUTextureView;
    layout: GPUStorageTextureBindingLayout;
    decl: string;

    constructor(params: {
        device: GPUTexture;
        view: GPUTextureView;
        layout: GPUStorageTextureBindingLayout;
        decl: string;
    }) {
        this.device = params.device;
        this.view = params.view;
        this.layout = params.layout;
        this.decl = params.decl;
    }

    getLayoutEntry(binding: number): GPUBindGroupLayoutEntry {
        return {
            binding,
            visibility: GPUShaderStage.COMPUTE,
            storageTexture: this.layout
        };
    }

    binding(): GPUTextureView {
        return this.view;
    }

    toWGSL(): string {
        return this.decl;
    }

    texture(): GPUTexture {
        return this.device;
    }

    setTexture(texture: GPUTexture): void {
        this.device = texture;
        this.view = texture.createView();
    }
}

class SamplerBinding implements Binding {
    layout: GPUSamplerBindingLayout;
    bind: GPUSampler;
    decl: string;

    constructor(params: { layout: GPUSamplerBindingLayout; bind: GPUSampler; decl: string }) {
        this.layout = params.layout;
        this.bind = params.bind;
        this.decl = params.decl;
    }

    getLayoutEntry(binding: number): GPUBindGroupLayoutEntry {
        return {
            binding,
            visibility: GPUShaderStage.COMPUTE,
            sampler: this.layout
        };
    }

    binding(): GPUSampler {
        return this.bind;
    }

    toWGSL(): string {
        return this.decl;
    }
}

// Main bindings class
export class Bindings {
    time: BufferBinding<Time>;
    mouse: BufferBinding<Mouse>;
    keys: BufferBinding<BitArray>;
    custom: BufferBinding<[string[], Float32Array]>;
    // userData: BufferBinding<Map<string, Uint32Array>>;

    storage: BufferBinding<void>[];
    // debugBuffer: BufferBinding<void>;
    dispatchInfo: BufferBinding<void>;

    texScreen: StorageTextureBinding;
    texRead: TextureBinding;
    texWrite: StorageTextureBinding;
    channels: TextureBinding[];

    nearest: SamplerBinding;
    bilinear: SamplerBinding;
    trilinear: SamplerBinding;
    nearestRepeat: SamplerBinding;
    bilinearRepeat: SamplerBinding;
    trilinearRepeat: SamplerBinding;

    constructor(device: GPUDevice, width: number, height: number, passF32: boolean) {
        const uniformBuffer: GPUBufferBindingLayout = {
            type: 'uniform'
        };

        const storageBuffer: GPUBufferBindingLayout = {
            type: 'storage'
        };

        const passFormat = passF32 ? 'rgba32float' : 'rgba16float';

        const blank: GPUTextureDescriptor = {
            size: {
                width: 1,
                height: 1,
                depthOrArrayLayers: 1
            },
            format: 'rgba8unorm-srgb',
            usage: GPUTextureUsage.TEXTURE_BINDING,
            dimension: '2d',
            mipLevelCount: 1,
            sampleCount: 1
        };

        const channelLayout: GPUTextureBindingLayout = {
            sampleType: 'float',
            viewDimension: '2d',
            multisampled: false
        };

        const repeat: GPUSamplerDescriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            addressModeW: 'repeat'
        };

        // Create textures
        const texScreen = device.createTexture({
            size: {
                width,
                height,
                depthOrArrayLayers: 1
            },
            format: 'rgba16float',
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '2d',
            mipLevelCount: 1,
            sampleCount: 1
        });

        const texRead = device.createTexture({
            size: {
                width,
                height,
                depthOrArrayLayers: 4
            },
            format: passF32 ? 'rgba32float' : 'rgba16float',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            dimension: '2d',
            mipLevelCount: 1,
            sampleCount: 1
        });

        const texWrite = device.createTexture({
            size: {
                width,
                height,
                depthOrArrayLayers: 4
            },
            format: passF32 ? 'rgba32float' : 'rgba16float',
            usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.STORAGE_BINDING,
            dimension: '2d',
            mipLevelCount: 1,
            sampleCount: 1
        });

        const channel0 = device.createTexture(blank);
        const channel1 = device.createTexture(blank);

        // Initialize time binding
        this.time = new BufferBinding<Time>({
            host: new Time(),
            device: device.createBuffer({
                size: 16, // Aligned to 16 bytes
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }),
            layout: uniformBuffer,
            decl: 'var<uniform> time: Time'
        });

        // Initialize mouse binding
        this.mouse = new BufferBinding<Mouse>({
            host: new Mouse({ x: width / 2, y: height / 2 }, 1, 0, { x: 0, y: 0 }, { x: 0, y: 0 }),
            device: device.createBuffer({
                size: 32, // Aligned to 16 bytes
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }),
            layout: uniformBuffer,
            decl: 'var<uniform> mouse: Mouse'
        });

        // Initialize keyboard binding
        this.keys = new BufferBinding<BitArray>({
            host: new BitArray(NUM_KEYCODES),
            device: device.createBuffer({
                size: 32, // Aligned to 16 bytes
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }),
            layout: uniformBuffer,
            decl: 'var<uniform> _keyboard: array<vec4<u32>,2>'
        });

        // Initialize custom binding
        this.custom = new BufferBinding<[string[], Float32Array]>({
            host: [['_dummy'], new Float32Array([0])],
            device: device.createBuffer({
                size: MAX_CUSTOM_PARAMS * 4,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }),
            layout: uniformBuffer,
            decl: 'var<uniform> custom: Custom'
        });

        // Initialize user data binding
        // this.userData = new BufferBinding<Map<string, Uint32Array>>({
        //     host: new Map([['_dummy', new Uint32Array([0])]]),
        //     device: device.createBuffer({
        //         size: USER_DATA_BYTES,
        //         usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        //     }),
        //     layout: { ...storageBuffer, type: 'read-only-storage' },
        //     decl: 'var<storage,read> data: Data'
        // });

        // Initialize storage buffers
        const storageSize = 128 * 1024 * 1024; // 128MB
        this.storage = [
            new BufferBinding<void>({
                host: undefined,
                device: device.createBuffer({
                    size: storageSize,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
                }),
                layout: storageBuffer,
                decl: ''
            }),
            new BufferBinding<void>({
                host: undefined,
                device: device.createBuffer({
                    size: storageSize,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
                }),
                layout: storageBuffer,
                decl: ''
            })
        ];

        // Initialize debug buffer
        // this.debugBuffer = new BufferBinding<void>({
        //     host: undefined,
        //     device: device.createBuffer({
        //         size: 16 * NUM_ASSERT_COUNTERS, // Aligned to 16 bytes
        //         usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
        //     }),
        //     layout: storageBuffer,
        //     decl: 'var<storage,read_write> _assert_counts: array<atomic<u32>>'
        // });

        // Initialize dispatch info buffer
        this.dispatchInfo = new BufferBinding<void>({
            host: undefined,
            device: device.createBuffer({
                size: 256 * OFFSET_ALIGNMENT,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }),
            layout: { ...uniformBuffer, hasDynamicOffset: true, type: 'uniform' },
            bindingSize: 4,
            decl: 'var<uniform> dispatch: DispatchInfo'
        });

        // Initialize texture bindings
        this.texScreen = new StorageTextureBinding({
            device: texScreen,
            view: texScreen.createView(),
            layout: {
                access: 'write-only',
                format: 'rgba16float',
                viewDimension: '2d'
            },
            decl: 'var screen: texture_storage_2d<rgba16float,write>'
        });

        this.texRead = new TextureBinding({
            device: texRead,
            view: texRead.createView({
                dimension: '2d-array'
            }),
            layout: {
                sampleType: passF32 ? 'unfilterable-float' : 'float',
                viewDimension: '2d-array',
                multisampled: false
            },
            decl: 'var pass_in: texture_2d_array<f32>'
        });

        this.texWrite = new StorageTextureBinding({
            device: texWrite,
            view: texWrite.createView({
                dimension: '2d-array'
            }),
            layout: {
                access: 'write-only',
                format: passF32 ? 'rgba32float' : 'rgba16float',
                viewDimension: '2d-array'
            },
            decl: `var pass_out: texture_storage_2d_array<${passFormat},write>`
        });

        this.channels = [
            new TextureBinding({
                device: channel0,
                view: channel0.createView(),
                layout: channelLayout,
                decl: 'var channel0: texture_2d<f32>'
            }),
            new TextureBinding({
                device: channel1,
                view: channel1.createView(),
                layout: channelLayout,
                decl: 'var channel1: texture_2d<f32>'
            })
        ];

        // Initialize sampler bindings
        this.nearest = new SamplerBinding({
            layout: {
                type: 'non-filtering'
            },
            bind: device.createSampler(),
            decl: 'var nearest: sampler'
        });

        this.bilinear = new SamplerBinding({
            layout: {
                type: 'filtering'
            },
            bind: device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear'
            }),
            decl: 'var bilinear: sampler'
        });

        this.trilinear = new SamplerBinding({
            layout: {
                type: 'filtering'
            },
            bind: device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear',
                mipmapFilter: 'linear'
            }),
            decl: 'var trilinear: sampler'
        });

        this.nearestRepeat = new SamplerBinding({
            layout: {
                type: 'non-filtering'
            },
            bind: device.createSampler(repeat),
            decl: 'var nearest_repeat: sampler'
        });

        this.bilinearRepeat = new SamplerBinding({
            layout: {
                type: 'filtering'
            },
            bind: device.createSampler({
                ...repeat,
                magFilter: 'linear',
                minFilter: 'linear'
            }),
            decl: 'var bilinear_repeat: sampler'
        });

        this.trilinearRepeat = new SamplerBinding({
            layout: {
                type: 'filtering'
            },
            bind: device.createSampler({
                ...repeat,
                magFilter: 'linear',
                minFilter: 'linear',
                mipmapFilter: 'linear'
            }),
            decl: 'var trilinear_repeat: sampler'
        });
    }

    private getAllBindings(): Binding[] {
        return [
            ...this.storage,
            this.time,
            this.mouse,
            this.keys,
            this.custom,
            // this.userData,
            // this.debugBuffer,
            this.dispatchInfo,
            this.texScreen,
            this.texRead,
            this.texWrite,
            ...this.channels,
            this.nearest,
            this.bilinear,
            this.trilinear,
            this.nearestRepeat,
            this.bilinearRepeat,
            this.trilinearRepeat
        ];
    }

    createBindGroupLayout(device: GPUDevice): GPUBindGroupLayout {
        return device.createBindGroupLayout({
            entries: this.getAllBindings().map((binding, index) => binding.getLayoutEntry(index))
        });
    }

    createPipelineLayout(device: GPUDevice, layout: GPUBindGroupLayout): GPUPipelineLayout {
        return device.createPipelineLayout({
            bindGroupLayouts: [layout]
        });
    }

    createBindGroup(device: GPUDevice, layout: GPUBindGroupLayout): GPUBindGroup {
        return device.createBindGroup({
            layout,
            entries: this.getAllBindings().map((binding, index) => ({
                binding: index,
                resource: binding.binding()
            }))
        });
    }

    toWGSL(): string {
        return this.getAllBindings()
            .map((binding, index) => {
                const decl = binding.toWGSL();
                if (!decl) return '';
                return `@group(0) @binding(${index}) ${decl};`;
            })
            .filter(s => s)
            .join('\n');
    }

    stage(queue: GPUQueue): void {
        queue.writeBuffer(this.custom.device, 0, this.custom.host[1].buffer);
        // queue.writeBuffer(this.userData.device, 0, this.userData.host.toBuffer());
        queue.writeBuffer(this.time.device, 0, this.time.host.toBuffer());
        queue.writeBuffer(this.mouse.device, 0, this.mouse.host.toBuffer());
        queue.writeBuffer(this.keys.device, 0, this.keys.host.toBuffer());
    }

    dispose(): void {
        // Destroy buffers
        this.storage.map(bufferBinding => bufferBinding.device.destroy());
        this.time.device.destroy();
        this.mouse.device.destroy();
        this.keys.device.destroy();
        this.custom.device.destroy();
        this.dispatchInfo.device.destroy();

        // Destroy textures
        this.texScreen.device.destroy();
        this.texRead.device.destroy();
        this.texWrite.device.destroy();
        this.channels.forEach(channel => channel.device.destroy());

        // Clear sampler references
        this.nearest.bind = null as any;
        this.bilinear.bind = null as any;
        this.trilinear.bind = null as any;
        this.nearestRepeat.bind = null as any;
        this.bilinearRepeat.bind = null as any;
        this.trilinearRepeat.bind = null as any;
    }
}
