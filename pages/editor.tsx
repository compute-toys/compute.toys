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
import { Fab } from "@mui/material";

import PlayPauseButton from "../components/playpausebutton"
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme/theme";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#1e1e1e',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
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

    const frameStyle = {
        justifyContent: 'center',
        border: 1,
        borderColor: 'grey.800',
        display: 'inline-block',
        borderRadius: '4px'
    }

    const canvasStyle = {
        display: 'inline-block',
        borderRadius: '4px'
    }

    return (
        <ThemeProvider theme={theme}>
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item ref={renderNodeRef} xs={4} md={5} lg={6} xl={7}>
                    <Item>
                        <Box sx={frameStyle}>
                            <WgpuToy parentWidth={renderNodeWidth} code={code} play={play} setPlay={setPlay} bindID={"editor-canvas"} style={canvasStyle}/>
                        </Box>
                        <PlayPauseButton play={play} setPlay={setPlay} />
                    </Item>

                </Grid>
                <Grid item ref={monacoNodeRef} xs={8} md={7} lg={6} xl={5}>
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