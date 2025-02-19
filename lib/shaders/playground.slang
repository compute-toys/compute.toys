internal struct UniformInput
{
    float4 mousePosition;
    float time;
}

internal uniform UniformInput uniformInput;

// Returns the current time in milliseconds.
public float getTime()
{
    return uniformInput.time;
}

// Returns mouse position info.
// xy: mouse position (in pixels) during last button down.
// abs(zw): mouse position during last button click.
// sign(mouze.z): button is down
// sign(mouze.w): button is clicked
//
public float4 getMousePosition() { return uniformInput.mousePosition; }

// type field: 1 for format string, 2 for normal string, 3 for integer, 4 for float, 5 for double, 
struct FormattedStruct
{
    uint32_t type = 0xFFFFFFFF;
    uint32_t low = 0;
    uint32_t high = 0;
};

// This is global variable, intead of shader parameter.
internal static int g_printBufferIndex = 0;

internal RWStructuredBuffer<FormattedStruct> g_printedBuffer;

interface IPrintf
{
    uint32_t typeFlag();
    uint32_t writePrintfWords();
};

extension uint : IPrintf
{
    uint32_t typeFlag() { return 3;}
    uint32_t writePrintfWords() { return (uint32_t)this; }
}

extension int : IPrintf
{
    uint32_t typeFlag() { return 3;}
    uint32_t writePrintfWords() { return (uint32_t)this; }
}

extension float : IPrintf
{
    uint32_t typeFlag() { return 4;}
    uint32_t writePrintfWords() { return bit_cast<uint32_t>(this); }
}

extension String : IPrintf
{
    uint32_t typeFlag() { return 2;}
    uint32_t writePrintfWords() { return getStringHash(this); }
}

void handleEach<T>(T value, int index) where T :  IPrintf
{
    g_printedBuffer[index].type = value.typeFlag();
    g_printedBuffer[index].low = value.writePrintfWords();
}

public void print<each T>(String format, expand each T values) where T : IPrintf
{
    //if (format.length != 0)
    {
        g_printedBuffer[g_printBufferIndex].type = 1;
        g_printedBuffer[g_printBufferIndex].low = getStringHash(format);
        g_printBufferIndex++;
        expand(handleEach(each values, g_printBufferIndex++));

        g_printedBuffer[g_printBufferIndex++] = {};
    }
}

[OverloadRank(1)]
public void printf<each T>(String format, expand each T values) where T : IPrintf
{
    print(format, expand each values);
}

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_ZEROSAttribute
{
    int count;
};

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_BLACKAttribute
{
    int width;
    int height;
};

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_URLAttribute
{
    string url;
};

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_RANDAttribute
{
    int count;
};

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_SLIDERAttribute
{
    float default;
    float min;
    float max;
};

[__AttributeUsage(_AttributeTargets.Var)]
public struct playground_COLOR_PICKAttribute
{
    float defaultRed;
    float defaultGreen;
    float defaultBlue;
};

[__AttributeUsage(_AttributeTargets.Function)]
public struct playground_CALLAttribute
{
    int x;
    int y;
    int z;
};

[__AttributeUsage(_AttributeTargets.Function)]
public struct playground_CALL_SIZE_OFAttribute
{
    string resourceName;
};

[__AttributeUsage(_AttributeTargets.Function)]
public struct playground_CALL_ONCEAttribute
{
}; 