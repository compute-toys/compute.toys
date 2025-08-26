/**
 * Standalone WebGPU Shader Editor Component
 * 
 * A self-contained React component for editing and running compute shaders
 * with WebGPU, supporting full feature parity with the main compute.toys site.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StandaloneEditorProps, EditorFeatures, ShaderData } from './types';

// Import copied components with corrected paths
import FullscreenButton from './components/buttons/fullscreenbutton';
import HotReloadToggle from './components/buttons/hotreloadtoggle';
import PlayPauseButton from './components/buttons/playpausebutton';
import RecordButton from './components/buttons/recordbutton';
import ReloadButton from './components/buttons/reloadbutton';
import ResetButton from './components/buttons/resetbutton';
import ResolutionButton from './components/buttons/resolutionbutton';
import VimButton from './components/buttons/vimbutton';
import BufferControls from './components/editor/buffercontrols';
import ConfigurationPicker from './components/editor/configurationpicker';
import EntryPointDisplay from './components/editor/entrypointdisplay';
import Explainer from './components/editor/explainer';
import Monaco from './components/editor/monaco';
import TexturePicker from './components/editor/texturepicker';
import UniformSliders from './components/editor/uniformsliders';
import Timer from './components/timer';
import { WgpuToyWrapper } from './components/wgputoy';

// Copied atoms and dependencies
import {
    authorProfileAtom,
    codeAtom,
    codeNeedSaveAtom,
    customTexturesAtom,
    dbLoadedAtom,
    descriptionAtom,
    float32EnabledAtom,
    languageAtom,
    loadedTexturesAtom,
    manualReloadAtom,
    saveColorTransitionSignalAtom,
    shaderIDAtom,
    sliderRefMapAtom,
    sliderSerDeNeedsUpdateAtom,
    titleAtom,
    visibilityAtom
} from './lib/atoms/atoms';
import { canvasParentElAtom } from './lib/atoms/wgputoyatoms';

// Theme components
import { ItemWithTransitionSignal } from './theme/itemwithtransition';
import { MonacoTheme } from './theme/monacotheme';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

// Frame component that uses theme from context
const Frame = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.primary.darker,
    justifyContent: 'center',
    display: 'inline-flex',
    borderRadius: '4px'
}));

// Import uniform utilities
import { fromUniformActiveSettings } from './components/editor/uniformsliders';
import { fixup_shader_code } from './lib/util/fixup';
import { defaultTextures } from './lib/util/textureutils';

/**
 * Default feature configuration - all features enabled
 */
const DEFAULT_FEATURES: Required<EditorFeatures> = {
    texturePicker: true,
    uniformSliders: true,
    bufferControls: true,
    recording: true,
    profiler: true,
    vim: true,
    hotReload: true,
    timer: true,
    explainer: true,
    comments: true,
    metadata: true
};

/**
 * Default textures - minimal set for functionality
 */
const DEFAULT_TEXTURES = [
    { img: '/textures/blank.png' },
    { img: '/textures/blank.png' }
];

