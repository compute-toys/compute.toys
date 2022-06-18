/*
MIT License

Copyright (c) Microsoft Corporation.
Copyright (c) 2022 David A Roberts <https://davidar.io/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// A simple inclusive prefix sum (scan), using a typical up sweep and down sweep scheme
// Based on https://github.com/walbourn/directx-sdk-samples/blob/main/AdaptiveTessellationCS40/ScanCS.hlsl

// ping-pong buffers
var<workgroup> scan_bucket: array<array<SCAN_TYPE, SCAN_WORKGROUP_SIZE>, 2>;

fn scan_pass( i: uint, x: SCAN_TYPE ) -> SCAN_TYPE
{
    scan_bucket[0][i] = x;
    scan_bucket[1][i] = SCAN_TYPE(0);

    // Up sweep
    for ( var stride = 2u; stride <= SCAN_WORKGROUP_SIZE; stride = stride << 1u ) {
        workgroupBarrier();

        if ( (i & (stride - 1)) == (stride - 1) ) {
            scan_bucket[0][i] += scan_bucket[0][i - stride/2];
        }
    }

    if ( i == uint(SCAN_WORKGROUP_SIZE - 1) ) {
        scan_bucket[0][i] = SCAN_TYPE(0);
    }

    // Down sweep
    var n = 1;
    for ( var stride = uint(SCAN_WORKGROUP_SIZE / 2); stride >= 1u; stride = stride >> 1u ) {
        workgroupBarrier();

        var a = stride - 1u;
        var b = stride | a;

        if ( ( i & b) == b ) {
            scan_bucket[n][i] = scan_bucket[1 - n][i - stride] + scan_bucket[1 - n][i];
        } else if ( (i & a) == a ) {
            scan_bucket[n][i] = scan_bucket[1 - n][i + stride];
        } else {
            scan_bucket[n][i] = scan_bucket[1 - n][i];
        }

        // ping-pong between passes
        n = 1 - n;
    }

    return scan_bucket[1 - n][i] + x;
}
