export type ReflectionBinding =
    | {
          kind: 'uniform';
          offset: number;
          size: number;
      }
    | {
          kind: 'descriptorTableSlot';
          index: number;
      }
    | {
          kind: 'subElementRegisterSpace';
          index: number;
      };

export type ReflectionType =
    | {
          kind: 'struct';
          name: string;
          fields: ReflectionParameter[];
      }
    | {
          kind: 'vector';
          elementCount: number;
          elementType: ReflectionType;
      }
    | {
          kind: 'scalar';
          scalarType: `${'uint' | 'int'}${8 | 16 | 32 | 64}` | `${'float'}${16 | 32 | 64}`;
      }
    | {
          kind: 'resource';
          baseShape: 'structuredBuffer';
          access?: 'readWrite';
          resultType: ReflectionType;
      }
    | {
          kind: 'resource';
          baseShape: 'texture2D';
          access?: 'readWrite';
      }
    | {
          kind: 'parameterBlock';
          elementType: ReflectionType;
          containerVarLayout?: {
              bindings: ReflectionBinding[];
          };
          elementVarLayout?: {
              type: ReflectionType;
              binding: ReflectionBinding;
          };
      };

export type ReflectionParameter = {
    binding?: ReflectionBinding;
    name: string;
    type: ReflectionType;
    userAttribs?: ReflectionUserAttribute[];
    semanticName?: string;
};

export type ReflectionJSON = {
    entryPoints: ReflectionEntryPoint[];
    parameters: ReflectionParameter[];
};

export type ReflectionEntryPoint = {
    name: string;
    parameters: ReflectionParameter[];
    stage: string;
    threadGroupSize: number[];
    userAttribs?: ReflectionUserAttribute[];
};

export type ReflectionUserAttribute = {
    arguments: (number | string)[];
    name: string;
};
