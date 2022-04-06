import { theme } from "../theme/theme";

export const defineMonacoTheme = (monaco, name: string) => {
    return monaco.editor.defineTheme(name, {
        base: 'vs-dark', // can also be vs-dark or hc-black
        inherit: true, // can also be false to completely replace the builtin rules
        rules: [
            { token: 'keyword.type.wgsl', foreground: theme.palette.primary.light },
            { token: 'comment.js', foreground: '008800', fontStyle: 'bold' },
            { token: 'comment.css', foreground: '0000ff' } // will inherit fontStyle from `comment` above
        ],
        colors: {
        }
    });
}