/**
 * Reads GPU buffers to the CPU, one after the other
 * Not speedy and may be replaced with a pipelined approach or something when the need arises
 */
export class BufferReader {
    private device: GPUDevice;
    private stagingBuffer: GPUBuffer;
    private execChain: Promise<void>;

    constructor(device: GPUDevice, maxBufferSize: number = 128 << 20 /* 128MiB */) {
        this.device = device;
        this.stagingBuffer = device.createBuffer({
            size: maxBufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });
        this.execChain = Promise.resolve();
    }

    /**
     * deviceBuffer MUST have GPUBufferUsage.COPY_SRC usage flag
     */
    read(
        deviceBuffer: GPUBuffer,
        hostBuffer: ArrayBuffer,
        size: number,
        srcOffset: number = 0,
        dstOffset: number = 0
    ): Promise<ArrayBuffer> {
        return new Promise(resolve => {
            this.execChain = this.execChain.then(async () => {
                // Calculate offset and size which are a multiple of 4 and contain the requested range
                // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/copyBufferToBuffer#validation
                // https://developer.mozilla.org/en-US/docs/Web/API/GPUBuffer/mapAsync#validation
                // https://developer.mozilla.org/en-US/docs/Web/API/GPUBuffer/getMappedRange#validation
                const startPadding = srcOffset % 4;
                const readOffset = srcOffset - startPadding;
                const readSize = Math.ceil((startPadding + size) / 4) * 4;

                // WebGPU severely restricts usage of mappable buffers, only allowing copying to and from them
                // So we need to copy to an intermediate buffer which we can then map and read on the CPU
                const encoder = this.device.createCommandEncoder();
                encoder.copyBufferToBuffer(
                    deviceBuffer,
                    readOffset,
                    this.stagingBuffer,
                    0,
                    readSize
                );
                this.device.queue.submit([encoder.finish()]);
                await this.device.queue.onSubmittedWorkDone(); // SLOW

                await this.stagingBuffer.mapAsync(GPUMapMode.READ, 0, readSize); // also pretty slow
                const mappedRange = this.stagingBuffer.getMappedRange(0, readSize);
                new Uint8Array(hostBuffer, dstOffset, size).set(
                    new Uint8Array(mappedRange, startPadding, size)
                );
                this.stagingBuffer.unmap();

                resolve(hostBuffer);
            });
        });
    }

    dispose() {
        this.stagingBuffer.destroy();
    }
}
