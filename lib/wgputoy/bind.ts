import { WgpuContext } from './context';

// Constants
const NUM_KEYCODES = 256;
const MAX_CUSTOM_PARAMS = 32;
export const NUM_ASSERT_COUNTERS = 10;
const USER_DATA_BYTES = 4096;
// export const OFFSET_ALIGNMENT = 256;

// Core data structures
class Time {
    frame: number;
    elapsed: number;
    delta: number;

    constructor(frame: number = 0, elapsed: number = 0, delta: number = 0) {
        this.frame = frame;
        this.elapsed = elapsed;
        this.delta = delta;
    }

    static fromBuffer(buffer: Uint8Array): Time {
        if (buffer.length < 12) {
            throw new Error('Buffer too small');
        }

        const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        const frame = view.getUint32(0, true); // true for little-endian
        const elapsed = view.getFloat32(4, true);
        const delta = view.getFloat32(8, true);

        return new Time(frame, elapsed, delta);
    }

    toBuffer(): Uint8Array {
        const buffer = new Uint8Array(12);
        const view = new DataView(buffer.buffer);

        view.setUint32(0, this.frame, true); // true for little-endian
        view.setFloat32(4, this.elapsed, true);
        view.setFloat32(8, this.delta, true);

        return buffer;
    }
}

class Mouse {
    pos: [number, number];
    click: number;

    constructor(x: number, y: number, click: number) {
        this.pos = [x, y];
        this.click = click;
    }

    static fromBuffer(buffer: Uint8Array): Mouse {
        if (buffer.length < 12) {
            throw new Error('Buffer too small');
        }

        const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        const x = view.getInt32(0, true);
        const y = view.getInt32(4, true);
        const click = view.getInt32(8, true);

        return new Mouse(x, y, click);
    }

    toBuffer(): Uint8Array {
        const buffer = new Uint8Array(12);
        const view = new DataView(buffer.buffer);

        view.setInt32(0, this.pos[0], true);
        view.setInt32(4, this.pos[1], true);
        view.setInt32(8, this.click, true);

        return buffer;
    }
}

interface Binding {
    getLayoutEntry(binding: number): GPUBindGroupLayoutEntry;
    binding(): GPUBindingResource;
    toWGSL(): string;
}

class BufferBinding<H> implements Binding {
    host: H;
    serialize: (h: H) => Uint8Array;
    device: GPUBuffer;
    layout: GPUBufferBindingLayout;
    // bind: (buffer: GPUBuffer) => GPUBufferBinding;
    decl: string;

    constructor(params) {
        this.host = params.host;
        this.serialize = params.serialize;
        this.device = params.device;
        this.layout = params.layout;
        // this.bind = params.bind;
        this.decl = params.decl;
    }

    getLayoutEntry(binding: number): GPUBindGroupLayoutEntry {
        return {
            binding,
            visibility: GPUShaderStage.COMPUTE,
            buffer: this.layout
        };
    }

    binding(): GPUBindingResource {
        return { buffer: this.device };
    }

    toWGSL(): string {
        return this.decl;
    }

    buffer(): GPUBuffer {
        return this.device;
    }

    stage(queue: GPUQueue): void {
        const data = this.serialize(this.host);
        if (data.length > 0) {
            queue.writeBuffer(this.device, 0, data);
        } else {
            console.warn('no data to stage');
        }
    }
}

class TextureBinding implements Binding {
    device: GPUTexture;
    view: GPUTextureView;
    layout: GPUTextureBindingLayout;
    decl: string;

