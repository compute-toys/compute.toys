'use client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Editor from 'components/editor/editor';
import { ShadowCanvas } from 'components/global/shadowcanvas';
import { useSetAtom } from 'jotai';
import { codeNeedSaveAtom } from 'lib/atoms/atoms';
import { WindowManagementProvider } from 'lib/util/draggablewindowscontext';
import { theme } from 'theme/theme';

export default function App() {
    const setCodeNeedSave = useSetAtom(codeNeedSaveAtom);
    setCodeNeedSave(false);

    return (
        <WindowManagementProvider>
            <ThemeProvider theme={theme}>
                <ShadowCanvas />
                <CssBaseline />
                <Editor standalone />
            </ThemeProvider>
        </WindowManagementProvider>
    );
}
