// MUI sizing from refs:
// https://github.com/mui/material-ui/issues/15662

import Monaco, { MonacoOnInitializePane } from '../components/monaco';
import {useRef, useState} from 'react';

import WgpuToy from "../components/wgputoy";
import { default_shader } from "../components/wgpu-defaults";

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import useSize from "@react-hook/size";
import {CssBaseline, Fab} from "@mui/material";

import PlayPauseButton from "../components/playpausebutton"
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme/theme";

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
    const [code, setCode] = useState<string>(default_shader)
    const [play, setPlay] = useState<boolean>(true)

    const monacoNodeRef = useRef(null);
    const [monacoNodeWidth, monacoNodeHeight] = useSize(monacoNodeRef);

    const renderNodeRef = useRef(null);
    const [renderNodeWidth, renderNodeHeight] = useSize(renderNodeRef);


    const onInitializePane: MonacoOnInitializePane = (
        monacoEditorRef,
        editorRef,
        model
    ) => {
        editorRef.current.focus()
        monacoEditorRef.current.setModelMarkers(model[0], 'owner', null)
    }

    const canvasStyle = {
        display: 'inline-block',
        borderRadius: '4px'
    };

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
                                    bindID={"editor-canvas"}
                                    style={canvasStyle}
                                />
                            </Frame>
                            <PlayPauseButton play={play} setPlay={setPlay} />
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
                    </Item>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    );
}

export default Index;