export function StandaloneEditor(props: StandaloneEditorProps) {
    const {
        shaderData: propShaderData,
        initialShader,
        language = 'wgsl',
        user,
        onShaderChange,
        onCompileSuccess,
        onCompileError,
        onLanguageChange,
        onShaderDataChange,
        onSave,
        onDelete,
        onFork,
        textureProvider,
        defaultTextures: propDefaultTextures = DEFAULT_TEXTURES,
        customTextures = [],
        imageTransform,
        MetadataEditorComponent,
        CommentsComponent,
        statusColor = false,
        features: userFeatures = {},
        embed = false,
        className,
        style,
        children
    } = props;


    // Merge user features with defaults
    const features = useMemo(
        () => ({ ...DEFAULT_FEATURES, ...userFeatures }),
        [userFeatures]
    );

    // Internal shader data state
    const [internalShaderData, setInternalShaderData] = useState<ShaderData>(() => {
        // Initialize from props
        if (propShaderData) {
            return propShaderData;
        }
        return {
            name: 'New Shader',
            description: '',
            code: initialShader || '@compute @workgroup_size(1) fn main() {}',
            uniforms: [],
            textures: propDefaultTextures,
            float32Enabled: false,
            language: language,
            visibility: 'private',
            needsSave: false
        };
    });

    // Atom setters for integration with existing components
    const setCanvasParentEl = useSetAtom(canvasParentElAtom);
    const setCode = useSetAtom(codeAtom);
    const setDbLoaded = useSetAtom(dbLoadedAtom);
    const setLanguage = useSetAtom(languageAtom);
    const setLoadedTextures = useSetAtom(loadedTexturesAtom);
    const setCustomTextures = useSetAtom(customTexturesAtom);
    const setTitle = useSetAtom(titleAtom);
    const setDescription = useSetAtom(descriptionAtom);
    const setVisibility = useSetAtom(visibilityAtom);
    const setAuthorProfile = useSetAtom(authorProfileAtom);
    const setFloat32Enabled = useSetAtom(float32EnabledAtom);
    const setShaderID = useSetAtom(shaderIDAtom);
    const setManualReload = useSetAtom(manualReloadAtom);
    const setCodeNeedSave = useSetAtom(codeNeedSaveAtom);
    const setSliderRefMap = useSetAtom(sliderRefMapAtom);
    const setSliderSerDeNeedsUpdate = useSetAtom(sliderSerDeNeedsUpdateAtom);
    const setSaveColorTransitionSignal = useSetAtom(saveColorTransitionSignalAtom);
    
    const code = useAtomValue(codeAtom);

    // Load shader data into atoms (replicates useShader functionality)
    const loadShaderData = useCallback((shaderData: ShaderData) => {
        console.log('Loading shader data:', shaderData);
        
        setDbLoaded(false);
        setTitle(shaderData.name);
        setDescription(shaderData.description || '');
        setVisibility(shaderData.visibility);
        
        // Process code with fixup
        const processedCode = fixup_shader_code(shaderData.code);
        setCode(processedCode);
        setLoadedTextures(shaderData.textures);
        
        // Handle custom textures
        setCustomTextures(existingCustomTextures => {
            const newCustomTextures: any[] = [];
            for (const requiredTexture of shaderData.textures) {
                const isDefault = defaultTextures.find(dt => dt.img === requiredTexture.img);
                if (!isDefault) {
                    const isNew = !existingCustomTextures.find(ect => ect.img === requiredTexture.img);
                    if (isNew) {
                        newCustomTextures.push({ img: requiredTexture.img });
                    }
                }
            }
            return [...existingCustomTextures, ...newCustomTextures];
        });

        // Set up uniform sliders
        if (shaderData.uniforms) {
            setSliderRefMap(fromUniformActiveSettings(shaderData.uniforms));
            setSliderSerDeNeedsUpdate(true);
        }
        
        setFloat32Enabled(shaderData.float32Enabled);
        setLanguage(shaderData.language);
        setAuthorProfile(shaderData.profile || false);
        setShaderID(shaderData.id || false);
        setCodeNeedSave(shaderData.needsSave || false);
        
        // Apply status color if provided
        if (statusColor !== false) {
            setSaveColorTransitionSignal(statusColor);
        }
        
        setManualReload(true);
        setDbLoaded(true);
    }, [statusColor, setSaveColorTransitionSignal, setDbLoaded, setTitle, setDescription, setVisibility, setCode, setLoadedTextures, setCustomTextures, setSliderRefMap, setSliderSerDeNeedsUpdate, setFloat32Enabled, setLanguage, setAuthorProfile, setShaderID, setCodeNeedSave, setManualReload]);

    // Initialize shader data when component mounts or propShaderData changes
    useEffect(() => {
        loadShaderData(internalShaderData);
    }, [loadShaderData, internalShaderData]);

    // Update internal shader data when props change
    useEffect(() => {
        if (propShaderData && propShaderData !== internalShaderData) {
            setInternalShaderData(propShaderData);
        }
    }, [propShaderData, internalShaderData]);

    // Handle shader code changes
    useEffect(() => {
        if (onShaderChange && code !== internalShaderData.code) {
            onShaderChange(code);
            setInternalShaderData(prev => ({ ...prev, code, needsSave: true }));
        }
    }, [code, onShaderChange, internalShaderData.code]);

    // Handle shader data changes from metadata editor
    const handleShaderDataChange = useCallback((changes: Partial<ShaderData>) => {
        const updatedData = { ...internalShaderData, ...changes, needsSave: true };
        setInternalShaderData(updatedData);
        
        if (onShaderDataChange) {
            onShaderDataChange(changes);
        }
    }, [internalShaderData, onShaderDataChange]);

    // Canvas parent ref callback
    const renderParentNodeRef = useCallback((parent: HTMLElement | null) => {
        if (parent) {
            setCanvasParentEl(parent);
        }
    }, [setCanvasParentEl]);

    // Theme and responsive setup
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Monaco editor options
    const monacoOptions = useMemo(() => ({
        stopRenderingLineAfter: isMobile ? 500 : 1000,
        fontSize: 12,
        lineHeight: 14,
        fontFamily: "'Fira Code', monospace",
        'bracketPairColorization.enabled': true,
        mouseWheelZoom: true,
        minimap: { enabled: !isMobile },
        scrollBeyondLastLine: !isMobile,
        automaticLayout: true,
        lineNumbersMinChars: isMobile ? 3 : 4,
        useShadowDOM: false
    }), [isMobile]);

    // Embed styling
    const embedStyle = embed ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999
    } : {};

    // Monaco editor with buttons
    const monacoEditorWithButtons = (
        <ItemWithTransitionSignal transitionAtom={saveColorTransitionSignalAtom}>
            <div className="vim-status"></div>
            <MonacoTheme>
                <Monaco editorOptions={monacoOptions} />
            </MonacoTheme>
            <Box sx={{ paddingTop: '4px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button style={{ pointerEvents: 'none' }} />
                    <div>
                        <ReloadButton />
                        {features.hotReload && <HotReloadToggle />}
                        {features.explainer && <Explainer />}
                    </div>
                    {features.vim && <VimButton />}
                </Box>
            </Box>
        </ItemWithTransitionSignal>
    );

    // Metadata editor
    const metadataEditor = features.metadata && user && MetadataEditorComponent ? (
        <ItemWithTransitionSignal
            sx={{ textAlign: 'left', marginTop: '20px' }}
            transitionAtom={saveColorTransitionSignalAtom}
        >
            <MetadataEditorComponent
                shaderData={internalShaderData}
                user={user}
                onShaderDataChange={handleShaderDataChange}
                onSave={onSave}
                onDelete={onDelete}
                onFork={onFork}
            />
        </ItemWithTransitionSignal>
    ) : null;

    // Comments component
    const comments = features.comments && CommentsComponent && internalShaderData.id ? (
        <CommentsComponent shaderId={internalShaderData.id} />
    ) : null;

    // Left panel with canvas and controls
    const leftPanel = (
        <div ref={renderParentNodeRef}>
            <ItemWithTransitionSignal transitionAtom={saveColorTransitionSignalAtom}>
                <Frame elevation={12}>
                    <WgpuToyWrapper
                        bindID={embed ? 'embed-canvas' : 'standalone-editor-canvas'}
                        style={{
                            display: 'inline-block',
                            borderRadius: '4px',
                            backgroundColor: 'black',
                            ...embedStyle
                        }}
                        embed={embed}
                    />
                </Frame>
                <Grid
                    container
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        padding: '5px 5px 4px 5px'
                    }}
                >
                    <Grid item xs={2}>
                        <Stack
                            direction="column"
                            justifyContent="flex-start"
                            alignItems="flex-start"
                        >
                            {features.timer && <Timer />}
                        </Stack>
                    </Grid>
                    <Grid item xs={8}>
                        <PlayPauseButton />
                        <ResetButton />
                        {features.recording && <RecordButton />}
                    </Grid>
                    <Grid item xs={2}>
                        <Stack direction="column" justifyContent="flex-end" alignItems="flex-end">
                            <ResolutionButton />
                            <FullscreenButton />
                        </Stack>
                    </Grid>
                </Grid>
                {features.bufferControls && <BufferControls />}
                {features.uniformSliders && <UniformSliders />}
            </ItemWithTransitionSignal>

            {metadataEditor}

            {/* Show code right after metadata on mobile */}
            {isMobile && monacoEditorWithButtons}

            {/* Don't show comments on mobile */}
            {!isMobile && comments}
        </div>
    );

    // Right panel with editor and controls
    const rightPanel = (
        <div>
            {!isMobile && monacoEditorWithButtons}
            <Grid
                container
                spacing={2}
                sx={{
                    flexWrap: useMediaQuery(theme.breakpoints.up('sm')) ? 'nowrap' : 'wrap',
                    alignItems: 'stretch'
                }}
            >
                {features.texturePicker && (
                    <Grid item>
                        <TexturePicker />
                    </Grid>
                )}
                <Grid item>
                    <ConfigurationPicker />
                </Grid>
                <Grid item>
                    <EntryPointDisplay />
                </Grid>
            </Grid>
            {isMobile && comments}
        </div>
    );

    return (
        <div className={className} style={style}>
            {children}
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4} lg={5} xl={6}>
                        {leftPanel}
                    </Grid>
                    <Grid item xs={12} md={8} lg={7} xl={6}>
                        {rightPanel}
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
}

export default StandaloneEditor;