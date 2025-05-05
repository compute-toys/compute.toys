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
        switch (type.kind) {
            case 'scalar':
                switch (type.scalarType) {
                    case 'float32':
                        return 'f32';
                    case 'uint32':
                        return 'atomic<u32>'; //why does this need to be atomic?
                    case 'int32':
                        return 'i32';
                    default:
                        return 'f32';
                }
            case 'vector':
                return `vec${type.elementCount}<${this.getWGSLType(type.elementType)}>`;
            case 'struct':
                return `${type.name}_std430_0`;
            default:
                return 'f32';
        }
    }

    private generateDefines(params: ReflectionParameter[]): string {
        const defines: string[] = [];

        for (const p of params) {
            let value = p.name;

            if (p.type.kind === 'parameterBlock' && p.type.elementType?.kind === 'struct') {
                const struct = p.type.elementType;
                for (const field of struct.fields) {
                    defines.push(`#define ${field.name}_0 ${field.name}`);
                }
            }

            if (
                p.type.kind === 'resource' &&
                p.type.baseShape === 'structuredBuffer' &&
                this.getBufferSize(p) > 0
            ) {
                value = `fields.${p.name}`;
            }
            defines.push(`#define ${p.name}_0 ${value}`);
        }

        return defines.filter(Boolean).join('\n');
    }

    private generateWorkgroupCounts(
        entryPoints: ReflectionEntryPoint[],
        params: ReflectionParameter[]
    ): string {
        return entryPoints
            .filter(ep =>
                ep.userAttribs?.some(
                    a =>
                        a.name === 'Cover' ||
                        a.name === 'WorkgroupCount' ||
                        a.name === 'DispatchCount'
                )
            )
            .map(ep => {
                const lines: string[] = [];
                const threadGroupSize = ep.threadGroupSize;
                let countX = 0,
                    countY = 0,
                    countZ = 0;

                const wgAttr = ep.userAttribs?.find(a => a.name === 'WorkgroupCount');
                if (wgAttr && wgAttr.arguments.length >= 3) {
                    countX = wgAttr.arguments[0] as number;
                    countY = wgAttr.arguments[1] as number;
                    countZ = wgAttr.arguments[2] as number;
                } else {
                    const coverAttr = ep.userAttribs?.find(a => a.name === 'Cover');
                    if (coverAttr && coverAttr.arguments.length > 0) {
                        const targetName = coverAttr.arguments[0] as string;
                        const param = params.find(p => p.name === targetName);
                        if (param && param.type.kind === 'resource') {
                            if (param.type.baseShape === 'structuredBuffer') {
                                countX = Math.ceil(this.getBufferSize(param) / threadGroupSize[0]);
                            } else if (param.type.baseShape === 'texture2D') {
                                countX = countY =
                                    threadGroupSize[0] > 0
                                        ? Math.ceil(512 / threadGroupSize[0])
                                        : 1; //why 512?
                            }
                        }
                    }
                }

                // Set minimum counts and handle special case
                countX = Math.max(countX, 1);
                countY = Math.max(countY, 1);
                countZ = Math.max(countZ, 1);

                lines.push(`#workgroup_count ${ep.name} ${countX} ${countY} ${countZ}`);

                const dispatchAttr = ep.userAttribs?.find(a => a.name === 'DispatchCount');
                if (dispatchAttr) {
                    const dispatchCount =
                        dispatchAttr.arguments.length > 0
                            ? (dispatchAttr.arguments[0] as number)
                            : 1;
                    lines.push(`#dispatch_count ${ep.name} ${dispatchCount}`);
                }

                return lines.join('\n');
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
