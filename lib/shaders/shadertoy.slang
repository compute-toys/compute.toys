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

// HLSL/Slang doenst provide a way to get the inverse of a matrix, so we have to implement it ourselves
[Differentiable] float2x2 inverse(float2x2 m)
{
    float det = m._11 * m._22 - m._12 * m._21;
    float invD = 1.0 / det;
    return float2x2(m._22, -m._12,
                    -m._21, m._11) * invD;
}

[Differentiable] float3x3 inverse(float3x3 m)
{
    float3x3 inv;
    inv._11 = (m._22 * m._33 - m._23 * m._32);
    inv._12 = -(m._12 * m._33 - m._13 * m._32);
    inv._13 = (m._12 * m._23 - m._13 * m._22);

    inv._21 = -(m._21 * m._33 - m._23 * m._31);
    inv._22 = (m._11 * m._33 - m._13 * m._31);
    inv._23 = -(m._11 * m._23 - m._13 * m._21);

    inv._31 = (m._21 * m._32 - m._22 * m._31);
    inv._32 = -(m._11 * m._32 - m._12 * m._31);
    inv._33 = (m._11 * m._22 - m._12 * m._21);

    float det = m._11 * inv._11 + m._12 * inv._21 + m._13 * inv._31;
    return inv * (1.0 / det);
}

[Differentiable] float4x4 inverse(float4x4 m)
{
    float a00 = m._11, a01 = m._12, a02 = m._13, a03 = m._14;
    float a10 = m._21, a11 = m._22, a12 = m._23, a13 = m._24;
    float a20 = m._31, a21 = m._32, a22 = m._33, a23 = m._34;
    float a30 = m._41, a31 = m._42, a32 = m._43, a33 = m._44;

    float b00 = a00 * a11 - a01 * a10;
    float b01 = a00 * a12 - a02 * a10;
    float b02 = a00 * a13 - a03 * a10;
    float b03 = a01 * a12 - a02 * a11;
    float b04 = a01 * a13 - a03 * a11;
    float b05 = a02 * a13 - a03 * a12;
    float b06 = a20 * a31 - a21 * a30;
    float b07 = a20 * a32 - a22 * a30;
    float b08 = a20 * a33 - a23 * a30;
    float b09 = a21 * a32 - a22 * a31;
    float b10 = a21 * a33 - a23 * a31;
    float b11 = a22 * a33 - a23 * a32;

    float det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    float invD = 1.0 / det;

    float4x4 inv;
    inv._11 = (a11 * b11 - a12 * b10 + a13 * b09) * invD;
    inv._12 = (-a01 * b11 + a02 * b10 - a03 * b09) * invD;
    inv._13 = (a31 * b05 - a32 * b04 + a33 * b03) * invD;
    inv._14 = (-a21 * b05 + a22 * b04 - a23 * b03) * invD;

    inv._21 = (-a10 * b11 + a12 * b08 - a13 * b07) * invD;
    inv._22 = (a00 * b11 - a02 * b08 + a03 * b07) * invD;
    inv._23 = (-a30 * b05 + a32 * b02 - a33 * b01) * invD;
    inv._24 = (a20 * b05 - a22 * b02 + a23 * b01) * invD;

    inv._31 = (a10 * b10 - a11 * b08 + a13 * b06) * invD;
    inv._32 = (-a00 * b10 + a01 * b08 - a03 * b06) * invD;
    inv._33 = (a30 * b04 - a31 * b02 + a33 * b00) * invD;
    inv._34 = (-a20 * b04 + a21 * b02 - a23 * b00) * invD;

    inv._41 = (-a10 * b09 + a11 * b07 - a12 * b06) * invD;
    inv._42 = (a00 * b09 - a01 * b07 + a02 * b06) * invD;
    inv._43 = (-a30 * b03 + a31 * b01 - a32 * b00) * invD;
    inv._44 = (a20 * b03 - a21 * b01 + a22 * b00) * invD;

    return inv;
}

[Differentiable] public __generic<int S0, int S1, int S2> matrix<float, S0, S2> operator *(matrix<float, S0, S1> a, matrix<float, S1, S2> b) { return mul(a, b); }
// GLSL/Slang matrices are transposed compared to HLSL matrices
[Differentiable] public __generic<int S0, int S1> vector<float, S1> operator *(matrix<float, S0, S1> a, vector<float, S0> b) { return mul(b, a); }
[Differentiable] public __generic<int S0, int S1> vector<float, S0> operator *(vector<float, S1> a, matrix<float, S0, S1> b) { return mul(b, a); }

[Differentiable] public __generic<int S> void operator *=(inout matrix<float, S, S> a, matrix<float, S, S> b) { a = mul(a, b); }
[Differentiable] public __generic<int S> void operator *=(inout vector<float, S> a, matrix<float, S, S> b) { a = mul(b, a); }

public uint floatBitsToUint(float x) { return asuint(x); };
public int floatBitsToInt(float x) { return asint(x); };
public float uintBitsToFloat(uint x) { return asfloat(x); };
public float intBitsToFloat(int x) { return asfloat(x); };

public __generic<int S> vector<uint, S> floatBitsToUint(vector<float, S> x) { return asuint(x); }
public __generic<int S> vector<int, S> floatBitsToInt(vector<float, S> x) { return asint(x); }
public __generic<int S> vector<float, S> uintBitsToFloat(vector<uint, S> x) { return asfloat(x); }
public __generic<int S> vector<float, S> intBitsToFloat(vector<int, S> x) { return asfloat(x); }

public __generic<int S> vector<bool, S> lessThan(vector<float, S> x, vector<float, S> y) { return x < y; }
public __generic<int S> vector<bool, S> lessThanEqual(vector<float, S> x, vector<float, S> y) { return x <= y; }
public __generic<int S> vector<bool, S> greaterThan(vector<float, S> x, vector<float, S> y) { return x > y; }
public __generic<int S> vector<bool, S> greaterThanEqual(vector<float, S> x, vector<float, S> y) { return x >= y; }
public __generic<int S> vector<bool, S> equal(vector<float, S> x, vector<float, S> y) { return x == y; }
public __generic<int S> vector<bool, S> notEqual(vector<float, S> x, vector<float, S> y) { return x != y; }

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
    return tex.SampleLevel(bilinear, coord, lod);
}

public vec4 texture(Texture2D<float4> tex, vec2 coord) {
    return textureLod(tex, coord, 0.0);
}