    constructor(params) {
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

    binding(): GPUBindingResource {
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

    constructor(params) {
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

    binding(): GPUBindingResource {
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

    constructor(params) {
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

    binding(): GPUBindingResource {
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
    userData: BufferBinding<Map<string, Uint32Array>>;

    storage1: BufferBinding<void>;
    storage2: BufferBinding<void>;
    debugBuffer: BufferBinding<void>;
    // dispatchInfo: BufferBinding<void>;

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

    constructor(wgpu: WgpuContext, width: number, height: number, passF32: boolean) {
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
        const texScreen = wgpu.device.createTexture({
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

        const texRead = wgpu.device.createTexture({
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

        const texWrite = wgpu.device.createTexture({
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

        const channel0 = wgpu.device.createTexture(blank);
        const channel1 = wgpu.device.createTexture(blank);

        // Initialize time binding
        this.time = new BufferBinding<Time>({
            host: new Time(),
            serialize: (h: Time) => h.toBuffer(),
            device: wgpu.device.createBuffer({
                size: 16, // Aligned to 16 bytes
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }),
            layout: uniformBuffer,
            // bind: (buffer) => ({ offset: 0, size: 12 }),
            decl: 'var<uniform> time: Time'
        });

        // Initialize mouse binding
        this.mouse = new BufferBinding<Mouse>({
            host: new Mouse(width / 2, height / 2, 0),
            serialize: (h: Mouse) => h.toBuffer(),
            device: wgpu.device.createBuffer({
                size: 16, // Aligned to 16 bytes
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }),
            layout: uniformBuffer,
            // bind: (buffer) => ({ offset: 0, size: 12 }),
            decl: 'var<uniform> mouse: Mouse'
        });

        // Initialize keyboard binding
        this.keys = new BufferBinding<BitArray>({
            host: new BitArray(NUM_KEYCODES),
            serialize: (h: BitArray) => h.bytes,
            device: wgpu.device.createBuffer({
                size: 32, // Aligned to 16 bytes
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }),
            layout: uniformBuffer,
            // bind: (buffer) => ({ offset: 0, size: NUM_KEYCODES / 8 }),
            decl: 'var<uniform> _keyboard: array<vec4<u32>,2>'
        });

        // Initialize custom binding
        this.custom = new BufferBinding<[string[], Float32Array]>({
            host: [['_dummy'], new Float32Array([0])],
            serialize: ([, values]) => new Uint8Array(values.buffer),
            device: wgpu.device.createBuffer({
                size: MAX_CUSTOM_PARAMS * 4,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }),
            layout: uniformBuffer,
            // bind: (buffer) => ({ offset: 0, size: MAX_CUSTOM_PARAMS * 4 }),
            decl: 'var<uniform> custom: Custom'
        });

        // Initialize user data binding
        this.userData = new BufferBinding<Map<string, Uint32Array>>({
            host: new Map([['_dummy', new Uint32Array([0])]]),
            serialize: data => {
                const buffer = new ArrayBuffer(USER_DATA_BYTES);
                let offset = 0;
                for (const array of data.values()) {
                    new Uint32Array(buffer, offset).set(array);
                    offset += array.length * 4;
                }
                return new Uint8Array(buffer);
            },
            device: wgpu.device.createBuffer({
                size: USER_DATA_BYTES,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            }),
            layout: { ...storageBuffer, buffer: { type: 'read-only-storage' } },
            // bind: (buffer) => ({ offset: 0, size: USER_DATA_BYTES }),
            decl: 'var<storage,read> data: Data'
        });

        // Initialize storage buffers
        const storageSize = 128 * 1024 * 1024; // 128MB
        this.storage1 = new BufferBinding<void>({
            host: undefined,
            serialize: () => new Uint8Array(0),
            device: wgpu.device.createBuffer({
                size: storageSize,
                usage: GPUBufferUsage.STORAGE
            }),
            layout: storageBuffer,
            // bind: (buffer) => ({ offset: 0, size: storageSize }),
            decl: ''
        });

        this.storage2 = new BufferBinding<void>({
            host: undefined,
            serialize: () => new Uint8Array(0),
            device: wgpu.device.createBuffer({
                size: storageSize,
                usage: GPUBufferUsage.STORAGE
            }),
            layout: storageBuffer,
            // bind: (buffer) => ({ offset: 0, size: storageSize }),
            decl: ''
        });

        // Initialize debug buffer
        this.debugBuffer = new BufferBinding<void>({
            host: undefined,
            serialize: () => new Uint8Array(0),
            device: wgpu.device.createBuffer({
                size: 16 * NUM_ASSERT_COUNTERS, // Aligned to 16 bytes
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
            }),
            layout: storageBuffer,
            // bind: (buffer) => ({ offset: 0, size: 4 * NUM_ASSERT_COUNTERS }),
            decl: 'var<storage,read_write> _assert_counts: array<atomic<u32>>'
        });

        // Initialize dispatch info buffer
        // this.dispatchInfo = new BufferBinding<void>({
        //     host: undefined,
        //     serialize: () => new Uint8Array(0),
        //     device: wgpu.device.createBuffer({
        //         size: 256 * OFFSET_ALIGNMENT,
        //         usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        //     }),
        //     layout: { ...uniformBuffer, buffer: { hasDynamicOffset: true, type: 'uniform' } },
        //     // bind: (buffer) => ({ offset: 0, size: 4 }),
        //     decl: "var<uniform> dispatch: DispatchInfo"
        // });

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
                sampleType: 'float',
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
            bind: wgpu.device.createSampler(),
            decl: 'var nearest: sampler'
        });

        this.bilinear = new SamplerBinding({
            layout: {
                type: 'filtering'
            },
            bind: wgpu.device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear'
            }),
            decl: 'var bilinear: sampler'
        });

        this.trilinear = new SamplerBinding({
            layout: {
                type: 'filtering'
            },
            bind: wgpu.device.createSampler({
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
            bind: wgpu.device.createSampler(repeat),
            decl: 'var nearest_repeat: sampler'
        });

        this.bilinearRepeat = new SamplerBinding({
            layout: {
                type: 'filtering'
            },
            bind: wgpu.device.createSampler({
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
            bind: wgpu.device.createSampler({
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
            this.storage1,
            this.storage2,
            this.time,
            this.mouse,
            this.keys,
            this.custom,
            this.userData,
            this.debugBuffer,
            // this.dispatchInfo,
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
        this.custom.stage(queue);
        this.userData.stage(queue);
        this.time.stage(queue);
        this.mouse.stage(queue);
        this.keys.stage(queue);
    }
}

// Helper class for managing bit arrays (equivalent to Rust's BitVec)
class BitArray {
    private bits: Uint8Array;

    constructor(size: number) {
        this.bits = new Uint8Array(Math.ceil(size / 8));
    }

    get bytes(): Uint8Array {
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
