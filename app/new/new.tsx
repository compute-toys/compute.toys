'use client';
import { useSetAtom } from 'jotai';
import { useResetShaderData } from 'lib/db/serializeshader';
import {
    codeNeedSaveAtom,
    dbLoadedAtom,
    manualReloadAtom,
    shaderIDAtom
} from '../../standalone-editor/src/lib/atoms/atoms';
import StandaloneEditor from '../../standalone-editor/src/StandaloneEditor';

// Import the default shader
import defaultWGSL from '../../standalone-editor/src/lib/shaders/default.wgsl';

export default function Index(props) {
    const reset = useResetShaderData();
    const setManualReload = useSetAtom(manualReloadAtom);
    const setShaderID = useSetAtom(shaderIDAtom);
    const setDBLoaded = useSetAtom(dbLoadedAtom);
    const setCodeNeedSave = useSetAtom(codeNeedSaveAtom);
    setDBLoaded(false);
    reset();
    setShaderID(false);
    setManualReload(true);
    setDBLoaded(true);
    setCodeNeedSave(false);
    return <StandaloneEditor user={props.user} initialShader={defaultWGSL} language="wgsl" />;
}
