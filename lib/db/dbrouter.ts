import {useRouter} from "next/router";
import {authorProfileAtom, codeAtom, dbLoadedAtom, DEFAULT_SHADER, manualReloadAtom, shaderIDAtom} from "lib/atoms/atoms";
import { isSafeContext, wgputoyAtom } from "lib/atoms/wgputoyatoms";
import { useAtomValue } from "jotai";
import {useUpdateAtom} from "jotai/utils";
import useShaderSerDe, {useResetShaderData} from "lib/db/serializeshader";
import {useEffect} from "react";

function toNumber(str) {
    if (!Number.isNaN(Number(str))) {
        return Number(str);
    } else {
        return null;
    }
}

export const useDBRouter = () => {
    const reset = useResetShaderData();
    const setManualReload = useUpdateAtom(manualReloadAtom);
    const setShaderID = useUpdateAtom(shaderIDAtom);
    const setDBLoaded = useUpdateAtom(dbLoadedAtom);
    const wgputoy = useAtomValue(wgputoyAtom);

    const [get, upsert] = useShaderSerDe();

    const router = useRouter();
    useEffect(() => {
        if (router.isReady && typeof router.query.id === 'string') {
            const id = toNumber(router.query.id);
            setDBLoaded(false);
            reset();
            if (id) {
                get(id).then(() => {
                    setShaderID(id);
                    setManualReload(true);
                    setDBLoaded(true);
                });
            } else if (router.query.id === 'new') {
                setShaderID(false);
                setManualReload(true);
                setDBLoaded(true);
            } else {
                // TODO: should 404
                setShaderID(false);
                setDBLoaded(false);
            }
        }
    }, [router.isReady, router.query.id]);
    useEffect(() => {
        const handleRouteChange = (url: string, { shallow }) => {
            if (isSafeContext(wgputoy) && !['new', 'view', 'editor'].includes(url.split('/')[1])) {
                console.log("Destroying WebGPU renderer");
                wgputoy.free();
                window['wgsl_error_handler'] = null;
            }
        }

        router.events.on('routeChangeStart', handleRouteChange)

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:
        return () => {
            router.events.off('routeChangeStart', handleRouteChange)
        }
    }, [wgputoy]);
    useEffect(() => {
        router.beforePopState(({ url, as, options }) => {
            // https://github.com/vercel/next.js/discussions/30215
            window.location.href = as;
            return false;
        })
    }, [router]);
}