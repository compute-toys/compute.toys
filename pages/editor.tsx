// MUI sizing from refs:
// https://github.com/mui/material-ui/issues/15662

import Monaco, { MonacoOnInitializePane } from './components/monaco'
import {useEffect, useRef, useState} from 'react'

import WgpuToy from "./components/wgputoy";
import { default_shader } from "./components/wgpu-defaults";

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

const Index = () => {
    const [code, setCode] = useState<string>(default_shader)
    const canvasGridRef = useRef();
    const monacoGridRef = useRef();


    const onInitializePane: MonacoOnInitializePane = (
        monacoEditorRef,
        editorRef,
        model
    ) => {
        editorRef.current.focus()
        monacoEditorRef.current.setModelMarkers(model[0], 'owner', null)
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item ref={canvasGridRef} xs={4} md={5} lg={6} xl={7}>
                    <WgpuToy parentRef={canvasGridRef} code={code} bindID={"editor-canvas"}/>
                </Grid>
                <Grid item ref={monacoGridRef} xs={8} md={7} lg={6} xl={5}>
                <Monaco
                    code={code}
                    setCode={setCode}
                    parentRef={monacoGridRef}
                    editorOptions={{
                        stopRenderingLineAfter: 1000
                    }}
                    onInitializePane={onInitializePane}
                />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Index;