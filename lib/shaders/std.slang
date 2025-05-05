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

public struct Time {
    public uint frame;
    public float elapsed;
    public float delta;
};

public struct Mouse {
    public uint2 pos;
    public int click;
};

public struct DispatchInfo {
    public uint id;
};

public ParameterBlock<Time> time;
public ParameterBlock<Mouse> mouse;
public ParameterBlock<DispatchInfo> dispatch;
