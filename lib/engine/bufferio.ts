/**
 * Reads GPU buffers to the CPU, one after the other
 * Not speedy and may be replaced with a pipelined approach or something when the need arises
 */
export class BufferReader {
    private device: GPUDevice;
    private stagingBuffer: GPUBuffer;
    private execChain: Promise<void | ArrayBuffer>;

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
        size?: number,
        srcOffset: number = 0,
        dstOffset: number = 0
    ): Promise<ArrayBuffer> {
        // TODO handle srcOffset and size that are not multiples of 4 (e.g. reading buffers of half floats)
        if (size === undefined) size = Math.min(deviceBuffer.size, hostBuffer.byteLength);
        return (this.execChain = this.execChain
            .then(() => {
                const encoder = this.device.createCommandEncoder();
                encoder.copyBufferToBuffer(deviceBuffer, srcOffset, this.stagingBuffer, 0, size);
                this.device.queue.submit([encoder.finish()]);
                return this.device.queue.onSubmittedWorkDone();
            })
            .then(() => this.stagingBuffer.mapAsync(GPUMapMode.READ, 0, size))
            .then<ArrayBuffer>(() => {
                new Uint8Array(hostBuffer).set(
                    new Uint8Array(this.stagingBuffer.getMappedRange(0, size)),
                    dstOffset
                );
                this.stagingBuffer.unmap();
                return hostBuffer;
            }));
    }

    dispose() {
        this.stagingBuffer.destroy();
    }
}
