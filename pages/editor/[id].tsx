// MUI sizing from refs:
// https://github.com/mui/material-ui/issues/15662

import Monaco from '../../components/monaco';
import {WgpuToyWrapper} from "../../components/wgputoy";

import React, {useCallback} from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import PlayPauseButton from "../../components/playpausebutton"
import ResetButton from "../../components/resetbutton";
import HotReloadToggle from "../../components/hotreloadtoggle";
import ReloadButton from "../../components/reloadbutton";

import { Frame, Item, theme } from "../../theme/theme";
import {Accordion, AccordionDetails, AccordionSummary, CssBaseline, Typography} from "@mui/material";

import "firacode";

import UniformSliders, {UniformSliderRef} from "../../components/uniformsliders";
import TexturePicker, {LoadedTextures} from "../../components/texturepicker";
import EntryPointDisplay from "../../components/entrypointdisplay";
import {useOctokitRouter} from "../../components/octokitrouter";
import {canvasParentElAtom} from "../../lib/wgputoyatoms";
import {useUpdateAtom} from "jotai/utils";
import LoginModal from "../../components/loginmodal";
import {MetadataEditor} from "../../components/metadataeditor";
import {UpdateProfile} from "../../components/updateprofile";
import {useDBRouter} from "../../lib/dbrouter";

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
            <LoginModal/>
            <Grid container spacing={2}>
                <Grid item ref={renderParentNodeRef} xs={3} md={4} lg={5} xl={6}>
                    <Item>
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
                        <Accordion sx={{color: theme.palette.dracula.foreground, backgroundColor: theme.palette.primary.darker}}>
                            <AccordionSummary
                                sx={{fontSize: 14}}
                                expandIcon={<ExpandMoreIcon sx={{color: theme.palette.dracula.foreground}}/>}
                                aria-controls="uniform-accordion"
                                id="uniform-accordion"
                            >Uniforms</AccordionSummary>
                            <AccordionDetails sx={{padding: "0px 2px 8px"}}>
                                <UniformSliders/>
                            </AccordionDetails>
                        </Accordion>
                    </Item>
                    <MetadataEditor/>
                </Grid>
                <Grid item xs={9} md={8} lg={7} xl={6}>
                <Item>
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
                </Item>
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