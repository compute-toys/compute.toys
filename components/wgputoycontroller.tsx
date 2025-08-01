'use client';
import useResizeObserver from '@react-hook/resize-observer';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTransientAtom } from 'jotai-game';
import {
    codeAtom,
    dbLoadedAtom,
    entryPointsAtom,
    entryTimersAtom,
    float32EnabledAtom,
    halfResolutionAtom,
    heightAtom,
    hotReloadAtom,
    isPlayingAtom,
    languageAtom,
    loadedTexturesAtom,
    manualReloadAtom,
    parseErrorAtom,
    playAtom,
    profilerEnabledAtom,
    recordingAtom,
    requestFullscreenAtom,
    resetAtom,
    saveColorTransitionSignalAtom,
    sliderRefMapAtom,
    sliderUpdateSignalAtom,
    textureChannelDimensionsAtom,
    timerAtom,
    titleAtom,
    widthAtom
} from 'lib/atoms/atoms';
import {
    canvasElAtom,
    canvasParentElAtom,
    wgpuAvailabilityAtom,
    wgputoyPreludeAtom
} from 'lib/atoms/wgputoyatoms';
import { ComputeEngine } from 'lib/engine';
import { getCompiler, TextureDimensions } from 'lib/slang/compiler';
import { useCallback, useEffect } from 'react';
import { theme } from 'theme/theme';
import { getDimensions } from 'types/canvasdimensions';
import useAnimationFrame from 'use-animation-frame';

type Point = { x: number; y: number };

declare global {
    interface Window {
        mediaRecorder: MediaRecorder;
    }
}

