module std;

[__AttributeUsage(_AttributeTargets.Var)]
public struct StorageBufferAttribute {
    int count;
};

[__AttributeUsage(_AttributeTargets.Function)]
public struct WorkgroupCountAttribute {
    int countX;
    int countY;
    int countZ;
};

[__AttributeUsage(_AttributeTargets.Function)]
public struct CoverAttribute {
    string resourceName;
};

[__AttributeUsage(_AttributeTargets.Function)]
public struct DispatchCountAttribute {
    int count;
};

[__AttributeUsage(_AttributeTargets.Function)]
public struct DispatchOnceAttribute {};

[format("rgba8")]
public RWTexture2D screen;

public Texture2D<float4> channel0;
public Texture2D<float4> channel1;

public RWTexture2DArray<float4> pass_out;
public Texture2DArray<float4> pass_in;

public SamplerState nearest;
public SamplerState bilinear;
public SamplerState trilinear;
public SamplerState nearest_repeat;
public SamplerState bilinear_repeat;
public SamplerState trilinear_repeat;

public struct Time {
    public float elapsed;
    public float delta;
    public uint frame;
};

public struct Mouse {
    public int2 pos;
    public float zoom;
    public int click;
    public int2 start;
    //public int2 delta; //2do: fix pp for same names
};

public struct DispatchInfo {
    public uint id;
};

public ParameterBlock<Time> time;
public ParameterBlock<Mouse> mouse;
public ParameterBlock<uint4[2]> _keyboard;
public ParameterBlock<DispatchInfo> dispatch;

public bool keyDown(uint keycode) {
    //much faster than %
    uint id0 = keycode >> 7;
    uint a = keycode - (id0 << 7);
    uint id1 = a >> 5;  
    uint id2 = a - (id1 << 5);
    return ((_keyboard[id0][id1] >> id2) & 1u) == 1u;
}