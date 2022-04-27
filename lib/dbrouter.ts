import {useRouter} from "next/router";
import React from "react";
import {Octokit} from "@octokit/rest";
import {codeAtom, DEFAULT_SHADER, manualReloadAtom, shaderIDAtom} from "./atoms";
import {useUpdateAtom} from "jotai/utils";
import useShaderSerDe from "./serializeshader";

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

    const [get, upsert] = useShaderSerDe();

    const router = useRouter();
    React.useEffect(() => {
        if (router.isReady && typeof router.query.id === 'string') {
            const id = toNumber(router.query.id);
            if (id) {
                get(id).then(() => {
                    setShaderID(id);
                    setManualReload(true);
                });
            } else if (router.query.id === 'new') {
                setShaderID(false);
                setCode(DEFAULT_SHADER);
                setManualReload(true);
            } else {
                setShaderID(false);
            }
        }
    }, [router.isReady, router.query.id]);
}