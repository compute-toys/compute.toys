import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import UploadButton from 'components/buttons/uploadbutton';
import Avatar from 'components/global/avatar';
import { useAuth } from 'lib/db/authcontext';
import { supabase, SUPABASE_SHADER_TABLE_NAME } from 'lib/db/supabaseclient';
import { toDateString } from 'lib/util/dateutils';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import { CssTextField, Item, theme } from 'theme/theme';
import { ProfileShaders } from '../../components/profileshaders';

export const runtime = 'experimental-edge';

const PROFILE_AVATAR_WIDTH = 96;

async function loadShaders(username: string) {
    try {
        const { data, error, status } = await supabase
            .from(SUPABASE_SHADER_TABLE_NAME)
            .select(
                `
                    *,
                    profile:author!inner(username)  
                `
            )
            .eq('profile.username', username);

        if (error && status !== 406) {
            throw error;
        }

        if (data) {
            return {
                shaders: data,
                error: null
            };
        } else {
            return {
                shaders: [],
                error: 'no data'
            };
        }
    } catch (error) {
        return {
            shaders: [],
            error: error.message
        };
    }
}

export default function Profile(props) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatar, setAvatar] = useState(props.profile.avatar_url);
    const [aboutEditor, setAboutEditor] = useState(props.profile.about);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const { user } = useAuth();

    const [shaders, setShaders] = useState([]);
    const [editable, setEditable] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        // RLS prevents editing server-side
        setEditable(props.profile.id === (user ? user.id : ''));
    });

    useEffect(() => {
        loadShaders(props.profile.username).then(res => {
            setShaders(res.shaders);
            setErrorMessage(res.error);
        });
    }, [user, props.profile.id]);

    //https://github.com/supabase/supabase/blob/master/examples/nextjs-ts-user-management/components/Account.tsx
    const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                setErrorMessage('You must select an image to upload.');
                throw 'No file selected';
            }

            const file = event.target.files[0];

            if (file.size > 50 * 1024) {
                setErrorMessage('Please select an image that is less than 50KB');
                throw 'File must be less than 50KB';
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/avatar.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatar')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                setErrorMessage('Error uploading image: ' + uploadError.message);
                throw uploadError;
            }

            const { error: updateError } = await supabase.from('profile').upsert({
                id: user!.id,
                avatar_url: filePath
            });

            if (updateError) {
                setErrorMessage(
                    'Error updating profile image after upload: ' + updateError.message
                );
                throw updateError;
            }

            setAvatar(filePath);
            setErrorMessage(null);
        } catch {
            setAvatar(null);
        } finally {
            setUploading(false);
        }
    };

    async function saveChanges() {
        try {
            setLoading(true);

            const updates = {
                id: user!.id,
                about: aboutEditor
            };

            const { error } = await supabase.from('profile').upsert(updates);

            if (error) {
                setErrorMessage('Error updating username: ' + error.message);
                throw error;
            }

            setErrorMessage(null);
            setUnsavedChanges(false);
        } finally {
            setLoading(false);
        }
    }

    const style = {
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '16px',
        width: '95%',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        color: theme.palette.dracula.foreground
    };

    return (
        <Item sx={style}>
            <Stack direction="row">
                <Stack direction="row">
                    <Box>
                        <Box sx={{ position: 'relative', width: `${PROFILE_AVATAR_WIDTH}px` }}>
                            <Avatar url={avatar} size={PROFILE_AVATAR_WIDTH} displayOnNull={true} />
                            {editable ? (
                                <UploadButton
                                    onUpload={uploadAvatar}
                                    loading={uploading}
                                    sx={{
                                        color: theme.palette.dracula.cyan,
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        minWidth: '20px'
                                    }}
                                    iconSx={{ filter: 'drop-shadow(0px 0px 3px rgb(0 0 0 / 0.8))' }}
                                />
                            ) : null}
                        </Box>
                    </Box>
                </Stack>
                <Stack
                    sx={{
                        justifyContent: 'left',
                        textAlign: 'left',
                        marginLeft: '2em',
                        width: '100%'
                    }}
                >
                    <Typography variant="h6">{props.profile.username}</Typography>
                    <Typography>Since: {toDateString(props.profile.created_at)}</Typography>
                    {editable ? (
                        <Fragment>
                            <CssTextField
                                multiline
                                fullWidth
                                id="profile-about"
                                aria-label={'About user'}
                                size="small"
                                label={'About'}
                                value={aboutEditor || ''}
                                rows={3}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    setAboutEditor(event.target.value);
                                    setUnsavedChanges(true);
                                }}
                                sx={{
                                    marginTop: '1em',
                                    input: { color: theme.palette.dracula.foreground },
                                    label: { color: theme.palette.dracula.foreground }
                                }}
                            />
                            {unsavedChanges ? (
                                <Button
                                    onClick={() => {
                                        saveChanges();
                                    }}
                                    sx={
                                        loading
                                            ? { color: theme.status.disabled }
                                            : { color: theme.palette.dracula.orange }
                                    }
                                    disabled={loading}
                                >
                                    <span>{loading ? 'Loading' : 'Save'}</span>
                                </Button>
                            ) : null}
                        </Fragment>
                    ) : (
                        <Typography>About: {props.profile.about}</Typography>
                    )}
                </Stack>
            </Stack>
            {errorMessage ? (
                <Item sx={{ color: theme.palette.dracula.red }}>
                    <Stack>
                        <Typography>{errorMessage}</Typography>
                    </Stack>
                </Item>
            ) : null}
            <ProfileShaders rows={shaders} editable={editable} />
        </Item>
    );
}

export async function getServerSideProps(context) {
    context.res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

    const { username } = context.params;

    const { data: idData, error: idError } = await supabase
        .from('profile')
        .select('*')
        .eq('username', username)
        .single();

    if (idError) {
        context.res.statusCode = 404;
        return {
            notFound: true
        };
    }

    return {
        props: {
            profile: idData
        }
    };
}
