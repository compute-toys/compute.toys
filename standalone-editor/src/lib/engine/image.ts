/**
 * Convert a Uint8Array containing encoded image bytes into an ImageBitmap.
 *
 * Implementation notes for efficiency and type-safety:
 * - Avoids unsafe casts to DOM ArrayBufferView types.
 * - Preserves the correct byte range (byteOffset/byteLength) of the view.
 * - Zero-copy when possible (full-range ArrayBuffer); otherwise uses slice/copy as needed.
 */
function viewToArrayBuffer(view: Uint8Array): ArrayBuffer {
    if (view.byteLength === 0) {
        return new ArrayBuffer(0);
    }

    const underlying = view.buffer;

    // If the underlying buffer is a real ArrayBuffer, we can use it directly
    // when the view covers the whole buffer. Otherwise, slice the used range.
    if (underlying instanceof ArrayBuffer) {
        if (view.byteOffset === 0 && view.byteLength === underlying.byteLength) {
            return underlying;
        }
        return underlying.slice(view.byteOffset, view.byteOffset + view.byteLength);
    }

    // SharedArrayBuffer or other ArrayBufferLike: create a copy of the used range.
    const copy = new ArrayBuffer(view.byteLength);
    new Uint8Array(copy).set(view);
    return copy;
}

export async function uint8ArrayToImageBitmap(
    data: Uint8Array,
    options?: ImageBitmapOptions
): Promise<ImageBitmap> {
    const ab = viewToArrayBuffer(data);
    const blob = new Blob([ab]);
    return createImageBitmap(blob, options);
}
