import {ChangeEvent, Fragment, useEffect, useState} from "react";
import {supabase} from "lib/supabaseclient";
import {supabasePrivileged} from "lib/supabaseprivilegedclient";
import {useAuth, VIEWS} from "lib/authcontext";
import {Button, Modal, Stack, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Avatar from "components/avatar";
import UploadButton from "components/uploadbutton";
import {CssTextField, Item, theme} from "theme/theme";
import {definitions} from "../../types/supabase";
import Grid from "@mui/material/Grid";

export default function Profile(props) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatar, setAvatar] = useState(props.profile.avatar_url);
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

    async function updateProfile() {
        try {
            setLoading(true)

            const updates = {
                id: user!.id,
            }

            let { error } = await supabase.from('profile').upsert(updates, {
                returning: 'minimal', // Don't return the value after inserting
            })

            if (error) {
                setErrorMessage('Error updating username: ' + error.message);
                throw error
            }

            setErrorMessage(null);
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const toDateString = (utcDate: string) => {
        const date = new Date(utcDate);
        return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
    }

    return (
        <Grid container spacing={2}>
            <Grid item  xs={4} >
                <Item sx={{color: theme.palette.dracula.green}}>
                    <Stack direction="row">
                        <Stack direction="row" justifyContent={"center"} spacing={20} sx={{marginTop: "10px"}}>
                            <Avatar url={avatar} size={96} displayOnNull={true}/>
                            <UploadButton onUpload={uploadAvatar} loading={uploading} color={theme.palette.dracula.green}/>
                        </Stack>
                        <Stack>
                            <Typography>
                                {props.profile.username}
                            </Typography>
                            <Typography>
                                About: {props.profile.about}
                            </Typography>
                            <Typography>
                                Since: {toDateString(props.profile.created_at)}
                            </Typography>
                        </Stack>
                    </Stack>
                </Item>
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
            </Grid>
        </Grid>
    );
}

export async function getServerSideProps(context) {
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

    // bad way of doing this, and is it really necessary?
    if (user.id === id) {
        let { data: profileData, error: profileError, status: profileStatus } = await supabasePrivileged
            .from<definitions['profile']>('profile')
            .select(`*`)
            .eq('id', user.id)
            .single();

        let { data: shaderData, error: shaderError, status: shaderStatus } = await supabasePrivileged
            .from<definitions['shader']>('shader')
            .select('*')
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
            .select('*')
            .eq('author', id);

        return { props: {
                profile: profileData,
                shaders: shaderData,
                editable: false
            } };
    }
}