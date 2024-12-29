'use client';
// MUI sizing from refs:
// https://github.com/mui/material-ui/issues/15662

import Giscus from '@giscus/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import FullscreenButton from 'components/buttons/fullscreenbutton';
import HotReloadToggle from 'components/buttons/hotreloadtoggle';
import PlayPauseButton from 'components/buttons/playpausebutton';
import RecordButton from 'components/buttons/recordbutton';
import ReloadButton from 'components/buttons/reloadbutton';
import ResetButton from 'components/buttons/resetbutton';
import ScaleButton from 'components/buttons/scalebutton';
import VimButton from 'components/buttons/vimbutton';
import EntryPointDisplay from 'components/editor/entrypointdisplay';
import { MetadataEditor } from 'components/editor/metadataeditor';
import Monaco from 'components/editor/monaco';
import TexturePicker from 'components/editor/texturepicker';
import UniformSliders from 'components/editor/uniformsliders';
import { WgpuToyWrapper } from 'components/wgputoy';
import 'firacode';
import { useAtomValue, useSetAtom } from 'jotai';
import { saveColorTransitionSignalAtom, shaderIDAtom } from 'lib/atoms/atoms';
import { canvasParentElAtom } from 'lib/atoms/wgputoyatoms';
import { supabase } from 'lib/db/supabaseclient';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import { ItemWithTransitionSignal } from 'theme/itemwithtransition';
import { Frame } from 'theme/theme';
import ConfigurationPicker from './configurationpicker';
import Explainer from './explainer';

function Comments() {
    return (
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
    );
}

export default function Editor(props) {
    const setCanvasParentEl = useSetAtom(canvasParentElAtom);
    const shaderID = useAtomValue(shaderIDAtom);

    const renderParentNodeRef = useCallback(parent => {
        if (parent) {
            setCanvasParentEl(parent);
        }
    }, []);

    const Timer = dynamic(() => import('components/timer'), { ssr: false });
    const Resolution = dynamic(() => import('components/resolution'), {
        ssr: false
    });

    let metadataEditor = null;
    if (supabase && !props.standalone) {
        metadataEditor = (
            <ItemWithTransitionSignal
                sx={{ textAlign: 'left', marginTop: '20px' }}
                transitionAtom={saveColorTransitionSignalAtom}
            >
                <MetadataEditor />
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
                <Grid container>
                    <Grid item sx={{ textAlign: 'left' }} xs={2}>
                        <Timer />
                    </Grid>
                    <Grid item xs={7}>
                        <PlayPauseButton />
                        <ResetButton />
                        <RecordButton />
                    </Grid>
                    <Grid item sx={{ textAlign: 'right' }} xs={3}>
                        <Resolution />
                        <ScaleButton />
                        <FullscreenButton />
                    </Grid>
                </Grid>
                <UniformSliders />
            </ItemWithTransitionSignal>
            {metadataEditor}
            {shaderID ? <Comments /> : null}
        </div>
    );

    const theme = useTheme();

    const rightPanel = (
        <div>
            <ItemWithTransitionSignal transitionAtom={saveColorTransitionSignalAtom}>
                <div className="vim-status"></div>
                <Monaco
                    editorOptions={{
                        stopRenderingLineAfter: 1000,
                        fontFamily: "'Fira Code', monospace",
                        'bracketPairColorization.enabled': true,
                        mouseWheelZoom: true
                        //fontLigatures: true,
                    }}
                />
                <Box sx={{ paddingTop: '4px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button style={{ pointerEvents: 'none' }} />{' '}
                        {/* invisible button, used only for centering */}
                        <div>
                            <ReloadButton />
                            <HotReloadToggle />
                            <Explainer />
                        </div>
                        <VimButton />
                    </Box>
                </Box>
            </ItemWithTransitionSignal>
            <Grid
                container
                spacing={2}
                sx={{
                    flexWrap: useMediaQuery(theme.breakpoints.up('sm')) ? 'nowrap' : 'wrap'
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
