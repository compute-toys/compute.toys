// MUI sizing from refs:
// https://github.com/mui/material-ui/issues/15662

import Monaco from '../../components/monaco';
import WgpuToy from "../../components/wgputoy";

import React, { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import useSize from "@react-hook/size";

import PlayPauseButton from "../../components/playpausebutton"
import ResetButton from "../../components/resetbutton";
import HotReloadToggle from "../../components/hotreloadtoggle";
import ReloadButton from "../../components/reloadbutton";

import { ThemeProvider, styled } from "@mui/material/styles";
import { Frame, Item, theme } from "../../theme/theme";
import {Accordion, AccordionDetails, AccordionSummary, CssBaseline, Typography} from "@mui/material";

import "firacode";

import {ParseError} from "../../components/parseerror";
import UniformSliders, {UniformSliderRef} from "../../components/uniformsliders";
import { useRouter } from 'next/router';

import { Octokit } from "@octokit/rest";
import TexturePicker, {LoadedTextures} from "../../components/texturepicker";
import EntryPointDisplay from "../../components/entrypointdisplay";

const DEFAULT_SHADER = `
@stage(compute) @workgroup_size(16, 16)
fn main_image(@builtin(global_invocation_id) id: uint3) {
    // Viewport resolution (in pixels)
    let screen_size = uint2(textureDimensions(screen));

    // Prevent overdraw for workgroups on the edge of the viewport
    if (id.x >= screen_size.x || id.y >= screen_size.y) { return; }

    // Pixel coordinates (centre of pixel, origin at bottom left)
    let fragCoord = float2(float(id.x) + .5, float(screen_size.y - id.y) - .5);

    // Normalised pixel coordinates (from 0 to 1)
    let uv = fragCoord / float2(screen_size);

    // Time varying pixel colour
    var col = .5 + .5 * cos(time.elapsed + uv.xyx + float3(0.,2.,4.));

    // Convert from gamma-encoded to linear colour space
    col = pow(col, float3(2.2));

    // Output to screen (linear colour space)
    textureStore(screen, int2(id.xy), float4(col, 1.));
}
`;

const Index = () => {
    const [code, setCode] = useState<string>(DEFAULT_SHADER);
    const [play, setPlay] = useState<boolean>(true);
    const [reset, setReset] = useState<boolean>(false);
    const [hotReload, setHotReload] = useState<boolean>(false);
    const [manualReload, setManualReload] = useState<boolean>(false);
    const [parseError, setParseError] = useState<ParseError>(null);
    const [loadedTextures, setLoadedTextures] = useState(["/textures/blank.png", "/textures/blank.png"]);
    const [entryPoints, setEntryPoints] = useState([]);

    const monacoNodeRef = useRef(null);
    const [monacoNodeWidth, monacoNodeHeight] = useSize(monacoNodeRef);

    const renderNodeRef = useRef(null);
    const [renderNodeWidth, renderNodeHeight] = useSize(renderNodeRef);

    const [sliderRefMap, setSliderRefMap] = useState<Map<string,React.MutableRefObject<UniformSliderRef>>>(new Map<string,React.MutableRefObject<UniformSliderRef>>());

    const router = useRouter();
    React.useEffect(() => {
        if (router.isReady && typeof router.query.id === 'string') {
            if (router.query.id === 'new') {
                setManualReload(true);
            } else {
                const octokit = new Octokit();
                octokit.rest.gists.get({
                    gist_id: router.query.id
                }).then(r => {
                    console.log(r.data);
                    const title = r.data.description;
                    const files = Object.keys(r.data.files);
                    const wgsl = files.filter(f => f.endsWith('wgsl'))[0];
                    const license = r.data.files.LICENSE;
                    let content = r.data.files[wgsl].content;
                    if (title) document.title = title;
                    if (license) content = '/*** BEGIN LICENSE ***\n' + license.content + '\n*** END LICENSE ***/\n\n\n' + content;
                    setCode(content);
                    setManualReload(true);
                });
            }
        }
    }, [router.isReady, router.query.id]);


    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item ref={renderNodeRef} xs={3} md={4} lg={5} xl={6}>
                    <Item>
                        <Frame elevation={12}>
                            <WgpuToy
                                parentWidth={renderNodeWidth}
                                code={code}
                                play={play}
                                setPlay={setPlay}
                                reset={reset}
                                setReset={setReset}
                                hotReload={hotReload}
                                manualReload={manualReload}
                                setManualReload={setManualReload}
                                setError={setParseError}
                                sliderRefMap={sliderRefMap}
                                loadedTextures={loadedTextures}
                                setEntryPoints={setEntryPoints}
                                bindID={"editor-canvas"}
                                style={{
                                    display: 'inline-block',
                                    borderRadius: '4px'
                                }}
                            />
                        </Frame>
                        <PlayPauseButton play={play} setPlay={setPlay} />
                        <ResetButton reset={reset} setReset={setReset} />
                        <Accordion sx={{color: theme.palette.dracula.foreground, backgroundColor: theme.palette.primary.darker}}>
                            <AccordionSummary
                                sx={{fontSize: 14}}
                                expandIcon={<ExpandMoreIcon sx={{color: theme.palette.dracula.foreground}}/>}
                                aria-controls="uniform-accordion"
                                id="uniform-accordion"
                            >Uniforms</AccordionSummary>
                            <AccordionDetails sx={{padding: "0px 2px 8px"}}>
                                <UniformSliders
                                    sliderRefMap={sliderRefMap}
                                    setSliderRefMap={setSliderRefMap}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Item>
                </Grid>
                <Grid item ref={monacoNodeRef} xs={9} md={8} lg={7} xl={6}>
                <Item>
                    <Monaco
                        code={code}
                        setCode={setCode}
                        parentWidth={monacoNodeWidth}
                        editorOptions={{
                            stopRenderingLineAfter: 1000,
                            fontFamily: "'Fira Code', monospace",
                            //fontLigatures: true,
                        }}
                        parseError={parseError}
                    />
                    <Box sx={{paddingTop: "4px"}}>
                        <ReloadButton hotReload={hotReload} setManualReload={setManualReload}/>
                        <HotReloadToggle hotReload={hotReload} setHotReload={setHotReload}/>
                    </Box>
                </Item>
                    <Grid container spacing={2}>
                        <Grid item><TexturePicker loadedTextures={loadedTextures} setLoadedTextures={setLoadedTextures}/></Grid>
                        <Grid item><EntryPointDisplay entryPoints={entryPoints}/></Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Index;