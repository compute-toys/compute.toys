
import Monaco, { MonacoOnInitializePane } from './components/monaco'
import { useState } from 'react'
import { WgpuShim, shader } from "./wgpushim";

const Index = () => {
    WgpuShim();
    const [code, setCode] = useState<string>(shader)

    const onInitializePane: MonacoOnInitializePane = (
        monacoEditorRef,
        editorRef,
        model
    ) => {
        editorRef.current.setScrollTop(1)
        editorRef.current.setPosition({
            lineNumber: 2,
            column: 0,
        })
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