export function fixup_shader_code(code: string): string {
    if (!code.includes('#storage')) {
        if (code.includes('atomic_storage')) code = '#storage atomic_storage array<atomic<i32>>\n\n' + code;
        if (code.includes('float_storage')) code = '#storage float_storage array<vec4<f32>>\n\n' + code;
    }
    code = code.replace(/@stage\(compute\)/g, '@compute');
    return code;
}
