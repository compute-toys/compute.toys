import LineStyleIcon from '@mui/icons-material/LineStyle';
import { List, ListItem, ListItemIcon, ListItemText, ListSubheader, Switch } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAtom } from 'jotai';
import { float32EnabledAtom } from 'lib/atoms/atoms';
import { Item } from '../../theme/theme';

export default function ConfigurationPicker() {
    const [float32Enabled, setFloat32Enabled] = useAtom(float32EnabledAtom);
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
            </List>
        </Item>
    );
}
