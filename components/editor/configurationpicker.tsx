
import {getRainbowColor, Item} from '../../theme/theme';
import {useAtom, useAtomValue} from "jotai";
import {float32EnabledAtom} from "lib/atoms/atoms";
import {List, ListItem, ListItemIcon, ListItemText, ListSubheader, Switch} from "@mui/material";
import LineStyleIcon from '@mui/icons-material/LineStyle';
import {useTheme} from "@mui/material/styles";

export default function ConfigurationPicker() {
    const [float32Enabled, setFloat32Enabled] = useAtom(float32EnabledAtom);
    const theme = useTheme();
    return (
        <Item sx={{
            display: "inline-block",
            marginTop: "18px",
            textAlign: "left",
            color: theme.palette.dracula.foreground}}>
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                subheader={<ListSubheader sx={{color: theme.palette.dracula.foreground}}>Settings</ListSubheader>}
            >
                <ListItem>
                    <ListItemIcon sx={{minWidth: "32px", color: theme.palette.dracula.foreground}}>
                        <LineStyleIcon />
                    </ListItemIcon>
                    <ListItemText id="config-list-label-float32" primary="Float32 Buffers" />
                    <Switch
                        edge="end"
                        onChange={() => {setFloat32Enabled(!float32Enabled)}}
                        checked={float32Enabled}
                        inputProps={{
                            'aria-labelledby': "config-list-label-float32",
                        }}
                    />
                </ListItem>
            </List>
        </Item>
    );
}