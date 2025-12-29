'use client';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LineStyleIcon from '@mui/icons-material/LineStyle';
import PetsIcon from '@mui/icons-material/Pets';
import SpeedIcon from '@mui/icons-material/Speed';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { useAtom, useAtomValue } from 'jotai';
import {
    codeAtom,
    codeNeedSaveAtom,
    float32EnabledAtom,
    languageAtom,
    profilerEnabledAtom,
    screenHDRFormatAtom,
    shaderIDAtom
} from 'lib/atoms/atoms';
import defaultSlangShader from 'lib/shaders/default.slang';
import defaultWgslShader from 'lib/shaders/default.wgsl';
import { useEffect, useState } from 'react';
import { Item } from '../../theme/theme';

export default function ConfigurationPicker() {
    const [float32Enabled, setFloat32Enabled] = useAtom(float32EnabledAtom);
    const [screenHDRFormat, setScreenHDRFormat] = useAtom(screenHDRFormatAtom);
    const [profilerEnabled, setProfilerEnabled] = useAtom(profilerEnabledAtom);
    const [language, setLanguage] = useAtom(languageAtom);
    const [, setCode] = useAtom(codeAtom);
    const codeNeedSave = useAtomValue(codeNeedSaveAtom);
    const shaderID = useAtomValue(shaderIDAtom);
    const theme = useTheme();
    const [hdrSupported, setHdrSupported] = useState(false);

    useEffect(() => {
        setHdrSupported(window.matchMedia('(dynamic-range: high)').matches);
    }, []);

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
                display: 'flex',
                flexDirection: 'column',
                marginTop: '18px',
                textAlign: 'left',
                color: theme.palette.dracula.foreground,
                height: '100%',
                overflow: 'auto'
            }}
        >
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                <ListItem>
                    <ListItemIcon
                        sx={{ minWidth: '32px', color: theme.palette.dracula.foreground }}
                    >
                        <PetsIcon />
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
                        style={{ height: '2em', margin: '0' }}
                    >
                        <MenuItem value="wgsl">WGSL</MenuItem>
                        <MenuItem value="slang">Slang</MenuItem>
                    </Select>
                </ListItem>
                <Tooltip
                    title={
                        !hdrSupported && screenHDRFormat !== 'sRGB'
                            ? 'HDR not detected - output may fall back to SDR'
                            : ''
                    }
                    placement="left"
                >
                    <ListItem>
                        <ListItemIcon
                            sx={{ minWidth: '32px', color: theme.palette.dracula.foreground }}
                        >
                            <Brightness7Icon />
                        </ListItemIcon>
                        <ListItemText id="config-list-label-screenHDRFormat" primary="HDR" />
                        <Select
                            value={screenHDRFormat}
                            onChange={e => {
                                setScreenHDRFormat(e.target.value);
                            }}
                            sx={{
                                minWidth: '115px',
                                color: theme.palette.dracula.foreground,
                                '& .MuiSelect-icon': {
                                    color: theme.palette.dracula.foreground
                                }
                            }}
                            inputProps={{
                                'aria-labelledby': 'config-list-label-screenHDRFormat'
                            }}
                            style={{ height: '2em', margin: '0' }}
                        >
                            <MenuItem value="sRGB">sRGB (SDR)</MenuItem>
                            <MenuItem value="scRGB">scRGB (HDR)</MenuItem>
                            <MenuItem value="displayP3">Display P3 (HDR)</MenuItem>
                        </Select>
                    </ListItem>
                </Tooltip>
                <ListItem>
                    <ListItemIcon
                        sx={{ minWidth: '32px', color: theme.palette.dracula.foreground }}
                    >
                        <LineStyleIcon />
                    </ListItemIcon>
                    <ListItemText id="config-list-label-float32" primary="Float32 Textures" />
                    <Switch
                        edge="end"
                        onChange={() => {
                            setFloat32Enabled(!float32Enabled);
                        }}
                        checked={float32Enabled}
                        inputProps={{
                            'aria-labelledby': 'config-list-label-float32'
                        }}
                    />
                </ListItem>
                <ListItem>
                    <ListItemIcon
                        sx={{ minWidth: '32px', color: theme.palette.dracula.foreground }}
                    >
                        <SpeedIcon />
                    </ListItemIcon>
                    <ListItemText id="config-profiler-attached" primary="Profiler [beta]" />
                    <Switch
                        edge="end"
                        onChange={() => {
                            setProfilerEnabled(!profilerEnabled);
                        }}
                        checked={profilerEnabled}
                        inputProps={{
                            'aria-labelledby': 'config-profiler-attached'
                        }}
                    />
                </ListItem>
            </List>
        </Item>
    );
}
