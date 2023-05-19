import { theme } from "theme/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ShadowCanvas } from "components/global/shadowcanvas";
import FavIconHead from "components/global/faviconhead";
import NoWgpuModal from "components/global/nowgpumodal";
import { Editor } from 'components/editor/editor';
import { useSetAtom } from 'jotai';
import { dbLoadedAtom } from 'lib/atoms/atoms';

export default function App() {
    // FIXME: pretend the DB has loaded otherwise wgputoycontroller silently fails for e.g. manual reloads
    const setDBLoaded = useSetAtom(dbLoadedAtom);
    setDBLoaded(true);

    return (
        <ThemeProvider theme={theme}>
            <FavIconHead />
            <ShadowCanvas />
            <CssBaseline />
            <NoWgpuModal />
            <Editor />
        </ThemeProvider>
    )
}
