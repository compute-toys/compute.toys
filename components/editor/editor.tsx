// MUI sizing from refs:
// https://github.com/mui/material-ui/issues/15662

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { User } from '@supabase/supabase-js';
import FullscreenButton from 'components/buttons/fullscreenbutton';
import HotReloadToggle from 'components/buttons/hotreloadtoggle';
import PlayPauseButton from 'components/buttons/playpausebutton';
import RecordButton from 'components/buttons/recordbutton';
import ReloadButton from 'components/buttons/reloadbutton';
import ResetButton from 'components/buttons/resetbutton';
import ResolutionButton from 'components/buttons/resolutionbutton';
import VimButton from 'components/buttons/vimbutton';
import EntryPointDisplay from 'components/editor/entrypointdisplay';
import { MetadataEditor } from 'components/editor/metadataeditor';
import TexturePicker from 'components/editor/texturepicker';
import UniformSliders from 'components/editor/uniformsliders';
import { WgpuToyWrapper } from 'components/wgputoy';
import 'firacode';
import { useAtomValue, useSetAtom } from 'jotai';
import { saveColorTransitionSignalAtom, shaderIDAtom } from 'lib/atoms/atoms';
import { canvasParentElAtom } from 'lib/atoms/wgputoyatoms';
import { createClient } from 'lib/supabase/client';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import { ItemWithTransitionSignal } from 'theme/itemwithtransition';
import { MonacoTheme } from 'theme/monacotheme';
import { Frame } from 'theme/theme';
import ConfigurationPicker from './configurationpicker';
import Explainer from './explainer';

const Monaco = dynamic(() => import('components/editor/monaco'), {
    ssr: false,
    loading: () => <Box width={'100%'} height={'calc(100vh - 270px)'} />
});
const Giscus = dynamic(() => import('@giscus/react'), { ssr: false });

interface EditorProps {
    user?: User;
    standalone?: boolean;
    embed?: boolean;
}

function Comments() {
    return (
        <Box sx={{ marginTop: { xs: '2em', sm: 0 } }}>
            <Giscus
                id="comments"
                repo="compute-toys/comments"
                repoId="R_kgDOKRTytw"
                category="Announcements"
                categoryId="DIC_kwDOKRTyt84CllQC"
                mapping="pathname"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="1"
                inputPosition="top"
                theme="dark"
                lang="en"
                loading="lazy"
            />
        </Box>
    );
}

export default function Editor(props: EditorProps) {
    const setCanvasParentEl = useSetAtom(canvasParentElAtom);
    const shaderID = useAtomValue(shaderIDAtom);

    const supabase = createClient();

    const renderParentNodeRef = useCallback(parent => {
        if (parent) {
            setCanvasParentEl(parent);
        }
    }, []);

    const Timer = dynamic(() => import('components/timer'), { ssr: false });

    let metadataEditor: JSX.Element | null = null;
    if (supabase && !props.standalone) {
        metadataEditor = (
            <ItemWithTransitionSignal
                sx={{ textAlign: 'left', marginTop: '20px' }}
                transitionAtom={saveColorTransitionSignalAtom}
            >
                <MetadataEditor user={props.user} />
            </ItemWithTransitionSignal>
        );
    }

    let embedStyle = {};
    if (props.embed) {
        embedStyle = {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999
        };
    }

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const monacoOptions = (isMobile: boolean) => ({
        stopRenderingLineAfter: isMobile ? 500 : 1000,
        fontSize: isMobile ? 12 : 12,
        lineHeight: isMobile ? 16 : 18,
        fontFamily: "'Fira Code', monospace",
        'bracketPairColorization.enabled': true,
        mouseWheelZoom: true,
        minimap: { enabled: !isMobile },
        scrollBeyondLastLine: !isMobile,
        automaticLayout: true,
        lineNumbersMinChars: isMobile ? 3 : 4,
        useShadowDOM: false // https://github.com/microsoft/monaco-editor/issues/3602
    });

    const monacoEditorWithButtons = (
        <ItemWithTransitionSignal transitionAtom={saveColorTransitionSignalAtom}>
            <div className="vim-status"></div>
            <MonacoTheme>
                <Monaco editorOptions={monacoOptions(isMobile)} />
            </MonacoTheme>
            <Box sx={{ paddingTop: '4px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button style={{ pointerEvents: 'none' }} />
                    <div>
                        <ReloadButton />
                        <HotReloadToggle />
                        <Explainer />
                    </div>
                    <VimButton />
                </Box>
            </Box>
        </ItemWithTransitionSignal>
    );

    const leftPanel = (
        <div ref={renderParentNodeRef}>
            <ItemWithTransitionSignal transitionAtom={saveColorTransitionSignalAtom}>
                <Frame elevation={12}>
                    <WgpuToyWrapper
                        bindID={'editor-canvas'}
                        style={{
                            display: 'inline-block',
                            borderRadius: '4px',
                            backgroundColor: 'black',
                            ...embedStyle
                        }}
                        embed={props.embed}
                    />
                </Frame>
                <Grid
                    container
                    sx={{
                        display: 'flex',
                        alignItems: 'center', // Vertically centers
                        justifyContent: 'center', // Horizontally centers
                        height: '100%', // Ensures vertical alignment works
                        padding: '5px 5px 4px 5px' // top right bottom left
                    }}
                >
                    <Grid item xs={2}>
                        <Stack
                            direction="column"
                            justifyContent="flex-start"
                            alignItems="flex-start"
                        >
                            <Timer />
                        </Stack>
                    </Grid>
                    <Grid item xs={8}>
                        <PlayPauseButton />
                        <ResetButton />
                        <RecordButton />
                    </Grid>
                    <Grid item xs={2}>
                        <Stack direction="column" justifyContent="flex-end" alignItems="flex-end">
                            <ResolutionButton />
                            <FullscreenButton />
                        </Stack>
                    </Grid>
                </Grid>
                <UniformSliders />
            </ItemWithTransitionSignal>
            {metadataEditor}

            {/* Show code right after shader metadata on mobile */}
            {isMobile && monacoEditorWithButtons}

            {/* Don't show comments on mobile */}
            {!isMobile && (shaderID ? <Comments /> : null)}
        </div>
    );

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
                <Grid item>
                    <TexturePicker />
                </Grid>
                <Grid item>
                    <ConfigurationPicker />
                </Grid>
                <Grid item>
                    <EntryPointDisplay />
                </Grid>
            </Grid>
            {isMobile && (shaderID ? <Comments /> : null)}
        </div>
    );

    return (
        <div>
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
