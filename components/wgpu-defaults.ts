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
fn main_hist(@builtin(global_invocation_id) id: uint3) {
    let screen_size = uint2(textureDimensions(screen));
    let resolution = float2(screen_size);
    var seed = id.x + id.y * screen_size.x + time.frame * screen_size.x * screen_size.y;
    for (var iter = 0; iter < 8; iter = iter + 1) {
    let aspect = resolution.xy / resolution.y;
    let uv  = float2(float(id.x) + pcg(&seed), float(id.y) + pcg(&seed)) / resolution;
    let uv0 = float2(float(id.x) + pcg(&seed), float(id.y) + pcg(&seed)) / resolution;
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
        let idx1 = int(resolution.x * p.x) + int(resolution.y * p.y) * int(screen_size.x);
        let idx2 = int(resolution.x * p.x) + int(resolution.y * (1. - p.y)) * int(screen_size.x);
        if (n < 25) {
            atomicAdd(&atomic_storage[idx1*4+2], 1);
            atomicAdd(&atomic_storage[idx2*4+2], 1);
        } else if (n < 250) {
            atomicAdd(&atomic_storage[idx1*4+1], 1);
            atomicAdd(&atomic_storage[idx2*4+1], 1);
        } else if (n < 2500) {
            atomicAdd(&atomic_storage[idx1*4+0], 1);
            atomicAdd(&atomic_storage[idx2*4+0], 1);
        }
    }
    }
}

@stage(compute) @workgroup_size(16, 16)
fn main_image(@builtin(global_invocation_id) id: uint3) {
    let screen_size = uint2(textureDimensions(screen));
    if (id.x >= screen_size.x || id.y >= screen_size.y) { return; }
    let idx = int(id.x + id.y * screen_size.x);
    let x = float(atomicLoad(&atomic_storage[idx*4+0]));
    let y = float(atomicLoad(&atomic_storage[idx*4+1]));
    let z = float(atomicLoad(&atomic_storage[idx*4+2]));
    var r = float3(x + y + z, y + z, z) / 3e3;
    r = smoothstep(float3(0.), float3(1.), 2.5 * pow(r, float3(.9, .8, .7)));
    textureStore(screen, int2(id.xy), float4(r, 1.));
    atomicStore(&atomic_storage[idx*4+0], int(x * .7));
    atomicStore(&atomic_storage[idx*4+1], int(y * .7));
    atomicStore(&atomic_storage[idx*4+2], int(z * .7));
}
`