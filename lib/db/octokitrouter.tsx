import {useRouter} from "next/router";
import {Octokit} from "@octokit/rest";
import {
    codeAtom,
    DEFAULT_SHADER,
    descriptionAtom,
    manualReloadAtom,
    titleAtom,
    Visibility,
    visibilityAtom
} from "lib/atoms/atoms";
import {useSetAtom} from "jotai";
import {useEffect} from "react";

export const useOctokitRouter = () => {
    const setCode = useSetAtom(codeAtom);
    const setManualReload = useSetAtom(manualReloadAtom);
    const setTitle = useSetAtom(titleAtom);
    const setDescription = useSetAtom(descriptionAtom);
    const setVisibility = useSetAtom(visibilityAtom);

    const router = useRouter();
    useEffect(() => {
        if (router.isReady && typeof router.query.id === 'string') {
            if (router.query.id === 'new') {
                setCode(DEFAULT_SHADER);
                setManualReload(true);
                setTitle("New Shader");
                setDescription("");
                setVisibility("private" as Visibility);
                document.title = "New Shader";
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
                    setTitle(title);
                    setDescription("");
                    setVisibility("private" as Visibility);
                });
            }
        }
    }, [router.isReady, router.query.id]);
}