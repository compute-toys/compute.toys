import {ChangeEvent} from "react";
import {CssTextField, Item, theme} from "theme/theme";
import {
    Button,
    FormControl,
    Grid,
    InputBase,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {useAtom, useAtomValue} from "jotai";
import {
    authorProfileAtom,
    descriptionAtom,
    shaderDataUrlThumbAtom,
    titleAtom,
    Visibility,
    visibilityAtom,
    AuthorProfile,
} from "lib/atoms";
import {styled} from "@mui/material/styles";
import {
    shadowCanvasElAtom,
    shadowCanvasToDataUrl
} from "./shadowcanvas";
import {canvasElAtom} from "../lib/wgputoyatoms";
import {useUpdateAtom} from "jotai/utils";
import useShaderSerDe, {UpsertResult} from "../lib/serializeshader";
import Avatar from "./avatar";
import {useAuth} from "../lib/authcontext";
import {useRouter} from "next/router";
import Link from 'next/link';

const VisibilityInput = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
        paddingTop: '14px',
        paddingLeft: '14px',
    },
    '& .MuiSelect-icon': {
        color: theme.palette.dracula.foreground,
        marginTop: '5px'
    },
}));

export const MetadataEditor = () => {
    const [title, setTitle] = useAtom(titleAtom);
    const [description, setDescription] = useAtom(descriptionAtom);
    const [visibility, setVisibility] = useAtom(visibilityAtom);
    const setShaderDataUrlThumb = useUpdateAtom(shaderDataUrlThumbAtom);
    const shadowCanvasEl = useAtomValue(shadowCanvasElAtom);
    const canvasEl = useAtomValue(canvasElAtom);
    const authorProfile = useAtomValue(authorProfileAtom);
    const [getFromHost, upsertToHost] = useShaderSerDe();
    const {user} = useAuth();
    const router = useRouter();

    //TODO: not the best place for this logic
    const upsertShader = async () => {
        const dataUrl = await shadowCanvasToDataUrl(canvasEl, shadowCanvasEl);

        // we have the dataUrl "in hand," if we use an atom here
        // we'll have to wait to roundtrip it, so pass it instead.
        setShaderDataUrlThumb(dataUrl);
        const result: UpsertResult = await upsertToHost(dataUrl);
        if (result.success && result.needsRedirect) {
            router.push(`/view/${result.id}`);
        }
    }

    // disables frontend controls if not author (backend will reject changes otherwise)
    const userIsAuthor = () => {
        if (user) {
            // handles the case where shader has no author, i.e. is /editor/new
            if (!authorProfile || user.id === authorProfile.id) {
                return true;
            }
        }
        return false;
    }

    return (
        <Grid container spacing={2} sx={{padding: "10px"}}>
            <Grid item xs={8}>
                {userIsAuthor() ?
                    <CssTextField
                        fullWidth
                        id="metadata-title"
                        aria-label={"Title input"}
                        size="medium"
                        label={"Title"}
                        value={title}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {setTitle(event.target.value)}}
                        sx={{
                            input: {color: theme.palette.dracula.cyan},
                            label: {color: theme.palette.dracula.cyan},
                        }}
                        inputProps={{style: {fontSize: "1.25em", height: "1.0em", color: theme.palette.dracula.cyan}}}
                    />
                :
                    <Typography variant="h6" sx={{fontWeight: '400', color: theme.palette.dracula.cyan}}>
                        {title}
                    </Typography>
                }

            </Grid>
            <Grid item xs={4}>
                {userIsAuthor() ?
                    <FormControl fullWidth>
                        <InputLabel id="visibility-select-input-label">Visibility</InputLabel>
                        <Select
                            labelId="visbility-select-label"
                            id="metadata-visibility-select"
                            value={visibility}
                            label="Visibility"
                            input={<VisibilityInput/>}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {setVisibility(event.target.value as Visibility)}}
                        >
                            <MenuItem value={'private'}>private</MenuItem>
                            <MenuItem value={'unlisted'}>unlisted</MenuItem>
                            <MenuItem value={'public'}>public</MenuItem>
                        </Select>
                    </FormControl>
                    : null }
            </Grid>
            <Grid item xs={12}>
                {userIsAuthor() ?
                    <CssTextField
                        multiline
                        fullWidth
                        id="metadata-description"
                        aria-label={"Description input"}
                        size="small"
                        label={"Description"}
                        value={description}
                        rows={3}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setDescription(event.target.value)
                        }}
                        sx={{
                            input: {color: theme.palette.dracula.orange},
                            label: {color: theme.palette.dracula.orange}
                        }}
                    />
                    :
                    <Typography variant="body1" sx={{fontWeight: '300', color: theme.palette.dracula.orange}}>
                        {description}
                    </Typography>
                }
            </Grid>
            <Grid item xs={8} alignItems="center">
                {authorProfile !== false ?
                    <Stack direction="row" alignItems="center" justifyContent="left" spacing={1}>
                        <Avatar url={authorProfile.avatar_url ?? null} size={24} displayOnNull={false}/>
                        <Typography color={theme.palette.dracula.green}>
                            {authorProfile.username ? <Link href={`/profile/${authorProfile.username}`}>{authorProfile.username}</Link> : null}
                        </Typography>
                    </Stack>
                    : null
                }
            </Grid>
            <Grid item xs={4} alignItems="center" textAlign="right">
                {userIsAuthor() ?
                    <Button sx={{padding: "1", color: theme.palette.dracula.green, border: `1px solid ${theme.palette.dracula.currentLine}`}}
                            onClick={async () => {
                                upsertShader();
                            }}>
                        Save
                    </Button>
                    : null }
            </Grid>
        </Grid>
    );
};