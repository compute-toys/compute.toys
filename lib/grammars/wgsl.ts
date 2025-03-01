// This file was created for good syntax highlighting and later inspired by fb47a0f commit from
// https://github.com/microsoft/monaco-editor/blob/main/src/basic-languages/wgsl/wgsl.ts

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
    unicode: true,

    keywords: [
        //->alias
        'break',
        'case',
        //->const
        //->const_assert
        'continue',
        'continuing',
        'default',
        'diagnostic',
        'discard',
        'else',
        'enable',
        //->fn
        'for',
        'if',
        //->let
        'loop',
        'requires',
        'return',
        //->struct
        'switch',
        //->var
        'while',

        'private',
        'read',
        'read_write',
        'storage',
        'uniform',
        'workgroup',
        'write'
    ],

    reservedKeywords: [
        'NULL',
        'Self',
        'abstract',
        'active',
        'alignas',
        'alignof',
        'as',
        'asm',
        'asm_fragment',
        'async',
        'attribute',
        'auto',
        'await',
        'become',
        'binding_array',
        'cast',
        'catch',
        'class',
        'co_await',
        'co_return',
        'co_yield',
        'coherent',
        'column_major',
        'common',
        'compile',
        'compile_fragment',
        'concept',
        'const_cast',
        'consteval',
        'constexpr',
        'constinit',
        'crate',
        'debugger',
        'decltype',
        'delete',
        'demote',
        'demote_to_helper',
        'do',
        'dynamic_cast',
        'enum',
        'explicit',
        'export',
        'extends',
        'extern',
        'external',
        'fallthrough',
        'filter',
        'final',
        'finally',
        'friend',
        'from',
        'fxgroup',
        'get',
        'goto',
        'groupshared',
        'highp',
        'impl',
        'implements',
        'import',
        'inline',
        'instanceof',
        'interface',
        'layout',
        'lowp',
        'macro',
        'macro_rules',
        'match',
        'mediump',
        'meta',
        'mod',
        'module',
        'move',
        'mut',
        'mutable',
        'namespace',
        'new',
        'nil',
        'noexcept',
        'noinline',
        'nointerpolation',
        'noperspective',
        'null',
        'nullptr',
        'of',
        'operator',
        'package',
        'packoffset',
        'partition',
        'pass',
        'patch',
        'pixelfragment',
        'precise',
        'precision',
        'premerge',
        'priv',
        'protected',
        'pub',
        'public',
        'readonly',
        'ref',
        'regardless',
        'register',
        'reinterpret_cast',
        'require',
        'resource',
        'restrict',
        'self',
        'set',
        'shared',
        'sizeof',
        'smooth',
        'snorm',
        'static',
        'static_assert',
        'static_cast',
        'std',
        'subroutine',
        'super',
        'target',
        'template',
        'this',
        'thread_local',
        'throw',
        'trait',
        'try',
        'type',
        'typedef',
        'typeid',
        'typename',
        'typeof',
        'union',
        'unless',
        'unorm',
        'unsafe',
        'unsized',
        'use',
        'using',
        'varying',
        'virtual',
        'volatile',
        'wgsl',
        'where',
        'with',
        'writeonly',
        'yield'
    ],

    storageKeywords: ['var', 'let', 'override', 'const', 'const_assert'],

    typedefKeywords: ['alias'],

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
        'bool',
        'u32',
        'f16',
        'f32',
        'i32',
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
        'bitcast',

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
        'countLeadingZeros',
        'countOneBits',
        'countTrailingZeros',
        'cross',
        'degrees',
        'determinant',
        'distance',
        'dot',
        'dot4U8Packed',
        'dot4I8Packed',
        'exp',
        'exp2',
        'extractBits', //(signed)
        //extractBits (unsigned)
        'faceForward',
        'firstLeadingBit', //(signed)
        //firstLeadingBit (unsigned)
        'firstTrailingBit',
        'floor',
        'fma',
        'fract',
        'frexp',
        'insertBits',
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
        'reverseBits',
        'round',
        'saturate',
        'sign',
        'sin',
        'sinh',
        'smoothstep',
        'sqrt',
        'step',
        'tan',
        'tanh',
        'transpose',
        'trunc',

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
        'textureNumLayers',
        'textureNumLevels',
        'textureNumSamples',
        'textureSample',
        'textureSampleBias',
        'textureSampleCompare',
        'textureSampleCompareLevel',
        'textureSampleGrad',
        'textureSampleLevel',
        'textureSampleBaseClampToEdge',
        'textureStore',

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
        'pack4xI8',
        'pack4xU8',
        'pack4xI8Clamp',
        'pack4xU8Clamp',
        'pack2x16snorm',
        'pack2x16unorm',
        'pack2x16float',

        'unpack4x8snorm',
        'unpack4x8unorm',
        'unpack4xI8',
        'unpack4xU8',
        'unpack2x16snorm',
        'unpack2x16unorm',
        'unpack2x16float',

        'storageBarrier',
        'textureBarrier',
        'workgroupBarrier',
        'workgroupUniformLoad',

        'subgroupElect',
        'subgroupAll',
        'subgroupAny',
        'subgroupBroadcast',
        'subgroupBroadcastFirst',
        'subgroupBallot',
        'subgroupShuffle',
        'subgroupShuffleXor',
        'subgroupShuffleUp',
        'subgroupShuffleDown',
        'subgroupSum',
        'subgroupExclusiveSum',
        'subgroupProduct',
        'subgroupExclusiveProduct',
        'subgroupAnd',
        'subgroupOr',
        'subgroupXor',
        'subgroupMin',
        'subgroupMax',
        'quadBroadcast',
        'quadSwapX',
        'quadSwapY',
        'quadSwapDiagonal'
    ],

    addressSpaceKeywords: ['function', 'private', 'workgroup', 'uniform', 'storage'],

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
        'rgba32float',
        'bgra8unorm'
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
        'global_invocation_id',
        'local_invocation_id',
        'local_invocation_index',
        'workgroup_id',
        'num_workgroups',
        'subgroup_invocation_id',
        'subgroup_size'
    ],

    constants: ['true', 'false'],

    operators: [
        '&',
        '&&',
        '->',
        '/',
        '=',
        '==',
        '!=',
        '>',
        '>=',
        '<',
        '<=',
        '%',
        '-',
        '--',
        '+',
        '++',
        '|',
        '||',
        '*',
        '<<',
        '>>',
        '+=',
        '-=',
        '*=',
        '/=',
        '%=',
        '&=',
        '|=',
        '^=',
        '>>=',
        '<<='
    ],

    escapes: /\\([nrt0"''\\]|x[0-9a-fA-F]{2}|u\{[0-9a-fA-F]{1,6}\})/,
    delimiters: /[,;:]/,
    symbols: /[!%&*+\-/<=>^|_~,]+/,

    // TODO: check tokenizer according to spec
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
                /(@)([a-zA-Z][a-zA-Z0-9_]+)(\()((?:[a-zA-Z0-9_]+[a-zA-Z0-9_,\s]*)|(?:[a-zA-Z][a-zA-Z0-9_]+))(\))/,
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
            // Decimal float literals
            // https://www.w3.org/TR/WGSL/#syntax-decimal_float_literal
            // 0, with type-specifying suffix.
            [/0[fh]/, 'number.float'],
            // Other decimal integer, with type-specifying suffix.
            [/[1-9][0-9]*[fh]/, 'number.float'],
            // Has decimal point, at least one digit after decimal.
            [/[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?[fh]?/, 'number.float'],
            // Has decimal point, at least one digit before decimal.
            [/[0-9]+\.[0-9]*([eE][+-]?[0-9]+)?[fh]?/, 'number.float'],
            // Has at least one digit, and has an exponent.
            [/[0-9]+[eE][+-]?[0-9]+[fh]?/, 'number.float'],

            // Hex float literals
            // https://www.w3.org/TR/WGSL/#syntax-hex_float_literal
            [/0[xX][0-9a-fA-F]*\.[0-9a-fA-F]+(?:[pP][+-]?[0-9]+[fh]?)?/, 'number.hex'],
            [/0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*(?:[pP][+-]?[0-9]+[fh]?)?/, 'number.hex'],
            [/0[xX][0-9a-fA-F]+[pP][+-]?[0-9]+[fh]?/, 'number.hex'],

            // Hexadecimal integer literals
            // https://www.w3.org/TR/WGSL/#syntax-hex_int_literal
            [/0[xX][0-9a-fA-F]+[iu]?/, 'number.hex'],

            // Decimal integer literals
            // https://www.w3.org/TR/WGSL/#syntax-decimal_int_literal
            // We need two rules here because 01 is not valid.
            [/[1-9][0-9]*[iu]?/, 'number'],
            [/0[iu]?/, 'number'] // Must match last
        ]
    }
};
