import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Editor from 'components/editor/editor';
import { ShadowCanvas } from 'components/global/shadowcanvas';
import { WindowManagementProvider } from 'lib/util/draggablewindowscontext';
import { theme } from 'theme/theme';

function App() {
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

export default App;
