import { atom, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { getDimensions } from 'types/canvasdimensions';

export const MAX_SHADOW_CANVAS_WIDTH = 700;
// range from 0.0 to 1.0
export const JPEG_IMAGE_QUALITY = 0.5;

export const safeShadowCanvasContext = (
    canvas: HTMLCanvasElement | false,
    shadowCanvas: HTMLCanvasElement | false,
    callback: (canvas: HTMLCanvasElement, shadowCanvas: HTMLCanvasElement) => Promise<void>
): Promise<void> => {
    if (canvas !== false && shadowCanvas !== false) {
        return callback(canvas as HTMLCanvasElement, shadowCanvas as HTMLCanvasElement);
    } else {
        return new Promise<void>(r => {
            r();
        });
    }
};

export const safeShadowCanvasToDataContext = (
    shadowCanvas: HTMLCanvasElement | false,
    callback: (shadowCanvas: HTMLCanvasElement) => Promise<string>
): Promise<string> => {
    if (shadowCanvas !== false) {
        return callback(shadowCanvas as HTMLCanvasElement);
    } else {
        return new Promise<string>(r => r(''));
    }
};

export const shadowCanvasElAtom = atom<HTMLCanvasElement | false>(false);

/*
    Copying to canvas and converting to dataurl are not explicitly async,
    but we need to treat them as such anyway, because they take a long time.
    Also, copying directly from canvas to canvas here (without another dataurl
    in between) does not work, the canvas bounds will be clipped incorrectly
    under different display scalings.

    So the flow looks like:
    original canvas to dataURL
    dataURL to Image
    wait for Image onload
    copy Image to shadow canvas
    wait for image copy
    get shadow canvas dataURL
    wait for shadow canvas dataURL (perhaps this one is unnecessary)

    If we don't follow something like this routine, our shadow canvas will
    return a dataURL for a blank image, even when the shadow canvas has previously
    been written! Presumably this is because we are grabbing the canvas
    immediately after it has been blanked before copy in that situation.
 */
export const copyToShadowCanvas = async (
    canvasEl: HTMLCanvasElement | false,
    shadowCanvasEl: HTMLCanvasElement | false
) => {
    return safeShadowCanvasContext(canvasEl, shadowCanvasEl, async (canvas, shadowCanvas) => {
        const dim = getDimensions(
            canvas.clientWidth > MAX_SHADOW_CANVAS_WIDTH
                ? MAX_SHADOW_CANVAS_WIDTH
                : canvas.clientWidth
        );
        shadowCanvas.width = dim.x;
        shadowCanvas.height = dim.y;
        const shadowCtx = shadowCanvas.getContext('2d');

        const img = new window.Image();
        const dataUrl = canvas.toDataURL();
        await new Promise(r => {
            img.onload = r;
            img.src = dataUrl;
        });
        return new Promise(r => {
            shadowCtx.drawImage(img, 0, 0, shadowCanvas.clientWidth, shadowCanvas.clientHeight);
            r();
        });
    });
};

export const shadowCanvasToDataUrl = async (
    canvasEl: HTMLCanvasElement | false,
    shadowCanvasEl: HTMLCanvasElement | false
) => {
    return safeShadowCanvasToDataContext(shadowCanvasEl, async shadowCanvas => {
        await copyToShadowCanvas(canvasEl, shadowCanvasEl);
        return new Promise<string>(r => {
            r(shadowCanvas.toDataURL('image/jpeg', JPEG_IMAGE_QUALITY));
        });
    });
};

export const ShadowCanvas = () => {
    const setShadowCanvasEl = useSetAtom(shadowCanvasElAtom);

    const shadowCanvasRef = useCallback(canvas => {
        if (canvas) {
            setShadowCanvasEl(canvas);
        }
    }, []);

    /*
        NOTE: we cannot use display: none, or the canvas  hidden attribute here.
        The canvas will simply not draw at all in those cases.
     */
    return (
        <canvas
            ref={shadowCanvasRef}
            id="shadowCanvas"
            style={{ position: 'fixed', visibility: 'hidden' }}
        />
    );
};
