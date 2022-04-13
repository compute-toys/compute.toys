// MUI sizing from refs:
// https://github.com/mui/material-ui/issues/15662

import Monaco from '../../components/monaco';
import WgpuToy from "../../components/wgputoy";

import React, { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import useSize from "@react-hook/size";

import PlayPauseButton from "../../components/playpausebutton"
import ResetButton from "../../components/resetbutton";
import HotReloadToggle from "../../components/hotreloadtoggle";
import ReloadButton from "../../components/reloadbutton";

import { ThemeProvider, styled } from "@mui/material/styles";
import { Frame, Item, theme } from "../../theme/theme";
import {CssBaseline, Typography} from "@mui/material";

import "firacode";

import {ParseError} from "../../components/parseerror";
import UniformSliders, {UniformSliderRef} from "../../components/uniformsliders";
import { useRouter } from 'next/router';

import { Octokit } from "@octokit/rest";
import TexturePicker, {LoadedTextures} from "../../components/texturepicker";

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

    const monacoNodeRef = useRef(null);
    const [monacoNodeWidth, monacoNodeHeight] = useSize(monacoNodeRef);

    const renderNodeRef = useRef(null);
    const [renderNodeWidth, renderNodeHeight] = useSize(renderNodeRef);

    const [sliderRefMap, setSliderRefMap] = useState<Map<string,React.MutableRefObject<UniformSliderRef>>>(new Map<string,React.MutableRefObject<UniformSliderRef>>());

    const [loadedTextures, setLoadedTextures] = useState(["/textures/blank.png", "/textures/blank.png"]);

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
                    const files = Object.keys(r.data.files);
                    const content = r.data.files[files[0]].content;
                    setCode(content);
                    setManualReload(true);
                });
            }

        }
    }, [router.isReady]);


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
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
                                    bindID={"editor-canvas"}
                                    style={{
                                        display: 'inline-block',
                                        borderRadius: '4px'
                                    }}
                                />
                            </Frame>
                            <PlayPauseButton play={play} setPlay={setPlay} />
                            <ResetButton reset={reset} setReset={setReset} />
                        </Item>
                    </Grid>
                    <Grid item ref={monacoNodeRef} xs={9} md={8} lg={7} xl={6}>
                    <Item>
                        <UniformSliders
                            sliderRefMap={sliderRefMap}
                            setSliderRefMap={setSliderRefMap}
                        />
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
                        <TexturePicker loadedTextures={loadedTextures} setLoadedTextures={setLoadedTextures}/>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    );
}

export default Index;