import OpenInNew from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';

import AllowedTextureResources from '../../config/allowedtexturesources.json';
import { useTheme } from '@mui/material/styles';

export default function AllowedTextureSources() {
    const theme = useTheme();
    return (
        <List dense>
            <ListSubheader sx={{ color: theme.palette.dracula.orange }}>
                Allowed domains
            </ListSubheader>
            {AllowedTextureResources.map(resource => {
                return (
                    <ListItem
                        key={resource.domain}
                        dense={true}
                        secondaryAction={
                            <IconButton
                                role="link"
                                target="_blank"
                                href={resource.referenceUrl}
                                aria-label={`Open URL for ${resource.displayName}`}
                                sx={{
                                    minWidth: '1em',
                                    marginLeft: '2em',
                                    color: theme.palette.dracula.pink
                                }}
                            >
                                <OpenInNew />
                            </IconButton>
                        }
                    >
                        <ListItemText
                            sx={{ color: theme.palette.dracula.foreground, marginRight: 1.5 }}
                            primary={resource.domain}
                        />
                    </ListItem>
                );
            })}
        </List>
    );
}
