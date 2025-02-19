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
public struct DispatchOnceAttribute {};
