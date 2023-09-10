import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Editor } from 'components/editor/editor';
import MetaHead from 'components/global/metahead';
import { ShadowCanvas } from 'components/global/shadowcanvas';
import { useSetAtom } from 'jotai';
import { dbLoadedAtom } from 'lib/atoms/atoms';
import { theme } from 'theme/theme';

export default function App() {
    // FIXME: pretend the DB has loaded otherwise wgputoycontroller silently fails for e.g. manual reloads
    const setDBLoaded = useSetAtom(dbLoadedAtom);
    setDBLoaded(true);

    return (
        <ThemeProvider theme={theme}>
            <MetaHead />
            <ShadowCanvas />
            <CssBaseline />
            <Editor />
        </ThemeProvider>
    );
}
