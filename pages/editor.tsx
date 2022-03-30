
import Monaco, { MonacoOnInitializePane } from './components/monaco'
import {useEffect, useState} from 'react'
import WgpuToy, { default_shader } from "./components/wgputoy";

const Index = () => {
    const [code, setCode] = useState<string>(default_shader)

    const onInitializePane: MonacoOnInitializePane = (
        monacoEditorRef,
        editorRef,
        model
    ) => {
        editorRef.current.focus()
        monacoEditorRef.current.setModelMarkers(model[0], 'owner', null)
    }

    return <div><Monaco
        code={code}
        setCode={setCode}
        editorOptions={{
            stopRenderingLineAfter: 1000,
        }}
        onInitializePane={onInitializePane}
    /><WgpuToy code={code} bind_id={"editor-canvas"}/></div>
}

export default Index;