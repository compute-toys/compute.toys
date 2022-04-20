import {useRouter} from "next/router";
import React from "react";
import {Octokit} from "@octokit/rest";
import {codeAtom, DEFAULT_SHADER, manualReloadAtom} from "../lib/atoms";
import {useUpdateAtom} from "jotai/utils";

export const useOctokitRouter = () => {
    const setCode = useUpdateAtom(codeAtom);
    const setManualReload = useUpdateAtom(manualReloadAtom);

    const router = useRouter();
    React.useEffect(() => {
        if (router.isReady && typeof router.query.id === 'string') {
            if (router.query.id === 'new') {
                setCode(DEFAULT_SHADER);
                setManualReload(true);
            } else {
                const octokit = new Octokit();
                octokit.rest.gists.get({
                    gist_id: router.query.id
                }).then(r => {
                    console.log(r.data);
                    const title = r.data.description;
                    const files = Object.keys(r.data.files);
                    const wgsl = files.filter(f => f.endsWith('wgsl'))[0];
                    const license = r.data.files.LICENSE;
                    let content = r.data.files[wgsl].content;
                    if (title) document.title = title;
                    if (license) content = '/*** BEGIN LICENSE ***\n' + license.content + '\n*** END LICENSE ***/\n\n\n' + content;
                    setCode(content);
                    setManualReload(true);
                });
            }
        }
    }, [router.isReady, router.query.id]);
}