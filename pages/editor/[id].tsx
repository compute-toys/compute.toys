// MUI sizing from refs:
// https://github.com/mui/material-ui/issues/15662

import Monaco from 'components/editor/monaco';
import {WgpuToyWrapper} from "components/wgputoy";

import {useCallback} from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import PlayPauseButton from "components/buttons/playpausebutton"
import ResetButton from "components/buttons/resetbutton";
import HotReloadToggle from "components/buttons/hotreloadtoggle";
import ReloadButton from "components/buttons/reloadbutton";

import {Frame, theme} from "theme/theme";
import {Accordion, AccordionDetails, AccordionSummary} from "@mui/material";

import "firacode";

import UniformSliders from "components/editor/uniformsliders";
import TexturePicker from "components/editor/texturepicker";
import EntryPointDisplay from "components/editor/entrypointdisplay";
import {canvasParentElAtom} from "lib/atoms/wgputoyatoms";
import {useUpdateAtom} from "jotai/utils";
import {MetadataEditor} from "components/editor/metadataeditor";
import {useDBRouter} from "lib/db/dbrouter";
import {saveColorTransitionSignalAtom} from "lib/atoms/atoms";
import { ItemWithTransitionSignal } from 'theme/itemwithtransition';

const Index = () => {

    const setCanvasParentEl = useUpdateAtom(canvasParentElAtom);

    const renderParentNodeRef = useCallback((parent) => {
        if (parent) {
            setCanvasParentEl(parent);
        }
    }, []);

    useDBRouter();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item ref={renderParentNodeRef} xs={3} md={4} lg={5} xl={6}>
                    <ItemWithTransitionSignal transitionAtom={saveColorTransitionSignalAtom}>
                        <Frame elevation={12}>
                            <WgpuToyWrapper
                                bindID={"editor-canvas"}
                                style={{
                                    display: 'inline-block',
                                    borderRadius: '4px'
                                }}
                            />
                        </Frame>
                        <PlayPauseButton />
                        <ResetButton />
                        <UniformSliders/>
                    </ItemWithTransitionSignal>
                    <ItemWithTransitionSignal sx={{textAlign: "left", marginTop: "20px"}} transitionAtom={saveColorTransitionSignalAtom}>
                        <MetadataEditor/>
                    </ItemWithTransitionSignal>
                </Grid>
                <Grid item xs={9} md={8} lg={7} xl={6}>
                    <ItemWithTransitionSignal transitionAtom={saveColorTransitionSignalAtom}>
                        <Monaco
                            editorOptions={{
                                stopRenderingLineAfter: 1000,
                                fontFamily: "'Fira Code', monospace",
                                //fontLigatures: true,
                            }}
                        />
                        <Box sx={{paddingTop: "4px"}}>
                            <ReloadButton/>
                            <HotReloadToggle/>
                        </Box>
                    </ItemWithTransitionSignal>
                    <Grid container spacing={2}>
                        <Grid item><TexturePicker/></Grid>
                        <Grid item><EntryPointDisplay/></Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Index;