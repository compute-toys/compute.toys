import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputBase from '@mui/material/InputBase';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    authorProfileAtom,
    descriptionAtom,
    shaderDataUrlThumbAtom,
    shaderIDAtom,
    titleAtom,
    Visibility,
    visibilityAtom
} from 'lib/atoms/atoms';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect } from 'react';
import { CssTextField, theme } from 'theme/theme';
import { canvasElAtom } from '../../lib/atoms/wgputoyatoms';
import { useAuth } from '../../lib/db/authcontext';
import useShaderSerDe, { UpsertResult } from '../../lib/db/serializeshader';
import Avatar from '../global/avatar';
import { shadowCanvasElAtom, shadowCanvasToDataUrl } from '../global/shadowcanvas';

const VisibilityInput = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
        paddingTop: '14px',
        paddingLeft: '14px'
    },
    '& .MuiSelect-icon': {
        color: theme.palette.dracula.foreground,
        marginTop: '5px'
    }
}));

export const MetadataEditor = () => {
    const [title, setTitle] = useAtom(titleAtom);
    const [description, setDescription] = useAtom(descriptionAtom);
    const [visibility, setVisibility] = useAtom(visibilityAtom);
    const shaderID = useAtomValue(shaderIDAtom);
    const setShaderDataUrlThumb = useSetAtom(shaderDataUrlThumbAtom);
    const shadowCanvasEl = useAtomValue(shadowCanvasElAtom);
    const canvasEl = useAtomValue(canvasElAtom);
    const authorProfile = useAtomValue(authorProfileAtom);
    const [, upsertToHost] = useShaderSerDe();
    const { user } = useAuth();
    const router = useRouter();

    //TODO: not the best place for this logic
    const upsertShader = async (forceCreate: boolean) => {
        const dataUrl = await shadowCanvasToDataUrl(canvasEl, shadowCanvasEl);

        // we have the dataUrl "in hand," if we use an atom here
        // we'll have to wait to roundtrip it, so pass it instead.
        setShaderDataUrlThumb(dataUrl);
        const result: UpsertResult = await upsertToHost(dataUrl, forceCreate);
        if (result.success && result.needsRedirect) {
            router.push(`/view/${result.id}`);
        }
    };

    // disables frontend controls if not author (backend will reject changes otherwise)
    const userIsAuthor = () => {
        if (user) {
            // handles the case where shader has no author, i.e. is /new
            if (!authorProfile || user.id === authorProfile.id) {
                return true;
            }
        }
        return false;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                upsertShader(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [upsertShader]);

    return (
        <Grid container spacing={2} sx={{ paddingX: '22px', paddingY: '10px' }}>
            <Grid item xs={8}>
                {userIsAuthor() ? (
                    <CssTextField
                        fullWidth
                        id="metadata-title"
                        aria-label={'Title input'}
                        size="medium"
                        label={'Title'}
                        value={title}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setTitle(event.target.value);
                        }}
                        sx={{
                            input: { color: theme.palette.dracula.cyan },
                            label: { color: theme.palette.dracula.cyan }
                        }}
                        inputProps={{
                            style: {
                                fontSize: '1.25em',
                                height: '1.0em',
                                color: theme.palette.dracula.cyan
                            }
                        }}
                    />
                ) : (
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: '400', color: theme.palette.dracula.cyan }}
                    >
                        {title}
                    </Typography>
                )}
            </Grid>
            <Grid item xs={4}>
                {userIsAuthor() ? (
                    <FormControl fullWidth>
                        <InputLabel id="visibility-select-input-label">Visibility</InputLabel>
                        <Select
                            labelId="visbility-select-label"
                            id="metadata-visibility-select"
                            value={visibility}
                            label="Visibility"
                            input={<VisibilityInput />}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                setVisibility(event.target.value as Visibility);
                            }}
                        >
                            <MenuItem value={'private'}>private</MenuItem>
                            <MenuItem value={'unlisted'}>unlisted</MenuItem>
                            <MenuItem value={'public'}>public</MenuItem>
                        </Select>
                    </FormControl>
                ) : null}
            </Grid>
            <Grid item xs={12}>
                {userIsAuthor() ? (
                    <CssTextField
                        multiline
                        fullWidth
                        id="metadata-description"
                        aria-label={'Description input'}
                        size="small"
                        label={'Description'}
                        value={description}
                        rows={3}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setDescription(event.target.value);
                        }}
                        sx={{
                            input: { color: theme.palette.dracula.orange },
                            label: { color: theme.palette.dracula.orange }
                        }}
                    />
                ) : (
                    <Typography
                        variant="body1"
                        sx={{ fontWeight: '300', color: theme.palette.dracula.orange }}
                    >
                        {description}
                    </Typography>
                )}
            </Grid>
            <Grid item xs={8} alignItems="center">
                {authorProfile !== false ? (
                    <Stack direction="row" alignItems="center" justifyContent="left" spacing={1}>
                        <Avatar
                            url={authorProfile.avatar_url ?? null}
                            size={24}
                            displayOnNull={false}
                        />
                        <Typography color={theme.palette.dracula.green}>
                            {authorProfile.username ? (
                                <Link href={`/profile/${authorProfile.username}`}>
                                    {authorProfile.username}
                                </Link>
                            ) : null}
                        </Typography>
                    </Stack>
                ) : null}
            </Grid>
            <Grid item xs={4} alignItems="center" textAlign="right">
                {shaderID && user ? (
                    <Button
                        sx={{
                            padding: '1',
                            color: theme.palette.dracula.green,
                            border: `1px solid ${theme.palette.dracula.currentLine}`
                        }}
                        onClick={async () => {
                            setTitle(`Fork of ${title}`.substring(0, 30));
                            setDescription(`Forked from https://compute.toys/view/${shaderID}`);
                            setVisibility('private');
                            upsertShader(true);
                        }}
                    >
                        Fork
                    </Button>
                ) : null}
                {userIsAuthor() ? (
                    <Button
                        sx={{
                            padding: '1',
                            color: theme.palette.dracula.green,
                            border: `1px solid ${theme.palette.dracula.currentLine}`
                        }}
                        onClick={async () => {
                            upsertShader(false);
                        }}
                    >
                        Save
                    </Button>
                ) : null}
            </Grid>
        </Grid>
    );
};
