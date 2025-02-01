'use client';
import Editor from 'components/editor/editor';
import { useSetAtom } from 'jotai';
import { codeNeedSaveAtom, dbLoadedAtom, manualReloadAtom, shaderIDAtom } from 'lib/atoms/atoms';
import { useResetShaderData } from 'lib/db/serializeshader';

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
    return <Editor user={props.user} />;
}
