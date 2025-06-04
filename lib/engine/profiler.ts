// See also:
// https://www.w3.org/TR/webgpu/#compute-pass-encoder-creation
// https://webgpufundamentals.org/webgpu/lessons/webgpu-timing.html

// 2DO:
// - aggregate results in 30 sec / 32 dispatches
// - support dispatchMap: Map<string, number>

import { Mutex } from 'async-mutex';

class Profiler {
    private querySet: GPUQuerySet;
    private resolveBuffer: GPUBuffer;
    private resultBuffer: GPUBuffer;
    private entryIds: Map<string, number>;
    private queryCount: number;
    mapMutex = new Mutex();

    constructor(entryNames: string[], device: GPUDevice) {
        this.entryIds = new Map(entryNames.map((name, id) => [name, id]));
        this.queryCount = entryNames.length * 2; // Start and end for each entry point

        this.querySet = device.createQuerySet({
            type: 'timestamp',
            count: this.queryCount
        });

        this.resolveBuffer = device.createBuffer({
            size: this.queryCount * 8, // 8 bytes per timestamp
            usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
        });

        this.resultBuffer = device.createBuffer({
            size: this.queryCount * 8,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });
    }

    getPassDescriptor(entryName: string): GPUComputePassDescriptor {
        const index = this.entryIds.get(entryName);
        if (index === undefined) {
            throw new Error(`Internal error! Unknown compute entry point: ${entryName}`);
        }
        return {
            timestampWrites: {
                querySet: this.querySet,
                beginningOfPassWriteIndex: index * 2,
                endOfPassWriteIndex: index * 2 + 1
            }
        };
    }

    beforeFinish(commandEncoder: GPUCommandEncoder) {
        commandEncoder.resolveQuerySet(
            this.querySet,
            0, // firstQuery
            this.queryCount,
            this.resolveBuffer,
            0 // destinationOffset
        );
        if (!this.mapMutex.isLocked()) {
            commandEncoder.copyBufferToBuffer(
                this.resolveBuffer,
                0, // sourceOffset
                this.resultBuffer,
                0, // destinationOffset
                this.queryCount * 8
            );
        }
    }

    async afterFinish(): Promise<string[]> {
        if (this.mapMutex.isLocked()) {
            throw new Error('Internal error! Check mapMutex is free.');
        } else {
            const release = await this.mapMutex.acquire();
            await this.resultBuffer.mapAsync(GPUMapMode.READ);
            const arrayBuffer = new BigUint64Array(this.resultBuffer.getMappedRange());
            const results = Array<number>(this.entryIds?.size);
            for (let i = 0; i < this.queryCount / 2; i++) {
                const start = arrayBuffer[i * 2];
                const end = arrayBuffer[i * 2 + 1];
                results[i] = Number(end - start) / 1000;
            }
            this.resultBuffer.unmap();
            release();
            return results.map(x => x + 'μs');
        }
    }

    async dispose(): Promise<void> {
        await this.mapMutex.waitForUnlock();
        this.querySet.destroy();
        this.resolveBuffer.destroy();
        this.resultBuffer.destroy();
    }
}

export { Profiler };