const needsInitialResetAtom = atom<boolean>(true);
const performingInitialResetAtom = atom<boolean>(false);
const isPointerPressedAtom = atom<boolean>(false);

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
    const [isPointerPressed, setIsPointerPressed] = useTransientAtom(isPointerPressedAtom);
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
    const [language] = useTransientAtom(languageAtom);

    // transient atom can't be used with effect hook, and we want both
    // "hot" access and effect hook access for code
    const code = useAtomValue(codeAtom);

    const [, setParseError] = useTransientAtom(parseErrorAtom);
    const loadedTextures = useAtomValue(loadedTexturesAtom);
    const setEntryPoints = useSetAtom(entryPointsAtom);
    const setEntryTimers = useSetAtom(entryTimersAtom);
    const setSaveColorTransitionSignal = useSetAtom(saveColorTransitionSignalAtom);

    const canvas = useAtomValue(canvasElAtom);
    const setPrelude = useSetAtom(wgputoyPreludeAtom);
    const wgpuAvailability = useAtomValue(wgpuAvailabilityAtom);

    const parentRef = useAtomValue<HTMLElement | null>(canvasParentElAtom);

    const [width, setWidth] = useTransientAtom(widthAtom);
    const [height, setHeight] = useTransientAtom(heightAtom);

    const [requestFullscreenSignal, setRequestFullscreenSignal] = useAtom(requestFullscreenAtom);
    const float32Enabled = useAtomValue(float32EnabledAtom);
    const [profilerEnabled, setProfilerEnabled] = useAtom(profilerEnabledAtom);
    const halfResolution = useAtomValue(halfResolutionAtom);

    const [textureDimensions, setTextureDimensions] = useTransientAtom(
        textureChannelDimensionsAtom
    );

    const updateUniforms = useCallback(async () => {
        const names: string[] = [];
        const values: number[] = [];
        [...sliderRefMap().keys()].map(uuid => {
            names.push(sliderRefMap().get(uuid)!.getUniform());
            values.push(sliderRefMap().get(uuid)!.getVal());
        }, this);
        if (names.length > 0) {
            // console.log(`Setting uniforms: ${names} with values: ${values}`);
            await ComputeEngine.getInstance().setCustomFloats(names, Float32Array.from(values));
        }
        setSliderUpdateSignal(false);
    }, []);

    /**
     * Processes the shader code based on the selected language
     * @param engine The engine instance to use for preprocessing
     * @returns Processed shader source or null if processing failed
     */
    const processShaderCode = async (engine: ComputeEngine) => {
        const code = codeHot();
        if (language() === 'slang') {
            console.log('Translating Slang to WGSL...');
            const startTime = performance.now();
            const compiler = await getCompiler();
            const slangPrelude = engine.getSlangPrelude();
            const wgsl = compiler.compile(code, textureDimensions(), slangPrelude);
            const endTime = performance.now();
            console.log(`Translation took ${(endTime - startTime).toFixed(2)}ms`);
            if (!wgsl) {
                console.error('Translating Slang to WGSL failed');
                return null;
            }
            return engine.preprocess(wgsl);
        } else {
            // For WGSL, just preprocess directly
            return engine.preprocess(code);
        }
    };

    const recompile = async () => {
        await updateUniforms();
        console.log('Recompiling shader...');
        const engine = ComputeEngine.getInstance();
        const source = await processShaderCode(engine);
        if (source) {
            await engine.compile(source);
            setPrelude(engine.getPrelude());
            engine.render();
        }
    };

    /*
        Handle manual reload in the play callback to handle race conditions
        where manualReload gets set before the controller is loaded, which
        results in the effect hook for manualReload never getting called.
     */
    useAnimationFrame(async e => {
        if (sliderUpdateSignal() && !needsInitialReset()) {
            await updateUniforms();
        }
        if (performingInitialReset()) {
            // wait for initial reset to complete
        } else if (needsInitialReset() && dbLoaded()) {
            console.log('Initialising engine...');
            setPerformingInitialReset(true);
            await ComputeEngine.create();
            const engine = ComputeEngine.getInstance();
            if (!canvas) {
                console.error('Canvas not found');
                return;
            }
            engine.setSurface(canvas);
            engine.onSuccess(handleSuccess);
            engine.onUpdate(handleUpdate);
            engine.onError(handleError);
            setTimer(0);
            engine.setPassF32(float32Enabled);
            setProfilerEnabled(false);
            updateResolution();
            engine.resize(width(), height());
            engine.reset();
            await loadTexture(0, loadedTextures[0].img);
            await loadTexture(1, loadedTextures[1].img);
            await updateUniforms();
            console.log('Compiling shader...');
            const source = await processShaderCode(engine);
            if (!source) {
                console.error('Initialisation aborted: shader compilation failed');
                return;
            }
            await engine.compile(source);
            setPrelude(engine.getPrelude());
            engine.render();
            setManualReload(false);
            setNeedsInitialReset(false);
            setPerformingInitialReset(false);
            console.log('Initialisation complete');
        } else if (dbLoaded() && manualReload()) {
            console.log('Manual reload triggered');
            setManualReload(false);
            await recompile();
        }
        if (needsInitialReset()) {
            return;
        }
        if (sliderUpdateSignal() && !isPlaying()) {
            ComputeEngine.getInstance().setTimeDelta(e.delta);
            ComputeEngine.getInstance().render();
        } else if (isPlaying() || manualReload()) {
            let t = timer();
            if (!manualReload()) {
                t += e.delta;
            }
            setTimer(t);
            ComputeEngine.getInstance().setTimeElapsed(t);
            ComputeEngine.getInstance().setTimeDelta(e.delta);
            ComputeEngine.getInstance().render();
        }
    });

    const playCallback = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const pauseCallback = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const resetCallback = useCallback(() => {
        if (!needsInitialReset()) {
            console.log('Resetting engine...');
            setTimer(0);
            ComputeEngine.getInstance().reset();
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

    const handleUpdate = useCallback(entryTimers => {
        if (profilerEnabled) {
            setEntryTimers(entryTimers);
        }
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

    const loadTexture = useCallback(async (index: number, url: string): Promise<boolean> => {
        console.log(`Loading texture ${index} from ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Error fetching texture: ${response.statusText}`);
                return false;
            }

            const contentType = response.headers.get('content-type');
            const buffer = await response.arrayBuffer();
            const data = new Uint8Array(buffer);

            let dimensions: TextureDimensions;

            if (contentType?.includes('image/x-radiance') || url.endsWith('.hdr')) {
                dimensions = await ComputeEngine.getInstance().loadChannelHDR(index, data);
            } else {
                dimensions = await ComputeEngine.getInstance().loadChannel(index, data);
            }

            // Update texture dimensions in the atom
            const newDimensions = [...textureDimensions()];
            newDimensions[index] = dimensions;
            setTextureDimensions(newDimensions);

            // Trigger recompile when texture dimensions change
            if (
                dbLoaded() &&
                !needsInitialReset() &&
                !performingInitialReset() &&
                !manualReload() &&
                canvas
            ) {
                console.log('Texture dimensions changed, recompiling shader...');
                return true;
            }
        } catch (error) {
            console.error(`Error loading texture ${index}:`, error);
        }
        return false;
    }, []);

    const requestFullscreen = useCallback(() => {
        if (canvas && !document.fullscreenElement) {
            canvas.requestFullscreen({ navigationUI: 'hide' });
        }
    }, []);

    // init effect
    useEffect(props.onLoad, []);

    useEffect(() => {
        const handleKeyDown = e => {
            // console.log(`Key down: ${e.keyCode}`);
            if (typeof e.keyCode === 'number')
                ComputeEngine.getInstance().setKeydown(e.keyCode, true);
        };
        if (canvas) {
            canvas.addEventListener('keydown', handleKeyDown);
            return () => canvas.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    useEffect(() => {
        const handleKeyUp = e => {
            // console.log(`Key up: ${e.keyCode}`);
            if (typeof e.keyCode === 'number')
                ComputeEngine.getInstance().setKeydown(e.keyCode, false);
        };
        if (canvas) {
            canvas.addEventListener('keyup', handleKeyUp);
            return () => canvas.removeEventListener('keyup', handleKeyUp);
        }
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
                const encoder = new TextEncoder();
                const decoder = new TextDecoder();

                // Truncate string by size in bytes
                function truncate(str: string, maxByteSize: number): string {
                    const bytes = encoder.encode(str);
                    if (bytes.length <= maxByteSize) return str;
                    return decoder.decode(bytes.slice(0, maxByteSize));
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
            const options: MediaRecorderOptions = {
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
            const chunks: Blob[] = [];

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
                document.body.removeChild(a);
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
            let zoom = 1.0;
            let initialPinchDistance: number | null = null;
            let previousPointerStart: Point = { x: 0, y: 0 };
            let previousPointerPosition: Point = { x: 0, y: 0 };

            const getPointerPosition = (e: MouseEvent | TouchEvent) => {
                if (e instanceof MouseEvent) {
                    return {
                        x: (e.offsetX / canvas.clientWidth) * width(),
                        y: (e.offsetY / canvas.clientHeight) * height()
                    };
                } else {
                    const rect = canvas.getBoundingClientRect();
                    const touch = e.touches[0];
                    return {
                        x: ((touch.clientX - rect.left) / canvas.clientWidth) * width(),
                        y: ((touch.clientY - rect.top) / canvas.clientHeight) * height()
                    };
                }
            };

            const handleScroll = (e: WheelEvent) => {
                e.preventDefault();
                const factor = e.deltaY > 0 ? 0.95 : 1.05;
                zoom *= factor;
                ComputeEngine.getInstance().setMouseZoom(zoom);
                if (!isPlaying()) ComputeEngine.getInstance().render();
            };

            const handlePinch = (e: TouchEvent) => {
                if (e.touches.length !== 2) return;
                e.preventDefault();
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                ComputeEngine.getInstance().setMousePos(previousPointerStart);
                if (initialPinchDistance !== null) {
                    zoom = currentDistance / initialPinchDistance;
                    ComputeEngine.getInstance().setMouseZoom(zoom);
                    if (!isPlaying()) ComputeEngine.getInstance().render();
                } else {
                    initialPinchDistance = currentDistance;
                }
            };

            const handlePointerMove = (e: MouseEvent | TouchEvent) => {
                const p = getPointerPosition(e);
                if (isPointerPressed() && initialPinchDistance === null) {
                    ComputeEngine.getInstance().setMousePos(p);
                    ComputeEngine.getInstance().setMouseDelta(
                        p.x - previousPointerPosition.x,
                        p.y - previousPointerPosition.y
                    );
                    if (!isPlaying()) ComputeEngine.getInstance().render();
                }
                previousPointerPosition = p;
            };

            const handlePointerUp = () => {
                ComputeEngine.getInstance().setMouseClick(0);
                initialPinchDistance = null;
                setIsPointerPressed(false);
            };

            const handlePointerDown = (e: MouseEvent | TouchEvent) => {
                if (isPointerPressed()) return;
                setIsPointerPressed(true);
                previousPointerStart = ComputeEngine.getInstance().getMousePos();
                const p = getPointerPosition(e);
                ComputeEngine.getInstance().setMouseStart(p);
                ComputeEngine.getInstance().setMousePos(p);
                ComputeEngine.getInstance().setMouseClick(
                    e instanceof MouseEvent ? e.button + 1 : 1
                );
                if (!isPlaying()) ComputeEngine.getInstance().render();
            };

            const handleMouse = (e: MouseEvent) => {
                e.preventDefault();
                if (e.type === 'mousedown') handlePointerDown(e);
                else if (e.type === 'mousemove') handlePointerMove(e);
                else if (e.type === 'mouseup' || e.type === 'mouseleave') handlePointerUp();
            };

            const handleTouch = (e: TouchEvent) => {
                e.preventDefault();
                if (e.type === 'touchstart') {
                    if (e.touches.length === 1) handlePointerDown(e);
                    else if (e.touches.length === 2) handlePinch(e);
                } else if (e.type === 'touchmove') {
                    if (e.touches.length === 1) handlePointerMove(e);
                    else if (e.touches.length === 2) handlePinch(e);
                } else if (
                    (e.type === 'touchend' && e.touches.length === 0) ||
                    e.type === 'touchcancel'
                ) {
                    handlePointerUp();
                }
            };

            // Bind events
            canvas.onmousedown = e => handleMouse(e);
            canvas.onmouseup = e => handleMouse(e);
            canvas.onmouseleave = e => handleMouse(e);
            canvas.onmousemove = e => handleMouse(e);
            canvas.onwheel = handleScroll;
            canvas.ontouchstart = e => handleTouch(e);
            canvas.ontouchend = e => handleTouch(e);
            canvas.ontouchcancel = e => handleTouch(e);
            canvas.ontouchmove = e => handleTouch(e);

            return () => {
                canvas.onmousedown = null;
                canvas.onmouseup = null;
                canvas.onmouseleave = null;
                canvas.onmousemove = null;
                canvas.onwheel = null;
                canvas.ontouchstart = null;
                canvas.ontouchend = null;
                canvas.ontouchcancel = null;
                canvas.ontouchmove = null;
            };
        }
    }, [canvas]);

    useEffect(() => {
        if (!isPlaying() && wgpuAvailability === 'available') {
            setPlay(true);
            setNeedsInitialReset(true);
            playCallback();
        }
    }, [wgpuAvailability]);

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
            recompile().then(() => setManualReload(false));
        }
    }, [code, hotReload, manualReload()]);

    const updateResolution = () => {
        const dpr = !halfResolution ? window.devicePixelRatio : window.devicePixelRatio * 0.5;
        let dimensions = { x: 0, y: 0 }; // dimensions in device (physical) pixels
        if (document.fullscreenElement) {
            // calculate actual screen resolution, accounting for both zoom and hidpi
            // https://stackoverflow.com/a/55839671/78204
            dimensions.x =
                Math.round(
                    (window.screen.width * dpr) / (window.outerWidth / window.innerWidth) / 80
                ) * 80;
            dimensions.y =
                Math.round(
                    (window.screen.height * dpr) / (window.outerWidth / window.innerWidth) / 60
                ) * 60;
        } else if (props.embed) {
            dimensions = getDimensions(window.innerWidth * dpr);
        } else {
            const padding = 16;
            dimensions = getDimensions((parentRef!.offsetWidth - padding) * dpr);
        }
        if (canvas) {
            canvas.width = dimensions.x;
            canvas.height = dimensions.y;
            canvas.style.width = `${dimensions.x / dpr}px`;
            canvas.style.height = `${dimensions.y / dpr}px`;
        }
        if (dimensions.x !== width()) {
            console.log(`Resizing to ${dimensions.x / dpr}x${dimensions.y / dpr} @ ${dpr}x`);
            setWidth(dimensions.x);
            setHeight(dimensions.y);
            return true;
        }
        return false;
    };

    useResizeObserver(parentRef, () => {
        if (!needsInitialReset() && updateResolution()) {
            ComputeEngine.getInstance().resize(width(), height());
            resetCallback();
        }
    });

    useEffect(() => {
        if (!needsInitialReset() && updateResolution()) {
            ComputeEngine.getInstance().resize(width(), height());
            resetCallback();
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
            loadTexture(0, loadedTextures[0].img).then(changed => {
                if (changed) {
                    recompile();
                }
            });
        }
    }, [loadedTextures[0]]);

    useEffect(() => {
        if (!needsInitialReset()) {
            loadTexture(1, loadedTextures[1].img).then(changed => {
                if (changed) {
                    recompile();
                }
            });
        }
    }, [loadedTextures[1]]);

    useEffect(() => {
        if (requestFullscreenSignal) {
            requestFullscreen();
            setRequestFullscreenSignal(false);
        }
    }, [requestFullscreenSignal]);

    useEffect(() => {
        if (!needsInitialReset()) {
            console.log(`Setting passF32 to ${float32Enabled}`);
            ComputeEngine.getInstance().setPassF32(float32Enabled);
            ComputeEngine.getInstance().reset();
            if (dbLoaded()) {
                recompile().then(() => {
                    resetCallback();
                });
            }
        }
    }, [float32Enabled]);

    useEffect(() => {
        if (!needsInitialReset()) {
            if (profilerEnabled) {
                const engine = ComputeEngine.getInstance();
                if (!engine.device.features.has('timestamp-query')) {
                    console.warn('Timestamp queries not supported, disabling profiler');
                    setProfilerEnabled(false);
                    return;
                }
            }
            ComputeEngine.getInstance()
                .setProfilerAttached(profilerEnabled)
                .then(() => {
                    recompile().then(() => {
                        setProfilerEnabled(profilerEnabled);
                    });
                });
        }
    }, [profilerEnabled]);

    return null;
};

export default WgpuToyController;
