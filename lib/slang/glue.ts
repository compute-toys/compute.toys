import type { ReflectionEntryPoint, ReflectionParameter, ReflectionType } from 'types/reflection';
import { EnhancedReflectionJSON, TextureDimensions } from './compiler';

export interface StorageStructMemberLayout {
    name: string;
    offset: number;
    size: number;
}

export class ShaderConverter {
    private roundUp(multiple: number, value: number): number {
        return Math.ceil(value / multiple) * multiple;
    }

    // Reference https://www.w3.org/TR/WGSL/#alignment-and-size for size and alignment of WGSL types
    private calcSizeAndAlignment(type: ReflectionType): [number, number] {
        switch (type.kind) {
            case 'scalar': {
                switch (type.scalarType) {
                    case 'bool': // not host shareable but slang lets it pass and it gets caught by WebGPU
                    case 'int32':
                    case 'uint32':
                    case 'float32': {
                        return [4, 4];
                    }

                    case 'float16': {
                        return [2, 2];
                    }

                    default: {
                        return [0, 0];
                    }
                }
            }

            case 'vector': {
                const [elementSize, elementAlign] = this.calcSizeAndAlignment(type.elementType);
                switch (type.elementCount) {
                    case 1: {
                        // slang differentiates between scalars and single element vectors for some reason
                        return [elementSize, elementAlign];
                    }

                    case 2: {
                        const width = 2 * elementSize;
                        return [width, width];
                    }

                    case 3: {
                        return [3 * elementSize, 4 * elementSize];
                    }

                    case 4: {
                        const width = 4 * elementSize;
                        return [width, width];
                    }

                    default: {
                        return [0, 0];
                    }
                }
            }

            case 'matrix': {
                // slang matrix<T, R, C> translates to wgsl array<vector<T, C>, R>
                const [, rowAlign] = this.calcSizeAndAlignment({
                    kind: 'vector',
                    elementCount: type.columnCount,
                    elementType: type.elementType
                });
                return [type.rowCount * rowAlign, rowAlign];
            }

            case 'struct': {
                const structAlign = Math.max(
                    ...type.fields.map(field => this.calcSizeAndAlignment(field.type)[1])
                );
                const lastMemberBinding = type.fields[type.fields.length - 1]?.binding;
                if (lastMemberBinding?.kind === 'uniform') {
                    const justPastLastMember = lastMemberBinding.offset + lastMemberBinding.size;
                    return [this.roundUp(structAlign, justPastLastMember), structAlign];
                } else {
                    return [0, 0];
                }
            }

            case 'array': {
                const [elementSize, elementAlign] = this.calcSizeAndAlignment(type.elementType);
                return [type.elementCount * this.roundUp(elementAlign, elementSize), elementAlign];
            }

            default: {
                return [0, 0];
            }
        }
    }

    private getBufferElementCount(param: ReflectionParameter): number {
        const zeros = param.userAttribs?.find(attr => attr.name === 'StorageBuffer');
        if (zeros && zeros.arguments.length > 0) {
            return zeros.arguments[0] as number;
        }
        return 0;
    }

    private generateStorageStruct(
        input: EnhancedReflectionJSON
    ): [string, StorageStructMemberLayout[]] {
        const layout: StorageStructMemberLayout[] = [];
        let memberOffset = 0;
        let bufferFields = '';
        for (const p of input.parameters) {
            if (
                p.type.kind === 'resource' &&
                p.type.baseShape === 'structuredBuffer' &&
                this.getBufferElementCount(p) > 0
            ) {
                if (p.name in input.bindings) {
                    const binding = input.bindings[p.name];
                    const elementCount = this.getBufferElementCount(p);
                    bufferFields += `    ${p.name}: array<${binding.typeArgs[0]}, ${elementCount}>,\n`;
                    if (memberOffset >= 0) {
                        const [elementSize, elementAlign] = this.calcSizeAndAlignment(
                            p.type.resultType
                        );
                        if (elementAlign > 0) {
                            memberOffset = this.roundUp(elementAlign, memberOffset);
                            const memberSize =
                                elementCount * this.roundUp(elementAlign, elementSize);
                            layout.push({ name: p.name, offset: memberOffset, size: memberSize });
                            memberOffset += memberSize;
                        } else {
                            console.error(
                                `Size and alignment unknown for binding ${p.name}`,
                                p.type
                            );
                            memberOffset = -1; // invalidate offset to skip following members
                        }
                    } else {
                        console.warn(
                            `Skipping binding ${p.name} due to inability to determine offset`
                        );
                    }
                } else {
                    console.warn(`No binding found for ${p.name}`);
                }
            }
        }
        return [bufferFields ? `struct StorageBuffers {\n${bufferFields}}` : '', layout];
    }

