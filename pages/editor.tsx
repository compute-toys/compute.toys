// MUI sizing from refs:
// https://github.com/mui/material-ui/issues/15662

import Monaco, { MonacoOnInitializePane } from '../components/monaco';
import WgpuToy from "../components/wgputoy";

import { useRef, useState } from 'react';

import { default_shader } from "../components/wgpu-defaults";

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import useSize from "@react-hook/size";

import PlayPauseButton from "../components/playpausebutton"
import ResetButton from "../components/resetbutton";

import { ThemeProvider, styled } from "@mui/material/styles";
import { theme } from "../theme/theme";
import { CssBaseline } from "@mui/material";
import HotReloadToggle from "../components/hotreloadtoggle";
import ReloadButton from "../components/reloadbutton";


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.primary.darker,
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const Frame = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.primary.darker,
    justifyContent: 'center',
    display: 'inline-flex',
    borderRadius: '4px'
}));

const Index = () => {
    const [code, setCode] = useState<string>(default_shader);
    const [play, setPlay] = useState<boolean>(true);
    const [reset, setReset] = useState<boolean>(false);
    const [hotReload, setHotReload] = useState<boolean>(false);
    const [manualReload, setManualReload] = useState<boolean>(false);

    const monacoNodeRef = useRef(null);
    const [monacoNodeWidth, monacoNodeHeight] = useSize(monacoNodeRef);

    const renderNodeRef = useRef(null);
    const [renderNodeWidth, renderNodeHeight] = useSize(renderNodeRef);

    const onInitializePane: MonacoOnInitializePane = (
        monacoEditorRef,
        editorRef,
        model
    ) => {
        editorRef.current.focus();
        monacoEditorRef.current.setModelMarkers(model[0], 'owner', null);
    }

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
                        <Monaco
                            code={code}
                            setCode={setCode}
                            parentWidth={monacoNodeWidth}
                            editorOptions={{
                                stopRenderingLineAfter: 1000
                            }}
                            onInitializePane={onInitializePane}
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