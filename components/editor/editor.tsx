'use client';
// MUI sizing from refs:
// https://github.com/mui/material-ui/issues/15662

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { User } from '@supabase/supabase-js';
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
    const Resolution = dynamic(() => import('components/resolution'), {
        ssr: false
    });

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

    const ordinaryStyle = {
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        aspectRatio: '1.77',
        background: 'rgba(0,0,0,0)',
        borderRadius: '4px'
    };
    let embedStyle = {};
    if (props.embed) {
        embedStyle = {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw !important',
            height: '100vh !important',
            zIndex: 999999999
        };
    }

    const leftPanel = (
        <div>
            <ItemWithTransitionSignal transitionAtom={saveColorTransitionSignalAtom}>
                <div style={ordinaryStyle} ref={renderParentNodeRef}>
                    <WgpuToyWrapper
                        bindID={'editor-canvas'}
                        style={{ ...ordinaryStyle, ...embedStyle }}
                        embed={props.embed}
                    />
                </div>
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
