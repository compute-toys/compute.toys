import std;

// GLSL types
public typealias vec2  = float2;    public typealias vec3  = float3;    public typealias vec4  = float4;
public typealias ivec2 = int2;      public typealias ivec3 = int3;      public typealias ivec4 = int4;
public typealias uvec2 = uint2;     public typealias uvec3 = uint3;     public typealias uvec4 = uint4;
public typealias bvec2 = bool2;     public typealias bvec3 = bool3;     public typealias bvec4 = bool4;
public typealias mat2  = float2x2;  public typealias mat3  = float3x3;  public typealias mat4  = float4x4;
public typealias mat2x2 = float2x2; public typealias mat2x3 = float2x3; public typealias mat2x4 = float2x4;
public typealias mat3x2 = float3x2; public typealias mat3x3 = float3x3; public typealias mat3x4 = float3x4;
public typealias mat4x2 = float4x2; public typealias mat4x3 = float4x3; public typealias mat4x4 = float4x4;

// GLSL functions
[Differentiable] public __generic<T> T mix(T a, T b, T c) where T : __BuiltinFloatingPointType { return a + (b - a) * c; }
[Differentiable] public __generic<T, int S> vector<T, S> mix(vector<T, S> a, vector<T, S> b, vector<T, S> c) where T : __BuiltinFloatingPointType { return a + (b - a) * c; }
[Differentiable] public __generic<T, int S0, int S1> matrix<T, S0, S1> mix(matrix<T, S0, S1> a, matrix<T, S0, S1> b, matrix<T, S0, S1> c) where T : __BuiltinFloatingPointType { return a + (b - a) * c; }

[Differentiable] public float fract(float a) { return frac(a); }
[Differentiable] public __generic<T, int S> vector<T, S> frac(vector<T, S> a) where T : __BuiltinFloatingPointType { return frac(a); }
[Differentiable] public __generic<T, int S0, int S1> matrix<T, S0, S1> frac(matrix<T, S0, S1> a) where T : __BuiltinFloatingPointType { return frac(a); }

[Differentiable] public __generic<T> T inversesqrt(T a) where T : __BuiltinFloatingPointType { return rsqrt(a); }
[Differentiable] public __generic<T, int S> vector<T, S> inversesqrt(vector<T, S> a) where T : __BuiltinFloatingPointType { return rsqrt(a); }
[Differentiable] public __generic<T, int S0, int S1> matrix<T, S0, S1> inversesqrt(matrix<T, S0, S1> a) where T : __BuiltinFloatingPointType { return rsqrt(a); }

[Differentiable] public __generic<T> T mod(T x, T y) where T : __BuiltinFloatingPointType { return x - no_diff floor(x / y) * y; }
[Differentiable] public __generic<T, int S> vector<T, S> mod(vector<T, S> x, T y) where T : __BuiltinFloatingPointType { return x - no_diff floor(x / y) * y; }
[Differentiable] public __generic<T, int S> vector<T, S> mod(vector<T, S> x, vector<T, S> y) where T : __BuiltinFloatingPointType { return x - no_diff floor(x / y) * y; }
[Differentiable] public __generic<T, int S0, int S1> matrix<T, S0, S1> mod(matrix<T, S0, S1> x, T y) where T : __BuiltinFloatingPointType { return x - no_diff floor(x / y) * y; }
[Differentiable] public __generic<T, int S0, int S1> matrix<T, S0, S1> mod(matrix<T, S0, S1> x, matrix<T, S0, S1> y) where T : __BuiltinFloatingPointType { return x - no_diff floor(x / y) * y; }

[Differentiable] public __generic<T> T atan(T x, T y) where T : __BuiltinFloatingPointType { return atan2(y, x); }
[Differentiable] public __generic<T, int S> vector<T, S> atan(vector<T, S> x, vector<T, S> y) where T : __BuiltinFloatingPointType { return atan2(y, x); }
[Differentiable] public __generic<T, int S0, int S1> matrix<T, S0, S1> atan(matrix<T, S0, S1> x, matrix<T, S0, S1> y) where T : __BuiltinFloatingPointType { return atan2(y, x); }

[Differentiable] public __generic<int S0, int S1, int S2> matrix<float, S0, S2> operator *(matrix<float, S0, S1> a, matrix<float, S1, S2> b) { return mul(a, b); }
[Differentiable] public __generic<int S0, int S1> vector<float, S0> operator *(matrix<float, S0, S1> a, vector<float, S1> b) { return mul(a, b); }
[Differentiable] public __generic<int S0, int S1> vector<float, S1> operator *(vector<float, S0> a, matrix<float, S0, S1> b) { return mul(a, b); }

[Differentiable] public __generic<int S> void operator *=(inout matrix<float, S, S> a, matrix<float, S, S> b) { a = mul(a, b); }
[Differentiable] public __generic<int S> void operator *=(inout vector<float, S> a, matrix<float, S, S> b) { a = mul(a, b); }

public uint floatBitsToUint(float x) { return asuint(x); };
public int floatBitsToInt(float x) { return asint(x); };
public float uintBitsToFloat(uint x) { return asfloat(x); };
public float intBitsToFloat(int x) { return asfloat(x); };

public __generic<int S> vector<uint, S> floatBitsToUint(vector<float, S> x) { return asuint(x); }
public __generic<int S> vector<int, S> floatBitsToInt(vector<float, S> x) { return asint(x); }
public __generic<int S> vector<float, S> uintBitsToFloat(vector<uint, S> x) { return asfloat(x); }
public __generic<int S> vector<float, S> intBitsToFloat(vector<int, S> x) { return asfloat(x); }

public static const vec2 iResolution = vec2(SCREEN_SIZE);
public static float iTime = time.elapsed;
public static float iTimeDelta = time.delta;
public static int iFrame = time.frame;
public static vec2 iMousePos = vec2(mouse.pos.x, SCREEN_SIZE.y - 1 - mouse.pos.y);
public static vec4 iMouse = vec4(iMousePos, (mouse.click == 1) ? iMousePos : 0.0);

public vec4 texelFetch(int channel, ivec2 coord, int lod) {
    return pass_in[ivec3(coord, channel)];
}

public vec4 textureLod(int channel, vec2 coord, float lod) {
    coord = coord*iResolution - 0.5;
    ivec2 icoord = ivec2(floor(coord));
    vec2 fcoord = fract(coord);
    vec4 v00 = texelFetch(channel, icoord + ivec2(0,0), 0);
    vec4 v01 = texelFetch(channel, icoord + ivec2(0,1), 0);
    vec4 v10 = texelFetch(channel, icoord + ivec2(1,0), 0);
    vec4 v11 = texelFetch(channel, icoord + ivec2(1,1), 0);
    return mix(mix(v00, v01, fcoord.y), mix(v10, v11, fcoord.y), fcoord.x); 
}

public vec4 texture(int channel, vec2 coord) {
    return textureLod(channel, coord, 0.0);
}

public vec4 texelFetch(Texture2D<float4> tex, ivec2 coord, int lod) {
    return tex.Load(int3(coord, lod));
}

public vec4 textureLod(Texture2D<float4> tex, vec2 coord, float lod) {
    return tex.SampleLevel(nearest, coord, lod);
}

public vec4 texture(Texture2D<float4> tex, vec2 coord) {
    return textureLod(tex, coord, 0.0);
}
