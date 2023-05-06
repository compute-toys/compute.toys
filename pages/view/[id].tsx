import { Editor } from "components/editor/editor";
import { useDBRouter } from "lib/db/dbrouter";

export default function Index() {
    useDBRouter();
    return <Editor/>;
}
