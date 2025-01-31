'use client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Editor from 'components/editor/editor';
import FavIconHead from 'components/global/faviconhead';
import { ShadowCanvas } from 'components/global/shadowcanvas';
import { useSetAtom } from 'jotai';
import { codeNeedSaveAtom, dbLoadedAtom } from 'lib/atoms/atoms';
import { WindowManagementProvider } from 'lib/util/draggablewindowscontext';
import { theme } from 'theme/theme';

export default function App() {
    // FIXME: pretend the DB has loaded otherwise wgputoycontroller silently fails for e.g. manual reloads
    const setDBLoaded = useSetAtom(dbLoadedAtom);
    const setCodeNeedSave = useSetAtom(codeNeedSaveAtom);
    setDBLoaded(true);
    setCodeNeedSave(false);

    return (
        <WindowManagementProvider>
            <ThemeProvider theme={theme}>
                <FavIconHead />
                <ShadowCanvas />
                <CssBaseline />
                <Editor standalone />
            </ThemeProvider>
        </WindowManagementProvider>
    );
}
