'use client';
import useResizeObserver from '@react-hook/resize-observer';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTransientAtom } from 'jotai-game';
import {
    codeAtom,
    dbLoadedAtom,
    entryPointsAtom,
    float32EnabledAtom,
    halfResolutionAtom,
    heightAtom,
    hotReloadAtom,
    isPlayingAtom,
    loadedTexturesAtom,
    manualReloadAtom,
    parseErrorAtom,
    playAtom,
    recordingAtom,
    requestFullscreenAtom,
    resetAtom,
    saveColorTransitionSignalAtom,
    scaleAtom,
    sliderRefMapAtom,
    sliderUpdateSignalAtom,
    timerAtom,
    titleAtom,
    widthAtom
} from 'lib/atoms/atoms';
import {
    canvasElAtom,
    canvasParentElAtom,
    isSafeContext,
    wgputoyAtom,
    wgputoyPreludeAtom
} from 'lib/atoms/wgputoyatoms';
import { useCallback, useEffect } from 'react';
import { theme } from 'theme/theme';
import { getDimensions } from 'types/canvasdimensions';
import useAnimationFrame from 'use-animation-frame';

declare global {
    interface Window {
        mediaRecorder: MediaRecorder;
    }
}

const needsInitialResetAtom = atom<boolean>(false);
const performingInitialResetAtom = atom<boolean>(false);

/*
    Controller component. Returns null because we expect to be notified
    when a new canvas element is rendered to the DOM by a parent node
    (or elsewhere).

    Note that "exhaustive deps" are deliberately not used in effect hooks
    here, because they will fire off additional effects unnecessarily.
 */
