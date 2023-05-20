import type { languages } from 'monaco-editor';

export const wgslConfiguration: languages.LanguageConfiguration = {
    comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
    ],
    autoClosingPairs: [
        { open: '[', close: ']' },
        { open: '{', close: '}' },
        { open: '(', close: ')' }
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' }
    ]
};

export const wgslLanguageDef = <languages.IMonarchLanguage>{
    tokenPostfix: '.wgsl',
    defaultToken: 'invalid',

    keywords: [
        'bitcast',
        'block',
        'break',
        'case',
        'continue',
        'continuing',
        'default',
        'discard',
        'else',
        'elseif',
        'enable',
        'fallthrough',
        'for',
        'if',
        'loop',
        'private',
        'read',
        'read_write',
        'return',
        'storage',
        'switch',
        'uniform',
        'workgroup',
        'write'
    ],

    reservedKeywords: [
        'asm',
        'const',
        'do',
        'enum',
        'handle',
        'mat',
        'premerge',
        'regardless',
        'typedef',
        'unless',
        'using',
        'vec',
        'void',
        'while'
    ],

    storageKeywords: ['var', 'let'],

    typedefKeywords: ['type', 'alias'],

    enumKeywords: ['enum'],

    structKeywords: ['struct'],

    functionKeywords: ['fn'],

    typeKeywords: [
        'int',
        'int2',
        'int3',
        'int4',
        'uint',
        'uint2',
        'uint3',
        'uint4',
        'float',
        'float2',
        'float3',
        'float4',
        'vec2f',
        'vec3f',
        'vec4f',
        'vec2i',
        'vec3i',
        'vec4i',
        'vec2u',
        'vec3u',
        'vec4u',
        'vec2h',
        'vec3h',
        'vec4h',
        'mat4x4h',
        'mat4x3h',
        'mat4x2h',
        'mat3x4h',
        'mat3x3h',
        'mat3x2h',
        'mat2x4h',
        'mat2x3h',
        'mat2x2h',
        'mat4x4f',
        'mat4x3f',
        'mat4x2f',
        'mat3x4f',
        'mat3x3f',
        'mat3x2f',
        'mat2x4f',
        'mat2x3f',
        'mat2x2f',
        'char',
        'bool',
        'u8',
        'u16',
        'u32',
        'u64',
        'f32',
        'f64',
        'i8',
        'i16',
        'i32',
        'i64',
        'function'
    ],

    boxKeywords: [
        'var',
        'vec2',
        'vec3',
        'vec4',
        'mat2x2',
        'mat3x2',
        'mat3x3',
        'mat4x3',
        'mat2x4',
        'mat3x4',
        'mat4x4',
        'ptr',
        'array', // can take two type params
        'atomic'
    ],

    builtinFunctionKeywords: [
        'all',
        'any',
        'select',

        'arrayLength',

        'abs',
        'acos',
        'acosh',
        'asin',
        'asinh',
        'atan',
        'atanh',
        'atan2',
        'ceil',
        'clamp',
        'cos',
        'cosh',
        'cross',
        'degrees',
        'distance',
        'exp',
        'exp2',
        'faceForward',
        'floor',
        'fma',
        'fract',
        'frexp',
        'inverseSqrt',
        'ldexp',
        'length',
        'log',
        'log2',
        'max',
        'min',
        'mix',
        'modf',
        'normalize',
        'pow',
        'quantizeToF16',
        'radians',
        'reflect',
        'refract',
        'round',
        'sign',
        'sin',
        'sinh',
        'smoothstep',
        'sqrt',
        'step',
        'tan',
        'tanh',
        'trunc',

        'countLeadingZeros',
        'countOneBits',
        'countTrailingZeros',
        'firstLeadingBit',
        'firstTrailingBit',
        'extractBits',
        'insertBits',
        'reverseBits',
        'shiftLeft',
        'shiftRight',

        'determinant',
        'transpose',

        'dot',

        'dpdx',
        'dpdxCoarse',
        'dpdxFine',
        'dpdy',
        'dpdyCoarse',
        'dpdyFine',
        'fwidth',
        'fwidthCoarse',
        'fwidthFine',

        'textureDimensions',
        'textureGather',
        'textureGatherCompare',
        'textureLoad',
        'textureSample',
        'textureSampleBias',
        'textureSampleCompare',
        'textureSampleCompareLevel',
        'textureSampleGrad',
        'textureSampleLevel',
        'textureStore',
        'textureNumLayers',
        'textureNumLevels',
        'textureNumSamples',

        'atomicLoad',
        'atomicStore',
        'atomicAdd',
        'atomicSub',
        'atomicMax',
        'atomicMin',
        'atomicAnd',
        'atomicOr',
        'atomicXor',
        'atomicExchange',
        'atomicCompareExchangeWeak',

        'pack4x8snorm',
        'pack4x8unorm',
        'pack2x16snorm',
        'pack2x16unorm',
        'pack2x16float',
        'unpack4x8snorm',
        'unpack4x8unorm',
        'unpack2x16snorm',
        'unpack2x16unorm',
        'unpack2x16float',

        'storageBarrier',
        'workgroupBarrier'
    ],

    addressSpaceKeywords: ['function', 'private', 'workgroup', 'uniform', 'storage', 'handle'],

    memoryAccessModeKeywords: ['read', 'write', 'read_write'],

    texelFormatKeywords: [
        'rgba8unorm',
        'rgba8snorm',
        'rgba8uint',
        'rgba8sint',
        'rgba16uint',
        'rgba16sint',
        'rgba16float',
        'r32uint',
        'r32sint',
        'r32float',
        'rg32uint',
        'rg32sint',
        'rg32float',
        'rgba32uint',
        'rgba32sint',
        'rgba32float'
    ],

    textureTypeKeywords: [
        'texture_1d',
        'texture_2d',
        'texture_2d_array',
        'texture_3d',
        'texture_cube',
        'texture_cube_array',
        'texture_multisampled_2d',
        'texture_storage_1d',
        'texture_storage_2d',
        'texture_storage_2d_array',
        'texture_storage_3d',
        'texture_depth_2d',
        'texture_depth_2d_array',
        'texture_depth_cube',
        'texture_depth_cube_array',
        'texture_depth_multisampled_2d'
    ],

    samplerTypeKeywords: ['sampler', 'sampler_comparison'],

    annotationKeywords: [
        'group',
        'binding',
        'workgroup_size',
        'block',
        'stride',
        'offset',
        'layout',
        'align',
        'id',
        'interpolate',
        'invariant',
        'location',
        'size',
        'stage',
        'builtin'
    ],

    stageKeywords: ['compute', 'vertex', 'fragment'],

    vertexStageKeywords: ['vertex_index', 'instance_index', 'position'],

    fragmentStageKeywords: [
        'position',
        'front_facing',
        'frag_depth',
        'sample_index',
        'sample_mask'
    ],

    computeStageKeywords: [
        'local_invocation_id',
        'local_invocation_index',
        'global_invocation_id',
        'workgroup_id',
        'num_workgroups'
    ],

    constants: ['true', 'false'],

    operators: [
        '!',
        '!=',
        '%',
        '%=',
        '&',
        '&=',
        '&&',
        '*',
        '*=',
        '+',
        '+=',
        '-',
        '-=',
        '->',
        '/',
        '/=',
        ':',
        ';',
        '<',
        '<=',
        '=',
        '==',
        '>',
        '>=',
        '^',
        '^=',
        '|',
        '|=',
        '||'
    ],

    escapes: /\\([nrt0"''\\]|x[0-9a-fA-F]{2}|u\{[0-9a-fA-F]{1,6}\})/,
    delimiters: /[,]/,
    symbols: /[#!%&*+\-./:;<=>@^|_?]+/,
    intSuffixes: /[iu]/,
    floatSuffixes: /f/,

    tokenizer: {
        root: [
            // Raw string literals
            [/r(#*)"/, { token: 'string.quote', bracket: '@open', next: '@stringraw.$1' }],
            [
                /[a-zA-Z][a-zA-Z0-9_]*!?|_[a-zA-Z0-9_]+/,
                {
                    cases: {
                        '@typeKeywords': 'keyword.type',
                        '@storageKeywords': 'keyword.storage',
                        '@keywords': 'keyword',
                        '@reservedKeywords': 'invalid',
                        '@functionKeywords': 'keyword.function',
                        '@typedefKeywords': 'keyword.typedef',
                        '@structKeywords': 'keyword.struct',
                        '@constants': 'keyword.constants',
                        '@boxKeywords': 'keyword.box',
                        '@builtinFunctionKeywords': 'keyword.builtinFunction',
                        '@addressSpaceKeywords': 'keyword.addressSpace',
                        '@memoryAccessModeKeywords': 'keyword.memoryAccessMode',
                        '@texelFormatKeywords': 'keyword.texelFormat',
                        '@textureTypeKeywords': 'keyword.textureType',
                        '@samplerTypeKeywords': 'keyword.samplerType',
                        '@default': 'identifier'
                    }
                }
            ],
            // Annotations
            // Overly complex...
            [/[@]compute/, 'attribute.stage.type'],
            [
                /(@)([a-zA-Z][a-zA-Z0-9_]+)(\()((?:\d+[\d,\s]*)|(?:[a-zA-Z][a-zA-Z0-9_]+))(\))/,
                {
                    cases: {
                        '$2==builtin': [
                            'attribute',
                            'attribute.builtin',
                            'delimiter.parenthesis',
                            {
                                cases: {
                                    '@vertexStageKeywords': 'attribute.builtin.type',
                                    '@fragmentStageKeywords': 'attribute.builtin.type',
                                    '@computeStageKeywords': 'attribute.builtin.type',
                                    '@default': 'invalid'
                                }
                            },
                            'delimiter.parenthesis'
                        ],
                        '$2@annotationKeywords': 'attribute'
                    }
                }
            ],
            // Field Accessor
            [/(\.)(((?:[xyzw]{1,4}|[rgba]{1,4})(?![a-zA-Z0-9_]+)))/, 'field.vector'],
            [/(\.)(?:[a-zA-Z][a-zA-Z0-9_]+)/, 'field'],

            // Strings
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

            { include: '@numbers' },

            // The preprocessor checks must be before whitespace as they check /^\s*#/ which
            // otherwise fails to match later after other whitespace has been removed.

            // Inclusion
            [/^\s*#\s*include/, { token: 'keyword.directive.include', next: '@include' }],

            // Preprocessor directive
            [/^\s*#\s*\w+/, 'keyword.directive'],

            // Whitespace + comments
            { include: '@whitespace' },
            [
                /@delimiters/,
                {
                    cases: {
                        '@keywords': 'keyword',
                        '@default': 'delimiter'
                    }
                }
            ],

            [/[{}()[\]<>]/, '@brackets'],
            [/@symbols/, { cases: { '@operators': 'operator', '@default': 'invalid' } }]
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment']
        ],

        comment: [
            [/[^/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],
            ['\\*/', 'comment', '@pop'],
            [/[/*]/, 'comment']
        ],

        string: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        include: [
            [
                /(\s*)(<)([^<>]*)(>)/,
                [
                    '',
                    'keyword.directive.include.begin',
                    'string.include.identifier',
                    { token: 'keyword.directive.include.end', next: '@pop' }
                ]
            ],
            [
                /(\s*)(")([^"]*)(")/,
                [
                    '',
                    'keyword.directive.include.begin',
                    'string.include.identifier',
                    { token: 'keyword.directive.include.end', next: '@pop' }
                ]
            ]
        ],

        numbers: [
            //Float (from WGSL spec)
            [
                /(((([0-9]*\.[0-9]+)|([0-9]+\.[0-9]*))([eE](\+|-)?[0-9]+)?)|([0-9]+[eE](\+|-)?[0-9]+))f?|0f|[1-9][0-9]*f/,
                { token: 'number' }
            ],
            //Hex Float (from WGSL spec)
            [
                /0[xX]((([0-9a-fA-F]*\.[0-9a-fA-F]+|[0-9a-fA-F]+\.[0-9a-fA-F]*)([pP](\+|-)?[0-9]+f?)?)|([0-9a-fA-F]+[pP](\+|-)?[0-9]+f?))/,
                { token: 'number' }
            ],
            //Hex/Decimal Integer (from WGSL spec)
            [/(0[xX][0-9a-fA-F]+|0|[1-9][0-9]*)[iu]?/, { token: 'number' }]
        ]
    }
};
