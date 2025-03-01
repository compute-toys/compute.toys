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
import { useAtom } from 'jotai';
import { float32EnabledAtom, languageAtom } from 'lib/atoms/atoms';
import { Item } from '../../theme/theme';

export default function ConfigurationPicker() {
    const [float32Enabled, setFloat32Enabled] = useAtom(float32EnabledAtom);
    const [language, setLanguage] = useAtom(languageAtom);
    const theme = useTheme();
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
                        Settings
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemIcon
                        sx={{ minWidth: '32px', color: theme.palette.dracula.foreground }}
                    >
                        <LineStyleIcon />
                    </ListItemIcon>
                    <ListItemText id="config-list-label-float32" primary="Float32 Buffers" />
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
                        <CodeIcon />
                    </ListItemIcon>
                    <ListItemText id="config-list-label-language" primary="Language" />
                    <Select
                        value={language}
                        onChange={e => {
                            setLanguage(e.target.value);
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
