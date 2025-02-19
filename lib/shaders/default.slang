import playground;

[playground::ZEROS(131072)]
RWStructuredBuffer<float> buf;

// Fills buffer with a sine wave
// This entry point will only be called once at the start of rendering
// Remove the ONCE attribute to call it every frame
[playground::CALL::SIZE_OF("buf")]
[playground::CALL::ONCE]
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

RWStructuredBuffer<int> outputBuffer;

[format("rgba8")]
WTexture2D outputTexture;

[shader("compute")]
[numthreads(16, 16, 1)]
void imageMain(uint3 dispatchThreadID: SV_DispatchThreadID)
{
    uint width = 0;
    uint height = 0;
    outputTexture.GetDimensions(width, height);

    float4 color = imageMain(dispatchThreadID.xy, int2(width, height));

    if (dispatchThreadID.x >= width || dispatchThreadID.y >= height)
        return;

    outputTexture.Store(dispatchThreadID.xy, color);
}
