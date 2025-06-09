// 2DO:
// - smooth profiler

import { Mutex } from 'async-mutex';

const UPDATE_TIME = 200; //milliseconds

class Profiler {
    private mapMutex = new Mutex();
    private querySet: GPUQuerySet;
    private resolveBuffer: GPUBuffer;
    private resultBuffer: GPUBuffer;

    private entryPointStartId: number[]; // in flatten pipeline
    private entryPointCount: number[];
    private queryCount: number; // in flatten pipeline

    constructor(entryPointNames: string[], dispatchCount: Map<string, number>, device: GPUDevice) {
        this.entryPointCount = new Array(entryPointNames.length);
        this.entryPointStartId = new Array(entryPointNames.length);

        let dispatchId = 0;
        for (let i = 0; i < entryPointNames.length; ++i) {
            this.entryPointStartId[i] = dispatchId;
            const count = dispatchCount.get(entryPointNames[i]) || 1;
            this.entryPointCount[i] = count;
            dispatchId += count;
        }
        this.queryCount = dispatchId * 2; // Start and end for each pass

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

    fillPassDescriptors(
        passDescs: GPUComputePassDescriptor[],
        nameId: number
    ): GPUComputePassDescriptor[] {
        const startId = this.entryPointStartId[nameId];
        return passDescs.map((desc, passId) => {
            const dispatchId = startId + passId;
            Object.assign(desc, {
                timestampWrites: {
                    querySet: this.querySet,
                    beginningOfPassWriteIndex: dispatchId * 2,
                    endOfPassWriteIndex: dispatchId * 2 + 1
                }
            });
            return desc;
        });
    }

    beforeFinish(commandEncoder: GPUCommandEncoder) {
        if (!this.mapMutex.isLocked()) {
            commandEncoder.resolveQuerySet(
                this.querySet,
                0, // firstQuery
                this.queryCount,
                this.resolveBuffer,
                0 // destinationOffset
            );
            commandEncoder.copyBufferToBuffer(
                this.resolveBuffer,
                0, // sourceOffset
                this.resultBuffer,
                0, // destinationOffset
                this.queryCount * 8
            );
        }
    }

    afterFinish(cb: ((entryTimers: string[]) => void) | undefined) {
        if (!this.mapMutex.isLocked()) {
            (async () => {
                const release = await this.mapMutex.acquire();
                await this.resultBuffer.mapAsync(GPUMapMode.READ);

                const arrayBuffer = new BigUint64Array(this.resultBuffer.getMappedRange());
                const len = this.entryPointStartId.length;
                const timers = new Array<string>(len);
                for (let i = 0; i < len; i++) {
                    let sum = 0;
                    const startId = this.entryPointStartId[i];
                    const count = this.entryPointCount[i];
                    for (let passId = 0; passId < count; passId++) {
                        const t0 = arrayBuffer[(startId + passId) * 2];
                        const t1 = arrayBuffer[(startId + passId) * 2 + 1];
                        sum += Number(t1 - t0);
                    }
                    timers[i] = (sum / 1000).toFixed(1) + 'μs'; // microseconds
                }

                const updateCb = cb;
                this.resultBuffer.unmap();
                setTimeout(() => {
                    if (updateCb) {
                        updateCb(timers);
                    }
                    release();
                }, UPDATE_TIME);
            })();
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
