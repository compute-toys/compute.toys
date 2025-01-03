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
    const [, setHeight] = useTransientAtom(heightAtom);
    const [scale, setScale] = useTransientAtom(scaleAtom);

    const [requestFullscreenSignal, setRequestFullscreenSignal] = useAtom(requestFullscreenAtom);
    const float32Enabled = useAtomValue(float32EnabledAtom);
    const halfResolution = useAtomValue(halfResolutionAtom);

    const updateUniforms = useCallback(async () => {
        if (isSafeContext(wgputoy)) {
            const names: string[] = [];
            const values: number[] = [];
            [...sliderRefMap().keys()].map(uuid => {
                names.push(sliderRefMap().get(uuid)!.getUniform());
                values.push(sliderRefMap().get(uuid)!.getVal());
            }, this);
            if (names.length > 0) {
                await wgputoy.set_custom_floats(names, Float32Array.from(values));
            }
            setSliderUpdateSignal(false);
        }
    }, []);

    const reloadCallback = useCallback(() => {
        updateUniforms().then(() => {
            if (isSafeContext(wgputoy)) {
                wgputoy.preprocess(codeHot()).then(s => {
                    if (s) {
                        wgputoy.compile(s);
                        setPrelude(wgputoy.prelude());
                        wgputoy.render();
                    }
                });
                setManualReload(false);
            }
        });
    }, []);

    const awaitableReloadCallback = async () => {
        return updateUniforms().then(() => {
            if (isSafeContext(wgputoy)) {
                wgputoy.preprocess(codeHot()).then(s => {
                    if (s) {
                        wgputoy.compile(s);
                        setPrelude(wgputoy.prelude());
                        wgputoy.render();
                    }
                });
                return true;
            } else {
                return false;
            }
        });
    };

    /*
        Handle manual reload in the play callback to handle race conditions
        where manualReload gets set before the controller is loaded, which
        results in the effect hook for manualReload never getting called.
     */
    const liveReloadCallback = useCallback(() => {
        if (needsInitialReset() && dbLoaded()) {
            awaitableReloadCallback().then(ready => {
                // we don't want to reset in general except on load
                if (ready && parseError().success) {
                    resetCallback();
                    setNeedsInitialReset(false);
                }
            });
        } else if (dbLoaded() && manualReload()) {
            reloadCallback();
        }
    }, []);

    useAnimationFrame(e => {
        if (isSafeContext(wgputoy)) {
            if (sliderUpdateSignal()) {
                updateUniforms().then(() => {
                    liveReloadCallback();
                });
            } else {
                liveReloadCallback();
            }
            if (sliderUpdateSignal() && !isPlaying()) {
                wgputoy.set_time_delta(e.delta);
                wgputoy.render();
            } else if (isPlaying() || manualReload()) {
                let t = timer();
                if (!manualReload()) {
                    t += e.delta;
                }
                setTimer(t);
                wgputoy.set_time_elapsed(t);
                wgputoy.set_time_delta(e.delta);
                wgputoy.render();
            }
        }
    });

    const playCallback = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const pauseCallback = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const resetCallback = useCallback(() => {
        if (isSafeContext(wgputoy)) {
            setTimer(0);
            wgputoy.reset();
            reloadCallback();
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

    if (window) window['wgsl_error_handler'] = handleError;

    const loadTexture = useCallback((index: number, uri: string) => {
        if (isSafeContext(wgputoy)) {
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
                        wgputoy.load_channel_hdr(index, new Uint8Array(data));
                    } else {
                        wgputoy.load_channel(index, new Uint8Array(data));
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
                if (typeof e.keyCode === 'number') wgputoy.set_keydown(e.keyCode, true);
            }
        };
        if (canvas) {
            canvas.addEventListener('keydown', handleKeyDown);
            return () => canvas.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    useEffect(() => {
        const handleKeyUp = e => {
            if (isSafeContext(wgputoy)) {
                if (typeof e.keyCode === 'number') wgputoy.set_keydown(e.keyCode, false);
            }
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
                    wgputoy.set_mouse_pos(
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
                    wgputoy.set_mouse_click(false);
                    canvas.onmousemove = null;
                }
            };

            const handleMouseDown = (e: MouseEvent) => {
                if (isSafeContext(wgputoy)) {
                    wgputoy.set_mouse_click(true);
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
        if (isSafeContext(wgputoy)) {
            wgputoy.on_success(handleSuccess);
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
            reloadCallback();
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
                    (parentRef!.offsetWidth - padding) * window.devicePixelRatio
                );
            }
            const newScale = halfResolution ? 0.5 : 1;
            if (dimensions.x !== width() || newScale !== scale()) {
                setWidth(dimensions.x);
                setHeight(dimensions.y);
                setScale(newScale);
                wgputoy.resize(dimensions.x, dimensions.y, newScale);
                reloadCallback();
            }
            if (canvas) {
                canvas.width = dimensions.x;
                canvas.height = dimensions.y;
                canvas.style.width = `${dimensions.x / window.devicePixelRatio}px`;
                canvas.style.height = `${dimensions.y / window.devicePixelRatio}px`;
            }
        }
    };

    useResizeObserver(parentRef, updateResolution);

    useEffect(updateResolution, [halfResolution]);

    useEffect(() => {
        if (reset) {
            resetCallback();
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        loadTexture(0, loadedTextures[0].img);
    }, [loadedTextures[0]]);

    useEffect(() => {
        loadTexture(1, loadedTextures[1].img);
    }, [loadedTextures[1]]);

    useEffect(() => {
        if (requestFullscreenSignal) {
            requestFullscreen();
            setRequestFullscreenSignal(false);
        }
    }, [requestFullscreenSignal]);

    useEffect(() => {
        if (isSafeContext(wgputoy)) {
            wgputoy.set_pass_f32(float32Enabled);
            if (dbLoaded()) {
                awaitableReloadCallback().then(() => {
                    resetCallback();
                });
            }
        }
    }, [float32Enabled]);

    return null;
};

export default WgpuToyController;
