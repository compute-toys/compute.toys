import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// fix: https://github.com/microsoft/monaco-editor/issues/3602
export const MonacoTheme = styled(Box)(({ theme }) => ({
    '.monaco-action-bar': {
        backgroundColor: `${theme.palette.background.paper} !important`
    }
}));

export const defineMonacoTheme = (monaco, name: string, theme: any) => {
    return monaco.editor.defineTheme(name, {
        base: 'vs-dark', // can also be vs-dark or hc-black
        inherit: true, // can also be false to completely replace the builtin rules

        rules: [
            { token: 'keyword', foreground: theme.palette.dracula.cyan },
            { token: 'keyword.type', foreground: theme.palette.dracula.purple },
            {
                token: 'keyword.storage',
                foreground: theme.palette.dracula.pink
            },
            {
                token: 'keyword.function',
                foreground: theme.palette.dracula.green
            },
            {
                token: 'keyword.typedef',
                foreground: theme.palette.dracula.orange
            },
            { token: 'keyword.struct', foreground: theme.palette.dracula.cyan },
            {
                token: 'keyword.constants',
                foreground: theme.palette.dracula.comment
            },
            { token: 'keyword.box', foreground: theme.palette.dracula.purple },
            {
                token: 'keyword.builtinFunction',
                foreground: theme.palette.dracula.cyan
            },
            {
                token: 'keyword.addressSpace',
                foreground: theme.palette.dracula.yellow
            },
            {
                token: 'keyword.memoryAccessMode',
                foreground: theme.palette.dracula.yellow
            },
            {
                token: 'keyword.texelFormat',
                foreground: theme.palette.dracula.yellow
            },
            {
                token: 'keyword.textureType',
                foreground: theme.palette.dracula.orange
            },
            {
                token: 'keyword.samplerType',
                foreground: theme.palette.dracula.orange
            },
            {
                token: 'identifier',
                foreground: theme.palette.dracula.foreground
            },
            { token: 'attribute', foreground: theme.palette.dracula.yellow },
            {
                token: 'attribute.builtin',
                foreground: theme.palette.dracula.yellow
            },
            {
                token: 'attribute.builtin.type',
                foreground: theme.palette.dracula.orange
            },
            {
                token: 'attribute.stage',
                foreground: theme.palette.dracula.yellow
            },
            {
                token: 'attribute.stage.type',
                foreground: theme.palette.dracula.orange
            },
            { token: 'field', foreground: theme.palette.dracula.pink },
            { token: 'invalid', foreground: theme.palette.dracula.red },
            { token: 'comment', foreground: theme.palette.dracula.comment },
            { token: 'number', foreground: theme.palette.dracula.green }
        ],
        colors: {
            'editor.background': theme.palette.background.paper
        }
    });
};
