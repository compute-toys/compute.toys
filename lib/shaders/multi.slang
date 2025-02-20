import std;

[StorageBuffer(131072)]
RWStructuredBuffer<float> buf;

[Cover("buf")]
[DispatchOnce]
[shader("compute")]
[numthreads(64, 1, 1)]
void fillBuffer(uint2 dispatchThreadId : SV_DispatchThreadID)
{
    uint idx = dispatchThreadId.x;
    buf[idx] = sin(float(idx) / 1000.0);
}

float4 imageMain(uint2 dispatchThreadID, int2 screenSize)
{
    uint idx = dispatchThreadID.x + dispatchThreadID.y * screenSize.x;

    float rand = buf[idx % 131072];

    return float4(rand, rand, rand, 1.0);
}

[shader("compute")]
[numthreads(16, 16, 1)]
void imageMain(uint3 dispatchThreadID: SV_DispatchThreadID)
{
    uint width = 0;
    uint height = 0;
    screen.GetDimensions(width, height);

    float4 color = imageMain(dispatchThreadID.xy, int2(width, height));

    if (dispatchThreadID.x >= width || dispatchThreadID.y >= height)
        return;

    screen.Store(dispatchThreadID.xy, color);
}