    /*
    private getWGSLType(type: ReflectionType): string {
        switch (type.kind) {
            case 'scalar':
                switch (type.scalarType) {
                    case 'float32':
                        return 'f32';
                    case 'uint32':
                        return 'u32';
                    case 'int32':
                        return 'i32';
                    default:
                        return 'f32';
                }
            case 'vector':
                return `vec${type.elementCount}<${this.getWGSLType(type.elementType)}>`;
            default:
                throw new Error(`Unsupported type: ${type.kind}`);
        }
    }
    */

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
                this.getBufferElementCount(p) > 0
            ) {
                value = `fields.${p.name}`;
            }
            defines.push(`#define ${p.name}_0 ${value}`);
        }

        return defines.filter(Boolean).join('\n') + '\n';
    }

    private generateWorkgroupCounts(
        entryPoints: ReflectionEntryPoint[],
        params: ReflectionParameter[],
        channelDimensions: TextureDimensions[]
    ): string {
        return (
            entryPoints
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
                                    countX = Math.ceil(
                                        this.getBufferElementCount(param) / threadGroupSize[0]
                                    );
                                } else if (param.type.baseShape === 'texture2D') {
                                    if (targetName === 'channel0' || targetName === 'channel1') {
                                        const { width, height } =
                                            channelDimensions[targetName === 'channel0' ? 0 : 1];
                                        console.log(
                                            `Using texture dimensions for ${targetName}: ${width}x${height}`
                                        );
                                        countX =
                                            threadGroupSize[0] > 0
                                                ? Math.ceil(width / threadGroupSize[0])
                                                : 1;
                                        countY =
                                            threadGroupSize[1] > 0
                                                ? Math.ceil(height / threadGroupSize[1])
                                                : 1;
                                    } else {
                                        throw new Error(
                                            `No texture dimensions found for ${targetName}`
                                        );
                                    }
                                }
                            }
                        }
                    }

                    const anyWgAttr = ep.userAttribs?.some(
                        a => a.name === 'WorkgroupCount' || a.name === 'Cover'
                    );
                    if (anyWgAttr) {
                        //make sure we need to set the workgroup count
                        // Set minimum counts and handle special case
                        countX = Math.max(countX, 1);
                        countY = Math.max(countY, 1);
                        countZ = Math.max(countZ, 1);

                        lines.push(`#workgroup_count ${ep.name} ${countX} ${countY} ${countZ}`);
                    }

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
                .join('\n') + '\n'
        );
    }

    private generateDispatchDirectives(entryPoints: ReflectionEntryPoint[]): string {
        return entryPoints
            .filter(ep => ep.userAttribs?.some(attr => attr.name === 'DispatchOnce'))
            .map(ep => `#dispatch_once ${ep.name}`)
            .join('\n');
    }

    public convert(
        input: EnhancedReflectionJSON,
        channelDimensions: TextureDimensions[]
    ): [string, StorageStructMemberLayout[]] {
        const [storageStructDecl, storageStructLayout] = this.generateStorageStruct(input);

        const parts = [
            storageStructDecl,
            storageStructDecl ? '' : null,
            storageStructDecl ? '#storage fields StorageBuffers' : null,
            '',
            this.generateDefines(input.parameters),
            '',
            this.generateWorkgroupCounts(input.entryPoints, input.parameters, channelDimensions),
            '',
            this.generateDispatchDirectives(input.entryPoints)
        ].filter(Boolean);

        return [parts.join('\n'), storageStructLayout];
    }
}
