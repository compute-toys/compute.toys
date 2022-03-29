
import Monaco, { MonacoOnInitializePane } from './components/monaco'
import {useEffect, useState} from 'react'
import { WgpuShim, shader } from "./wgpushim";

var wgpuContext;

WgpuShim((wgputoy) => {
    wgpuContext = wgputoy
})

const Index = () => {
    const [code, setCode] = useState<string>(shader)

    useEffect(() => {
        wgpuContext?.set_shader(code)
    }, [code])

    const onInitializePane: MonacoOnInitializePane = (
        monacoEditorRef,
        editorRef,
        model
    ) => {
        //editorRef.current.setScrollTop(1)
        /*editorRef.current.setPosition({
            lineNumber: 2,
            column: 0,
        })*/
        editorRef.current.focus()
        monacoEditorRef.current.setModelMarkers(model[0], 'owner', null)

    }

    return <Monaco
        code={code}
        setCode={setCode}
        editorOptions={{
            stopRenderingLineAfter: 1000,
        }}
        onInitializePane={onInitializePane}
    />
}

export default Index;