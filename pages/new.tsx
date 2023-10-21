import Editor from 'components/editor/editor';
import { useSetAtom } from 'jotai';
import { dbLoadedAtom, manualReloadAtom, shaderIDAtom } from 'lib/atoms/atoms';
import { useResetShaderData } from 'lib/db/serializeshader';

export default function Index() {
    const reset = useResetShaderData();
    const setManualReload = useSetAtom(manualReloadAtom);
    const setShaderID = useSetAtom(shaderIDAtom);
    const setDBLoaded = useSetAtom(dbLoadedAtom);
    setDBLoaded(false);
    reset();
    setShaderID(false);
    setManualReload(true);
    setDBLoaded(true);
    return <Editor />;
}
