import {useRouter} from "next/router";
import {authorProfileAtom, codeAtom, dbLoadedAtom, DEFAULT_SHADER, manualReloadAtom, shaderIDAtom} from "lib/atoms";
import {useUpdateAtom} from "jotai/utils";
import useShaderSerDe from "lib/serializeshader";
import {useEffect} from "react";

function toNumber(str) {
    if (!Number.isNaN(Number(str))) {
        return Number(str);
    } else {
        return null;
    }
}

export const useDBRouter = () => {
    const setCode = useUpdateAtom(codeAtom);
    const setManualReload = useUpdateAtom(manualReloadAtom);
    const setShaderID = useUpdateAtom(shaderIDAtom);
    const setAuthorProfile = useUpdateAtom(authorProfileAtom);
    const setDBLoaded = useUpdateAtom(dbLoadedAtom);

    const [get, upsert] = useShaderSerDe();

    const router = useRouter();
    useEffect(() => {
        if (router.isReady && typeof router.query.id === 'string') {
            const id = toNumber(router.query.id);
            setDBLoaded(false);
            if (id) {
                get(id).then(() => {
                    setShaderID(id);
                    setManualReload(true);
                    setDBLoaded(true);
                });
            } else if (router.query.id === 'new') {
                setShaderID(false);
                setCode(DEFAULT_SHADER);
                setAuthorProfile(false)
                setManualReload(true);
                setDBLoaded(true);
            } else {
                // TODO: should 404
                setShaderID(false);
                setDBLoaded(false);
            }
        }
    }, [router.isReady, router.query.id]);
}