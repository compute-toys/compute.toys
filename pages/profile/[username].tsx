import {ChangeEvent, Fragment, useEffect, useState} from "react";
import {supabase} from "lib/supabaseclient";
import {supabasePrivileged} from "lib/supabaseprivilegedclient";
import {useAuth, VIEWS} from "lib/authcontext";
import {Button, Modal, Stack, Table, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Avatar from "components/avatar";
import UploadButton from "components/uploadbutton";
import {CssTextField, Item, theme} from "theme/theme";
import {definitions} from "../../types/supabase";
import Grid from "@mui/material/Grid";
import { toDateString } from "lib/dateutils";
import {ShaderTable} from "../../components/shadertable";

const PROFILE_AVATAR_WIDTH = 96;

export default function Profile(props) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatar, setAvatar] = useState(props.profile.avatar_url);
    const [aboutEditor, setAboutEditor] = useState(props.profile.about);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const {user} = useAuth();

    const [errorMessage, setErrorMessage] = useState(null);

    //https://github.com/supabase/supabase/blob/master/examples/nextjs-ts-user-management/components/Account.tsx
    const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length == 0) {
                setErrorMessage('You must select an image to upload.');
                throw 'No file selected';
            }

            const file = event.target.files[0]

            if (file.size > (50 * 1024)) {
                setErrorMessage('Please select an image that is less than 50KB');
                throw 'File must be less than 50KB';
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/avatar.${fileExt}`
            const filePath = `${fileName}`

            let { error: uploadError } = await supabase.storage
                .from('avatar')
                .upload(filePath, file, {upsert: true})

            if (uploadError) {
                setErrorMessage('Error uploading image: ' + uploadError.message);
                throw uploadError
            }

            let { error: updateError } = await supabase.from('profile').upsert({
                id: user!.id,
                avatar_url: filePath,
            })

            if (updateError) {
                setErrorMessage('Error updating profile image after upload: ' + updateError.message);
                throw updateError
            }

            setAvatar(filePath);
            setErrorMessage(null);
        } catch (error) {
            setAvatar(null)
        } finally {
            setUploading(false)
        }
    }

    async function saveChanges() {
        try {
            setLoading(true)

            const updates = {
                id: user!.id,
                about: aboutEditor,
            }

            let { error } = await supabase.from('profile').upsert(updates, {
                returning: 'minimal', // Don't return the value after inserting
            })

            if (error) {
                setErrorMessage('Error updating username: ' + error.message);
                throw error
            }

            setErrorMessage(null);
            setUnsavedChanges(false);
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    const style = {
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '16px',
        width: "95%",
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        color: theme.palette.dracula.foreground
    };

    return (
                <Item sx={style}>
                    <Stack direction="row">
                        <Stack direction="row">
                            <Box><Box sx={{position: "relative", width: `${PROFILE_AVATAR_WIDTH}px`}}>
                                <Avatar url={avatar} size={PROFILE_AVATAR_WIDTH} displayOnNull={true}/>
                                {props.editable ?
                                        <UploadButton onUpload={uploadAvatar} loading={uploading} sx={{
                                            color: theme.palette.dracula.cyan,
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            minWidth: "20px"
                                        }} iconSx={{filter: "drop-shadow(0px 0px 3px rgb(0 0 0 / 0.8))"}} />
                                    : null}
                            </Box></Box>
                        </Stack>
                        <Stack sx={{justifyContent: "left", textAlign: "left", marginLeft: "2em", width: "100%"}}>
                            <Typography variant="h6">
                                {props.profile.username}
                            </Typography>
                            <Typography>
                                Since: {toDateString(props.profile.created_at)}
                            </Typography>
                            {props.editable ?
                                <Fragment>
                                    <CssTextField
                                        multiline
                                        fullWidth
                                        id="profile-about"
                                        aria-label={"About user"}
                                        size="small"
                                        label={"About"}
                                        value={aboutEditor || ""}
                                        rows={3}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                            setAboutEditor(event.target.value);
                                            setUnsavedChanges(true);
                                        }}
                                        sx={{
                                            marginTop: "1em",
                                            input: {color: theme.palette.dracula.foreground},
                                            label: {color: theme.palette.dracula.foreground}
                                        }}
                                    />
                                    {unsavedChanges ?
                                        <Button
                                            onClick={(e) => {
                                                saveChanges()
                                            }}
                                            sx={loading ? {color: theme.status.disabled} : {color: theme.palette.dracula.orange}}
                                            disabled={loading}
                                        >
                                            <span>{loading ? 'Loading' : 'Save'}</span>
                                        </Button>

                                        : null
                                    }
                                </Fragment>

                                :
                                <Typography>
                                    About: {props.profile.about}
                                </Typography>
                            }


                        </Stack>
                    </Stack>
                    {errorMessage ?
                        <Item sx={{color: theme.palette.dracula.red}}>
                            <Stack>
                                <Typography>
                                    {errorMessage}
                                </Typography>
                            </Stack>
                        </Item>
                        : null
                    }
                    <ShaderTable rows={props.shaders}/>
                </Item>
    );
}

export async function getServerSideProps(context) {
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    )
    
    const { username } = context.params;
    const { user } = await supabase.auth.api.getUserByCookie(context.req);

    let { data: idData, error: idError, status: idStatus } = await supabase
        .from<definitions['profile']>('profile')
        .select(`id`)
        .eq('username', username)
        .single();

    const { id } = idData;

    if (idError) {
        context.res.statusCode = 404;
        return {
            notFound: true
        }
    }

    // TODO: bad way of doing this, and is it really necessary?
    if (user && user.id === id) {
        let { data: profileData, error: profileError, status: profileStatus } = await supabasePrivileged
            .from<definitions['profile']>('profile')
            .select(`*`)
            .eq('id', user.id)
            .single();

        let { data: shaderData, error: shaderError, status: shaderStatus } = await supabasePrivileged
            .from<definitions['shader']>('shader')
            .select('id, name, visibility, created_at, thumb_url')
            .eq('author', user.id);

        return { props: {
                profile: profileData,
                shaders: shaderData,
                editable: true
            } };
    } else {
        let { data: profileData, error: profileError, status: profileStatus } = await supabase
            .from<definitions['profile']>('profile')
            .select(`*`)
            .eq('id', id)
            .single();

        let { data: shaderData, error: shaderError, status: shaderStatus } = await supabase
            .from<definitions['shader']>('shader')
            .select('id, name, visibility, created_at, thumb_url')
            .eq('author', id);

        return { props: {
                profile: profileData,
                shaders: shaderData,
                editable: false
            } };
    }
}