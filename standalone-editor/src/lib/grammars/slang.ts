import type { languages } from 'monaco-editor';

export const slangConfiguration: languages.LanguageConfiguration = {
    comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
        ['<', '>']
    ],
    autoClosingPairs: [
        { open: '[', close: ']' },
        { open: '{', close: '}' },
        { open: '(', close: ')' },
        { open: '<', close: '>' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '<', close: '>' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
    ]
};

export const slangLanguageDef = <languages.IMonarchLanguage>{
    tokenPostfix: '.slang',
    defaultToken: 'invalid',
    unicode: true,

    keywords: [
        'if',
        'else',
        'switch',
        'case',
        'default',
        'return',
        'try',
        'throw',
        'throws',
        'catch',
        'while',
        'for',
        'let',
        'var',
        'spirv_asm',
        'no_diff',
        'dynamic_uniform',
        'fwd_diff',
        'bwd_diff',
        'module',
        'implementing',
        '__include',
        '__dispatch_kernel',
        'row_major',
        'column_major',
        'nointerpolation',
        'snorm',
        'unorm',
        'globallycoherent',
        'extern',
        'layout',
        'do',
        'static',
        'const',
        'in',
        'out',
        'inout',
        'ref',
        '__subscript',
        '__init',
        'property',
        'get',
        'set',
        'class',
        'struct',
        'interface',
        'public',
        'private',
        'internal',
        'protected',
        'typedef',
        'typealias',
        'uniform',
        'export',
        'groupshared',
        'extension',
        'associatedtype',
        'this',
        'namespace',
        'This',
        'using',
        '__generic',
        '__exported',
        'import',
        'enum',
        'break',
        'continue',
        'discard',
        'defer',
        'cbuffer',
        'tbuffer',
        'func',
        'is',
        'as',
        'nullptr',
        'none',
        'true',
        'false',
        'functype',
        'sizeof',
        'alignof',
        '__target_switch',
        '__intrinsic_asm',
        'typename',
        'each',
        'expand',
        'where',
        'register',
        'packoffset'
    ],

    typeKeywords: [
        'bool',
        'double',
        'uint',
        'int',
        'short',
        'char',
        'void',
        'float',
        'int16_t',
        'uint16_t',
        'int32_t',
        'uint32_t',
        'int64_t',
        'uint64_t',
        'int8_t',
        'uint8_t',
        'half',
        'float',
        'double',
        'vec',
        'ivec',
        'mat'
    ],

    builtinTypes: [
        'RWStructuredBuffer',
        'StructuredBuffer',
        'RasterizerOrderedStructuredBuffer',
        'FeedbackStructuredBuffer',
        'RWTexture1D',
        'RWTexture2D',
        'RWTexture3D',
        'Texture1D',
        'Texture2D',
        'Texture3D',
        'Texture2DArray',
        'TextureCube',
        'TextureCubeArray',
        'ByteAddressBuffer',
        'RWByteAddressBuffer',
        'RasterizerOrderedByteAddressBuffer',
        'ConstantBuffer',
        'ParameterBlock',
        'SamplerState',
        'SamplerComparisonState'
    ],

    operators: [
        '=',
        '>',
        '<',
        '!',
        '~',
        '?',
        ':',
        '==',
        '<=',
        '>=',
        '!=',
        '&&',
        '||',
        '++',
        '--',
        '+',
        '-',
        '*',
        '/',
        '&',
        '|',
        '^',
        '%',
        '<<',
        '>>',
        '>>>',
        '+=',
        '-=',
        '*=',
        '/=',
        '&=',
        '|=',
        '^=',
        '%=',
        '<<=',
        '>>=',
        '>>>='
    ],

    namespaceFollows: ['namespace', 'using'],

    symbols: /[=><!~?:&|+\-*/^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
        root: [
            // C++ raw string literal
            [/(R"([a-zA-Z0-9_]*?)\()/, { token: 'string.raw.quote', next: '@rawstring.$2' }],

            // Builtin types
            [
                /(((RW|RasterizerOrdered|Feedback)?(StructuredBuffer|Texture[A-Za-z0-9]+|ByteAddressBuffer))|ConstantBuffer|ParameterBlock|SamplerState|SamplerComparisonState|(image|sampler)[A-Z0-9]+D(Array)?(MS)?(Shadow)?)\b/,
                'type'
            ],
            [
                /(bool|int|uint|float|int16_t|uint16_t|int32_t|uint32_t|int64_t|uint64_t|int8_t|uint8_t|half|float|double|vec|ivec|mat)((1|2|3|4)(x(1|2|3|4))?)?\b/,
                'keyword.type'
            ],

            // Identifiers and keywords
            [
                /@?[a-zA-Z_]\w*/,
                {
                    cases: {
                        '@typeKeywords': 'keyword.type',
                        '@namespaceFollows': { token: 'keyword.$0', next: '@namespace' },
                        '@keywords': { token: 'keyword.$0', next: '@qualified' },
                        '@default': { token: 'identifier', next: '@qualified' }
                    }
                }
            ],

            // Preprocessor directives
            [/#[a-z]+\w*/, 'keyword.directive'],

            // Whitespace
            { include: '@whitespace' },

            // Delimiters and operators
            [/[{}()[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [
                /@symbols/,
                {
                    cases: {
                        '@operators': 'operator',
                        '@default': ''
                    }
                }
            ],

            // Numbers
            [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],

            // Delimiter
            [/[;,.]/, 'delimiter'],

            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

            // Characters
            [/'[^\\']'/, 'string'],
            [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
            [/'/, 'string.invalid']
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

        rawstring: [
            [
                /\)([a-zA-Z0-9_]*?)"/,
                {
                    cases: {
                        '$1==$S2': { token: 'string.raw.quote', next: '@pop' },
                        '@default': 'string.raw'
                    }
                }
            ],
            [/./, 'string.raw']
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment']
        ],

        qualified: [
            [
                /[a-zA-Z_][\w]*/,
                {
                    cases: {
                        '@keywords': { token: 'keyword.$0' },
                        '@default': 'identifier'
                    }
                }
            ],
            [/\./, 'delimiter'],
            ['', '', '@pop']
        ],

        namespace: [
            { include: '@whitespace' },
            [/[A-Z]\w*/, 'namespace'],
            [/[.=]/, 'delimiter'],
            ['', '', '@pop']
        ]
    }
};
