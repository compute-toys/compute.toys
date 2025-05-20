'use client';
import CodeIcon from '@mui/icons-material/Code';
import LineStyleIcon from '@mui/icons-material/LineStyle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { useAtom, useAtomValue } from 'jotai';
import {
    codeAtom,
    codeNeedSaveAtom,
    float32EnabledAtom,
    languageAtom,
    shaderIDAtom
} from 'lib/atoms/atoms';
import defaultSlangShader from 'lib/shaders/default.slang';
import defaultWgslShader from 'lib/shaders/default.wgsl';
import { Item } from '../../theme/theme';

export default function ConfigurationPicker() {
    const [float32Enabled, setFloat32Enabled] = useAtom(float32EnabledAtom);
    const [language, setLanguage] = useAtom(languageAtom);
    const [, setCode] = useAtom(codeAtom);
    const codeNeedSave = useAtomValue(codeNeedSaveAtom);
    const shaderID = useAtomValue(shaderIDAtom);
    const theme = useTheme();

    // Function to handle language change
    const handleLanguageChange = newLanguage => {
        // If we're on the /new page (shaderID is false) and the user hasn't made any edits yet
        if (shaderID === false && !codeNeedSave) {
            // Switch to the appropriate default shader based on the selected language
            if (newLanguage === 'wgsl') {
                setCode(defaultWgslShader);
            } else if (newLanguage === 'slang') {
                setCode(defaultSlangShader);
            }
        }

        // Update the language setting
        setLanguage(newLanguage);
    };

    return (
        <Item
            sx={{
                display: 'inline-block',
                marginTop: '18px',
                textAlign: 'left',
                color: theme.palette.dracula.foreground,
                minHeight: '-webkit-fill-available'
            }}
            style={{ minHeight: '-moz-fill-available' }}
        >
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                subheader={
                    <ListSubheader sx={{ color: theme.palette.dracula.foreground }}>
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemIcon
                        sx={{ minWidth: '32px', color: theme.palette.dracula.foreground }}
                    >
                        <LineStyleIcon />
                    </ListItemIcon>
                    <ListItemText id="config-list-label-float32" primary="Textures" />
                    <Select
                        value={float32Enabled}
                        onChange={e => {
                            setFloat32Enabled(e.target.value);
                        }}
                        sx={{
                            minWidth: '100px',
                            color: theme.palette.dracula.foreground,
                            '& .MuiSelect-icon': {
                                color: theme.palette.dracula.foreground
                            }
                        }}
                        inputProps={{
                            'aria-labelledby': 'config-list-label-float32'
                        }}
                    >
                        <MenuItem value={false as any}>float16</MenuItem>
                        <MenuItem value={true  as any}>float32</MenuItem>
                    </Select>
                </ListItem>
                <ListItem>
                    <ListItemIcon
                        sx={{ minWidth: '32px', color: theme.palette.dracula.foreground }}
                    >
                        <CodeIcon />
                    </ListItemIcon>
                    <ListItemText id="config-list-label-language" primary="Language" />
                    <Select
                        value={language}
                        onChange={e => {
                            handleLanguageChange(e.target.value);
                        }}
                        sx={{
                            minWidth: '100px',
                            color: theme.palette.dracula.foreground,
                            '& .MuiSelect-icon': {
                                color: theme.palette.dracula.foreground
                            }
                        }}
                        inputProps={{
                            'aria-labelledby': 'config-list-label-language'
                        }}
                    >
                        <MenuItem value="wgsl">WGSL</MenuItem>
                        <MenuItem value="slang">Slang</MenuItem>
                    </Select>
                </ListItem>
            </List>
        </Item>
    );
}
