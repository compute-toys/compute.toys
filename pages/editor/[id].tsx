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


const Index = () => {
    const [code, setCode] = useState<string>("// Loading...");
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

    const router = useRouter();
    React.useEffect(() => {
        if (router.isReady && typeof router.query.id === 'string') {
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
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    );
}

export default Index;