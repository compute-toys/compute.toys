import type {
    ReflectionEntryPoint,
    ReflectionJSON,
    ReflectionParameter,
    ReflectionType
} from 'types/reflection';

class ShaderConverter {
    private getBufferSize(param: ReflectionParameter): number {
        const zeros = param.userAttribs?.find(attr => attr.name === 'StorageBuffer');
        if (zeros && zeros.arguments.length > 0) {
            return zeros.arguments[0] as number;
        }
        return 0;
    }

    private generateStorageStruct(params: ReflectionParameter[]): string {
        let bufferFields = '';
        for (const p of params) {
            if (
                p.type.kind === 'resource' &&
                p.type.baseShape === 'structuredBuffer' &&
                this.getBufferSize(p) > 0
            ) {
                const type = p.type.resultType;
                const typeName = this.getWGSLType(type);
                const size = this.getBufferSize(p);
                bufferFields += `    ${p.name}: array<${typeName}, ${size}>,\n`;
            }
        }
        return bufferFields ? `struct StorageBuffers {\n${bufferFields}}` : '';
    }

    private getWGSLType(type: ReflectionType | undefined): string {
        if (!type) return 'f32';
        if (type.kind === 'scalar') {
            switch (type.scalarType) {
                case 'float32':
                    return 'f32';
                case 'uint32':
                    return 'atomic<u32>';
                case 'int32':
                    return 'i32';
                default:
                    return 'f32';
            }
        }
        return 'f32'; // default
    }

    private generateDefines(params: ReflectionParameter[]): string {
        return params
            .map(p => {
                if (p.name === 'targetTexture') {
                    return '#define targetTexture_0 channel0';
                }
                if (p.name === 'outputTexture') {
                    return '#define outputTexture_0 screen';
                }
                if (
                    p.type.kind === 'resource' &&
                    p.type.baseShape === 'structuredBuffer' &&
                    this.getBufferSize(p) > 0
                ) {
                    return `#define ${p.name}_0 fields.${p.name}`;
                }
                return '';
            })
            .filter(Boolean)
            .join('\n');
    }

    private generateWorkgroupCounts(
        entryPoints: ReflectionEntryPoint[],
        params: ReflectionParameter[]
    ): string {
        return entryPoints
            .filter(ep =>
                ep.userAttribs?.some(
                    attr => attr.name === 'Cover' || attr.name === 'WorkgroupCount'
                )
            )
            .map(ep => {
                const threadGroupSize = ep.threadGroupSize;
                let countX: number = 0;
                let countY: number = 0;
                let countZ: number = 0;

                const callAttr = ep.userAttribs?.find(attr => attr.name === 'WorkgroupCount');

                if (callAttr && callAttr.arguments.length >= 3) {
                    countX = callAttr.arguments[0] as number;
                    countY = callAttr.arguments[1] as number;
                    countZ = callAttr.arguments[2] as number;
                } else {
                    const sizeOfAttr = ep.userAttribs?.find(attr => attr.name === 'Cover');

                    if (sizeOfAttr && sizeOfAttr.arguments.length > 0) {
                        const targetName = sizeOfAttr.arguments[0] as string;
                        const param = params.find(p => p.name === targetName);

                        if (param) {
                            if (param.type.kind === 'resource') {
                                if (param.type.baseShape === 'structuredBuffer') {
                                    countX = Math.floor(
                                        this.getBufferSize(param) / threadGroupSize[0]
                                    );
                                } else if (param.type.baseShape === 'texture2D') {
                                    countX = countY =
                                        threadGroupSize[0] > 0
                                            ? Math.floor(512 / threadGroupSize[0])
                                            : 1;
                                }
                            }
                        }
                    }
                }

                // Set minimum counts and handle special case
                countX = Math.max(countX, 1);
                countY = Math.max(countY, 1);
                countZ = Math.max(countZ, 1);

                const counts = `${countX} ${countY} ${countZ}`;

                return `#workgroup_count ${ep.name} ${counts}`;
            })
            .join('\n');
    }

    private generateDispatchDirectives(entryPoints: ReflectionEntryPoint[]): string {
        return entryPoints
            .filter(ep => ep.userAttribs?.some(attr => attr.name === 'DispatchOnce'))
            .map(ep => `#dispatch_once ${ep.name}`)
            .join('\n');
    }

    public convert(input: ReflectionJSON): string {
        const storageStruct = this.generateStorageStruct(input.parameters);

        const parts = [
            storageStruct,
            storageStruct ? '' : null,
            storageStruct ? '#storage fields StorageBuffers' : null,
            '',
            this.generateDefines(input.parameters),
            '',
            this.generateWorkgroupCounts(input.entryPoints, input.parameters),
            '',
            this.generateDispatchDirectives(input.entryPoints)
        ].filter(Boolean);

        return parts.join('\n');
    }
}

export default ShaderConverter;