const WgpuToyController = props => {
    const [play, setPlay] = useAtom(playAtom);
    const [reset, setReset] = useAtom(resetAtom);
    const hotReload = useAtomValue(hotReloadAtom);
    const [recording, setRecording] = useAtom(recordingAtom);
    const title = useAtomValue(titleAtom);

    // must be transient so we can access updated value in play loop
    const [sliderUpdateSignal, setSliderUpdateSignal] = useTransientAtom(sliderUpdateSignalAtom);
    const [manualReload, setManualReload] = useTransientAtom(manualReloadAtom);
    const [needsInitialReset, setNeedsInitialReset] = useTransientAtom(needsInitialResetAtom);
    const [performingInitialReset, setPerformingInitialReset] = useTransientAtom(
        performingInitialResetAtom
    );
    const [isPlaying, setIsPlaying] = useTransientAtom(isPlayingAtom);
    const [codeHot] = useTransientAtom(codeAtom);
    const [dbLoaded] = useTransientAtom(dbLoadedAtom);
    const [hotReloadHot] = useTransientAtom(hotReloadAtom);
    const [sliderRefMap] = useTransientAtom(sliderRefMapAtom);
    const [timer, setTimer] = useTransientAtom(timerAtom);

    // transient atom can't be used with effect hook, and we want both
    // "hot" access and effect hook access for code
    const code = useAtomValue(codeAtom);

    const [parseError, setParseError] = useTransientAtom(parseErrorAtom);
    const loadedTextures = useAtomValue(loadedTexturesAtom);
    const setEntryPoints = useSetAtom(entryPointsAtom);
    const setSaveColorTransitionSignal = useSetAtom(saveColorTransitionSignalAtom);

    const wgputoy = useAtomValue(wgputoyAtom);
    const canvas = useAtomValue(canvasElAtom);
    const [, setPrelude] = useAtom(wgputoyPreludeAtom);

    const parentRef = useAtomValue<HTMLElement | null>(canvasParentElAtom);

    const [width, setWidth] = useTransientAtom(widthAtom);
    const [height, setHeight] = useTransientAtom(heightAtom);
    const [scale, setScale] = useTransientAtom(scaleAtom);

    const [requestFullscreenSignal, setRequestFullscreenSignal] = useAtom(requestFullscreenAtom);
    const float32Enabled = useAtomValue(float32EnabledAtom);
    const halfResolution = useAtomValue(halfResolutionAtom);

    const updateUniforms = useCallback(async () => {
        if (isSafeContext(wgputoy)) {
            const names: string[] = [];
            const values: number[] = [];
            [...sliderRefMap().keys()].map(uuid => {
                names.push(sliderRefMap().get(uuid).getUniform());
                values.push(sliderRefMap().get(uuid).getVal());
            }, this);
            if (names.length > 0) {
                // console.log(`Setting uniforms: ${names} with values: ${values}`);
                await wgputoy.setCustomFloats(names, Float32Array.from(values));
            }
            setSliderUpdateSignal(false);
        }
    }, []);

    const recompile = async () => {
        await updateUniforms();
        if (isSafeContext(wgputoy)) {
            console.log('Recompiling shader...');
            const s = await wgputoy.preprocess(codeHot());
            if (s) {
                await wgputoy.compile(s);
                setPrelude(wgputoy.getPrelude());
                wgputoy.render();
            } else {
                console.error('Recompilation failed');
            }
            return true;
        }
        return false;
    };

    /*
        Handle manual reload in the play callback to handle race conditions
        where manualReload gets set before the controller is loaded, which
        results in the effect hook for manualReload never getting called.
     */
    useAnimationFrame(async e => {
        if (!isSafeContext(wgputoy)) {
            return;
        }
        if (sliderUpdateSignal() && !needsInitialReset()) {
            await updateUniforms();
        }
        if (performingInitialReset()) {
            // wait for initial reset to complete
        } else if (needsInitialReset() && dbLoaded()) {
            console.log('Initialising engine...');
            setPerformingInitialReset(true);
            if (!isSafeContext(wgputoy)) {
                console.error('Initialisation aborted: engine not available');
                return;
            }
            wgputoy.onSuccess(handleSuccess);
            wgputoy.onError(handleError);
            setTimer(0);
            wgputoy.setPassF32(float32Enabled);
            updateResolution();
            wgputoy.resize(width(), height(), scale());
            wgputoy.reset();
            loadTexture(0, loadedTextures[0].img);
            loadTexture(1, loadedTextures[1].img);
            await updateUniforms();
            console.log('Compiling shader...');
            const s = await wgputoy.preprocess(codeHot());
            if (!s) {
                console.error('Initialisation aborted: shader compilation failed');
                return;
            }
            await wgputoy.compile(s);
            setPrelude(wgputoy.getPrelude());
            wgputoy.render();
            setManualReload(false);
            setNeedsInitialReset(false);
            setPerformingInitialReset(false);
            console.log('Initialisation complete');
        } else if (dbLoaded() && manualReload()) {
            console.log('Manual reload triggered');
            recompile().then(ready => {
                if (ready) {
                    setManualReload(false);
                }
            });
        }
        if (needsInitialReset()) {
            return;
        }
        if (sliderUpdateSignal() && !isPlaying()) {
            wgputoy.setTimeDelta(e.delta);
            wgputoy.render();
        } else if (isPlaying() || manualReload()) {
            let t = timer();
            if (!manualReload()) {
                t += e.delta;
            }
            setTimer(t);
            wgputoy.setTimeElapsed(t);
            wgputoy.setTimeDelta(e.delta);
            wgputoy.render();
        }
    });

    const playCallback = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const pauseCallback = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const resetCallback = useCallback(() => {
        if (!needsInitialReset() && isSafeContext(wgputoy)) {
            console.log('Resetting engine...');
            setTimer(0);
            wgputoy.reset();
            recompile();
        }
    }, []);

    const handleSuccess = useCallback(entryPoints => {
        setEntryPoints(entryPoints);
        setParseError(() => ({
            summary: '',
            position: { row: 0, col: 0 },
            success: true
        }));
        if (!hotReloadHot()) setSaveColorTransitionSignal('#24252C');
    }, []);

    const handleError = useCallback((summary: string, row: number, col: number) => {
        setParseError(() => ({
            summary: summary,
            position: { row: Number(row), col: Number(col) },
            success: false
        }));
        if (!hotReloadHot()) setSaveColorTransitionSignal(theme.palette.dracula.orange);
    }, []);

    // if (window) window['wgsl_error_handler'] = handleError;

    const loadTexture = useCallback((index: number, uri: string) => {
        if (isSafeContext(wgputoy)) {
            console.log(`Loading texture ${index} from ${uri}`);
            fetch(uri)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load image');
                    }
                    return response.blob();
                })
                .then(b => b.arrayBuffer())
                .then(data => {
                    if (uri.match(/\.hdr/i)) {
                        wgputoy.loadChannelHDR(index, new Uint8Array(data));
                    } else {
                        wgputoy.loadChannel(index, new Uint8Array(data));
                    }
                })
                .catch(error => console.error(error));
        }
    }, []);

    const requestFullscreen = useCallback(() => {
        if (isSafeContext(wgputoy) && canvas !== false) {
            if (!document.fullscreenElement) {
                canvas.requestFullscreen({ navigationUI: 'hide' });
            }
        }
    }, []);

    // init effect
    useEffect(props.onLoad, []);

    useEffect(() => {
        const handleKeyDown = e => {
            if (isSafeContext(wgputoy)) {
                // console.log(`Key down: ${e.keyCode}`);
                if (typeof e.keyCode === 'number') wgputoy.setKeydown(e.keyCode, true);
            }
        };
        if (canvas) {
            canvas.addEventListener('keydown', handleKeyDown);
            return () => canvas.removeEventListener('keydown', handleKeyDown);
        }
        return null;
    }, []);

    useEffect(() => {
        const handleKeyUp = e => {
            if (isSafeContext(wgputoy)) {
                // console.log(`Key up: ${e.keyCode}`);
                if (typeof e.keyCode === 'number') wgputoy.setKeydown(e.keyCode, false);
            }
        };
        if (canvas) {
            canvas.addEventListener('keyup', handleKeyUp);
            return () => canvas.removeEventListener('keyup', handleKeyUp);
        }
        return null;
    }, []);

    useEffect(() => {
        if (!canvas) {
            return;
        }
        function createMediaRecorder(canvas: HTMLCanvasElement) {
            function getFormattedDateTime(): string {
                const now = new Date();

                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = String(now.getFullYear());
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');

                return `${year}-${month}-${day} ${hours}h${minutes}m`;
            }
            // https://www.npmjs.com/package/sanitize-filename/v/1.4.3?activeTab=code
            function sanitizeString(input: string, replacement = ''): string {
                const illegalRe = /[\/\?<>\\:\*\|":]/g; // eslint-disable-line
                const controlRe = /[\x00-\x1f\x80-\x9f]/g; // eslint-disable-line
                const reservedRe = /^\.+$/;
                const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

                // Truncate string by size in bytes
                function truncate(str: string, maxByteSize: number): string {
                    const buffer = Buffer.alloc(maxByteSize);
                    const written = buffer.write(str, 'utf8');
                    return buffer.toString('utf8', 0, written);
                }

                // Sanitize the input string
                let sanitized = input
                    .replace(illegalRe, replacement)
                    .replace(controlRe, replacement)
                    .replace(reservedRe, replacement)
                    .replace(windowsReservedRe, replacement);

                // Truncate to 255 bytes
                sanitized = truncate(sanitized, 255);

                // Re-sanitize if replacement is not empty
                if (replacement !== '') {
                    sanitized = sanitized
                        .replace(illegalRe, '')
                        .replace(controlRe, '')
                        .replace(reservedRe, '')
                        .replace(windowsReservedRe, '');
                }

                return sanitized;
            }
            const options: any = {
                audioBitsPerSecond: 0,
                videoBitsPerSecond: 8000000
            };

            const types = [
                'video/webm;codecs=h264',
                'video/webm;codecs=vp9',
                'video/webm;codecs=vp8'
            ];

            for (const type of types) {
                if (MediaRecorder.isTypeSupported(type)) {
                    options.mimeType = type;
                }
            }
            if (!options.mimeType) {
                options.mimeType = 'video/webm';
            }

            const mediaRecorder = new MediaRecorder(canvas.captureStream(), options);
            const chunks = [];

            mediaRecorder.ondataavailable = function (e) {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = function () {
                setRecording(false);
                const blob = new Blob(chunks, { type: 'video/webm' });
                chunks.length = 0;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                const fileName = sanitizeString(title + ' - ' + getFormattedDateTime() + '.webm');
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            };

            window.mediaRecorder = mediaRecorder;
            return mediaRecorder;
        }

        let mediaRecorder: MediaRecorder = window.mediaRecorder;
        if (recording) {
            if (!mediaRecorder) {
                mediaRecorder = createMediaRecorder(canvas);
            }

            if (mediaRecorder.state === 'inactive') {
                mediaRecorder.start();
            }
        } else if (!recording && mediaRecorder) {
            if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
        }
    }, [recording, title]);

    useEffect(() => {
        if (canvas !== false) {
            const handleMouseMove = (e: MouseEvent) => {
                if (isSafeContext(wgputoy)) {
                    // console.log(`Mouse move: ${e.offsetX}, ${e.offsetY}`);
                    wgputoy.setMousePos(
                        e.offsetX / canvas.clientWidth,
                        e.offsetY / canvas.clientHeight
                    );
                    if (!isPlaying()) {
                        wgputoy.render();
                    }
                }
            };

            const handleMouseUp = () => {
                if (isSafeContext(wgputoy)) {
                    // console.log('Mouse up');
                    wgputoy.setMouseClick(false);
                    canvas.onmousemove = null;
                }
            };

            const handleMouseDown = (e: MouseEvent) => {
                if (isSafeContext(wgputoy)) {
                    // console.log('Mouse down');
                    wgputoy.setMouseClick(true);
                    handleMouseMove(e);
                    canvas.onmousemove = handleMouseMove;
                }
            };

            canvas.onmousedown = handleMouseDown;
            canvas.onmouseup = handleMouseUp;
            canvas.onmouseleave = handleMouseUp;
        }
    }, []);

    useEffect(() => {
        if (!isPlaying()) {
            setPlay(true);
            setNeedsInitialReset(true);
            playCallback();
        }
    }, []);

    // Return a pauseCallback for the cleanup lifecycle
    useEffect(() => pauseCallback, []);

    useEffect(() => {
        if (play && !isPlaying()) {
            playCallback();
        } else if (!play && isPlaying()) {
            pauseCallback();
        }
    }, [play, isPlaying()]);

    useEffect(() => {
        /*
            only need to handle manual reload effect here for
            special case where we're paused and a reload is called
        */
        if (hotReload || (!isPlaying() && manualReload())) {
            console.log('Hot reload triggered...');
            recompile().then(ready => {
                if (ready) {
                    setManualReload(false);
                }
            });
        }
    }, [code, hotReload, manualReload()]);

    const updateResolution = () => {
        if (isSafeContext(wgputoy)) {
            let dimensions = { x: 0, y: 0 }; // dimensions in device (physical) pixels
            if (document.fullscreenElement) {
                // calculate actual screen resolution, accounting for both zoom and hidpi
                // https://stackoverflow.com/a/55839671/78204
                dimensions.x =
                    Math.round(
                        (window.screen.width * window.devicePixelRatio) /
                            (window.outerWidth / window.innerWidth) /
                            80
                    ) * 80;
                dimensions.y =
                    Math.round(
                        (window.screen.height * window.devicePixelRatio) /
                            (window.outerWidth / window.innerWidth) /
                            60
                    ) * 60;
            } else if (props.embed) {
                dimensions = getDimensions(window.innerWidth * window.devicePixelRatio);
            } else {
                const padding = 16;
                dimensions = getDimensions(
                    (parentRef.offsetWidth - padding) * window.devicePixelRatio
                );
            }
            if (canvas) {
                canvas.width = dimensions.x;
                canvas.height = dimensions.y;
                canvas.style.width = `${dimensions.x / window.devicePixelRatio}px`;
                canvas.style.height = `${dimensions.y / window.devicePixelRatio}px`;
            }
            const newScale = halfResolution ? 0.5 : 1;
            if (dimensions.x !== width() || newScale !== scale()) {
                console.log(`Resizing to ${dimensions.x}x${dimensions.y} @ ${newScale}x`);
                setWidth(dimensions.x);
                setHeight(dimensions.y);
                setScale(newScale);
                return true;
            }
        }
        return false;
    };

    useResizeObserver(parentRef, () => {
        if (!needsInitialReset() && isSafeContext(wgputoy) && updateResolution()) {
            wgputoy.resize(width(), height(), scale());
            wgputoy.reset();
            recompile();
        }
    });

    useEffect(() => {
        if (!needsInitialReset() && isSafeContext(wgputoy) && updateResolution()) {
            wgputoy.resize(width(), height(), scale());
            wgputoy.reset();
            recompile();
        }
    }, [halfResolution]);

    useEffect(() => {
        if (reset) {
            resetCallback();
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        if (!needsInitialReset()) {
            loadTexture(0, loadedTextures[0].img);
        }
    }, [loadedTextures[0]]);

    useEffect(() => {
        if (!needsInitialReset()) {
            loadTexture(1, loadedTextures[1].img);
        }
    }, [loadedTextures[1]]);

    useEffect(() => {
        if (requestFullscreenSignal) {
            requestFullscreen();
            setRequestFullscreenSignal(false);
        }
    }, [requestFullscreenSignal]);

    useEffect(() => {
        if (!needsInitialReset() && isSafeContext(wgputoy)) {
            console.log(`Setting passF32 to ${float32Enabled}`);
            wgputoy.setPassF32(float32Enabled);
            wgputoy.reset();
            if (dbLoaded()) {
                recompile().then(() => {
                    resetCallback();
                });
            }
        }
    }, [float32Enabled]);

    return null;
};

export default WgpuToyController;
