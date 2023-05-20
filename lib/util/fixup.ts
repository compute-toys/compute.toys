export function fixup_shader_code(code: string): string {
    if (!code.includes('#storage')) {
        if (code.includes('atomic_storage'))
            code = '#storage atomic_storage array<atomic<i32>>\n\n' + code;
        if (code.includes('float_storage'))
            code = '#storage float_storage array<vec4<f32>>\n\n' + code;
    }
    code = code.replace(/@stage\(compute\)/g, '@compute');
    code = code.replace(/^type /gm, 'alias ');
    code = code.replace(/^let /gm, 'const ');
    code = code.replace(/alias\s+bool([2-4])\s*=\s*vec\1<\s*bool\s*>\s*;/gm, '');
    code = code.replace(/alias\s+float([2-4])x([2-4])\s*=\s*mat\1x\2<\s*f32\s*>\s*;/gm, '');
    return code;
}
