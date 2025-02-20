import std;

[shader("compute")]
[numthreads(16, 16, 1)]
void main_image(uint3 id : SV_DispatchThreadID)
{
    // Viewport resolution (in pixels)
    uint width, height;
    screen.GetDimensions(width, height);

    // Prevent overdraw for workgroups on the edge of the viewport
    if (id.x >= width || id.y >= height)
        return;

    // Pixel coordinates (centre of pixel, origin at bottom left)
    float2 fragCoord = float2(float(id.x) + 0.5, float(height - id.y) - 0.5);

    // Normalised pixel coordinates (from 0 to 1)
    float2 uv = fragCoord / float2(width, height);

    // Time varying pixel colour
    float3 col = 0.5 + 0.5 * cos(time.elapsed + float3(uv.x, uv.y, uv.x) + float3(0.0, 2.0, 4.0));

    // Convert from gamma-encoded to linear colour space
    col = pow(col, float3(2.2, 2.2, 2.2));

    // Output to screen (linear colour space)
    screen[id.xy] = float4(col, 1.0);
}
