export const default_shader = `
// 2022 David A Roberts <https://davidar.io/>

// https://www.jcgt.org/published/0009/03/02/
// https://www.pcg-random.org/
fn pcg(seed: ptr<function, uint>) -> float {
	*seed = *seed * 747796405u + 2891336453u;
	let word = ((*seed >> ((*seed >> 28u) + 4u)) ^ *seed) * 277803737u;
	return float((word >> 22u) ^ word) / float(0xffffffffu);
}

@stage(compute) @workgroup_size(16, 16)
fn main_hist(@builtin(global_invocation_id) global_id: uint3) {
    let resolution = float2(screen.size);
    var seed = global_id.x + global_id.y * screen.size.x + time.frame * screen.size.x * screen.size.y;
    for (var iter = 0; iter < 8; iter = iter + 1) {
    let aspect = resolution.xy / resolution.y;
    let uv  = float2(float(global_id.x) + pcg(&seed), float(global_id.y) + pcg(&seed)) / resolution;
    let uv0 = float2(float(global_id.x) + pcg(&seed), float(global_id.y) + pcg(&seed)) / resolution;
    let c  = (uv  * 2. - 1.) * aspect * 1.5;
    let z0 = (uv0 * 2. - 1.) * aspect * 1.5;
    var z = z0;
    var n = 0;
    for (n = 0; n < 2500; n = n + 1) {
        z = float2(z.x * z.x - z.y * z.y, 2. * z.x * z.y) + c;
        if (dot(z,z) > 4.) { break; }
    }
    z = z0;
    for (var i = 0; i < 2500; i = i + 1) {
        z = float2(z.x * z.x - z.y * z.y, 2. * z.x * z.y) + c;
        if (dot(z,z) > 4.) { break; }
        let t = float(time.frame) / 60.;
        let p = (cos(.3*t) * z + sin(.3*t) * c) / 1.5 / aspect * .5 + .5;
        if (p.x < 0. || p.x > 1. || p.y < 0. || p.y > 1.) { continue; }
        let id1 = uint(resolution.x * p.x) + uint(resolution.y * p.y) * screen.size.x;
        let id2 = uint(resolution.x * p.x) + uint(resolution.y * (1. - p.y)) * screen.size.x;
        if (n < 25) {
            atomicAdd(&buf.data[id1*4u+2u], 1);
            atomicAdd(&buf.data[id2*4u+2u], 1);
        } else if (n < 250) {
            atomicAdd(&buf.data[id1*4u+1u], 1);
            atomicAdd(&buf.data[id2*4u+1u], 1);
        } else if (n < 2500) {
            atomicAdd(&buf.data[id1*4u+0u], 1);
            atomicAdd(&buf.data[id2*4u+0u], 1);
        }
    }
    }
}

@stage(compute) @workgroup_size(16, 16)
fn main_image(@builtin(global_invocation_id) global_id: uint3) {
    if (global_id.x >= screen.size.x || global_id.y >= screen.size.y) { return; }
    let id = global_id.x + global_id.y * screen.size.x;
    let x = float(atomicLoad(&buf.data[id*4u+0u]));
    let y = float(atomicLoad(&buf.data[id*4u+1u]));
    let z = float(atomicLoad(&buf.data[id*4u+2u]));
    var r = float3(x + y + z, y + z, z) / 3e3;
    r = smoothstep(float3(0.), float3(1.), 2.5 * pow(r, float3(.9, .8, .7)));
    textureStore(col, int2(global_id.xy), float4(r, 1.));
    atomicStore(&buf.data[id*4u+0u], int(x * .7));
    atomicStore(&buf.data[id*4u+1u], int(y * .7));
    atomicStore(&buf.data[id*4u+2u], int(z * .7));
}
`